import { Schema, model } from 'mongoose'

const answerSchema = new Schema({
    questionId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    selectedOption: {
        type: Number, // Index of the selected option
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    timeTaken: {
        type: Number, // Time in seconds taken to answer the question
        required: true
    }
})

const quizSubmissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const QuizSubmission = model('QuizSubmission', quizSubmissionSchema)

export default QuizSubmission
