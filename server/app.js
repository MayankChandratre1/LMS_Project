import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import chatRoutes from './routes/aiRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import miscRoutes from './routes/miscellaneousRoutes.js'
import errorMiddleware from './middleware/errorMiddleware.js'
import quizSubmissionRoutes from './routes/quizSubmisionRoutes.js'
import NodeCache from 'node-cache'
import forumThreadRoutes from './routes/forumThreadRoutes.js' // Add this import

dotenv.config()
const app = express()
export const myCache = new NodeCache();

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/course", courseRoutes)
app.use("/api/v1/payments", paymentRoutes)
app.use("/api/v1/progress", progressRoutes)
app.use("/api/v1/ai", chatRoutes)
app.use("/api/v1/quiz", quizRoutes)
app.use("/api/v1/quiz-submission", quizSubmissionRoutes)
app.use("/api/v1", miscRoutes)
app.use('/api/v1/forum', forumThreadRoutes) // Add this line

app.use("/ping", (req, res) => {
    res.send("Server is working")
})

app.all("*", (req, res) => {
    res.status(404).send(`!oops page not found`)
})
app.use(errorMiddleware)
export default app