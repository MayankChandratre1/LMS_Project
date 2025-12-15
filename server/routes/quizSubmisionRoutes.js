import { Router } from 'express'
import {
    submitQuiz,
    getUserSubmissions,
    getQuizSubmissions,
    getSubmissionById
} from '../controller/quizSubmissionController.js'
import { isLoggedIn, authorizedRole } from '../middleware/authMiddleware.js'

const router = Router()

// Submit a quiz
router.post('/:quizId', isLoggedIn, submitQuiz)

// Get all submissions for the logged-in user
router.get('/user', isLoggedIn, getUserSubmissions)

// Get all submissions for a specific quiz (only instructors/admins)
router.get('/quiz/:quizId', isLoggedIn, authorizedRole('INSTRUCTOR', 'ADMIN'), getQuizSubmissions)

// Get a specific submission by ID (users can view their own, admins/instructors can view all)
router.get('/:submissionId', isLoggedIn, getSubmissionById)

export default router
