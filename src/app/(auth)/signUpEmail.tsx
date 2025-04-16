import { useState, useEffect, useRef } from "react"
import { View, Text, TextInput, Pressable, Keyboard, ScrollView, Modal, StyleSheet, ActivityIndicator} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { StatusBar } from "expo-status-bar"
import { router, useNavigation } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { supabase } from "@/src/Providers/supabaselib"
import { useAppSelector } from "@/src/redux/app/hooks"
import { storage } from "../(home)/_layout"

export default function SignUpEmail(){
    const userAuth = useAppSelector((state) => state.auth.userAuth)
    const [showEmailText, setShowEmailText] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [showEmailError, setShowEmailError] = useState('false')
    const emailRef = useRef<TextInput>(null)
    const [email, setEmail] = useState('')
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

   
      const goToPassword = async ()=>{
        try{
           
                    // Go to password screen
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                        if(email.length >= 1 && emailRegex.test(email)){
                            setShowLoadingIndicator(true)
                            // Check if email exists in database using rpc (remote procedure call)
                            // const { data } = await supabase.rpc("get_user_id_by_email", { email: email });
                            const { data, error } = await supabase.rpc('get_user_id_by_email', { email: email });
                
                            
                            console.log('Email exists : ', data )
                
                            if(!data){
                                router.push({
                                    pathname: '/(auth)/createPassword',
                                    params: { email }
                                })
                            }
                            else{
                                //Check if email is confirmed
                                const { data: emailConfirmed } = await supabase.rpc('is_email_confirmed', { email_param: email });
                                console.log('Email confirmed : ', emailConfirmed)
                                if(emailConfirmed){
                                    if(userAuth){
                                        console.log('Found UserAuth')
                                        const { data, error } = await supabase.rpc('check_user_id_by_email', {
                                            input_email: email,
                                            input_user_id: userAuth
                                          });
                                        if(data){
                                            const { data: userData } = await supabase
                                            .from('User')
                                            .select()
                                            .eq('id', userAuth)
                                            console.log('userData: ', userData)
                                            if(userData){
                                                             if(userData[0].signInStatus){
                                                                console.log('Error signing up email: User already exist')
                                                                setShowEmailError('user_log_in') 
                                                             }else{
                                                                console.log('User exists, proceed to complete sign up process', data)
                                                                
                                                                if(userData[0].password){
                                                                    // Go to enter name screen
                                                                        router.push({
                                                                        pathname: '/(auth)/enterName',
                                                                        params: {email, password: userData[0].password, userData: userData[0]?.name }
                                                                    })
                                                                }
                                                              
                                                             }
                                            }
                                        }else{
                                                console.log('Error signing up email: User already exist')
                                                setShowEmailError('user_log_in') 
                                        }
                                    }else{
                                        console.log('UserAuth not found')
                                        setShowEmailError('user_log_in') 
                                }
                                       
                            }else{
                                         //Go to createPassword screen
                                        router.push({
                                           pathname: '/(auth)/createPassword',
                                           params: {email}
                                       })
                                    }
                            }
                       
                }
                  else{
                            Keyboard.dismiss()
                            setShowEmailError('true')
                 }

                        setShowLoadingIndicator(false)
          
        }catch(e){
            if(e instanceof Error){
                console.log('Error signing up email', e.message)
            }
            setShowEmailError('network_error')
            setShowLoadingIndicator(false)
        }
       
        
      }

      const updateEmail = (emailVal: string)=>{
                setEmail(emailVal)
                if(showEmailError == 'true'){
                    setShowEmailError('false')
                }
      }

      useEffect(()=>{
         if(showEmailError == 'user_log_in'){
            setShowModal(true)
         }
      }, [showEmailError])

       const goToSignIn = ()=>{
                     
                      const keys = storage.getAllKeys()
                          navigation.reset({
                              index: 0,
                              routes: keys[0]? [
                                  { name: 'autoSignIn' as never },
                              ] : 
                              [
                                  { name: 'signIn' as never }
                              ]
                          });
                     
                          setShowModal(false)
                    }
          

    return(
        <SafeAreaView style={styles.container}>
           <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
            <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />
            <View style={{marginTop: 10}}>
                 <Text style={styles.headerText}>What's your email?</Text>
                 <Text style={styles.headerDescText}>Enter the email number where you can be contacted. No one will see this on your profile</Text>

                 <Pressable onPress={()=>{ emailRef.current?.focus(); setShowEmailText(true)}} style={{...styles.TextInputContainer, borderColor: showEmailError == 'true'? 'red' : '#4C4C4C'}}>
                   <View style={styles.emailInputCont}>
                            { showEmailText && <Text style={{...styles.label, color:showEmailError == 'true'? 'red' : '#4C4C4C'}}>Email</Text>}
                            {(!showEmailText && email.length == 0) && <Text style={{...styles.placeholder, color: showEmailError == 'true'? 'red' : 'gray'}}>Email</Text>} 
                            { showEmailText && <TextInput ref={emailRef} autoFocus={true} onBlur={()=> email.length >= 1? setShowEmailText(true) : setShowEmailText(false) } cursorColor='black' style={styles.inputBox} keyboardType='email-address' value={email} onChangeText={updateEmail}  />}
                   </View>
                  { (email.length >=1 && keyboardVisible && showEmailError == 'false') && <MaterialIcons onPress={()=> setEmail('')} name="clear" size={30} color="#4C4C4C" />}
                  { showEmailError == 'true' && <AntDesign name="exclamationcircleo" size={24} color="red" />}
                 </Pressable>
                 { showEmailError == 'true' && <Text style={{color: 'red', letterSpacing: 0.3}}>Enter a valid email address</Text>}
            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={goToPassword} style={styles.nextBtn}>
                  { showLoadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.nextBtnText}>Next</Text>}
                </Pressable>
                <Pressable onPress={()=> router.push('/(auth)/signUp')} style={styles.mobileBtn}>
                    <Text style={styles.signUpText}>Sign up with mobile number</Text>
                </Pressable>
            </View>
            <View style={{ display: keyboardVisible? 'none' : 'flex'}}>
                <Text onPress={()=> setShowModal(true)} style={styles.alreadyHaveAccText}>I already have an account</Text>
            </View>
            
            </ScrollView>
            <Modal visible={showModal} onRequestClose={()=> {setShowModal(false); setShowEmailError('false')}} presentationStyle='overFullScreen' animationType='fade' transparent={true}>
                <StatusBar style='light' backgroundColor="rgba(0,0,0,0.3)"/>
                <Pressable onPress={()=> {setShowModal(false); setShowEmailError('false')}} style={styles.modalCont}>
                        <View style={styles.alertBox}>
                            <Text style={styles.haveAnAccText}>{showEmailError == 'user_log_in'? 'Already have an account' : 'Already have an account?'}</Text>
                            <View style={styles.actionBtnCont}>
                                <Text onPress={goToSignIn} style={styles.logInText}>{ showEmailError=='user_log_in'? 'PROCEED TO LOGIN' : 'LOG IN'}</Text>
                               { showEmailError !== 'user_log_in' && <Text onPress={()=> setShowModal(false)} style={styles.continueToAccText}>CONTINUE CREATING ACCOUNT</Text>}
                            </View>
                        </View>
                </Pressable>
            </Modal>
            <Modal visible={showLoadingIndicator} onRequestClose={()=>{}} transparent={true} presentationStyle='overFullScreen'>
                        
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