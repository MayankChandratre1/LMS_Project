import ForumThread from '../models/forumThread.js'
import createError from '../utils/error.js'
import { v2 } from 'cloudinary'
import { generateForumAnswer } from '../utils/gemini.js'
import User from '../models/userModel.js'

// Helper function to build thread context for AI
const buildThreadContext = async (thread, newReplyContent = null) => {
    let context = `THREAD CONTEXT:\n\n`
    context += `Title: ${thread.title}\n`
    context += `Category: ${thread.category}\n`
    
    // Populate courseId if it exists
    if (thread.courseId) {
        if (!thread.populated('courseId')) {
            await thread.populate('courseId', 'title description')
        }
        context += `Related Course: ${thread.courseId?.title || 'N/A'}\n`
        context += `Course Description: ${thread.courseId?.description || 'N/A'}\n`
    }
    
    context += `\nORIGINAL QUESTION:\n${thread.content}\n`
    
    if (thread.tags && thread.tags.length > 0) {
        context += `\nTags: ${thread.tags.join(', ')}\n`
    }
    
    if (thread.replies && thread.replies.length > 0) {
        // Populate userId for all replies at once
        if (!thread.populated('replies.userId')) {
            await thread.populate('replies.userId', 'fullName')
        }
        
        context += `\nPREVIOUS REPLIES (${thread.replies.length}):\n`
        for (const reply of thread.replies) {
            context += `\n- ${reply.userId?.fullName || 'User'}: ${reply.content}\n`
        }
    }
    
    if (newReplyContent) {
        context += `\nNEW REPLY REQUESTING AI ASSISTANCE:\n${newReplyContent}\n`
    }
    
    context += `\n\nPlease provide a comprehensive answer to the question, taking into account all the context provided above.`
    
    return context
}

// Helper function to check if content contains /answer command
const shouldGenerateAIResponse = (content) => {
    return content && content.toLowerCase().includes('/answer')
}

// Helper function to generate and add AI reply
const generateAndAddAIReply = async (thread, triggerContent = null) => {
    try {
        // Build context
        const context = await buildThreadContext(thread, triggerContent)
        
        // Generate AI response
        const aiResponse = await generateForumAnswer(context)
        
        // Find or create AI bot user
        let aiBot = await User.findOne({ email: 'aibot@lms.system' })
        if (!aiBot) {
            aiBot = await User.create({
                name: 'AI Assistant', // Changed from fullName to name
                email: 'aibot@lms.system',
                password: 'AIBot@123456', // Strong password that meets validation
                role: 'USER',
                avatar: {
                    public_id: 'ai-bot',
                    secure_url: 'https://ui-avatars.com/api/?name=AI+Assistant&background=fbbf24&color=000'
                }
            })
        }
        
        // Add AI reply to thread
        thread.replies.push({
            userId: aiBot._id,
            content: aiResponse,
            upvotes: [],
            downvotes: [],
            images: []
        })
        
        await thread.save()
        return true
    } catch (error) {
        console.error('Error generating AI reply:', error)
        return false
    }
}

