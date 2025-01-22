import { useState, useMemo, useEffect } from 'react'
import {View, Text, Pressable, Image, StyleSheet, ActivityIndicator} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Fontisto} from '@expo/vector-icons'
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet'
import * as ImgPicker from 'expo-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { router, useLocalSearchParams } from 'expo-router'
import { uploadData } from 'aws-amplify/storage';

export default function ProfilePicture(){
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const [image, setImage] = useState<string | null>(null);
    const snapPoints = useMemo(()=> ['80%'], [])
    const { name } = useLocalSearchParams()
    const [loadingIndicator, setLoadingIndicator] = useState(false)

    const openCamera = async () => {
        // Request camera permissions
        const permissionResult = await ImgPicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
          alert('Camera access is required to use this feature.');
          return;
        }

        // Launch the camera
        const result = await ImgPicker.launchCameraAsync({
          mediaTypes: 'images', // Allow photos and videos
          allowsEditing: true, // Allow user to edit the captured image
          quality: 1, // Highest quality
        });
    
        if (!result.canceled) {
          setImage(result.assets[0].uri); // Store the captured image URI
        }
      };
    
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImgPicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      };

     
      const cropImage = ()=>{
        if(typeof image === 'string'){
          ImagePicker.openCropper({
            path: image,
            width: 300,
            height: 400,
            mediaType: 'photo'
          }).then(img => {
             setImage(img.path)
          });
        }
      }

      const uploadImageToS3Bucket = async()=>{
        try {
          if(typeof image !== 'string'){
              return
          }
          // Fetch the image and convert it to a blob
        const getRealImg = await fetch(image);
        const theBlob = await getRealImg.blob();
        console.log('The Blob', theBlob);
      // Upload the image blob to the storage
          const result = await uploadData({
            // path:  `media/userProfilePicture/a856aacc-e3fd-4dd7-9db0-96dc9721f420`,
            path: ({identityId}) => `media/userProfilePicture/${identityId}/*`,
            data: theBlob,
          }).result;
          console.log('Succeeded: ', result);
          router.push({
            pathname: '/(auth)/welcomeScreen',
            params: {name}
          })
          setLoadingIndicator(false)
        } catch (error) {
          console.log('Error : ', error);
          setLoadingIndicator(false)
        }
      }

      const processImage = ()=>{
         if(image){
            setLoadingIndicator(true)
            uploadImageToS3Bucket()
         }else{
          setOpenBottomSheet(true)
         }
      }

      const skipToWelcomeScreen = async ()=>{
        if(image){
          setOpenBottomSheet(true)
        }else{
          router.push({
            pathname: '/(auth)/welcomeScreen',
            params: {name}
          })
        }
      }

      
    return(
        <SafeAreaView style={{  flex: 1, 
                                padding: 20, 
                                backgroundColor:'#F3FAFF'
                            }}>
            <View style={{flex: 1}}>
               
                    <Text style={{ fontSize: 24, 
                                    fontFamily:'sans-serif', 
                                    fontWeight: '800', 
                                    letterSpacing: 0.5, 
                                    marginBottom: 10,
                                    marginTop: image? 20 : 0}}
                    >{image? 'Confirm or change your profile profile picture' : 'Add a profile picture'}</Text>
                   {!image && <Text style={{ fontSize: 15, 
                                    lineHeight: 20, 
                                    letterSpacing: 0.5, 
                                    marginBottom: 15
                                }}
                     >Add a profile picture so your friends know it's you. Everyone will be able to see your picture.</Text>}
                <View style={{alignItems:"center"}}>
                <View style={{ justifyContent:image? 'center' : 'flex-end', alignItems:'center', width: 250, height: 250, borderWidth: 10, borderRadius: 250, borderColor:'white', backgroundColor:"#ebecf0", marginTop: 10}}>
                    {!image && <AntDesign name="user" size={180} color="white" /> }                  
                     {image && <Image source={{ uri : image}} style={{width: 235, height: 235, borderRadius: 235, resizeMode:'cover'}}/>}

                    
                    </View>
                {image && <Pressable onPress={cropImage} style={{flexDirection:'row', alignItems:'center', marginTop: 20, borderWidth: 1, borderColor:'lightgray', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20}}>
                        <Fontisto name="crop" size={16} color="#4C4C4C" style={{marginRight: 12}}/>
                        <Text style={{fontSize: 18, letterSpacing: 0.2, fontWeight: '500'}}>Edit</Text>
                     </Pressable>
                    }
                </View>
                   

                    <View style={{marginTop:'auto'}}>
                        <Pressable onPress={processImage} style={{
                            backgroundColor: '#2337C6', 
                            padding: 10, 
                            borderRadius: 25,
                            marginBottom: 10
                        }}>
                            { loadingIndicator? <ActivityIndicator size="small" color="white" /> : <Text style={{
                                 color:'white', 
                                 fontWeight:'500', 
                                 fontSize: 16, 
                                 alignSelf:'center'
                            }}>{image? 'Done' : 'Add Picture'}</Text>}
                            
                        </Pressable>
                        <Pressable onPress={skipToWelcomeScreen} style={{
                            borderWidth: 1,
                            borderColor:'#4C4C4C', 
                            padding: 10, 
                            borderRadius: 25
                        }}>
                            <Text style={{
                                 fontWeight:'500', 
                                 fontSize: 16, 
                                 alignSelf:'center'
                            }}>{image? 'Change picture' : 'Skip'}</Text>
                        </Pressable>
                    </View>
            </View>
            {openBottomSheet && <Pressable onPress={()=> setOpenBottomSheet(false) } style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.5)'}}>
            </Pressable>}

            {openBottomSheet && <BottomSheet onClose={()=> setOpenBottomSheet(false)} backgroundStyle={{backgroundColor:'rgba(0,0,0,0)'}} snapPoints={snapPoints} index={0} enablePanDownToClose handleStyle={{ marginHorizontal: 3,  backgroundColor:'#F3FAFF', borderTopLeftRadius:20, borderTopRightRadius: 20}} handleIndicatorStyle={{backgroundColor:"lightgray", width: 45}}>
                <BottomSheetView style={{ flex: 1 }}>
                     <View style={{ padding: 10, marginHorizontal: 3, marginBottom: 5, flex: 1, backgroundColor:'#F3FAFF', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                     <AntDesign onPress={()=> setOpenBottomSheet(false)} name="close" size={30} color="black" />
                     <Text style={{fontWeight:'600', letterSpacing: 0.5, fontSize: 25, marginTop: 10}}>Add picture</Text>
                        <View style={{backgroundColor:'white', borderRadius: 20, padding: 20, marginTop: 20}}>
                            <Text onPress={()=> {  pickImage(); setOpenBottomSheet(false)}} style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Choose from Gallery</Text>
                            <Text onPress={()=> {  openCamera(); setOpenBottomSheet(false)}} style={{marginVertical: 25, fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Take photo</Text>
                            {image && <Text onPress={()=> {setImage(null); setOpenBottomSheet(false)}} style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Remove profile picture</Text>}

                        </View>
                     </View>
                </BottomSheetView>
          </BottomSheet>}
        </SafeAreaView>
    )
}