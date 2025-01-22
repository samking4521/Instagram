import { useFonts } from 'expo-font';
import { View, Text, Pressable, SafeAreaView, Image} from 'react-native'
import { Feather, AntDesign } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router';
import { getUrl } from 'aws-amplify/storage';
import { useState , useEffect, useLayoutEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function WelcomeScreen(){
    const { name } = useLocalSearchParams()
    const [image, setImage] = useState<string | null>(null)


    const storeData = async (value: string) => {
        try {
          await AsyncStorage.setItem('welcomeScreen', value);
          console.log('welcomeScreen set as true to local storage')
        } catch (e) {
            console.log('Error storing data locally : ', e)
        }
      };
  
      useEffect(()=>{
        storeData('true')
      }, [])


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
                        <Pressable style={{ width: '90%', backgroundColor:'blue', padding: 10, borderRadius: 25}}>
                             <Text style={{color:'white', fontWeight:'600', textAlign:'center', fontSize: 16}}>Continue to Home</Text>
                        </Pressable>
                    </View>
                    
            </View>
        </SafeAreaView>
    )
}
