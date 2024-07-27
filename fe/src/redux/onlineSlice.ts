import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { logOut } from './userSlice';
import { removeFriend } from './friendSlice';
import { IUser } from '@/interfaces';
type OnlineState = IUser[]|null;

const initialState: OnlineState = null;

const onlineSlice = createSlice({
    name: 'online',
    initialState: initialState as OnlineState,
    reducers: {
        // @ts-expect-error ts(6133)
        setOnline(state, action: PayloadAction<IUser[]>) {
            console.log("action",action.payload)
            return action.payload;
        },
        loggedOn(state, action: PayloadAction<IUser>) {
            if (state!==null) {
                if (action.payload.username === '') {
                    return state;
                }
                state.push(action.payload);
            }
        },
        loggedOff(state, action: PayloadAction<IUser>) {
            if (state!==null) {
                return state.filter(user => user.id !== action.payload.id);
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(logOut, () => {
            return initialState;
        })
        builder.addCase(removeFriend, (state, action) => {
            if (state!==null) {
                return state.filter(user => user.id !== action.payload);
            }
        })
    }
})

export const { setOnline, loggedOn, loggedOff } = onlineSlice.actions;
export default onlineSlice.reducer;