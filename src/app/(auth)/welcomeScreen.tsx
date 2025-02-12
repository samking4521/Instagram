import { useFonts } from 'expo-font';
import { View, Text, Pressable, SafeAreaView, Image, ActivityIndicator, Modal} from 'react-native'
import { Feather, AntDesign } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router';
import { getUrl } from 'aws-amplify/storage';
import { useState, useLayoutEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth'
import type { Schema } from '../../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import { storage } from './signIn';
import * as FileSystem from 'expo-file-system';

const client = generateClient<Schema>()

export default function WelcomeScreen(){
    const { name, email, mobileNo, password} = useLocalSearchParams()
    const [image, setImage] = useState<string | null>(null)
    const [loadingIndicator, setLoadingIndicator] = useState(false)
    const [errorText, showErrorText] = useState(false)


    const setCompleteSignUp = async()=>{
        try{
            // get user in Database
              const { userId } = await getCurrentUser();
              console.log('userId : ', userId)
              // if userId returns true
              if(userId){
                  const { data: user } = await client.models.User.list({
                    filter: {
                      sub: {
                          'eq': userId
                      }
                    }
                  });
                  console.log('User : ', user)
            
                  const updatedUserDataObj = {
                      id: user[0].id,
                      completeSignUp: true
                    };
                    // update user obj with username
                    const { data: updatedUserData } = await client.models.User.update(updatedUserDataObj);
                    console.log('Updated User Data : ', updatedUserData)
              }
        }catch(e){
            console.log('Error updating user complete sign up key : ', e)
            showErrorText(true)
            setLoadingIndicator(false)
        }
    }

     useFonts({
        'Pacifico-Regular': require('../../../assets/fonts/Pacifico-Regular.ttf'),
       });
    
     useLayoutEffect(()=>{
        getUserProfileImg()
     }, [])

     const getUserProfileImg = async ()=>{
        const linkToStorageFile = await getUrl({
            path: ({identityId}) => `media/userProfilePicture/${identityId}/*`,
          });
          setImage(linkToStorageFile.url.href)
     }

     const clearLocalStorage = async()=>{
            // delete a specific key + value
            if(email){
                if(typeof email !== 'string'){
                    return
                }
                storage.delete(email)
                storage.delete(`${email} confirmed`)
            }else{
                if(typeof mobileNo !== 'string'){
                    return
                }
                storage.delete(mobileNo)
                storage.delete(`${mobileNo} confirmed`)
            }
     }


     const saveImageToLocal = async (imageUrl: string) => {
        try {
                const fileName = imageUrl.split('/').pop(); // Extract file name from the URL
                const destinationPath = `${FileSystem.documentDirectory}${fileName}`;
            
                const downloadResult = await FileSystem.downloadAsync(imageUrl, destinationPath);
                
                return downloadResult.uri
        } catch (error) {
                 console.error('Error saving image:', error);
        }
      };
    

     
      const setLoginDataLocally = async ()=>{
        if(email){
            if(typeof email !== 'string'){
                return
            }
            if(typeof image !== 'string'){
                return
            }
            const imagePath = await saveImageToLocal(image)
            console.log('Image saved locally')
            const user = {
                username: name,
                email: email,
                password: password,
                image: imagePath,
              }
    
              // Serialize the object into a JSON string
              storage.set(`${user.email} login`, JSON.stringify(user))
              console.log('User login info saved successfully via email')
        }else{
            if(typeof mobileNo !== 'string'){
                return
            }
            if(typeof image !== 'string'){
                return
            }
            const imagePath = await saveImageToLocal(image)
            console.log('Image saved locally')
            const user = {
                username: name,
                mobile: mobileNo,
                password: password,
                image: imagePath,
              }
    
              // Serialize the object into a JSON string
             storage.set(`${user.mobile} login`, JSON.stringify(`${user.mobile} login`))
          console.log('User login info saved successfully via mobileNo')
        }
      }

     const enterAppHomeScreen = async()=>{
             setLoadingIndicator(true)
             await setCompleteSignUp()
             await clearLocalStorage()
             await setLoginDataLocally()
             console.log('Local data cleared successfully')
             router.push('/(home)/explore')
     }

    return(
        <SafeAreaView style={{flex: 1, backgroundColor:'white'}}>
            <View style={{flex: 1, paddingVertical: 10, paddingHorizontal: 20}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Feather name="camera" size={35} color="black" />
                        <Text style={{marginLeft: 10, fontSize: 32, fontFamily:'Pacifico-Regular'}}>Instagram</Text>
                    </View>
                    <View style={{flex: 1, marginTop:'40%', alignItems:'center'}}>
                       {image?     <Image source={{uri : image}} style={{width: 150, height: 150, borderRadius: 150}}/>
                                 : <View style={{width: 150, height: 150, borderRadius: 150, borderWidth: 1, justifyContent:'center', alignItems:'center'}}>
                            <AntDesign name="home" size={50} color="black" />
                        </View>}
                        <Text style={{fontSize: 25, textAlign:'center', fontWeight:'500', marginTop: 15}}>Welcome to Instagram, {name}</Text>
                        <Text style={{marginVertical: 20, fontSize: 15, fontWeight: '500', color:'#4C4C4C', textAlign: 'center'}}>When you follow people you will see the photos and videos they post</Text>
                        <Pressable onPress={enterAppHomeScreen} style={{ width: '90%', backgroundColor:'blue', padding: 10, borderRadius: 25}}>
                             {loadingIndicator? <ActivityIndicator size={'small'} color='white'/> : <Text style={{color:'white', fontWeight:'600', textAlign:'center', fontSize: 16}}>Continue to Home</Text>}
                        </Pressable>
                        { errorText && <Text style={{color:'red', letterSpacing: 0.3}}>Something went wrong! Please check your internet connection or try again later</Text>}                    
                   </View>
                    
            </View>
            <Modal visible={loadingIndicator} onRequestClose={()=>{}} presentationStyle='overFullScreen' transparent={true}>
                                       <View style={{flex: 1}}>
                      
                                       </View>
                        </Modal>
            
        </SafeAreaView>
    )
}
