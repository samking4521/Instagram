import { useState, useMemo, useEffect, useRef } from "react"
import { View, Text, TextInput, Pressable, Keyboard, ScrollView, StyleSheet, ActivityIndicator, Modal} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from "expo-router"
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/src/Providers/supabaselib";

export default function ResetConfirmCode(){
    const [showConfirmCodeText, setShowConfirmCodeText] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [confirmCode, setConfirmCode] = useState('')
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const [showConfirmCodeErrorText, setShowConfirmCodeErrorText] = useState<string | null>(null)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const [loadingSpinner, setLoadingSpinner] = useState(false)
    const [codeResent, setCodeResent] = useState(false)
    const labelRef = useRef<TextInput>(null)
    const { userData } = useLocalSearchParams()
    const snapPoints = useMemo(()=> ['70%'], [])
    const bottomSheetRef = useRef<BottomSheet>(null)
   

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

      const resendCode = ()=>{
        Keyboard.dismiss()
        setOpenBottomSheet(true)
    }

      const resendConfirmationCode = async ()=>{
             setLoadingSpinner(true)
           
                if(typeof userData !== 'string'){
                    return
                }
                const { data, error } = await supabase.auth.resetPasswordForEmail(userData)
                    console.log('code resent: ', data)
                    setCodeResent(true)
                    setOpenBottomSheet(false)
                    setLoadingSpinner(false)
                        
                    }

      const updateConfirmCode = (val: string)=>{
        setConfirmCode(val)
        if(showConfirmCodeErrorText){
            setShowConfirmCodeErrorText(null)
        }
    }

    const ConfirmCode = async ()=>{
        Keyboard.dismiss()
        if(confirmCode.length >=6){
            setShowLoadingIndicator(true)
            confirmationCode()
        }else if(confirmCode.length == 0){
            setShowConfirmCodeErrorText('zero')
        }else{
           setShowConfirmCodeErrorText('less than 6')
        }
      }


      
    const confirmationCode = async()=>{
        try{
            if(typeof userData !== 'string'){
                console.log('azz')
                return
            }
         
            const { data: {session}, error } = await supabase.auth.verifyOtp({ email: userData, token: confirmCode, type: 'email'})
            if(error){
                console.log('Error confirming code : ', error.message)
                if(error.code == 'otp_expired'){
                    setShowConfirmCodeErrorText('Invalid code')
                    setShowLoadingIndicator(false)
                }else{
                    setShowConfirmCodeErrorText('network error')
                }  
                return
            }
            if(session){
                console.log('confirmed user id: ', session.user.id)
                router.push({
                    pathname:'/(auth)/newPassword'
                })
                setShowLoadingIndicator(false)
            }
            // showAlert()
        }catch(e){
           if(e instanceof Error){
               console.log('Error confirming code', e.message)
               setShowLoadingIndicator(false)
               setShowConfirmCodeErrorText('network error')
           }
        }
    }

    
    
    
    return(
        <SafeAreaView style={styles.container}>
           <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
            <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />
            
            <View style={{marginTop: 10}}>
                 <Text style={styles.headerText}>Enter the confirmation code</Text>
                 <Text style={styles.headerDescText}>{codeResent? `A new 6-digit verification code has been resent to your email or text message at ${userData}. Please check your email or text message and enter the code to proceed.` : `To reset your password enter the 6-digit code we sent via email or text message to ${userData}`}</Text>
                 <Pressable onPress={()=>{ labelRef.current?.focus(); setShowConfirmCodeText(true)}} style={{...styles.TextInputContainer, borderColor: showConfirmCodeErrorText? 'red' : '#4C4C4C' }}>
                   <View style={styles.confirmCodeInputCont}>
                            { showConfirmCodeText && <Text style={{...styles.label, color: showConfirmCodeErrorText? 'red' : '#4C4C4C' }}>Confirmation code</Text>}
                            {(!showConfirmCodeText  && confirmCode.length == 0) && <Text style={{...styles.placeholder, color: showConfirmCodeErrorText? 'red' : 'gray'}}>Confirmation code</Text>} 
                            { showConfirmCodeText && <TextInput ref={labelRef} autoFocus={true} onBlur={()=> confirmCode.length >= 1? setShowConfirmCodeText(true) : setShowConfirmCodeText(false) } cursorColor='black' style={styles.inputBox} keyboardType='decimal-pad' value={confirmCode} onChangeText={updateConfirmCode}  />}
                   </View>
                  { (confirmCode.length >=1 && keyboardVisible && !showConfirmCodeErrorText) && <MaterialIcons onPress={()=> setConfirmCode('')} name="clear" size={30} color="#4C4C4C" />}
                  { showConfirmCodeErrorText && <AntDesign name="exclamationcircleo" size={24} color="red" /> }

                 </Pressable>
                   { showConfirmCodeErrorText && <Text style={{color:"red", letterSpacing: 0.5}}>{showConfirmCodeErrorText == 'zero'? `Code is required. Check your email or text message to find the code` : showConfirmCodeErrorText == 'less than 6'? 'Confirmation code must be at least 6 characters long' : showConfirmCodeErrorText == 'network'? 'Something went wrong! Check your internet connection or try again later' : showConfirmCodeErrorText == 'Invalid code'? 'The confirmation code you entered is incorrect. Please try again.' : 'Something went wrong! Please check your internet connection and try again later.' }</Text>}
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
                     <View style={{backgroundColor:'white', borderRadius: 20, padding: 20, marginTop: 20, alignItems: loadingSpinner? 'center' : 'flex-start'}}>
                         {loadingSpinner? <ActivityIndicator size='small' color='black'/> : <Text style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}} onPress={()=> resendConfirmationCode()}>Resend confirmation code</Text>}
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