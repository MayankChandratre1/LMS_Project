import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

import axiosInstance from '../../helpers/AxiosInstance'

const initialState = {
    chatHistory: [],
    isLoading: false,
    error: null
}

export const getChatHistory = createAsyncThunk('/chat/history', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/ai/history')
        console.log('Chat history response:', response.data); // Debug log
        
        // Normalize the chat history data
        const chatHistory = response.data?.data || [];
        const normalizedHistory = chatHistory.map(chat => ({
            text: chat.text,
            response: chat.response,
            isUser: chat.isUser,
            createdAt: chat.createdAt,
            _id: chat._id
        }));
        
        return normalizedHistory;
    } catch (error) {
        console.error('Chat history error:', error); // Debug log
        return rejectWithValue(error?.response?.data?.message || 'Failed to load chat history');
    }
})

export const chatWithAI = createAsyncThunk('/chat/chat', async (data, { rejectWithValue }) => {
    try {
        toast.loading("waiting for AI response...", {
            position: 'top-center'
        })
        const response = await axiosInstance.post('/ai/chat', { prompt: data });
        toast.dismiss()
        toast.success(response.data.message)
        console.log('AI response:', response.data); // Debug log
        return { response: response.data?.data, userMessage: data }
    } catch (error) {
        toast.dismiss();
        console.error('AI chat error:', error); // Debug log
        toast.error(error?.response?.data?.message || 'Failed to get AI response');
        return rejectWithValue(error?.response?.data?.message || 'Failed to get AI response');
    }  
})

export const deleteChatHistory = createAsyncThunk('/chat/history/delete', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete('/ai/history');
        return response.data;
    } catch (error) {
        console.error('Delete chat history error:', error); // Debug log
        return rejectWithValue(error?.response?.data?.message || 'Failed to delete chat history');
    }
})

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        clearChatHistory: (state) => {
            state.chatHistory = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Chat History cases
            .addCase(getChatHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getChatHistory.fulfilled, (state, action) => {
                console.log('getChatHistory fulfilled:', action.payload); // Debug log
                state.isLoading = false;
                state.chatHistory = Array.isArray(action.payload) ? action.payload : [];
                state.error = null;
            })
            .addCase(getChatHistory.rejected, (state, action) => {
                console.log('getChatHistory rejected:', action.payload); // Debug log
                state.isLoading = false;
                state.error = action.payload;
                state.chatHistory = [];
            })
            // Chat with AI cases
            .addCase(chatWithAI.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(chatWithAI.fulfilled, (state, action) => {
                console.log('chatWithAI fulfilled:', action.payload); // Debug log
                state.isLoading = false;
                // Add user message
                state.chatHistory.push({ 
                    text: action.payload.userMessage, 
                    isUser: true,
                    createdAt: new Date().toISOString()
                });
                // Add AI response
                state.chatHistory.push({ 
                    response: JSON.stringify(action.payload.response), 
                    isUser: false,
                    createdAt: new Date().toISOString()
                });
                state.error = null;
            })
            .addCase(chatWithAI.rejected, (state, action) => {
                console.log('chatWithAI rejected:', action.payload); // Debug log
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete Chat History cases
            .addCase(deleteChatHistory.pending, (state) => {
                state.isLoading = true; 
                state.error = null;
            })
            .addCase(deleteChatHistory.fulfilled, (state, action) => {
                console.log('deleteChatHistory fulfilled:', action.payload); // Debug log
                state.isLoading = false;
                state.chatHistory = [];
                state.error = null;
            })
            .addCase(deleteChatHistory.rejected, (state, action) => {
                console.log('deleteChatHistory rejected:', action.payload); // Debug log
                state.isLoading = false;
                state.error = action.payload;
            });
    }
})

export const { clearChatHistory } = chatSlice.actions;
export default chatSlice.reducer