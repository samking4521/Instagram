import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type initialState = {
    userAuth: string | null,
    anonymousUserAuth: string | null,
    showModal: boolean
}
const initialState: initialState = {
    userAuth: null,
    showModal: true,
    anonymousUserAuth: null
}

const userAuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userAuthSuccess: (state, action: PayloadAction<string | null>)=>{
            state.userAuth = action.payload
            state.showModal = false
        },
        noUserAuthSuccess: (state)=>{
            state.userAuth = null
            state.showModal = false
        },
        anonymousUserAuthSuccess: (state, action: PayloadAction<string | null>)=>{
            state.anonymousUserAuth = action.payload
            state.showModal = false
        }
    }
})

export default userAuthSlice.reducer
export const { userAuthSuccess, noUserAuthSuccess, anonymousUserAuthSuccess} = userAuthSlice.actions