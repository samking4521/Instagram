import { View, Text, Pressable, Image, ActivityIndicator, Modal} from 'react-native'
import { Feather, AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { storage } from '../(home)/_layout';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/src/Providers/supabaselib';
import { useAppSelector } from '@/src/redux/app/hooks';

export default function WelcomeScreen(){
    const userAuth = useAppSelector((state)=> state.auth.userAuth)
    const { name, email, mobileNo, password} = useLocalSearchParams()
    const [image, setImage] = useState<string | null>(null)
    const [loadingIndicator, setLoadingIndicator] = useState(false)
    const [errorText, showErrorText] = useState(false)


    const setCompleteSignUp = async()=>{
        try{
            const { data } = await supabase
            .from('User')
            .update({ signInStatus: true })
            .eq('id', userAuth)
            .select()   

            if(data){
                if(data[0]){
                    console.log('User signInStatus updated successfully : ', data[0] )
                }
            }   
        }catch(e){
            console.log('Error updating user signInStatus: ', e)
            showErrorText(true)
            setLoadingIndicator(false)
        }
    }
    
     useEffect(()=>{
        checkIfImageExistsInDb()
     }, [])

     const checkIfImageExistsInDb = async()=>{
        const { data } = await supabase
        .from('User')
        .select('key')
        .eq('id', userAuth)
        console.log('Key object : ', data)
        if(data){
           if(data[0].key){
            getUserProfileImg(data[0].key)
           }
        }
      }

  

     const getUserProfileImg = async (imgUrl: string)=>{
        const { data: {publicUrl} } = supabase
        .storage
        .from('insta-photos')
        .getPublicUrl(imgUrl)
        if(publicUrl){
            setImage(publicUrl)
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
                
                const user = {
                    username: name,
                    email: email,
                    password: password,
                    image: undefined
                  }
        
                  // Serialize the object into a JSON string
                  storage.set(`${user.email} login`, JSON.stringify(user))
                  console.log('User login info saved successfully via email')
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
                image: imagePath,
              }
    
              // Serialize the object into a JSON string
             storage.set(`${user.mobile} login`, JSON.stringify(user))
          console.log('User login info saved successfully via mobileNo')
        }
      }

     const enterAppHomeScreen = async()=>{
             setLoadingIndicator(true)
             await setCompleteSignUp()
             setLoginDataLocally()
             setLoadingIndicator(false)
             router.replace('/(home)/explore')
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
