import Progress from '../models/progressModel.js'
import Course from '../models/courseModel.js'
import createError from '../utils/error.js'
import { updateStreak } from './streakController.js'

export const enrollInCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params
        const userId = req.user.id

        // Check if course exists
        const course = await Course.findById(courseId)
        if (!course) {
            return next(createError(404, "Course not found"))
        }

        // Check if already enrolled
        const existingProgress = await Progress.findOne({ userId, courseId })
        if (existingProgress) {
            return res.status(200).json({
                success: true,
                message: "Already enrolled in this course",
                progress: existingProgress
            })
        }

        // Create initial progress
        const progress = new Progress({
            userId,
            courseId,
            lectureProgress: course.lectures.map(lecture => ({
                lectureId: lecture._id,
                title: lecture.title,
                completed: false,
                timeSpent: 0
            }))
        })

        await progress.save()

        res.status(201).json({
            success: true,
            message: "Successfully enrolled in course",
            progress
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const updateLectureProgress = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.params
        const { timeSpent = 0 } = req.body
        const userId = req.user.id

        // Find or create progress
        let progress = await Progress.findOne({ userId, courseId })
        if (!progress) {
            // Auto-enroll if not enrolled
            const course = await Course.findById(courseId)
            if (!course) {
                return next(createError(404, "Course not found"))
            }

            progress = new Progress({
                userId,
                courseId,
                lectureProgress: course.lectures.map(lecture => ({
                    lectureId: lecture._id,
                    title: lecture.title,
                    completed: false,
                    timeSpent: 0
                }))
            })
        }

        // Find lecture details
        const course = await Course.findById(courseId)
        const lecture = course.lectures.id(lectureId)
        if (!lecture) {
            return next(createError(404, "Lecture not found"))
        }

        // Update progress
        progress.updateLectureProgress(lectureId, lecture.title, timeSpent)
        progress.currentLecture = lectureId
        
        await progress.save()

        // Update streak
        updateStreak(userId)

        res.status(200).json({
            success: true,
            message: "Progress updated successfully",
            progress: {
                totalProgress: progress.totalProgress,
                isCompleted: progress.isCompleted,
                currentLecture: progress.currentLecture,
                lectureProgress: progress.lectureProgress.find(
                    lp => lp.lectureId.toString() === lectureId.toString()
                )
            }
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getUserProgress = async (req, res, next) => {
    try {
        const { courseId } = req.params
        const userId = req.user.id

        const progress = await Progress.findOne({ userId, courseId })
            .populate('courseId', 'title description thumbnail numberOfLectures')

        if (!progress) {
            return next(createError(404, "No progress found for this course"))
        }

        res.status(200).json({
            success: true,
            message: "Progress retrieved successfully",
            progress
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getCourseProgress = async (req, res, next) => {
    try {
        const { courseId } = req.params

        const progressData = await Progress.find({ courseId })
            .populate('userId', 'name email')
            .select('userId totalProgress isCompleted enrolledAt completedAt')

        if (!progressData.length) {
            return res.status(200).json({
                success: true,
                message: "No students enrolled yet",
                stats: {
                    totalEnrolled: 0,
                    completed: 0,
                    inProgress: 0,
                    averageProgress: 0
                }
            })
        }

        const stats = {
            totalEnrolled: progressData.length,
            completed: progressData.filter(p => p.isCompleted).length,
            inProgress: progressData.filter(p => !p.isCompleted && p.totalProgress > 0).length,
            averageProgress: Math.round(
                progressData.reduce((sum, p) => sum + p.totalProgress, 0) / progressData.length
            )
        }

        res.status(200).json({
            success: true,
            message: "Course progress retrieved successfully",
            progressData,
            stats
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getUserDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id

        const allProgress = await Progress.find({ userId })
            .populate('courseId', 'title description thumbnail category')
            .sort({ lastAccessedAt: -1 })

        const dashboardData = {
            totalCourses: allProgress.length,
            completedCourses: allProgress.filter(p => p.isCompleted).length,
            inProgressCourses: allProgress.filter(p => !p.isCompleted && p.totalProgress > 0).length,
            totalTimeSpent: allProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
            recentCourses: allProgress.slice(0, 5),
            averageProgress: allProgress.length > 0 ? 
                Math.round(allProgress.reduce((sum, p) => sum + p.totalProgress, 0) / allProgress.length) : 0
        }

        res.status(200).json({
            success: true,
            message: "Dashboard data retrieved successfully",
            dashboard: dashboardData
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getProgressAnalytics = async (req, res, next) => {
    try {
        const { courseId } = req.params
        const userId = req.user.id

        const progress = await Progress.findOne({ userId, courseId })
        if (!progress) {
            return next(createError(404, "No progress found"))
        }

        // Weekly progress calculation
        const weeklyData = []
        const today = new Date()
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)
            
            const dayProgress = progress.dailyProgress.find(
                dp => dp.date.getTime() === date.getTime()
            )
            
            weeklyData.push({
                date: date.toISOString().split('T')[0],
                lecturesCompleted: dayProgress?.lecturesCompleted || 0,
                timeSpent: dayProgress?.timeSpent || 0,
                progressPercentage: dayProgress?.progressPercentage || 0
            })
        }

        const analytics = {
            overallProgress: progress.totalProgress,
            totalTimeSpent: progress.totalTimeSpent,
            lecturesCompleted: progress.lectureProgress.filter(lp => lp.completed).length,
            totalLectures: progress.lectureProgress.length,
            weeklyData,
            lastAccessed: progress.lastAccessedAt,
            enrolledAt: progress.enrolledAt,
            isCompleted: progress.isCompleted
        }

        res.status(200).json({
            success: true,
            message: "Analytics retrieved successfully",
            analytics
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const getProgressGraph = async (req, res, next) => {
    try {
        const { courseId } = req.params
        const { period = '7' } = req.query // days
        const userId = req.user.id

        const progress = await Progress.findOne({ userId, courseId })
        if (!progress) {
            return next(createError(404, "No progress found"))
        }

        const days = parseInt(period)
        const graphData = []
        const today = new Date()

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const dayProgress = progress.dailyProgress.find(
                dp => dp.date.getTime() === date.getTime()
            )

            graphData.push({
                date: date.toISOString().split('T')[0],
                progress: dayProgress?.progressPercentage || (i === days - 1 ? 0 : graphData[graphData.length - 1]?.progress || 0),
                timeSpent: dayProgress?.timeSpent || 0,
                lecturesCompleted: dayProgress?.lecturesCompleted || 0
            })
        }

        res.status(200).json({
            success: true,
            message: "Graph data retrieved successfully",
            graphData
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}
