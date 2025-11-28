import { Schema, model } from 'mongoose'

const streakSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String, // Format: YYYY-MM
        required: true
    },
    streakDays: [
        {
            date: {
                type: Date,
                required: true
            }
        }
    ],
    longestStreak: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

// Compound index for efficient queries
streakSchema.index({ userId: 1, month: 1 }, { unique: true })

const Streak = model('Streak', streakSchema)

export default Streak
