import { useEffect } from 'react';
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json"
import { signOut } from 'aws-amplify/auth'

Amplify.configure(outputs);

export default function RootNavigator(){
    
    return <GestureHandlerRootView style={{flex: 1}}>
                 <Slot/>
          </GestureHandlerRootView>
}