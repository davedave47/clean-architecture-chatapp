import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { logOut } from "./userSlice";
import { IUser } from "@/interfaces";
import { acceptRequest } from "./requestSlice";
type FriendState = {
    friends: IUser[]|null;
    loading: boolean;
    error: string;
}

export const fetchAllFriends = createAsyncThunk('friend/fetchFriends', async () => {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/friend', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
});

const friendSlice = createSlice({
    name: 'friend',
    initialState: {
        friends: null,
        loading: false,
        error: ''
    } as FriendState,
    reducers: {
        setFriends(state, action: PayloadAction<IUser[]>) {
            state.friends = action.payload;
        },
        addFriend(state, action: PayloadAction<IUser>) {
            if (state.friends!==null)
            state.friends.push(action.payload);
        },
        removeFriend(state, action: PayloadAction<string>) {
            if (state.friends!==null)
            state.friends = state.friends.filter(friend => friend.id !== action.payload);
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchAllFriends.fulfilled, (state, action) => {
            state.friends = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchAllFriends.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchAllFriends.rejected, (state, action) => {
            state.error = action.error.message || '';
            state.loading = false;
        });
        builder.addCase(logOut, (state) => {
            state.friends = null;
            state.loading = false;
            state.error = '';
        });
        builder.addCase(acceptRequest, (state, action) => {
            if (state.friends!==null) {
                state.friends.push(action.payload);
            }
        });
    }
});

export const { setFriends, addFriend, removeFriend } = friendSlice.actions;
export default friendSlice.reducer;