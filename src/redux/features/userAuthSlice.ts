import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type initialState = {
    userAuth: string | null,
    showModal: boolean
}
const initialState: initialState = {
    userAuth: null,
    showModal: true
}

const userAuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userAuthSuccess: (state, action: PayloadAction<string>)=>{
            state.userAuth = action.payload
            state.showModal = false
        },
        userAuthError: (state)=>{
            state.userAuth = null
            state.showModal = false
        }
    }
})

export default userAuthSlice.reducer
export const { userAuthSuccess, userAuthError} = userAuthSlice.actions