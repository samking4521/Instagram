import { useState, useEffect, useRef } from "react"
import { View, Text, Pressable, Keyboard, ScrollView, Modal, StyleSheet, ActivityIndicator} from "react-native"
import { AntDesign } from '@expo/vector-icons'
import { StatusBar } from "expo-status-bar"
import { router, useNavigation } from "expo-router"
import PhoneInput from "react-native-phone-number-input";
import { SafeAreaView } from "react-native-safe-area-context"
import { supabase } from "@/src/Providers/supabaselib"
import { storage } from "../(home)/_layout"

export default function SignUp(){
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [mobileNo, setMobileNo] = useState('')
    const [showErrorText, setShowErrorText] = useState<string | null>(null)
    const [value, setValue] = useState("");
    const phoneInput = useRef<PhoneInput>(null);
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
   const navigation = useNavigation()
    
   
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

      useEffect(()=>{
            if(showErrorText == 'user_log_in'){
                setShowModal(true)
            }
      }, [showErrorText])

      const goToPassword = async()=>{
         try{
                            const phoneRegex = /^\d{6,15}$/
                             if(phoneRegex.test(value)){
                                setShowLoadingIndicator(true)
                                    const { data, error } = await supabase.auth.signInWithOtp({
                                        phone: mobileNo,
                                    })
                                    if(error){
                                        console.log('Error signing in with otp via phone : ', error.message)
                                        setShowLoadingIndicator(false)
                                        setShowErrorText('network_error')
                                        return
                                    }else{
                                        if(data){
                                            console.log('aa  : ', data)
                                           
                                                console.log('Verify code to complete sign in : ')
                                                router.push({
                                                    pathname:'/(auth)/confirmCode',
                                                    params: {mobileNo}
                                                })
                                                setShowLoadingIndicator(false)
                                            }
                                        
                                            
                                        }    
                             }else if(value.length == 0){
                                setShowErrorText('zero')
                             }else{
                                setShowErrorText('invalid_length')
                             }
                  
                }catch(e){
                    if(e instanceof Error){
                        console.log('Error signing up phone', e.message)
                    }
                    setShowErrorText('network_error')
                    setShowLoadingIndicator(false)
                }
      }
    

      const goToSignIn = ()=>{
                     setShowModal(false)
                     const keys = storage.getAllKeys()
             
                         navigation.reset({
                             index: 0,
                             routes: keys[0]? [
                                 { name: 'autoSignIn' as never }
                             ] : 
                             [
                                 { name: 'signIn' as never }
                             ]
                         });
                
                   }

       
    return(
        <SafeAreaView style={styles.container}>
           <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
            <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />
            <View style={{marginTop: 10}}>
                 <Text style={styles.headerText}>What's your mobile number?</Text>
                 <Text style={styles.headerDescText}>Enter the mobile number where you can be contacted. No one will see this on your profile</Text>
                 <PhoneInput
                            ref={phoneInput}
                            defaultValue={value}
                            defaultCode="NG"
                            layout="first"
                            placeholder="Mobile number"
                            onChangeText={(text) => {
                            setValue(text);
                            if(showErrorText){
                                setShowErrorText(null)
                            }
                            }}
                            onChangeFormattedText={(text) => {
                               setMobileNo(text)
                            }}
                            containerStyle={{borderWidth: 2, width: '100%', borderRadius: 5, borderColor: showErrorText? 'red' : 'lightgray', height: 65}}
                            textContainerStyle={{backgroundColor:'#fff'}}
                            flagButtonStyle={{borderRightWidth: 1, borderRightColor: showErrorText && showErrorText !== 'user_log_in' ? 'red':'gray', width: 60, justifyContent:'center', alignItems:'center'}}
                            autoFocus
                            
                 />
                  <Text style={{...styles.descText, color: showErrorText? 'red' : '#4C4C4C', marginTop: 2}}>{showErrorText == 'zero'? 'Mobile number cannot be empty' : showErrorText == 'invalid_length'? 'Please enter a valid mobile number: 6–15 digits with no symbols or letters.' : showErrorText == 'network_error'? 'Something went wrong! Check your internet connection and try again.' : showErrorText == 'user_log_in'? null : 'You may receive Whatsapp and SMS notifications from us for security and login purposes'}</Text>
            </View>

            <View style={styles.pressableContainer}> 
                <Pressable onPress={goToPassword} style={styles.nextBtn}>
                   {showLoadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.nextBtnText}>Next</Text>}
                </Pressable>
                <Pressable onPress={()=> router.push('/(auth)/signUpEmail')} style={styles.emailBtn}>
                    <Text style={styles.signUpText}>Sign up with email</Text>
                </Pressable>
            </View>
            <View style={{ display: keyboardVisible? 'none' : 'flex'}}>
                <Text onPress={()=> setShowModal(true)} style={styles.alreadyHaveAccText}>I already have an account</Text>
            </View>
            
            </ScrollView>
            <Modal visible={showModal} onRequestClose={()=> {setShowModal(false); setShowErrorText(null)}} presentationStyle='overFullScreen' animationType='fade' transparent={true}>
                <StatusBar style='light' backgroundColor="rgba(0,0,0,0.3)"/>
                <Pressable onPress={()=> {setShowModal(false); setShowErrorText(null)}} style={styles.modalCont}>
                        <View style={styles.alertBox}>
                            <Text style={styles.haveAnAccText}>{showErrorText == 'user_log_in'? "Already have an account" : "Already have an account?"}</Text>
                            <View style={styles.actionBtnCont}>
                                <Text onPress={goToSignIn} style={styles.logInText}>{showErrorText == 'user_log_in'? "PROCEED TO LOGIN" : "LOGIN"}</Text>
                                { showErrorText !== 'user_log_in' && <Text onPress={()=> setShowModal(false)} style={styles.continueToAccText}>CONTINUE CREATING ACCOUNT</Text>}
                            </View>
                        </View>
                </Pressable>
            </Modal>
            <Modal visible={showLoadingIndicator} transparent={true} presentationStyle='overFullScreen'>

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
    textInputCont: {
        flexDirection:'row', 
        alignItems:'center', 
        paddingHorizontal: 15, 
        borderWidth: 1, 
        height: 60, 
        borderRadius: 10, 
        backgroundColor:'#FFFFFF', 
        marginBottom: 10
    },
    mobileInputCont: {
        marginRight:'auto', 
        width: '90%'
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
        width: '100%', 
        height: 40, 
        fontSize: 18
    },
    descText: {
        letterSpacing: 0.2, 
    },
    pressableContainer: {
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
    emailBtn: {
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
    },
    alreadyHaveAccText: {
        color:'#2337C6', 
        fontWeight:'500', 
        letterSpacing: 0.2, 
        textAlign:'center'
    },
    modalCont: {
        flex: 1, 
        backgroundColor:'rgba(0,0,0,0.3)', 
        justifyContent:'center', 
        alignItems:'center'
    },
    alertBox: {
        padding: 20, 
        flexDirection:'row', 
        backgroundColor:'white', 
        width: '90%', 
        flexWrap:'wrap'
    },
    haveAnAccText: {
        fontSize: 18, 
        fontWeight:'600'
    },
    actionBtnCont: {
        width: '100%', 
        marginTop: 15
    },
    logInText: {
        fontSize: 15, 
        fontWeight:'600', 
        marginBottom: 25, 
        textAlign:'right'
    },
    continueToAccText: {
        fontSize: 15, 
        fontWeight:'600', 
        textAlign:'right'
    }
})