import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from '../features/userAuthSlice'

const store = configureStore({
    reducer: {
        auth : userAuthReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      })
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch