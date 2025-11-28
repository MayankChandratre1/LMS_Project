import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../helpers/AxiosInstance";

const initialState = {
    dashboard: null,
    userProgress: null,
    analytics: null,
    graphData: null,
    isLoading: false
};

export const updateLectureProgress = createAsyncThunk("/progress/update", async (data) => {
    try {
        const response = axiosInstance.put(`/progress/lecture/${data.courseId}/${data.lectureId}`, {
            timeSpent: data.timeSpent
        });
        toast.promise(response, {
            loading: "Updating progress...",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to update progress"
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getDashboardData = createAsyncThunk("/progress/dashboard", async () => {
    try {
        const response = axiosInstance.get("/progress/dashboard");
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getUserProgress = createAsyncThunk("/progress/user", async (courseId) => {
    try {
        const response = axiosInstance.get(`/progress/user/${courseId}`);
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getCourseAnalytics = createAsyncThunk("/progress/analytics", async (courseId) => {
    try {
        const response = axiosInstance.get(`/progress/analytics/${courseId}`);
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getGraphData = createAsyncThunk("/progress/graph", async (courseId) => {
    try {
        const response = axiosInstance.get(`/progress/graph/${courseId}`);
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

const progressSlice = createSlice({
    name: "progress",
    initialState,
    reducers: {
        clearProgress: (state) => {
            state.userProgress = null;
            state.analytics = null;
            state.graphData = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateLectureProgress.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateLectureProgress.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload?.success && state.userProgress) {
                    state.userProgress.progress = action.payload.progress;
                }
            })
            .addCase(updateLectureProgress.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(getDashboardData.fulfilled, (state, action) => {
                if (action.payload?.success) {
                    state.dashboard = action.payload.dashboard;
                }
            })
            .addCase(getUserProgress.fulfilled, (state, action) => {
                if (action.payload?.success) {
                    state.userProgress = action.payload.progress;
                }
            })
            .addCase(getCourseAnalytics.fulfilled, (state, action) => {
                if (action.payload?.success) {
                    state.analytics = action.payload.analytics;
                }
            })
            .addCase(getGraphData.fulfilled, (state, action) => {
                if (action.payload?.success) {
                    state.graphData = action.payload.graphData;
                }
            });
    }
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;
