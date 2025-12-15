import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../helpers/AxiosInstance";

const initialState = {
    quizzes: [], // Ensure quizzes is always an array
    quizDetails: null,
    isLoading: false,
};

export const createQuiz = createAsyncThunk("/quiz/create", async (data) => {
    try {
        const response = axiosInstance.post("/quiz", data);
        toast.success(response?.data?.message || "Quiz created successfully");
        return (await response).data.quiz;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to create quiz");
    }
});

export const getQuizzesByCourse = createAsyncThunk("/quiz/course", async (courseId) => {
    try {
        const response = axiosInstance.get(`/quiz/course/${courseId}`);

        return (await response).data.quizzes;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch quizzes");
    }
});

export const getQuizById = createAsyncThunk("/quiz/details", async (quizId) => {
    try {
        const response = axiosInstance.get(`/quiz/${quizId}`);
        return (await response).data.quiz;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch quiz details");
    }
});

export const updateQuiz = createAsyncThunk("/quiz/update", async ({ quizId, data }) => {
    try {
        const response = axiosInstance.put(`/quiz/${quizId}`, data);
        toast.success(response?.data?.message || "Quiz updated successfully");
        return (await response).data.quiz;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to update quiz");
    }
});

export const deleteQuiz = createAsyncThunk("/quiz/delete", async (quizId) => {
    try {
        const response = axiosInstance.delete(`/quiz/${quizId}`);
        toast.success(response?.data?.message || "Quiz deleted successfully");
        return quizId;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete quiz");
    }
});

export const generateQuiz = createAsyncThunk("/quiz/generate", async (topicDescription) => {
    try {
        const response = await axiosInstance.post("/quiz/generate", { topicDescription });
        toast.success(response?.data?.message || "Quiz generated successfully");
        return response.data.questions;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to generate quiz");
        throw error;
    }
});

const quizSlice = createSlice({
    name: "quiz",
    initialState,
    reducers: {
        clearQuizState: (state) => {
            state.quizzes = [];
            state.quizDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getQuizzesByCourse.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getQuizzesByCourse.fulfilled, (state, action) => {
                console.log(action.payload);

                state.isLoading = false;
                state.quizzes = action.payload || [];
            })
            .addCase(getQuizzesByCourse.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(getQuizById.fulfilled, (state, action) => {
                state.quizDetails = action.payload || null;
            })
            .addCase(createQuiz.fulfilled, (state, action) => {
                if (action) state.quizzes.push(action);
            })
            .addCase(updateQuiz.fulfilled, (state, action) => {
                if (action) {
                    const index = state.quizzes.findIndex((quiz) => quiz._id === action._id);
                    if (index !== -1) state.quizzes[index] = action;
                }
            })
            .addCase(deleteQuiz.fulfilled, (state, action) => {
                state.quizzes = state.quizzes.filter((quiz) => quiz._id !== action);
            });
    },
});

export const { clearQuizState } = quizSlice.actions;
export default quizSlice.reducer;
