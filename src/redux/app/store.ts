import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from '../features/userAuthSlice'

// import reduxLogger from 'redux-logger'

const store = configureStore({
    reducer: {
        auth : userAuthReducer
    },
    // middleware: (getDefaultMiddleware)=> getDefaultMiddleware().concat(reduxLogger)
    
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch