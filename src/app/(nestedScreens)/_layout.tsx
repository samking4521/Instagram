import { Stack } from "expo-router"
export default function NestedScreensLayout(){
        return(
            <Stack screenOptions={{ headerShown: false}}>
                <Stack.Screen name='index'/>
                <Stack.Screen name='LiveCamera'/>
                <Stack.Screen name='PostPreview'/>
            </Stack>
        )
}