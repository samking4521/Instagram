import { AntDesign, Entypo } from '@expo/vector-icons'
import React from 'react'
import { View, Text, Pressable, Modal } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { router } from 'expo-router'

export default function PromptLoginModal({ showLoginPrompt, setShowLoginPrompt }: { showLoginPrompt: boolean, setShowLoginPrompt: React.Dispatch<React.SetStateAction<boolean>>} ){

      const navigateToLoginOrSignUp= ()=>{
            router.replace('/(auth)/signIn')
      }

  return (
  <SafeAreaProvider>
      <Modal visible={showLoginPrompt} onRequestClose={()=> setShowLoginPrompt(false)} presentationStyle='overFullScreen' animationType='slide' transparent={true}>
      <View style={{flex: 1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
             <View style={{backgroundColor:'white', borderRadius: 20, width: '90%'}}>
                  <View style={{flexDirection:'row', alignItems:'center', paddingVertical: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor:'lightgray'}}>
                        <AntDesign name='close' size={22} color='black'/>
                        <Text style={{ fontSize: 16, fontWeight:'600', letterSpacing:0.2, textAlign:'center', flex: 1, marginLeft: -25}}>Log in or sign up</Text>
                  </View>
                  <View style={{paddingHorizontal: 20, paddingBottom: 20}}>
                        <Text style={{marginTop: 10, marginBottom: 20, fontSize: 20, fontWeight:'500', fontFamily:'Pacifico-Regular'}}>Welcome to Instagram</Text>
                  <View>
                      <Pressable onPress={navigateToLoginOrSignUp} style={{                 
                          backgroundColor:'#2337C6', 
                          padding: 15, 
                          borderRadius: 25,
                      }}>
                           <Text style={{
                              alignSelf:'center', 
                              fontWeight:'500', 
                              color:'white', 
                              fontSize: 15, 
                              letterSpacing: 0.2
                           }}>Log In</Text>
                     </Pressable>
                  </View>
        
                  </View>
                      </View>
        </View>
      </Modal>
        
    </SafeAreaProvider>
  )
}

