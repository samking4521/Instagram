import { View, Text } from 'react-native'
import { Redirect } from 'expo-router'
import { signOut } from 'aws-amplify/auth'
import { useEffect } from 'react'

const App = () => {
  // useEffect(()=>{
  //     (async()=>{
  //       await signOut()
  //       console.log('User Signed out successfully')
  //     })()
  // }, [])

  return <Redirect href="/(auth)/signIn"/>
}

export default App