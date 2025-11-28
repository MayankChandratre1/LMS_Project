import { Schema, model } from 'mongoose'

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    options: [
        {
            type: String,
            required: true
        }
    ],
    correctOption: {
        type: Number, // Index of the correct option in the options array
        required: true
    },
    timeout: {
        type: Number, // Time in seconds to answer the question
        default: 30
    }
})

const quizSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    questions: [questionSchema],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
}, { timestamps: true })

const Quiz = model('Quiz', quizSchema)

export default Quiz
