import { useState, useEffect, useRef, useMemo } from "react"
import { View, Text, TextInput, Pressable, Keyboard, Alert, ScrollView, StyleSheet, ActivityIndicator, Modal} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { router, useLocalSearchParams, useNavigation } from "expo-router"
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch } from "@/src/redux/app/hooks"
import { userAuthSuccess, anonymousUserAuthSuccess } from "@/src/redux/features/userAuthSlice";
import { supabase } from "@/src/Providers/supabaselib";
import { storage } from "../(home)/_layout";

export default function ConfirmCode(){
    const dispatch = useAppDispatch()
    const [showConfirmCodeText, setShowConfirmCodeText] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [confirmCode, setConfirmCode] = useState('')
    const [showConfirmCodeErrorText, setShowConfirmCodeErrorText] = useState<string | null>(null)
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const [codeResent, setCodeResent] = useState(false)
    const labelRef = useRef<TextInput>(null)
    const { mobileNo, email, password, resendConfirmCode, fromSignIn } = useLocalSearchParams()
    const snapPoints = useMemo(()=> ['70%'], [])
    const bottomSheetRef = useRef<BottomSheet>(null)
    const navigation = useNavigation()

    type UserObj = {
        name: string,
        password: string,
        username: string,
        dob: string,
    }
     
    useEffect(()=>{
        if(resendConfirmCode){
            resendConfirmationCode()
            setCodeResent(true)
        }
    }, [])

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
          setKeyboardVisible(false);
        });
    
        // Cleanup the listeners on component unmount
        return () => {
          showSubscription.remove();
          hideSubscription.remove();
        };
      }, []);

      const ConfirmCode = async ()=>{
        Keyboard.dismiss()
        if(confirmCode.length >= 6){
            setShowLoadingIndicator(true)
            confirmationCode()
        }else if(confirmCode.length == 0){
            setShowConfirmCodeErrorText('zero')
        }else{
           setShowConfirmCodeErrorText('less_than_6')
        }
           
      }

    

      const AutoSignInUser = async()=>{
        try{
           
            if(email){
                if(typeof email === 'string' && typeof password === 'string'){
                    const { data: {session}, error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                      })
                         if(error){
                             console.log('error signing in user : ', error, error.message, error.name)
                         }
                         else{
                            if(session){
                            console.log('Successfully signed in : ', session.user);
                            dispatch(userAuthSuccess(session.user.id))
                            dispatch(anonymousUserAuthSuccess(null))
                                   const { data } = await supabase
                                  .from('User')
                                  .insert({ 
                                     email: email,
                                     password: password,
                                     last_login: getLocalDateTimeString()
                                   })
                                  .select()
                                  if(data)
                                     if(data[0]){
                                        console.log('User Model Created successfully : ', data)
                                        router.push({
                                            pathname: '/(auth)/enterName',
                                            params: {email, password}
                                        })
                                        setShowLoadingIndicator(false)
                                     }
                            }
                        }
                     }
            }                
           
        }catch(error){
            if(error instanceof Error)
            console.log('Error signing user in: ', error.message)
            setShowConfirmCodeErrorText('network_error')
            setShowLoadingIndicator(false)
        }
            
      }


      function getLocalDateTimeString() {
        const now = new Date();
        return now.toLocaleString(); 
      }
      
       const showCompleteSignUpAlert = (userObj: UserObj) => {
              Alert.alert(
                'Complete Sign up',
                'You already have an account, proceed to complete your profile settings.',
                [
                  {
                    text: 'Complete Sign-up',
                    onPress: () => router.push({
                      pathname: '/(auth)/enterName',
                      params: {mobileNo, userData: userObj?.name}
                    })
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ],
                { cancelable: true }
              );
            };
      
            const goToSignUpPhone = () => {
                Alert.alert(
                  'Proceed To Sign Up',
                  "Before signing in, please complete your profile to continue.", 
                  [
                    {
                      text: 'Proceed To Sign-up',
                      onPress: () => router.push({
                        pathname: '/(auth)/enterName',
                        params: {mobileNo}
                      })
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                  ],
                  { cancelable: true }
                );
              };
        


      const confirmationCode = async()=>{
          try{
            if(email){
                if(typeof email !== 'string'){
                    return
                }
               // Confirm sign up with the OTP received
               const { data: {session}, error } = await supabase.auth.verifyOtp({ email, token: confirmCode, type: 'email'})
               if(error){
                    console.log('Error confirming code : ', error.message)
                    if(error.code == 'otp_expired'){
                        setShowConfirmCodeErrorText('invalid_code')
                        setShowLoadingIndicator(false)
                    }  
               }else{
                    if(session){
                        console.log(`Email Verify Complete`, session.user);
                        AutoSignInUser()
                 }
               }
           }else{
                if(typeof mobileNo !== 'string'){
                    return
                }
                // Confirm sign up with the OTP received
                const { data: {session, user}, error } = await supabase.auth.verifyOtp({ phone: mobileNo, token: confirmCode, type: 'sms'})
                        if(error){
                            console.log('Error confirming code : ', error.message)
                            if(error.code == 'otp_expired'){
                                setShowConfirmCodeErrorText('invalid_code')
                                setShowLoadingIndicator(false)
                            }  
                        }else{
                                if(session){
                                    console.log(`User signed in success via phone : `, session.user, user);
                                    dispatch(userAuthSuccess(session.user.id))
                                    dispatch(anonymousUserAuthSuccess(null))
                                    if(fromSignIn == 'true'){
                                        const { data } = await supabase
                                        .from('User')
                                        .select()
                                        .eq('id', session.user.id)
                                        if(data){
                                            if(data.length == 0){
                                                        const { data, error } = await supabase
                                                        .from('User')
                                                        .insert({ signInStatus: false
                                                        }).select()
                                                        if(data){
                                                            if(data[0]){
                                                                setShowLoadingIndicator(false)
                                                                goToSignUpPhone()
                                                            }
                                                        }
                                                       
                                                        
                                            }else{
                                                if(data[0].signInStatus){
                                                    router.replace('/(home)/explore')
                                                }else{
                                                   
                                                    setShowLoadingIndicator(false)
                                                    showCompleteSignUpAlert(data[0])
                                                }
                                            }
                                           
                                        }
                                    }else{
                                        const { data } = await supabase
                                        .from('User')
                                        .select()
                                        .eq('id', session.user.id)
                                        if(data){
                                            if(data[0].signInStatus){
                                                router.replace('/(home)/explore')
                                            }else{
                                                const { data: UserObjExists } = await supabase
                                                .from('User')
                                                .select()
                                                .eq('id', session.user.id)
                                                if(UserObjExists){
                                                    const { data, error } = await supabase
                                                    .from('User')
                                                    .update({ mobile: mobileNo,
                                                        last_login: getLocalDateTimeString()
                                                     })
                                                    .eq('id', session.user.id)
                                                    .select()
                                                  
                                              if(data)
                                                 if(data[0]){
                                                    console.log('User Model Updated successfully : ', data)
                                                    router.push({
                                                        pathname: '/(auth)/enterName',
                                                        params: {mobileNo, userData: JSON.stringify(UserObjExists[0])}
                                                    })
                                                    setShowLoadingIndicator(false)
                                    
                                        }
                                                }else{
                                                    const { data, error } = await supabase
                                                    .from('User')
                                                    .insert({ mobile: mobileNo,
                                                        last_login: getLocalDateTimeString()
                                                     })
                                                    .select()
                                        
                                              
                                              if(data)
                                                 if(data[0]){
                                                    console.log('User Model Created successfully : ', data)
                                                    router.push({
                                                        pathname: '/(auth)/enterName',
                                                        params: {mobileNo}
                                                    })
                                                    setShowLoadingIndicator(false)
                                    
                                        }
                                                }
                                            }
                                        }
                                        
                                       
                                    }
                                   
                            }
                        }
                }
          }catch(error){
                console.log('Error confirming code : ', error)
                setShowConfirmCodeErrorText('network_error')
                setShowLoadingIndicator(false)
          }         
 }
 
      const updateConfirmCode = (val: string)=>{
            setConfirmCode(val)
            if(showConfirmCodeErrorText){
                setShowConfirmCodeErrorText(null)
            }
      }

      const resendCode = ()=>{
          Keyboard.dismiss()
          setOpenBottomSheet(true)
      }

      const resendConfirmationCode = async ()=>{
        try{
            if(email){
                if(typeof email !== 'string'){
                    return
                }
                const { data } = await supabase.auth.resend({
                    type: 'signup',
                    email
                  })
                    console.log('code resent: ', data)
                    setCodeResent(true)
                    setOpenBottomSheet(false)
            }else {
                if(typeof mobileNo !== 'string'){
                    return
                }
                const { data } = await supabase.auth.resend({
                    type: 'sms',
                    phone: mobileNo
                  })
                
                    console.log('code resent: ', data)
                    setCodeResent(true)
                    setOpenBottomSheet(false)
            }
        }catch(error){
            if(error instanceof Error){
                console.log('Error resending signup code : ', error.message)
                setOpenBottomSheet(false)
                setShowConfirmCodeErrorText('resend_error')
            }
        }
        
      }

      const goToSignUp = ()=>{
        const keys = storage.getAllKeys()
         if(email){
            navigation.reset({
                index: keys[0]? 2 : 1,
                routes: keys[0]?
                 [ { name: 'autoSignIn' as never },
                    { name: 'signIn' as never },
                    { name: 'signUp' as never }] 
                    
                    :
                    
                 [
                    { name: 'signIn' as never },
                    { name: 'signUp' as never }
               ] // your stack screen name
            });
         }else{
            navigation.reset({
                index: keys[0]? 2 : 1,
                routes: keys[0]?
                 [ { name: 'autoSignIn' as never },
                    { name: 'signIn' as never },
                    { name: 'signUpEmail' as never }] 
                    
                    :
                    
                 [
                    { name: 'signIn' as never },
                    { name: 'signUpEmail' as never }
               ] // your stack screen name
            });
         }
      }

      const changeMedium = ()=>{
        const keys = storage.getAllKeys()
        if(email){
            navigation.reset({
                index: keys[0]? 2 : 1,
                routes: keys[0]?
                 [ { name: 'autoSignIn' as never },
                    { name: 'signIn' as never },
                    { name: 'signUpEmail' as never }] 
                    
                    :
                    
                 [
                    { name: 'signIn' as never },
                    { name: 'signUpEmail' as never }
               ] // your stack screen name
            });
        }else{
            navigation.reset({
                index: keys[0]? 2 : 1,
                routes: keys[0]?
                [ { name: 'autoSignIn' as never },
                   { name: 'signIn' as never },
                   { name: 'signUp' as never }] 
                   
                   :
                   
                [
                   { name: 'signIn' as never },
                   { name: 'signUp' as never }
              ] // your stack screen name
            });
           
        }
      }

    return(
        <SafeAreaView style={styles.container}>
           <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
            <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />
            <View style={{marginTop: 10}}>
                 <Text style={styles.headerText}>Enter the confirmation code?</Text>
                 <Text style={styles.headerDescText}>{codeResent? `A new 6-digit verification code has been resent to your ${email? 'email' : 'text message'} at ${email || mobileNo}. Please check your ${email? 'email' : 'text message'} and enter the code to proceed.` : `To confirm your account enter the 6-digit code we sent via ${email? 'email' : 'text message'} to ${mobileNo || email}`}</Text>
                 <Pressable onPress={()=>{ labelRef.current?.focus(); setShowConfirmCodeText(true)}} style={{...styles.TextInputContainer, borderColor: showConfirmCodeErrorText? 'red' : '#4C4C4C' }}>
                   <View style={styles.confirmCodeInputCont}>
                            { showConfirmCodeText && <Text style={{...styles.label, color: showConfirmCodeErrorText? 'red' : '#4C4C4C' }}>Confirmation code</Text>}
                            {(!showConfirmCodeText  && confirmCode.length == 0) && <Text style={{...styles.placeholder, color: showConfirmCodeErrorText? 'red' : 'gray'}}>Confirmation code</Text>} 
                            { showConfirmCodeText && <TextInput ref={labelRef} autoFocus={true} onBlur={()=> confirmCode.length >= 1? setShowConfirmCodeText(true) : setShowConfirmCodeText(false) } cursorColor='black' style={styles.inputBox} keyboardType='decimal-pad' value={confirmCode} onChangeText={updateConfirmCode}  />}
                   </View>
                  { (confirmCode.length >=1 && keyboardVisible && !showConfirmCodeErrorText) && <MaterialIcons onPress={()=> setConfirmCode('')} name="clear" size={30} color="#4C4C4C" />}
                  { showConfirmCodeErrorText && <AntDesign name="exclamationcircleo" size={24} color="red" /> }

                 </Pressable>
                   { showConfirmCodeErrorText && <Text style={{color:"red", letterSpacing: 0.5}}>{showConfirmCodeErrorText == 'zero'? `Code is required. Check your ${email? 'email': 'text message'} to find the code` : showConfirmCodeErrorText == 'less_than_6'? 'Confirmation code must be at least 6 characters long' : showConfirmCodeErrorText == 'invalid_code'? 'Invalid or expired confirmation code. Ensure the code is correct or try resending a new one.' : showConfirmCodeErrorText == 'resend_error'? 'Error resending confirmation code. Please check your network and try again' : 'Something went wrong! Please check your internet connection and try again later.' }</Text>}
                </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={ConfirmCode} style={styles.nextBtn}>
                    {showLoadingIndicator? <ActivityIndicator color='white' size='small'/> :  <Text style={styles.nextBtnText}>Next</Text>}
                </Pressable>
                <Pressable onPress={resendCode} style={styles.mobileBtn}>
                    <Text style={styles.signUpText}>I didn't get the code</Text>
                </Pressable>
            </View>
            
            </ScrollView>
            {openBottomSheet && <Pressable onPress={()=> setOpenBottomSheet(false) } style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.5)'}}>
            </Pressable>}

            {openBottomSheet && <BottomSheet onClose={()=> setOpenBottomSheet(false)} backgroundStyle={{backgroundColor:'rgba(0,0,0,0)'}} ref={bottomSheetRef} snapPoints={snapPoints} index={0} enablePanDownToClose handleStyle={{ marginHorizontal: 3,  backgroundColor:'#F3FAFF', borderTopLeftRadius:20, borderTopRightRadius: 20}} handleIndicatorStyle={{backgroundColor:"lightgray", width: 45}}>
                <BottomSheetView style={{ flex: 1 }}>
                     <View style={{ padding: 10, marginHorizontal: 3, marginBottom: 5, flex: 1, backgroundColor:'#F3FAFF', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                     <AntDesign onPress={()=> setOpenBottomSheet(false)} name="close" size={30} color="black" />
                     <View style={{backgroundColor:'white', borderRadius: 20, padding: 20, marginTop: 20}}>
                         <Text style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}} onPress={()=> resendConfirmationCode()}>Resend confirmation code</Text>
                         <Text style={{marginVertical: 25, fontWeight:"500", letterSpacing: 0.5, fontSize: 17}} onPress={goToSignUp}>{email? 'Use mobile number instead' : 'Use email instead'}</Text>
                         <Text style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}} onPress={changeMedium}>{email? 'Change email' : 'Change mobile number'}</Text>
                     </View>
                     </View>
                </BottomSheetView>
          </BottomSheet>}
           <Modal visible={showLoadingIndicator} onRequestClose={()=>{}} presentationStyle='overFullScreen' transparent={true}>
                           <View style={{flex: 1}}>

                           </View>
            </Modal>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 20, 
        backgroundColor:'#F3FAFF'
    },
    headerText: {
        fontSize: 24, 
        fontFamily:'sans-serif', 
        fontWeight: '800', 
        letterSpacing: 0.5, 
        marginBottom: 10
    },
    headerDescText: {
        fontSize: 15, 
        lineHeight: 20, 
        letterSpacing: 0.5, 
        marginBottom: 20
    },
    TextInputContainer: {
        flexDirection:'row', 
        alignItems:'center', 
        paddingHorizontal: 15,
        borderWidth: 1, 
        height: 60, 
        borderRadius: 10,  
        backgroundColor:'#FFFFFF', 
        marginBottom: 10
    },
    confirmCodeInputCont: {
        marginRight:'auto', 
        width:'90%'
    },
    label: {
        paddingTop: 5, 
        fontWeight:'500', 
        letterSpacing: 0.2, 
        fontSize: 13
    },
    placeholder: {
        fontSize: 16, 
        fontWeight:'500', 
        letterSpacing: 0.3
    },
    inputBox: {
        height: 40, 
        fontSize: 18
    },
    pressableBtnCont: {
        marginTop: 20, 
        marginBottom:'auto'
    },
    nextBtn: {
        backgroundColor: '#2337C6', 
        padding: 10, 
        borderRadius: 25
    },
    nextBtnText: {
        color:'white', 
        fontWeight:'500', 
        fontSize: 16, 
        alignSelf:'center'
    },
    mobileBtn: {
        borderWidth: 0.5, 
        padding: 10, 
        borderRadius: 25, 
        borderColor:'#4C4C4C', 
        marginTop: 10
    },
    signUpText: {
        fontWeight:'500', 
        fontSize: 16, 
        alignSelf:'center', 
        letterSpacing: 0.5
    }
})