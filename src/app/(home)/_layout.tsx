import { Tabs } from "expo-router";

export default function HomeNavigator(){
    return(
        <Tabs>
            <Tabs.Screen name='homeScreen'/>
            <Tabs.Screen name='search'/>
            <Tabs.Screen name='reels'/>
            <Tabs.Screen name='post'/>
            <Tabs.Screen name='profile'/>
        </Tabs>
    )
}