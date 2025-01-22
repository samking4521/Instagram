import { useState, useEffect, useRef } from "react"
import { SafeAreaView, View, Text, TextInput, Pressable, Keyboard, ScrollView, Modal, StyleSheet, ActivityIndicator} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { StatusBar } from "expo-status-bar"
import { router } from "expo-router"
import AsyncStorage from '@react-native-async-storage/async-storage';
// import LinearGradient from 'react-native-linear-gradient';

export default function SignUpEmail(){
    const [showEmailText, setShowEmailText] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [showEmailError, setShowEmailError] = useState(false)
    const emailRef = useRef<TextInput>(null)
    const [email, setEmail] = useState('')
    const [loadingIndicator, setLoadingIndicator] = useState(false)

    const getEmailSignUpInStorage = async () => {
        try {
           const emailKeyVal = await AsyncStorage.getItem(`${email} Signup`)
           console.log('Email Signup key : ', emailKeyVal)
           return emailKeyVal
        } catch(e) {
          // read error
          console.log('Error reading data locally : ', e)
        }
      }

      const getEmailConfirmStatusInStorage = async () => {
        try {
           const emailConfirmKeyVal = await AsyncStorage.getItem(`${email} Confirmed`)
           console.log('Email Confirm key value : ', emailConfirmKeyVal)
           return emailConfirmKeyVal
        } catch(e) {
          // read error
          console.log('Error reading data locally : ', e)
        }
      }

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
   
      const goToPassword = async ()=>{
       
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
            if(email.length >= 1 && emailRegex.test(email)){
                setLoadingIndicator(true)
                const emailSignUpKeyValue =  await getEmailSignUpInStorage()
                const emailConfirmKeyValue = await getEmailConfirmStatusInStorage()
                console.log('Checked local storage')
                if(emailSignUpKeyValue && emailConfirmKeyValue === 'false'){
                        router.push({
                            pathname: '/(auth)/confirmCode',
                            params: {email, password:emailSignUpKeyValue, resendConfirmCode: 'true'}
                        })
                        setLoadingIndicator(false)
                }else{
                    // navigate to password screen 
                    router.push({
                        pathname: '/(auth)/createPassword',
                        params: {email}
                    })
                    setLoadingIndicator(false)
                }
               
            }else{
                Keyboard.dismiss()
                setShowEmailError(true)
            }
      }

      const updateEmail = (emailVal: string)=>{
                setEmail(emailVal)
                if(showEmailError){
                    setShowEmailError(false)
                }
      }


    return(
    //     <LinearGradient
    //     colors={['lightgreen', 'lightcoral', 'skyblue']} // Array of colors
    //     start={{ x: 0, y: 0 }} // Start point (top-left)
    //     end={{ x: 1, y: 1 }}   // End point (bottom-right)
    //     style={{flex: 1}}
    //   >
        <SafeAreaView style={styles.container}>
           <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
            <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />
            
            <View style={{marginTop: 10}}>
                 <Text style={styles.headerText}>What's your email?</Text>
                 <Text style={styles.headerDescText}>Enter the email number where you can be contacted. No one will see this on your profile</Text>

                 <Pressable onPress={()=>{ emailRef.current?.focus(); setShowEmailText(true)}} style={{...styles.TextInputContainer, borderColor: showEmailError? 'red' : '#4C4C4C'}}>
                   <View style={styles.emailInputCont}>
                            { showEmailText && <Text style={{...styles.label, color:showEmailError? 'red' : '#4C4C4C'}}>Email</Text>}
                            {(!showEmailText && email.length == 0) && <Text style={{...styles.placeholder, color: showEmailError? 'red' : 'gray'}}>Email</Text>} 
                            { showEmailText && <TextInput ref={emailRef} autoFocus={true} onBlur={()=> email.length >= 1? setShowEmailText(true) : setShowEmailText(false) } cursorColor='black' style={styles.inputBox} keyboardType='email-address' value={email} onChangeText={updateEmail}  />}
                   </View>
                  { (email.length >=1 && keyboardVisible && !showEmailError) && <MaterialIcons onPress={()=> setEmail('')} name="clear" size={30} color="#4C4C4C" />}
                  { showEmailError && <AntDesign name="exclamationcircleo" size={24} color="red" />}
                 </Pressable>
                 { showEmailError && <Text style={{color: 'red', letterSpacing: 0.3}}>Enter a valid email address</Text>}
            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={goToPassword} style={styles.nextBtn}>
                    {loadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.nextBtnText}>Next</Text>}
                </Pressable>
                <Pressable onPress={()=> router.push('/(auth)/signUp')} style={styles.mobileBtn}>
                    <Text style={styles.signUpText}>Sign up with mobile number</Text>
                </Pressable>
            </View>
            <View style={{ display: keyboardVisible? 'none' : 'flex'}}>
                <Text onPress={()=> setShowModal(true)} style={styles.alreadyHaveAccText}>I already have an account</Text>
            </View>
            
            </ScrollView>
            <Modal visible={showModal} onRequestClose={()=> setShowModal(false)} presentationStyle='overFullScreen' animationType='fade' transparent={true}>
                <StatusBar style='light' backgroundColor="rgba(0,0,0,0.3)"/>
                <Pressable onPress={()=> setShowModal(false)} style={styles.modalCont}>
                        <View style={styles.alertBox}>
                            <Text style={styles.haveAnAccText}>Already have an account?</Text>
                            <View style={styles.actionBtnCont}>
                                <Text style={styles.logInText}>LOG IN</Text>
                                <Text style={styles.continueToAccText}>CONTINUE CREATING ACCOUNT</Text>
                            </View>
                        </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    // </LinearGradient>
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
    emailInputCont: {
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