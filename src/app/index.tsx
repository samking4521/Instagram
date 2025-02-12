import { View, Image, Modal, Text } from 'react-native'
import { Redirect } from 'expo-router'
import { signOut } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'
import { useAppSelector } from '../redux/app/hooks'
import { storage } from './(auth)/signIn'
import { getCurrentUser } from 'aws-amplify/auth';
import { useAppDispatch } from '../redux/app/hooks';
import { userAuthSuccess, userAuthError } from '../redux/features/userAuthSlice';

const App = () => {
     const userAuth = useAppSelector((state)=> state.auth.userAuth)
     const showModal = useAppSelector((state)=> state.auth.showModal)
     const [storageLoginData, setStorageLoginData] = useState('null')
     const dispatch = useAppDispatch()

     useEffect(()=>{
         getAuthUser()
       }, [])
     
       const getAuthUser = async ()=>{
         try{
           const { userId } = await getCurrentUser()
           if(userId){
              console.log('user Auth retrieved successfully : ', userId)
              dispatch(userAuthSuccess(userId))
           }
         }catch(e){
           console.log('Error getting auth user : ', e)
             dispatch(userAuthError())
         }
       }
       

  useEffect(()=>{
    getLoginKeys()
  }, [])

  const getLoginKeys = ()=>{
      const loginData = storage.getAllKeys()
      const trueKeys = loginData.filter((key)=> key.includes('login'))
      if(trueKeys[0]){
          setStorageLoginData('true')
          console.log('login data found')
      }else{
        setStorageLoginData('false')
        console.log('login data not found')
      }
  }

  
  if(showModal || storageLoginData == 'null'){
    return <Modal visible={true} presentationStyle='overFullScreen'>
              <View style={{flex: 1, alignItems:'center', justifyContent:'center', backgroundColor:'white'}}>
                    <Image source={require('../../assets/images/instagramHomeIcon.png')} style={{borderRadius: 15, width: 70, height: 70}}/>
                    
              </View>
              <View style={{alignItems:'center', marginTop:'auto', padding: 10}}>
                        <Text style={{color:'#4C4C4C', fontSize: 16}}>from</Text>
                        <Image style={{ width: 120, height: 28}} source={require('../../assets/images/from_meta.png')}/>
              </View>
          </Modal>
  }

  
  return <Redirect href={ userAuth? "/(home)/explore" : storageLoginData == 'true'? "/(auth)/autoSignIn" : "/(auth)/signIn"}/>
}

export default App