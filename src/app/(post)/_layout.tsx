import { Stack } from "expo-router"

export default function PostLayout() {
        return(
            <Stack initialRouteName="index" screenOptions={{ headerShown: false, animation:'slide_from_left'}}>
                <Stack.Screen name='index'/>
                <Stack.Screen name='LiveCamera'/>
                <Stack.Screen name='PostPreview'/>
            </Stack>
        )
}