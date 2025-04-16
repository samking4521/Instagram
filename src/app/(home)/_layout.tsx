import { View, Image, Modal, Text } from 'react-native'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Tabs } from "expo-router";
import { Foundation, Feather, Octicons, MaterialCommunityIcons, FontAwesome} from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from '@/src/redux/app/hooks'
import { userAuthSuccess, anonymousUserAuthSuccess, noUserAuthSuccess } from '@/src/redux/features/userAuthSlice'
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { supabase } from '@/src/Providers/supabaselib'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

 export default function App(){
     const userAuth = useAppSelector((state) => state.auth.userAuth)
     const showModal = useAppSelector((state) => state.auth.showModal)
     const anonymousUser = useAppSelector((state) => state.auth.anonymousUserAuth)
     const [storageLoginData, setStorageLoginData] = useState<boolean | null>(null)
     const [signInStatus, setSignInStatus] = useState<string | null>(null)
     const dispatch = useAppDispatch()
     
    
    
     console.log('User session : ', userAuth)

     useEffect(() => {
       supabase.auth.getSession().then(({ data: { session } }) => {
         if(session){
            if(session.user.is_anonymous){
              dispatch(anonymousUserAuthSuccess(session.user.id))
              setSignInStatus('true')
            }
            else{
              dispatch(userAuthSuccess(session.user.id))
            }
         }else{
              (async()=>{
                const loginDataKeys = checkLocalStorage()
                if(loginDataKeys[0]){
                   dispatch(noUserAuthSuccess())
                    setStorageLoginData(true)
                    setSignInStatus('true')
                }else{
                  signInAnonymousUser()
                  setSignInStatus('true')
                }
              })()
         }
       })
     }, [])

     const checkLocalStorage = ()=>{
      const loginData = storage.getAllKeys()
      return loginData
     }

     useEffect(()=>{
        setNavigationColor('#FFFFFF')
     }, [])

     const setNavigationColor = (color: string) => {
        changeNavigationBarColor(color)
    };


      const signInAnonymousUser = async()=>{
             const { data: {session}, error } = await supabase.auth.signInAnonymously()
             if(error){
                 console.log('Error signing in anonymous user : ',error)
             }else{
                if(session){
                  console.log('anonymous data : ', session.user.id)
                  dispatch(anonymousUserAuthSuccess(session.user.id))
                }
             }
          }

          useEffect(()=>{
            if(!userAuth){
              return
            }
            checkUserSignInStatus()
          }, [userAuth])
        
          const checkUserSignInStatus = async()=>{
            console.log('the id : ', userAuth)
            const { data } = await supabase
            .from('User')
            .select()
            .eq('id', userAuth)    // Correct
            console.log('User object : ', data)
            if(data){
               if(data[0].signInStatus){
                   console.log('set true')
                   setSignInStatus('true')
               }else{
                console.log('set false')
                setSignInStatus('false')
               }
            }
          }

  useEffect(()=>{
    getLoginKeys()
  }, [userAuth, anonymousUser])

  const getLoginKeys = ()=>{
      const loginData = storage.getAllKeys()
      if(loginData[0]){
          setStorageLoginData(true)
          console.log('login data saved')
      }else{
        setStorageLoginData(null)
        console.log('login data not saved')
      }
  }

  console.log('anonymous user: ', anonymousUser)

  if(showModal || !signInStatus){
    return (<SafeAreaView style={{flex: 1, backgroundColor:'white'}}>
              <View style={{flex: 1, alignItems:'center', justifyContent:'center'}}>
                    <Image source={require('../../../assets/images/instagramHomeIcon.png')} style={{borderRadius: 15, width: 70, height: 70}}/>

              </View>
              <View style={{alignItems:'center', marginTop:'auto', padding: 10}}>
                        <Text style={{color:'#4C4C4C', fontSize: 16}}>from</Text>
                        <Image style={{ width: 120, height: 28}} source={require('../../../assets/images/from_meta.png')}/>
              </View>
          </SafeAreaView>
    )
  }

  

      if((userAuth || anonymousUser) && signInStatus == 'true'){
        return(
                    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, animation: 'shift'}}>
                        <Tabs.Screen name='explore' options={{ tabBarIcon: ()=> <Foundation name="home" size={28} color={'black'} />}}/>
                        <Tabs.Screen name='search' options={{ tabBarIcon: ()=> <Feather name="search" size={28} color={'black'} />}}/>
                        <Tabs.Screen name='post' options={{ tabBarIcon: ()=> <Octicons name="diff-added" size={28} color="black" /> }}/>
                        <Tabs.Screen name='reels' options={{ tabBarIcon: ()=> <MaterialCommunityIcons name="movie-play-outline" size={28} color="black" />}}/>
                        <Tabs.Screen name='profile' options={{ tabBarIcon: ()=> <FontAwesome name="user-circle-o" size={28} color="#959BA3" />}}/>
                    </Tabs>
                )
        }else if(storageLoginData){
             return <Redirect href={'/(auth)/autoSignIn'}/>
        }else{
            return <Redirect href={'/(auth)/signIn'}/>
        }
   }
