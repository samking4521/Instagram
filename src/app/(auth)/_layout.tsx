import { Stack } from 'expo-router'

export default function AuthNavigator(){
    return(
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name='signIn'/>
            <Stack.Screen name='signUp'/>
            <Stack.Screen name='signUpEmail'/>
            <Stack.Screen name='confirmCode'/>
            <Stack.Screen name='forgotPwd'/>
        </Stack>
    )
}