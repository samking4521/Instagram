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
            <Stack.Screen name='createPassword'/>
            <Stack.Screen name='enterBirthday'/>
            <Stack.Screen name='enterName'/>
            <Stack.Screen name='createUsername'/>
            <Stack.Screen name='profilePicture'/>
            <Stack.Screen name='welcomeScreen'/>
            <Stack.Screen name='autoSignIn'/>
            <Stack.Screen name='confirmResetCode'/>
            <Stack.Screen name='newPassword'/>
        </Stack>
    )
}