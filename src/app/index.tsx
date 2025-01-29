import { View, Image, Modal } from 'react-native'
import { Redirect } from 'expo-router'
import { signOut } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'
import { getCurrentUser } from "aws-amplify/auth"
import { useAppDispatch, useAppSelector } from '../redux/app/hooks'
import { userAuthSuccess, userAuthError } from '../redux/features/userAuthSlice'


const App = () => {
     const userAuth = useAppSelector((state)=> state.auth.userAuth)
     const dispatch = useAppDispatch()
     const [showModal, setShowModal] = useState(false)

  // useEffect(()=>{
  //     (async()=>{
  //       await signOut()
  //       console.log('User Signed out successfully')
  //     })()
  // }, [])

  useEffect(()=>{
    setShowModal(true)
    getAuthUser()
  }, [])

  const getAuthUser = async ()=>{
    const { userId } = await getCurrentUser()
    if(userId){
       console.log('user Auth retrieved successfully : ', userId)
       dispatch(userAuthSuccess(userId))
       setShowModal(false)
    }else{
      console.log('User is not authenticated yet : ', userId)
      dispatch(userAuthError())
      setShowModal(false)
    }
  }

  if(showModal){
    return <Modal visible={true} presentationStyle='overFullScreen'>
              <View style={{flex: 1, justifyContent:'center', alignItems:'center', backgroundColor:'white'}}>
                    <Image source={require('../../assets/images/instagramHomeIcon.png')} style={{borderRadius: 15, width: 70, height: 70}}/>
              </View>
          </Modal>
  }

  
  return <Redirect href={userAuth? "/(home)/homeScreen" : "/(auth)/signIn"}/>
}

export default App