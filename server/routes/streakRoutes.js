import { Router } from 'express'
import { getUserStreak, getUserStreakHistory } from '../controller/streakController.js'
import { isLoggedIn } from '../middleware/auth.js'

const router = Router()

// Get streak for the current month or a specific month
router.get('/', isLoggedIn, getUserStreak)

// Get streak history for the user
router.get('/history', isLoggedIn, getUserStreakHistory)

export default router
