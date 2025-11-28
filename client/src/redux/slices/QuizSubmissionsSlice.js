import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../helpers/AxiosInstance";

const initialState = {
    submissions: [],
    submissionDetails: null,
    isLoading: false,
};

export const submitQuiz = createAsyncThunk("/quiz-submission/submit", async ({ quizId, answers }) => {
    try {
        const response = axiosInstance.post(`/quiz-submission/${quizId}`, { answers });
        toast.success(response?.data?.message || "Quiz submitted successfully");
        return (await response).data.submission;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to submit quiz");
    }
});

export const getUserSubmissions = createAsyncThunk("/quiz-submission/user", async () => {
    try {
        const response = axiosInstance.get("/quiz-submission/user");
        return (await response).data.submissions;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch submissions");
    }
});

export const getSubmissionsByQuiz = createAsyncThunk("/quiz-submission/quiz", async (quizId) => {
    try {
        const response = axiosInstance.get(`/quiz-submission/quiz/${quizId}`);
        return (await response).data.submissions;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch quiz submissions");
    }
});

export const getSubmissionById = createAsyncThunk("/quiz-submission/details", async (submissionId) => {
    try {
        const response = axiosInstance.get(`/quiz-submission/${submissionId}`);
        return (await response).data.submission;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch submission details");
    }
});

const quizSubmissionsSlice = createSlice({
    name: "quizSubmissions",
    initialState,
    reducers: {
        clearSubmissions: (state) => {
            state.submissions = [];
            state.submissionDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserSubmissions.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserSubmissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.submissions = action.payload || [];
            })
            .addCase(getUserSubmissions.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(getSubmissionById.fulfilled, (state, action) => {
                state.submissionDetails = action.payload || null;
            })
            .addCase(submitQuiz.fulfilled, (state, action) => {
                if (action) state.submissions.push(action);
            });
    },
});

export const { clearSubmissions } = quizSubmissionsSlice.actions;
export default quizSubmissionsSlice.reducer;
