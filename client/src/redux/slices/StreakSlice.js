import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../helpers/AxiosInstance";

const initialState = {
    currentMonthStreak: null,
    streakHistory: [],
    isLoading: false,
};

export const getCurrentMonthStreak = createAsyncThunk("/streak/current", async (month) => {
    try {
        const response = axiosInstance.get(`/streak?month=${month}`);
        return (await response).data.streak;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch streak data");
    }
});

export const getStreakHistory = createAsyncThunk("/streak/history", async () => {
    try {
        const response = axiosInstance.get("/streak/history");
        return (await response).data.streakHistory;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch streak history");
    }
});

const streakSlice = createSlice({
    name: "streak",
    initialState,
    reducers: {
        clearStreak: (state) => {
            state.currentMonthStreak = null;
            state.streakHistory = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCurrentMonthStreak.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCurrentMonthStreak.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentMonthStreak = action.payload || null;
            })
            .addCase(getCurrentMonthStreak.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(getStreakHistory.fulfilled, (state, action) => {
                state.streakHistory = action.payload || [];
            });
    },
});

export const { clearStreak } = streakSlice.actions;
export default streakSlice.reducer;
