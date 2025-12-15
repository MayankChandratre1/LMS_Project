import { Router } from 'express'
import { chatWithLecture } from '../controller/lectureChatController.js'
import { isLoggedIn } from '../middleware/authMiddleware.js'

const router = Router()

// Chat with a specific lecture
router.post('/:courseId/:lectureId', isLoggedIn, chatWithLecture)

export default router
