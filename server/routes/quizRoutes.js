import { Router } from 'express'
import {
    createQuiz,
    getQuizzesByCourse,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    generateQuiz
} from '../controller/quizController.js'
import { isLoggedIn, authorizedRole } from '../middleware/authMiddleware.js'

const router = Router()

// Generate quiz questions using AI (only instructors and admins)
router.post('/generate', isLoggedIn, authorizedRole('INSTRUCTOR', 'ADMIN'), generateQuiz)

// Create a quiz (only instructors)
router.post('/', isLoggedIn, authorizedRole('INSTRUCTOR', 'ADMIN'), createQuiz)

// Get all quizzes for a course
router.get('/course/:courseId', isLoggedIn, getQuizzesByCourse)

// Get a specific quiz by ID
router.get('/:quizId', isLoggedIn, getQuizById)

// Update a quiz (only instructors)
router.put('/:quizId', isLoggedIn, authorizedRole('INSTRUCTOR', 'ADMIN'), updateQuiz)

// Delete a quiz (only instructors)
router.delete('/:quizId', isLoggedIn, authorizedRole('INSTRUCTOR', 'ADMIN'), deleteQuiz)

export default router
