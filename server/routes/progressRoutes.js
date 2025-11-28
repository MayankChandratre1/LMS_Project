import { Router } from 'express'
import {
    enrollInCourse,
    updateLectureProgress,
    getUserProgress,
    getCourseProgress,
    getUserDashboard,
    getProgressAnalytics,
    getProgressGraph
} from '../controller/progressController.js'
import { isLoggedIn } from '../middleware/authMiddleware.js'

const router = Router()

// Enrollment and progress creation
router.post('/enroll/:courseId', isLoggedIn, enrollInCourse)

// Progress tracking
router.put('/lecture/:courseId/:lectureId', isLoggedIn, updateLectureProgress)

// Progress retrieval
router.get('/user/:courseId', isLoggedIn, getUserProgress)
router.get('/course/:courseId', isLoggedIn, getCourseProgress)
router.get('/dashboard', isLoggedIn, getUserDashboard)

// Analytics
router.get('/analytics/:courseId', isLoggedIn, getProgressAnalytics)
router.get('/graph/:courseId', isLoggedIn, getProgressGraph)

export default router
