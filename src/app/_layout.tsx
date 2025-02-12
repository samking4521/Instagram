import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json"
import { Provider } from 'react-redux';
import store from '../redux/app/store';

Amplify.configure(outputs);

export default function RootNavigator(){
    
    return (
    <Provider store={store}>
                <GestureHandlerRootView style={{flex: 1}}>
                          <Slot/>
                </GestureHandlerRootView>
    </Provider>
    )
}