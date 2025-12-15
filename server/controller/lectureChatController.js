import Course from '../models/courseModel.js'
import createError from '../utils/error.js'
import { generateLectureChatResponse } from '../utils/gemini.js'

export const chatWithLecture = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.params
        const { message } = req.body

        if (!message || message.trim() === '') {
            return next(createError(400, 'Message is required'))
        }

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return next(createError(404, 'Course not found'))
        }

        // Find the specific lecture
        const lecture = course.lectures.id(lectureId)
        if (!lecture) {
            return next(createError(404, 'Lecture not found'))
        }

        // Prepare lecture context
        const lectureContext = {
            title: lecture.title,
            description: lecture.description || 'No description available',
            transcript: lecture.transcript || ''
        }

        // Generate AI response
        const aiResponse = await generateLectureChatResponse(lectureContext, message)

        res.status(200).json({
            success: true,
            message: 'Response generated successfully',
            response: aiResponse,
            lectureInfo: {
                title: lecture.title,
                hasTranscript: !!lecture.transcript
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}
