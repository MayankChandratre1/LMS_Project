import { configureStore } from '@reduxjs/toolkit'

import AuthSlice from './slices/AuthSlice'
import CourseSlice from './slices/CourseSlice'
import LectureSlice from './slices/LectureSlice'
import RazorpaySlice from './slices/RazorpaySlice'
import StatSlice from './slices/StatSlice'
import ChatSlice from './slices/ChatSlice'
import progressSliceReducer from './slices/ProgressSlice'
import quizSliceReducer from './slices/QuizSlice'
import quizSubmissionsSliceReducer from './slices/QuizSubmissionsSlice'
import streakSliceReducer from './slices/StreakSlice'


const store = configureStore({
    reducer: {
        auth: AuthSlice,
        course: CourseSlice,
        razorpay: RazorpaySlice,
        lecture: LectureSlice,
        stat: StatSlice,
        chat: ChatSlice,
        progress: progressSliceReducer,
        quiz: quizSliceReducer,
        quizSubmissions: quizSubmissionsSliceReducer,
        streak: streakSliceReducer,
    },
    devTools: true
})


export default store