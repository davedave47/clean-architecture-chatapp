import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { logOut } from "./userSlice";
import { IConversation, IMessage } from "../interfaces";

export const fetchAllConvo = createAsyncThunk('convo/fetchConvo', async () => {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/conversation', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data)
    return data;
});

type IConversationState = {
    convo: IConversation[]|null;
    loading: boolean;
    error: string;
}

const convoSlice = createSlice({
    name: 'friend',
    initialState: {
        convo: null,
        loading: false,
        error: ''
    } as IConversationState,
    reducers: {
        setConvo(state, action: PayloadAction<IConversation[]>) {
            state.convo = action.payload;
        },
        addConvo(state, action: PayloadAction<IConversation>) {
            if (state.convo!==null) {
                state.convo.push(action.payload);
            }
        },
        removeConvo(state, action: PayloadAction<string>) {
            if (state.convo!==null)
            state.convo = state.convo.filter(convo => convo.id !== action.payload);
        },
        setLatestMessage(state, action: PayloadAction<IMessage>) {
            if (state.convo!==null) {
                const convo = state.convo.find(convo => convo.id === action.payload.conversationId);
                if (convo) {
                    convo.lastMessage = action.payload;
                }
            }
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchAllConvo.fulfilled, (state, action) => {
            state.convo = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchAllConvo.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchAllConvo.rejected, (state, action) => {
            state.error = action.error.message || '';
            state.loading = false;
        });
        builder.addCase(logOut, (state) => {
            state.convo = null;
            state.loading = false;
            state.error = '';
        });
    }
});

export const { setConvo, addConvo, removeConvo, setLatestMessage} = convoSlice.actions;
export default convoSlice.reducer;