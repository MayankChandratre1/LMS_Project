import { Router } from 'express'
import {
    createThread,
    getAllThreads,
    getThreadById,
    updateThread,
    deleteThread,
    addReply,
    updateReply,
    deleteReply,
    voteThread,
    voteReply,
    getThreadsByCourse,
    getThreadsByCategory,
    searchThreads,
    togglePinThread,
    toggleCloseThread,
    generateAIResponseForThread
} from '../controller/forumThreadController.js'
import { authorizedRole, isLoggedIn } from '../middleware/authMiddleware.js'
import upload from '../middleware/multer.js'

const router = Router()

// Thread routes
router.get('/', getAllThreads)
router.get('/search', searchThreads)
router.get('/category/:category', getThreadsByCategory)
router.get('/course/:courseId', getThreadsByCourse)
router.get('/:id', getThreadById)
router.post('/', isLoggedIn, upload.array('images', 5), createThread) // Allow up to 5 images
router.put('/:id', isLoggedIn, upload.array('images', 5), updateThread)
router.delete('/:id', isLoggedIn, deleteThread)

// AI Response route
router.post('/:id/ai-answer', isLoggedIn, generateAIResponseForThread)

// Voting routes
router.post('/:id/vote', isLoggedIn, voteThread)
router.post('/:threadId/reply/:replyId/vote', isLoggedIn, voteReply)

// Reply routes
router.post('/:id/reply', isLoggedIn, upload.array('images', 3), addReply) // Allow up to 3 images for replies
router.put('/:threadId/reply/:replyId', isLoggedIn, upload.array('images', 3), updateReply)
router.delete('/:threadId/reply/:replyId', isLoggedIn, deleteReply)

// Admin routes
router.patch('/:id/pin', isLoggedIn, authorizedRole('ADMIN'), togglePinThread)
router.patch('/:id/close', isLoggedIn, authorizedRole('ADMIN'), toggleCloseThread)

export default router
