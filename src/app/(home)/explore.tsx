import { View, Text, Image, FlatList, Pressable } from 'react-native'
import React, { useState, useLayoutEffect } from 'react'
import { Feather } from '@expo/vector-icons'
import { anonymousUserAuthSuccess, userAuthSuccess } from '@/src/redux/features/userAuthSlice'
import UsersFollowing from '../../../assets/users.json'
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context'
import PromptLoginModal from '@/src/components/promptLoginModal'
import { useAppSelector } from '@/src/redux/app/hooks'
import { supabase } from '@/src/Providers/supabaselib'
import { useDispatch } from 'react-redux'
import { useNavigation } from 'expo-router'

export default function Explore(){
  const anonymousUser = useAppSelector((state)=> state.auth.anonymousUserAuth)
  const userAuth = useAppSelector((state)=> state.auth.userAuth)

  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const dispatch = useDispatch()
  const navigation = useNavigation()

  
 
  const addToStory = ()=>{
      if(anonymousUser){
          setShowLoginPrompt(true)
      }else{
         console.log('Created story')
      }
  }

  const signOut = async ()=>{
    const { error } = await supabase.auth.signOut()
    if(error){
      console.log('Error signing out : ', error.message)
    }else{
      console.log('User signed out')
      dispatch(userAuthSuccess(null))
      dispatch(anonymousUserAuthSuccess(null))
    }
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'white'}}>
       <View style={{flex: 1}}>
            <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal: 10}}>
                  <Text style={{fontSize: 25, fontWeight:'500', fontFamily:'Pacifico-Regular'}}>Instagram</Text>
                  <View style={{marginLeft:'auto', flexDirection:'row', alignItems:'center'}}>
                  <Feather name="heart" size={25} color="black" />
                  <Image source={require('../../../assets/images/insta_messenger_icon.png')} style={{marginLeft: 15, width: 30, height: 35}}/>
                  </View>
            </View>
            <View style={{paddingVertical: 10, borderBottomWidth: 0.5, borderColor:'lightgray', }}>
                 <FlatList contentContainerStyle={{gap: 15, paddingHorizontal: 10}} horizontal showsHorizontalScrollIndicator={false} data={UsersFollowing} renderItem={({item, index})=>{
                    if(index == 0){
                      return(
                        <Pressable onPress={addToStory} style={{alignItems:'center'}}>
                          <Image source={require('../../../assets/images/addStoryImg.jpeg')} style={{width: 80, height: 80}}/>
                          <Text>Your story</Text>
                        </Pressable>
                    )
                    }else{
                      if(item.following == 'true'){
                        return(
                          <View style={{alignItems:'center'}}>
                              <LinearGradient
                                  colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={{width: 80, height: 80, borderRadius: 80, justifyContent:'center', alignItems:'center'}}
                                >
                         
                              <View style={{width: 75, height: 75, borderRadius: 75, backgroundColor:'white', justifyContent:'center', alignItems:'center'}}>
                                <Image source={{ uri : item.image}} style={{width: 70, height: 70, borderRadius: 70}}/>
                              </View>
                       
                          </LinearGradient>
                          <Text>{item.username}</Text>
                         
                        </View>
                        )
                      }
                      else{
                        return(
                          <Pressable onPress={signOut} style={{alignItems:'center'}}>
                          <View style={{width: 75, height: 75, borderRadius: 75, justifyContent:'center', alignItems:'center'}}>
                             
                                <Image source={{ uri : item.image}} style={{width: 70, height: 70, borderRadius: 70}}/>
                                <View style={{zIndex: 1, position:'absolute', left: 22, top: 60, width: 35, height: 20, justifyContent:'center', alignItems:'center', backgroundColor:'white', borderRadius: 15, elevation: 3}}>
                                  <Feather name="user-plus" size={16} color="black" />
                                </View>
                           
                             
                          </View>
                          <Text>{item.username}</Text>
                        </Pressable>
                        )
                      }
                    }
                      
                 }}/>
            </View>
       </View>
        {/* Prompt login/Signup modal */}
       <PromptLoginModal showLoginPrompt={showLoginPrompt} setShowLoginPrompt={setShowLoginPrompt}/>
    </SafeAreaView>
  )
}
