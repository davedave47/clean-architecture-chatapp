import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface UserState {
    id: string|undefined;
    username: string|undefined;
    email: string|undefined;
}

const initialState: UserState = {
    id: undefined,
    username: undefined,
    email: undefined
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload.id;
            state.username = action.payload.username;
            state.email = action.payload.email;
        },
        logOut(state) {
            state.id = undefined;
            state.username = undefined;
            state.email = undefined;
        },
    }
});

export const { setUser, logOut } = userSlice.actions;
export default userSlice.reducer;
