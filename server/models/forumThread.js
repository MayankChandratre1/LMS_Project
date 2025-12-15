import { model, Schema } from 'mongoose'

const replySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Reply content is required'],
        minLength: [1, 'Reply must be at least 1 character'],
        maxLength: [7000, 'Reply should be less than 2000 characters'],
        trim: true
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    }],
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const forumThreadSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [5, 'Title must be at least 5 characters'],
        maxLength: [200, 'Title should be less than 200 characters'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minLength: [10, 'Content must be at least 10 characters'],
        maxLength: [10000, 'Content should be less than 10000 characters'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['general', 'course-help', 'career', 'technical', 'announcements', 'off-topic'],
        default: 'general'
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    images: [{
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    }],
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [replySchema],
    views: {
        type: Number,
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// Virtual for vote count
forumThreadSchema.virtual('voteCount').get(function() {
    return this.upvotes.length - this.downvotes.length
})

// Virtual for reply count
forumThreadSchema.virtual('replyCount').get(function() {
    return this.replies.length
})

// Ensure virtuals are included in JSON
forumThreadSchema.set('toJSON', { virtuals: true })
forumThreadSchema.set('toObject', { virtuals: true })

const ForumThread = model('ForumThread', forumThreadSchema)

export default ForumThread
