import QuizSubmission from '../models/quizSubmission.js'
import Quiz from '../models/quizModel.js'
import createError from '../utils/error.js'
import { updateStreak } from './streakController.js'

export const submitQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params
        const { answers } = req.body
        const userId = req.user.id

        // Fetch the quiz
        const quiz = await Quiz.findById(quizId)
        if (!quiz) {
            return next(createError(404, "Quiz not found"))
        }

        // Calculate score
        let score = 0
        let correctAnswers = 0
        const totalQuestions = quiz.questions.length
        const evaluatedAnswers = answers.map(answer => {
            const question = quiz.questions.id(answer.questionId)
            if (!question) {
                throw new Error(`Invalid question ID: ${answer.questionId}`)
            }
            const isCorrect = question.correctOption === answer.selectedOption
            if (isCorrect) {
                score += 1
                correctAnswers += 1
            }
            return {
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect,
                timeTaken: answer.timeTaken
            }
        })

        // Save submission
        const submission = new QuizSubmission({
            userId,
            quizId,
            courseId: quiz.courseId,
            answers: evaluatedAnswers,
            score,
            totalQuestions,
            correctAnswers
        })

        await submission.save()

        // Update streak
        updateStreak(userId)

        res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            submission
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getUserSubmissions = async (req, res, next) => {
    try {
        const userId = req.user.id

        const submissions = await QuizSubmission.find({ userId })
            .populate('quizId', 'title')
            .populate('courseId', 'title')

        res.status(200).json({
            success: true,
            message: "Submissions retrieved successfully",
            submissions
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getQuizSubmissions = async (req, res, next) => {
    try {
        const { quizId } = req.params

        const submissions = await QuizSubmission.find({ quizId })
            .populate('userId', 'name email')
            .populate('courseId', 'title')

        res.status(200).json({
            success: true,
            message: "Submissions retrieved successfully",
            submissions
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getSubmissionById = async (req, res, next) => {
    try {
        const { submissionId } = req.params

        const submission = await QuizSubmission.findById(submissionId)
            .populate('quizId', 'title')
            .populate('courseId', 'title')
            .populate('userId', 'name email')

        if (!submission) {
            return next(createError(404, "Submission not found"))
        }

        res.status(200).json({
            success: true,
            message: "Submission retrieved successfully",
            submission
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}
