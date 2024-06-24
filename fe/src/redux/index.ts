import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import convoReducer from "./convoSlice";
import friendReducer from "./friendSlice";
import requestReducer from "./requestSlice";
const store = configureStore({
    reducer: {
        user: userReducer,
        convo: convoReducer,
        friend: friendReducer,
        request: requestReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;