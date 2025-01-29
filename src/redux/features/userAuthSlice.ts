import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type initialState = {
    userAuth: string | null
}
const initialState: initialState = {
    userAuth: null
}

const userAuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userAuthSuccess: (state, action: PayloadAction<string>)=>{
            state.userAuth = action.payload
        },
        userAuthError: (state)=>{
            state.userAuth = null
        }
    }
})

export default userAuthSlice.reducer
export const { userAuthSuccess, userAuthError} = userAuthSlice.actions