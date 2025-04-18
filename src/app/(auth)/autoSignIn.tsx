import { useEffect, useState } from "react";
import { View, Image, FlatList, Text, Pressable, Modal, ActivityIndicator} from "react-native";
import { Entypo, MaterialIcons, FontAwesome6, AntDesign} from "@expo/vector-icons";
import { storage } from "../(home)/_layout";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/src/Providers/supabaselib";
import { userAuthSuccess, anonymousUserAuthSuccess } from "@/src/redux/features/userAuthSlice";
import { useAppDispatch } from "@/src/redux/app/hooks";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AutoSignIn(){
    const [allLogInData, setAllLogInData] = useState<LoginData[]>([])
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showDelText, setShowDelText] = useState(false)
    const dispatch = useAppDispatch()
    

    type LoginData = {
        username: string,
        email: string | undefined,
        mobile: string | undefined,
        image: string | undefined,
        password: string | undefined
    }

    useEffect(()=>{
        getAutoSignInKeysAndValues()
    }, [])

    const getAutoSignInKeysAndValues = async()=>{
        try{
        // getting all keys
        const keys = storage.getAllKeys()
        const loginObjData = keys.map((key)=>{
        // Deserialize the JSON string into an object
        const jsonUser = storage.getString(key) 
        
        if(jsonUser){
             const userObject = JSON.parse(jsonUser)
             return userObject
       }  
 })

    setAllLogInData(loginObjData)
        }catch(e){
            console.log('Error message : ', e)
        }
       
    }

    const signInUser = async (data: LoginData)=>{
        setShowModal(true)
        if(data.email){
            if(typeof data.password !== 'string'){
                return
            }
             const { data: {session} } = await supabase.auth.signInWithPassword({
                                        email: data.email,
                                        password: data.password,
                            })
                    if(session){
                        console.log('User signed in successfully : ')
                        setShowModal(false)
                        dispatch(userAuthSuccess(session.user.id))
                        dispatch(anonymousUserAuthSuccess(null))
                        router.replace('/(home)/explore')
                    }
        }else{
            if(typeof data.mobile !== 'string'){
                return
            }
        const { data: signInMobile, error } = await supabase.auth.signInWithOtp({
                                phone: data.mobile,
                              })
                              if(error){
                                  console.log('Error signing in with otp', error.message)
                                  return
                              }
                              if(signInMobile){
                                  console.log('User login in process : ', data)
                                  router.push({
                                    pathname: '/(auth)/confirmCode',
                                    params: {mobileNo: data.mobile, fromSignIn: 'true'}
                                  })
                                 setShowModal(false)
                              }
        }
    }


    const deleteLogInData = ()=>{
          // getting all keys
          const keys = storage.getAllKeys()
          keys.forEach((key)=>{
            storage.delete(key)
        })
        setShowDelText(false)
        setOpenBottomSheet(false)
        router.back()
    }



    return(
        <SafeAreaView style={{flex: 1,  backgroundColor:'#F3FAFF'}}>
            <View style={{flex: 1, padding: 20}}>
                 <Entypo onPress={()=> setOpenBottomSheet(true)} style={{alignSelf:'flex-end'}} name="dots-three-horizontal" size={24} color="black" />
                 <View style={{alignSelf:'center', marginTop: 50, marginBottom: 70}}>
                    <Image source={require('../../../assets/images/instagram_icon.jpeg')} style={{width: 60, height: 60}}/>
                 </View>
                 <View>
                    <FlatList data={allLogInData} style={{height: 400}} contentContainerStyle={{gap: 10}} showsVerticalScrollIndicator={false} renderItem={({item})=>{
                        
                        return(
                            <Pressable onPress={()=> signInUser(item)} style={{flexDirection:"row", alignItems:'center', backgroundColor:'white', padding: 15, borderRadius: 15, elevation: 3, shadowColor: 'gray'}}>
                                {
                                    item.image?  <Image source={{uri : item.image}} style={{width: 60, height: 60, borderRadius: 60, marginRight: 10}}/> :  <View style={{width: 60, height: 60, borderRadius: 60, marginRight: 10, backgroundColor:'rgba(224,224,224,0.5)'}}/>
                                }
                                <View>
                                    <Text style={{fontSize: 16, fontWeight:'600'}}>{item.username}</Text>
                                    <Text style={{color:'#4C4C4C'}}>{item.email || item.mobile}</Text>
                                </View>
                                <MaterialIcons name="navigate-next" size={24} color="#4C4C4C" style={{marginLeft:'auto'}}/>
                        </Pressable>
                        )
                    }}/>
                 </View>

                 <View style={{marginTop:'auto'}}>
                 <Pressable onPress={()=> router.push('/(auth)/signIn')} style={{marginTop: 15, borderWidth: 0.5, borderColor:'gray', paddingVertical: 10, borderRadius: 25}}>
                     <Text style={{textAlign:'center', fontSize: 16, fontWeight: '600'}}>Use another profile</Text>
                 </Pressable>

                    <Pressable onPress={()=> router.push('/(auth)/signUp')} style={{ 
                        marginTop: 20,
                         borderWidth: 1, 
                         borderColor:'#2337C6', 
                         padding: 10, 
                         borderRadius: 25
                    }}>
                        <Text style={{
                            alignSelf:'center', 
                            fontWeight:'500', 
                            color:'#2337C6', 
                            fontSize: 15, 
                            letterSpacing: 0.5
                        }}>Create new account</Text>
                    </Pressable>
                    <View style={{
                         flexDirection:'row', 
                         alignItems:'center', 
                         alignSelf:'center', 
                         marginTop: 15
                    }}>
                        <FontAwesome6 name="meta" size={20} color="#4C4C4C" style={{marginRight: 5}} />
                        <Text style={{
                            fontSize: 16, 
                            color:'#4C4C4C', 
                            fontWeight:'600'
                        }}>Meta</Text>
                    </View>
                </View>

            </View>
            {
                openBottomSheet && <Pressable onPress={()=> setOpenBottomSheet(false)} style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.5)'}}>

                </Pressable>
            }
            {openBottomSheet && <BottomSheet onClose={()=> setOpenBottomSheet(false)} backgroundStyle={{backgroundColor:'rgba(0,0,0,0)'}} snapPoints={['20%']} index={0} enablePanDownToClose handleStyle={{ marginHorizontal: 3,  backgroundColor:'#F3FAFF', borderTopLeftRadius:20, borderTopRightRadius: 20}} handleIndicatorStyle={{backgroundColor:"lightgray", width: 45}}>
                <BottomSheetView style={{ flex: 1 }}>
                     <View style={{ padding: 20, marginHorizontal: 3, marginBottom: 5, flex: 1, backgroundColor:'#F3FAFF', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <AntDesign onPress={()=> { console.log('mea'); setOpenBottomSheet(false)}} name="close" size={30} color="black" style={{marginRight: 10}}/>
                            <Text style={{ position:'absolute', left: '40%', fontSize: 18, fontWeight: '600'}}>Profiles</Text>
                        </View>
                        <Pressable onPress={()=>{ setShowDelText(true); deleteLogInData()}} style={{ flexDirection: showDelText? 'row' : 'column', marginTop: 'auto', backgroundColor:'white', borderRadius: 15, padding: 15, elevation: 3}}>
                           { showDelText && <ActivityIndicator size={'small'} color='black'/>}
                            <Text style={{fontSize: 17, letterSpacing:0.2, fontWeight:'500'}} >{showDelText? 'Deleting...' : 'Remove profiles from this device'}</Text>
                        </Pressable>
                     </View>
                </BottomSheetView>
          </BottomSheet>}
         <Modal visible={showModal} presentationStyle='fullScreen' animationType='slide'>
                <View style={{flex: 1, justifyContent:'center', alignItems:'center', backgroundColor:'#F3FAFF'}}>
                      <ActivityIndicator size='large' color='silver'/>
                </View>
          </Modal>
        </SafeAreaView>
    )
}