// Get all threads with pagination and sorting
export const getAllThreads = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt' } = req.query
        
        const threads = await ForumThread.find()
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title')
            .populate('replies.userId', 'fullName email avatar')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean()

        const count = await ForumThread.countDocuments()

        res.status(200).json({
            success: true,
            message: 'Threads fetched successfully',
            data: {
                threads,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Get thread by ID
export const getThreadById = async (req, res, next) => {
    try {
        const { id } = req.params

        const thread = await ForumThread.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title thumbnail')
            .populate('replies.userId', 'fullName email avatar')

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        res.status(200).json({
            success: true,
            message: 'Thread fetched successfully',
            data: thread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Create new thread
export const createThread = async (req, res, next) => {
    try {
        const { title, content, category, courseId, tags } = req.body
        const userId = req.user.id

        if (!title || !content) {
            return next(createError(400, 'Title and content are required'))
        }

        const thread = new ForumThread({
            title,
            content,
            category: category || 'general',
            courseId: courseId || null,
            userId,
            tags: tags ? JSON.parse(tags) : [],
            images: []
        })

        // Handle multiple image uploads
        if (req.files && req.files.length > 0) {
            try {
                const uploadPromises = req.files.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64')
                    const dataURI = `data:${file.mimetype};base64,${b64}`
                    
                    const result = await v2.uploader.upload(dataURI, {
                        resource_type: 'image',
                        folder: 'lms/forum'
                    })
                    
                    return {
                        public_id: result.public_id,
                        secure_url: result.secure_url
                    }
                })
                
                thread.images = await Promise.all(uploadPromises)
            } catch (error) {
                return next(createError(500, error.message || 'Image upload failed'))
            }
        }

        await thread.save()

        // Check if /answer is in the content
        if (shouldGenerateAIResponse(content)) {
            await generateAndAddAIReply(thread)
        }

        const populatedThread = await ForumThread.findById(thread._id)
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title')
            .populate('replies.userId', 'fullName email avatar')

        res.status(201).json({
            success: true,
            message: 'Thread created successfully',
            data: populatedThread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Update thread
export const updateThread = async (req, res, next) => {
    try {
        const { id } = req.params
        const { title, content, category, tags } = req.body
        const userId = req.user.id

        const thread = await ForumThread.findById(id)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        // Check if user is the owner or admin
        if (thread.userId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(createError(403, 'You are not authorized to update this thread'))
        }

        if (title) thread.title = title
        if (content) thread.content = content
        if (category) thread.category = category
        if (tags) thread.tags = JSON.parse(tags)
        thread.isEdited = true

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            try {
                // Delete old images from cloudinary
                if (thread.images && thread.images.length > 0) {
                    const deletePromises = thread.images.map(img => 
                        v2.uploader.destroy(img.public_id, { resource_type: 'image' })
                    )
                    await Promise.all(deletePromises)
                }

                // Upload new images
                const uploadPromises = req.files.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64')
                    const dataURI = `data:${file.mimetype};base64,${b64}`
                    
                    const result = await v2.uploader.upload(dataURI, {
                        resource_type: 'image',
                        folder: 'lms/forum'
                    })
                    
                    return {
                        public_id: result.public_id,
                        secure_url: result.secure_url
                    }
                })
                
                thread.images = await Promise.all(uploadPromises)
            } catch (error) {
                return next(createError(500, error.message || 'Image upload failed'))
            }
        }

        await thread.save()

        const updatedThread = await ForumThread.findById(id)
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title')

        res.status(200).json({
            success: true,
            message: 'Thread updated successfully',
            data: updatedThread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Delete thread
export const deleteThread = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const thread = await ForumThread.findById(id)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        // Check if user is the owner or admin
        if (thread.userId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(createError(403, 'You are not authorized to delete this thread'))
        }

        // Delete images from cloudinary
        if (thread.images && thread.images.length > 0) {
            try {
                const deletePromises = thread.images.map(img => 
                    v2.uploader.destroy(img.public_id, { resource_type: 'image' })
                )
                await Promise.all(deletePromises)
            } catch (error) {
                console.error('Error deleting images:', error)
            }
        }

        // Delete images from replies
        if (thread.replies && thread.replies.length > 0) {
            try {
                const replyImageDeletePromises = thread.replies
                    .filter(reply => reply.images && reply.images.length > 0)
                    .flatMap(reply => 
                        reply.images.map(img => 
                            v2.uploader.destroy(img.public_id, { resource_type: 'image' })
                        )
                    )
                await Promise.all(replyImageDeletePromises)
            } catch (error) {
                console.error('Error deleting reply images:', error)
            }
        }

        await ForumThread.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: 'Thread deleted successfully'
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Add reply to thread
export const addReply = async (req, res, next) => {
    try {
        const { id } = req.params
        const { content } = req.body
        const userId = req.user.id

        if (!content) {
            return next(createError(400, 'Reply content is required'))
        }

        const thread = await ForumThread.findById(id)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        if (thread.isClosed) {
            return next(createError(403, 'This thread is closed for replies'))
        }

        const replyData = {
            userId,
            content,
            upvotes: [],
            downvotes: [],
            images: []
        }

        // Handle multiple image uploads for reply
        if (req.files && req.files.length > 0) {
            try {
                const uploadPromises = req.files.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64')
                    const dataURI = `data:${file.mimetype};base64,${b64}`
                    
                    const result = await v2.uploader.upload(dataURI, {
                        resource_type: 'image',
                        folder: 'lms/forum/replies'
                    })
                    
                    return {
                        public_id: result.public_id,
                        secure_url: result.secure_url
                    }
                })
                
                replyData.images = await Promise.all(uploadPromises)
            } catch (error) {
                return next(createError(500, error.message || 'Image upload failed'))
            }
        }

        thread.replies.push(replyData)
        await thread.save()

        // Check if /answer is in the reply content
        if (shouldGenerateAIResponse(content)) {
            await generateAndAddAIReply(thread, content)
        }

        const updatedThread = await ForumThread.findById(id)
            .populate('userId', 'fullName email avatar')
            .populate('replies.userId', 'fullName email avatar')

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: updatedThread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Update reply
export const updateReply = async (req, res, next) => {
    try {
        const { threadId, replyId } = req.params
        const { content } = req.body
        const userId = req.user.id

        const thread = await ForumThread.findById(threadId)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        const reply = thread.replies.id(replyId)

        if (!reply) {
            return next(createError(404, 'Reply not found'))
        }

        // Check if user is the owner or admin
        if (reply.userId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(createError(403, 'You are not authorized to update this reply'))
        }

        reply.content = content
        reply.isEdited = true
        reply.updatedAt = Date.now()

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            try {
                // Delete old images from cloudinary
                if (reply.images && reply.images.length > 0) {
                    const deletePromises = reply.images.map(img => 
                        v2.uploader.destroy(img.public_id, { resource_type: 'image' })
                    )
                    await Promise.all(deletePromises)
                }

                // Upload new images
                const uploadPromises = req.files.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64')
                    const dataURI = `data:${file.mimetype};base64,${b64}`
                    
                    const result = await v2.uploader.upload(dataURI, {
                        resource_type: 'image',
                        folder: 'lms/forum/replies'
                    })
                    
                    return {
                        public_id: result.public_id,
                        secure_url: result.secure_url
                    }
                })
                
                reply.images = await Promise.all(uploadPromises)
            } catch (error) {
                return next(createError(500, error.message || 'Image upload failed'))
            }
        }

        await thread.save()

        const updatedThread = await ForumThread.findById(threadId)
            .populate('userId', 'fullName email avatar')
            .populate('replies.userId', 'fullName email avatar')

        res.status(200).json({
            success: true,
            message: 'Reply updated successfully',
            data: updatedThread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Delete reply
export const deleteReply = async (req, res, next) => {
    try {
        const { threadId, replyId } = req.params
        const userId = req.user.id

        const thread = await ForumThread.findById(threadId)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        const reply = thread.replies.id(replyId)

        if (!reply) {
            return next(createError(404, 'Reply not found'))
        }

        // Check if user is the owner or admin
        if (reply.userId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(createError(403, 'You are not authorized to delete this reply'))
        }

        // Delete images from cloudinary
        if (reply.images && reply.images.length > 0) {
            try {
                const deletePromises = reply.images.map(img => 
                    v2.uploader.destroy(img.public_id, { resource_type: 'image' })
                )
                await Promise.all(deletePromises)
            } catch (error) {
                console.error('Error deleting reply images:', error)
            }
        }

        thread.replies.pull(replyId)
        await thread.save()

        res.status(200).json({
            success: true,
            message: 'Reply deleted successfully'
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Vote on thread (upvote/downvote)
export const voteThread = async (req, res, next) => {
    try {
        const { id } = req.params
        const { voteType } = req.body // 'upvote', 'downvote', or 'remove'
        const userId = req.user.id

        const thread = await ForumThread.findById(id)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        // Remove existing votes
        thread.upvotes = thread.upvotes.filter(id => id.toString() !== userId)
        thread.downvotes = thread.downvotes.filter(id => id.toString() !== userId)

        // Add new vote if not removing
        if (voteType === 'upvote') {
            thread.upvotes.push(userId)
        } else if (voteType === 'downvote') {
            thread.downvotes.push(userId)
        }

        await thread.save()

        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                upvotes: thread.upvotes.length,
                downvotes: thread.downvotes.length,
                voteCount: thread.upvotes.length - thread.downvotes.length
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Vote on reply
export const voteReply = async (req, res, next) => {
    try {
        const { threadId, replyId } = req.params
        const { voteType } = req.body // 'upvote', 'downvote', or 'remove'
        const userId = req.user.id

        const thread = await ForumThread.findById(threadId)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        const reply = thread.replies.id(replyId)

        if (!reply) {
            return next(createError(404, 'Reply not found'))
        }

        // Remove existing votes
        reply.upvotes = reply.upvotes.filter(id => id.toString() !== userId)
        reply.downvotes = reply.downvotes.filter(id => id.toString() !== userId)

        // Add new vote if not removing
        if (voteType === 'upvote') {
            reply.upvotes.push(userId)
        } else if (voteType === 'downvote') {
            reply.downvotes.push(userId)
        }

        await thread.save()

        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                upvotes: reply.upvotes.length,
                downvotes: reply.downvotes.length,
                voteCount: reply.upvotes.length - reply.downvotes.length
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Get threads by course
export const getThreadsByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params
        const { page = 1, limit = 20 } = req.query

        const threads = await ForumThread.find({ courseId })
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const count = await ForumThread.countDocuments({ courseId })

        res.status(200).json({
            success: true,
            message: 'Threads fetched successfully',
            data: {
                threads,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Get threads by category
export const getThreadsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params
        const { page = 1, limit = 20 } = req.query

        const threads = await ForumThread.find({ category })
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const count = await ForumThread.countDocuments({ category })

        res.status(200).json({
            success: true,
            message: 'Threads fetched successfully',
            data: {
                threads,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Search threads
export const searchThreads = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 20 } = req.query

        if (!q) {
            return next(createError(400, 'Search query is required'))
        }

        const threads = await ForumThread.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        })
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const count = threads.length

        res.status(200).json({
            success: true,
            message: 'Search results',
            data: {
                threads,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Toggle pin thread (Admin only)
export const togglePinThread = async (req, res, next) => {
    try {
        const { id } = req.params

        const thread = await ForumThread.findById(id)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        thread.isPinned = !thread.isPinned
        await thread.save()

        res.status(200).json({
            success: true,
            message: `Thread ${thread.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: thread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// Toggle close thread (Admin only)
export const toggleCloseThread = async (req, res, next) => {
    try {
        const { id } = req.params

        const thread = await ForumThread.findById(id)

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        thread.isClosed = !thread.isClosed
        await thread.save()

        res.status(200).json({
            success: true,
            message: `Thread ${thread.isClosed ? 'closed' : 'opened'} successfully`,
            data: thread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

// New endpoint to manually trigger AI response for a thread
export const generateAIResponseForThread = async (req, res, next) => {
    try {
        const { id } = req.params

        // Fetch thread with all necessary populations
        const thread = await ForumThread.findById(id)
            .populate('courseId', 'title description')
            .populate('userId', 'fullName email avatar')
            .populate('replies.userId', 'fullName email avatar')

        if (!thread) {
            return next(createError(404, 'Thread not found'))
        }

        const success = await generateAndAddAIReply(thread)

        if (!success) {
            return next(createError(500, 'Failed to generate AI response'))
        }

        const updatedThread = await ForumThread.findById(id)
            .populate('userId', 'fullName email avatar')
            .populate('courseId', 'title')
            .populate('replies.userId', 'fullName email avatar')

        res.status(200).json({
            success: true,
            message: 'AI response generated successfully',
            data: updatedThread
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}
