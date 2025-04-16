import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux';
import store from '../redux/app/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

export default function RootNavigator(){
      const [loaded, error] = useFonts({
            'Pacifico-Regular': require('../../assets/fonts/Pacifico-Regular.ttf'),
           });
          
           useEffect(() => {
            if (loaded || error) {
              SplashScreen.hideAsync();
            }
          }, [loaded, error]);
        
          if (!loaded && !error) {
            return null;
          }
    return (
    <Provider store={store}>
          <SafeAreaProvider>
          <GestureHandlerRootView style={{flex: 1}}>
                         <Slot/>
                </GestureHandlerRootView>
          </SafeAreaProvider>         
    </Provider>
    )
}