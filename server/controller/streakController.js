import Streak from '../models/streakModel.js'
import createError from '../utils/error.js'

export const getUserStreak = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { month } = req.query // Format: YYYY-MM

        const streak = await Streak.findOne({ userId, month })

        if (!streak) {
            return res.status(200).json({
                success: true,
                message: "No streak data found for this month",
                streak: {
                    currentStreak: 0,
                    longestStreak: 0,
                    streakDays: []
                }
            })
        }

        res.status(200).json({
            success: true,
            message: "Streak data retrieved successfully",
            streak
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getUserStreakHistory = async (req, res, next) => {
    try {
        const userId = req.user.id

        const streakHistory = await Streak.find({ userId }).sort({ month: -1 })

        res.status(200).json({
            success: true,
            message: "Streak history retrieved successfully",
            streakHistory
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const updateStreak = async (userId) => {
    try {
        const today = new Date()
        const month = today.toISOString().slice(0, 7) // Format: YYYY-MM
        const date = today.toISOString().split('T')[0] // Format: YYYY-MM-DD

        let streak = await Streak.findOne({ userId, month })

        if (!streak) {
            streak = new Streak({
                userId,
                month,
                streakDays: [{ date }],
                currentStreak: 1,
                longestStreak: 1
            })
        } else {
            const lastStreakDay = streak.streakDays[streak.streakDays.length - 1]?.date
            const isConsecutive = lastStreakDay && new Date(lastStreakDay).getTime() === new Date(today.setDate(today.getDate() - 1)).getTime()

            if (!streak.streakDays.some(day => day.date === date)) {
                streak.streakDays.push({ date })
                streak.currentStreak = isConsecutive ? streak.currentStreak + 1 : 1
                streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak)
            }
        }

        await streak.save()
    } catch (error) {
        console.error("Error updating streak:", error.message)
    }
}
