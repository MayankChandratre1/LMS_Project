import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../helpers/AxiosInstance";

const initialState = {
    threads: [],
    currentThread: null,
    myThreads: [],
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0
    }
};

// Get all threads
export const getAllThreads = createAsyncThunk("/forum/getAll", async ({ page = 1, limit = 20, sort = '-createdAt' }) => {
    try {
        const response = await axiosInstance.get(`/forum?page=${page}&limit=${limit}&sort=${sort}`);
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch threads");
        throw error;
    }
});

// Get thread by ID
export const getThreadById = createAsyncThunk("/forum/getById", async (threadId) => {
    try {
        const response = await axiosInstance.get(`/forum/${threadId}`);
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch thread");
        throw error;
    }
});

// Create new thread
export const createThread = createAsyncThunk("/forum/create", async (formData) => {
    try {
        toast.loading("Creating thread...", { position: 'top-center' });
        const response = await axiosInstance.post("/forum", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.dismiss();
        toast.success(response?.data?.message || "Thread created successfully");
        return response.data.data;
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message || "Failed to create thread");
        throw error;
    }
});

// Update thread
export const updateThread = createAsyncThunk("/forum/update", async ({ threadId, formData }) => {
    try {
        toast.loading("Updating thread...", { position: 'top-center' });
        const response = await axiosInstance.put(`/forum/${threadId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.dismiss();
        toast.success(response?.data?.message || "Thread updated successfully");
        return response.data.data;
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message || "Failed to update thread");
        throw error;
    }
});

// Delete thread
export const deleteThread = createAsyncThunk("/forum/delete", async (threadId) => {
    try {
        toast.loading("Deleting thread...", { position: 'top-center' });
        const response = await axiosInstance.delete(`/forum/${threadId}`);
        toast.dismiss();
        toast.success(response?.data?.message || "Thread deleted successfully");
        return threadId;
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message || "Failed to delete thread");
        throw error;
    }
});

// Add reply to thread
export const addReply = createAsyncThunk("/forum/addReply", async ({ threadId, formData }) => {
    try {
        toast.loading("Adding reply...", { position: 'top-center' });
        const response = await axiosInstance.post(`/forum/${threadId}/reply`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.dismiss();
        toast.success(response?.data?.message || "Reply added successfully");
        return response.data.data;
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message || "Failed to add reply");
        throw error;
    }
});

// Vote on thread
export const voteThread = createAsyncThunk("/forum/vote", async ({ threadId, voteType }) => {
    try {
        const response = await axiosInstance.post(`/forum/${threadId}/vote`, { voteType });
        return { threadId, ...response.data.data };
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to vote");
        throw error;
    }
});

// Vote on reply
export const voteReply = createAsyncThunk("/forum/voteReply", async ({ threadId, replyId, voteType }) => {
    try {
        const response = await axiosInstance.post(`/forum/${threadId}/reply/${replyId}/vote`, { voteType });
        return { threadId, replyId, ...response.data.data };
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to vote");
        throw error;
    }
});

// Search threads
export const searchThreads = createAsyncThunk("/forum/search", async ({ query, page = 1, limit = 20 }) => {
    try {
        const response = await axiosInstance.get(`/forum/search?q=${query}&page=${page}&limit=${limit}`);
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to search threads");
        throw error;
    }
});

// Get threads by category
export const getThreadsByCategory = createAsyncThunk("/forum/category", async ({ category, page = 1, limit = 20 }) => {
    try {
        const response = await axiosInstance.get(`/forum/category/${category}?page=${page}&limit=${limit}`);
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch threads");
        throw error;
    }
});

// Get threads by course
export const getThreadsByCourse = createAsyncThunk("/forum/course", async ({ courseId, page = 1, limit = 20 }) => {
    try {
        const response = await axiosInstance.get(`/forum/course/${courseId}?page=${page}&limit=${limit}`);
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch threads");
        throw error;
    }
});

// Generate AI response
export const generateAIResponse = createAsyncThunk("/forum/aiAnswer", async (threadId) => {
    try {
        toast.loading("Generating AI response...", { position: 'top-center' });
        const response = await axiosInstance.post(`/forum/${threadId}/ai-answer`);
        toast.dismiss();
        toast.success(response?.data?.message || "AI response generated");
        return response.data.data;
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message || "Failed to generate AI response");
        throw error;
    }
});

const forumSlice = createSlice({
    name: "forum",
    initialState,
    reducers: {
        clearForumState: (state) => {
            state.threads = [];
            state.currentThread = null;
            state.myThreads = [];
            state.error = null;
        },
        setCurrentThread: (state, action) => {
            state.currentThread = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all threads
            .addCase(getAllThreads.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllThreads.fulfilled, (state, action) => {
                state.isLoading = false;
                state.threads = action.payload?.threads || [];
                state.pagination = {
                    currentPage: action.payload?.currentPage || 1,
                    totalPages: action.payload?.totalPages || 1,
                    total: action.payload?.total || 0
                };
            })
            .addCase(getAllThreads.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.threads = [];
                state.pagination = {
                    currentPage: 1,
                    totalPages: 1,
                    total: 0
                };
            })
            // Get thread by ID
            .addCase(getThreadById.fulfilled, (state, action) => {
                state.currentThread = action.payload;
            })
            // Create thread
            .addCase(createThread.fulfilled, (state, action) => {
                if (action.payload) {
                    state.threads.unshift(action.payload);
                }
            })
            // Update thread
            .addCase(updateThread.fulfilled, (state, action) => {
                if (action.payload) {
                    const index = state.threads.findIndex(t => t._id === action.payload._id);
                    if (index !== -1) {
                        state.threads[index] = action.payload;
                    }
                    if (state.currentThread?._id === action.payload._id) {
                        state.currentThread = action.payload;
                    }
                }
            })
            // Delete thread
            .addCase(deleteThread.fulfilled, (state, action) => {
                state.threads = state.threads.filter(t => t._id !== action.payload);
                if (state.currentThread?._id === action.payload) {
                    state.currentThread = null;
                }
            })
            // Add reply
            .addCase(addReply.fulfilled, (state, action) => {
                if (action.payload && state.currentThread?._id === action.payload._id) {
                    state.currentThread = action.payload;
                }
            })
            // Generate AI response
            .addCase(generateAIResponse.fulfilled, (state, action) => {
                if (action.payload && state.currentThread?._id === action.payload._id) {
                    state.currentThread = action.payload;
                }
            })
            // Search threads
            .addCase(searchThreads.fulfilled, (state, action) => {
                state.threads = action.payload?.threads || [];
                state.pagination = {
                    currentPage: action.payload?.currentPage || 1,
                    totalPages: action.payload?.totalPages || 1,
                    total: action.payload?.total || 0
                };
            })
            // Get by category
            .addCase(getThreadsByCategory.fulfilled, (state, action) => {
                state.threads = action.payload?.threads || [];
                state.pagination = {
                    currentPage: action.payload?.currentPage || 1,
                    totalPages: action.payload?.totalPages || 1,
                    total: action.payload?.total || 0
                };
            })
            // Get by course
            .addCase(getThreadsByCourse.fulfilled, (state, action) => {
                state.threads = action.payload?.threads || [];
                state.pagination = {
                    currentPage: action.payload?.currentPage || 1,
                    totalPages: action.payload?.totalPages || 1,
                    total: action.payload?.total || 0
                };
            });
    },
});

export const { clearForumState, setCurrentThread } = forumSlice.actions;
export default forumSlice.reducer;
