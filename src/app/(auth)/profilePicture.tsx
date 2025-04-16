import { useState, useMemo, useEffect } from 'react'
import {View, Text, Pressable, Image, StyleSheet, ActivityIndicator, Modal, Alert} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Fontisto} from '@expo/vector-icons'
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet'
import * as ImgPicker from 'expo-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/src/Providers/supabaselib'
import { useAppSelector } from '@/src/redux/app/hooks'

export default function ProfilePicture(){
    const userAuth = useAppSelector((state)=> state.auth.userAuth)
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const [image, setImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(false)
    const [imgSelect, setImgSelect] = useState(false)
    const snapPoints = useMemo(()=> ['80%'], [])
    const { name, email, mobileNo, password } = useLocalSearchParams()
    const [loadingIndicator, setLoadingIndicator] = useState(false)

    const checkIfImageExistsInDb = async()=>{
      const { data } = await supabase
      .from('User')
      .select('key')
      .eq('id', userAuth)
      console.log('Key object : ', data)
      if(data){
         if(data[0].key){
            return data[0].key
         }
      }
    }

    const getImageUrl = async(imgPath: string)=>{
      const { data: {publicUrl} } = supabase
      .storage
      .from('insta-photos')
      .getPublicUrl(imgPath)
      if(publicUrl){
          setImage(publicUrl)
          setImageUrl(true)
      }
    }

     useEffect(()=>{
        (async()=>{
            const imgPath = await checkIfImageExistsInDb()
            if(imgPath){
              getImageUrl(imgPath)
            }
        })()
       
     }, [])


    const showAlert = () => {
      Alert.alert(
        'Network Error', // Title of the alert
        'Image upload failed due to a network error. Please check your connection and try again.', // Message in the alert
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: true } // Allows dismissal by tapping outside the alert
      );
    };

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
          quality: 1, // Highest quality,
          aspect: [1, 1]
          
        });
    
        if (!result.canceled) {
          setImage(result.assets[0].uri); // Store the captured image URI
          setImgSelect(true)
        }
      };
    
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImgPicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
          setImgSelect(true)
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

     
      const uploadImageToImagesBucket = async(image: string)=>{
        try {
               if(imageUrl && !imgSelect){
                router.push({
                  pathname: '/(auth)/welcomeScreen',
                  params: {name, email, mobileNo, password}
                })
                return
               }
              const imgPath = await checkIfImageExistsInDb()
              if(imgPath){
                  await delImageInBucket(imgPath, true)
                  const arraybuffer = await fetch(image).then((res) => res.arrayBuffer())
                  const fileExt = image?.split('.').pop()?.toLowerCase() ?? 'jpeg'
                  const uniqueVal = Date.now()
                  const { data, error } = await supabase
                  .storage
                  .from('insta-photos')
                  .upload(`Profile_Photos/${userAuth}/userPhoto_${uniqueVal}.${fileExt}`, arraybuffer, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: 'image/*'
                  })
                  if(error){
                    console.log('Error storage : ', error)
                    setLoadingIndicator(false)
                  }else{
                      if(data){
                        console.log('storage id : ', data)
                        // Store image key in database
                        const { data: userInDb, error } = await supabase
                                    .from('User')
                                    .update({ key: `Profile_Photos/${userAuth}/userPhoto_${uniqueVal}.${fileExt}` })
                                    .eq('id', userAuth)
                                    .select()
                      if(userInDb){
                        console.log('User object updated : ', userInDb )
                        router.push({
                          pathname: '/(auth)/welcomeScreen',
                          params: {name, email, mobileNo, password}
                        })
                        setLoadingIndicator(false)
                       }
                    }
                }          
                
                      
              }else{
                const arraybuffer = await fetch(image).then((res) => res.arrayBuffer())
                const fileExt = image?.split('.').pop()?.toLowerCase() ?? 'jpeg'
                const uniqueVal = Date.now()
                const { data, error } = await supabase
                .storage
                .from('insta-photos')
                .upload(`Profile_Photos/${userAuth}/userPhoto_${uniqueVal}.${fileExt}`, arraybuffer, {
                  cacheControl: '3600',
                  upsert: false,
                  contentType: 'image/*'
                })
                if(error){
                  console.log('Error storage : ', error)
                  setLoadingIndicator(false)
                }else{
                    if(data){
                      console.log('storage id : ', data)
                      // Store image key in database
                      const { data: userInDb, error } = await supabase
                                  .from('User')
                                  .update({ key: `Profile_Photos/${userAuth}/userPhoto_${uniqueVal}.${fileExt}` })
                                  .eq('id', userAuth)
                                  .select()
                    if(userInDb){
                      console.log('User object updated : ', userInDb )
                      router.push({
                        pathname: '/(auth)/welcomeScreen',
                        params: {name, email, mobileNo, password}
                      })
                      setLoadingIndicator(false)
                     }
                  }
              }          
              }
                    
        } catch(error) {
          console.log('Error : ', error);
          setLoadingIndicator(false)
          showAlert()
        }
      }

      const processImage = ()=>{
         if(image){
            setLoadingIndicator(true)
            uploadImageToImagesBucket(image)
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
            params: {name, email, mobileNo, password}
          })
        }
      }

      const delImageInBucket = async (imgPath: string, param: boolean)=>{
          const { data, error } = await supabase
          .storage
          .from('insta-photos')
          .remove([`${imgPath}`])

          if(error){
            console.log('Error deleting image in bucket : ', error.message)
            return
          }

            if(data){
                console.log('Image deleted successfully : ', data)
                 // Store image key in database
                 const { data: userInDb, error } = await supabase
                 .from('User')
                 .update({ key: null })
                 .eq('id', userAuth)
                 .select()
                if(param){
                  return
                }
                setImage(null); 
                setOpenBottomSheet(false)
            }
        
      }

     const deleteImage = async()=>{
          const imgPath = await checkIfImageExistsInDb()
          if(imgPath){
            delImageInBucket(imgPath, false)
          }else{
            setImage(null); 
            setOpenBottomSheet(false)
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
                     <Text style={{fontWeight:'600', letterSpacing: 0.5, fontSize: 25, marginTop: 10}}>{ image? 'Change picture' : 'Add Picture'}</Text>
                        <View style={{backgroundColor:'white', borderRadius: 20, padding: 20, marginTop: 20}}>
                            <Text onPress={()=> {  pickImage(); setOpenBottomSheet(false)}} style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Choose from Gallery</Text>
                            <Text onPress={()=> {  openCamera(); setOpenBottomSheet(false)}} style={{marginVertical: 25, fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Take photo</Text>
                            {image && <Text onPress={deleteImage} style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Remove profile picture</Text>}

                        </View>
                     </View>
                </BottomSheetView>
          </BottomSheet>}
          <Modal visible={loadingIndicator} onRequestClose={()=>{}} presentationStyle='overFullScreen' transparent={true}>
                           <View style={{flex: 1}}>
          
                           </View>
            </Modal>
        </SafeAreaView>
    )
}