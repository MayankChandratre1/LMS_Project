import { configureStore } from '@reduxjs/toolkit'

import AuthSlice from './slices/AuthSlice'
import CourseSlice from './slices/CourseSlice'
import LectureSlice from './slices/LectureSlice'
import RazorpaySlice from './slices/RazorpaySlice'
import StatSlice from './slices/StatSlice'
import ChatSlice from './slices/ChatSlice'


const store = configureStore({
    reducer: {
        auth: AuthSlice,
        course: CourseSlice,
        razorpay: RazorpaySlice,
        lecture: LectureSlice,
        stat: StatSlice,
        chat: ChatSlice
    },
    devTools: true
})


export default store