import Quiz from '../models/quizModel.js'
import Course from '../models/courseModel.js'
import createError from '../utils/error.js'

export const createQuiz = async (req, res, next) => {
    try {
        const { courseId, title, description, questions } = req.body
        const userId = req.user.id

        // Check if course exists
        const course = await Course.findById(courseId)
        if (!course) {
            return next(createError(404, "Course not found"))
        }

        // Create quiz
        const quiz = new Quiz({
            courseId,
            title,
            description,
            questions,
            createdBy: userId
        })

        await quiz.save()

        res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            quiz
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getQuizzesByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params
        console.log(courseId);

        const quizzes = await Quiz.find({ courseId }).select('-questions')


        if (!quizzes.length) {
            return next(createError(404, "No quizzes found for this course"))
        }

        res.status(200).json({
            success: true,
            message: "Quizzes retrieved successfully",
            quizzes
        })
    } catch (error) {
        console.log(error);

        return next(createError(500, error.message))
    }
}

export const getQuizById = async (req, res, next) => {
    try {
        const { quizId } = req.params

        const quiz = await Quiz.findById(quizId)

        if (!quiz) {
            return next(createError(404, "Quiz not found"))
        }

        res.status(200).json({
            success: true,
            message: "Quiz retrieved successfully",
            quiz
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const updateQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params
        const { title, description, questions } = req.body

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            { title, description, questions },
            { new: true, runValidators: true }
        )

        if (!quiz) {
            return next(createError(404, "Quiz not found"))
        }

        res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            quiz
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const deleteQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params

        const quiz = await Quiz.findByIdAndDelete(quizId)

        if (!quiz) {
            return next(createError(404, "Quiz not found"))
        }

        res.status(200).json({
            success: true,
            message: "Quiz deleted successfully"
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const generateQuiz = async (req, res, next) => {
    try {
        const { topicDescription } = req.body

        if (!topicDescription || topicDescription.trim() === "") {
            return next(createError(400, "Topic description is required"))
        }

        // Import the generateQuizQuestions function dynamically
        const { generateQuizQuestions } = await import('../utils/gemini.js')

        // Generate quiz questions using Gemini AI
        const questions = await generateQuizQuestions(topicDescription)

        res.status(200).json({
            success: true,
            message: "Quiz questions generated successfully",
            questions
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

