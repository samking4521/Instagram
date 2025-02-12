import { Tabs } from "expo-router";
import { Foundation, Feather, Octicons, MaterialCommunityIcons, FontAwesome} from "@expo/vector-icons";

export default function HomeNavigator(){
    return(
        <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, animation: 'shift'}}>
            <Tabs.Screen name='explore' options={{ tabBarIcon: ()=> <Foundation name="home" size={28} color={'black'} />}}/>
            <Tabs.Screen name='search' options={{ tabBarIcon: ()=> <Feather name="search" size={28} color={'black'} />}}/>
            <Tabs.Screen name='post' options={{ tabBarIcon: ()=> <Octicons name="diff-added" size={28} color="black" /> }}/>
            <Tabs.Screen name='reels' options={{ tabBarIcon: ()=> <MaterialCommunityIcons name="movie-play-outline" size={28} color="black" />}}/>
            <Tabs.Screen name='profile' options={{ tabBarIcon: ()=> <FontAwesome name="user-circle-o" size={28} color="#959BA3" />}}/>
        </Tabs>
    )
}