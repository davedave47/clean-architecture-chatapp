import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { IUser } from "../interfaces";
import { logOut } from "./userSlice";
type RequestState = {
    requests: {
        sent: IUser[],
        received: IUser[]
    }|null;
    loading: boolean;
    error: string;
}
export const fetchAllRequests = createAsyncThunk('request/fetchRequests', async () => {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/friend/requests', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
})

const requestSlice = createSlice({
    name: 'request',
    initialState: {
        requests: null,
        loading: false,
        error: ''
    } as RequestState,
    reducers: {
        setRequests(state, action: PayloadAction<{sent: IUser[], received: IUser[]}>) {
            state.requests = action.payload;
        },
        receiveRequest(state, action: PayloadAction<IUser>) {
            if (state.requests!==null)
            state.requests.received.push(action.payload);
        },
        removeRequest(state, action: PayloadAction<IUser>) {
            if (state.requests!==null)
            state.requests.sent = state.requests.sent.filter(user => user.id !== action.payload.id);
        },
        sendRequest(state, action: PayloadAction<IUser>) {
            if (state.requests!==null)
            state.requests.sent.push(action.payload);
        },
        acceptRequest(state, action: PayloadAction<IUser>) {
            if (state.requests!==null) {
                state.requests.received = state.requests.received.filter(user => user.id !== action.payload.id);
            }
        },
        rejectRequest(state, action: PayloadAction<IUser>) {
            if (state.requests!==null) {
                state.requests.received = state.requests.received.filter(user => user.id !== action.payload.id);
            }
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchAllRequests.fulfilled, (state, action) => {
            state.requests = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchAllRequests.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchAllRequests.rejected, (state, action) => {
            state.error = action.error.message || '';
            state.loading = false;
        });
        builder.addCase(logOut, (state) => {
            state.requests = null;
            state.loading = false;
            state.error = '';
        });
    }
});

export const { setRequests, removeRequest, receiveRequest, sendRequest, acceptRequest, rejectRequest } = requestSlice.actions;
export default requestSlice.reducer;