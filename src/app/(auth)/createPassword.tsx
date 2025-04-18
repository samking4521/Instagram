import { useState, useEffect, useRef } from "react"
import { View, Text, TextInput, Pressable, Keyboard, ScrollView, StyleSheet, ActivityIndicator, Modal} from "react-native"
import { AntDesign, Feather } from '@expo/vector-icons'
import { router, useLocalSearchParams, useNavigation } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { supabase } from "@/src/Providers/supabaselib"
import { SafeAreaView } from "react-native-safe-area-context"
import { storage } from "../(home)/_layout"

export default function CreatePassword(){
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [password, setPassword] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showPwd, setShowPwd] = useState(false)
    const [showPwdErr, setShowPwdErr] = useState<boolean | string>(false)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const TxtInputContRef = useRef(null)
    const { email } = useLocalSearchParams()
    const navigation = useNavigation()
    
     function SignUp(){
         const regex = /.*\d.*/
         if(password.length >= 6 && regex.test(password) ){
                    setShowLoadingIndicator(true)    
                    signUpEmail()
         }else if(password.length >= 6 && !(regex.test(password))){
            Keyboard.dismiss()
            setShowPwdErr('invalid_password')
         }
         else if(password.length < 6 && password.length !== 0){
                Keyboard.dismiss()
                setShowPwdErr('less_than_6')
         }
        else{
                setShowPwdErr('zero')
        }
     }



     

     const userSignUp = async ()=>{
        try{
            if(email){
                if(typeof email !== 'string'){
                    return
               }
                // Sign up using a email
                const { data: {session}, error} = await supabase.auth.signUp({
                    email: email,
                    password: password,
                })
        
                if(error){
                    if(error instanceof Error){
                        console.error('Error signing up email', error.message)
                    }
                    setShowPwdErr('network_error')
                }else{
                    if(!session){
                        console.log('Email Signup complete, confirm code')
                        // Go to confirm code screen
                        router.push({
                            pathname: '/(auth)/confirmCode',
                            params: {email, password}
                    })
                  }
                }
                setShowLoadingIndicator(false)
            }
        }catch(e){
            if(e instanceof Error){
                console.log('Error signing up phone', e.message)
            }
            setShowPwdErr('network_error')
            setShowLoadingIndicator(false)
        }
        
     }
   
     const signUpEmail = async()=>{
        try{
            // Check if email exists in database using rpc (remote procedure call)
            const { data } = await supabase.rpc("get_user_id_by_email", { email: email });
             if(!data){
                    userSignUp()
                }
                else{
                    //Check if email is confirmed
                        const { data: emailConfirmed } = await supabase.rpc("is_email_confirmed", { email_param: email });
                        if(!emailConfirmed){
                            const { data, error } = await supabase.rpc('delete_unverified_user_by_email', { user_email: email});
                              console.log('delete : ', data)
                                if(data){
                                userSignUp()
                                }       
                }
            }

        }catch(e){
            if(e instanceof Error){
                console.log('Error signing up email', e.message)
            }
            setShowPwdErr('network_error')
            setShowLoadingIndicator(false)
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

      const updatePassword = (passwordValue: string)=>{
            setPassword(passwordValue)
            if(showPwdErr){
                setShowPwdErr(false)
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
                 <Text style={styles.headerText}>Create a password</Text>
                 <Text style={styles.headerDescText}>Create a password with at least 6 letters or numbers. It should be something others can't guess.</Text>

                 <Pressable onPress={()=> showPwdErr? setShowPwdErr(false) : null} ref={TxtInputContRef} style={{...styles.TextInputContainer, borderColor: showPwdErr? 'red' : '#4C4C4C'}}>
                   <View style={styles.confirmCodeInputCont}>
                           { showPwdErr !== 'zero' && <Text style={{...styles.label, color: showPwdErr? 'red':'#4C4C4C'}}>Password</Text>}
                            { showPwdErr === 'zero' && <Text style={styles.placeholder}>Password</Text>}
                            { showPwdErr !== 'zero' && <TextInput autoFocus={true} cursorColor='black' secureTextEntry={showPwd? false : true} style={styles.inputBox} keyboardType='default' value={password} onChangeText={updatePassword}  />}                   
                </View>
                        { showPwdErr?  <AntDesign name="exclamationcircleo" size={24} color="red" /> :  <Feather onPress={()=> setShowPwd(!showPwd)} name={showPwd? "eye-off" : "eye"} size={28} color="#4C4C4C" />}                
                 </Pressable>
                 {showPwdErr && <Text style={{color:"red", letterSpacing: 0.5}}>{showPwdErr == 'zero'? 'Password cannot be empty' : showPwdErr == 'less_than_6'? 'This password is too short. Create a longer password with at least 6 letters and numbers' : showPwdErr == 'invalid_password'? 'Password must contain letters and at least one number' : showPwdErr == 'user_exists'? 'User already exists. Please try logging in.' : 'Something went wrong! check your internet connection or try again later'}</Text>}

            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={SignUp} style={styles.nextBtn}>
                    {showLoadingIndicator? <ActivityIndicator color='white' size='small'/> :  <Text style={styles.nextBtnText}>Next</Text>}
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
                            <Text style={styles.haveAnAccText}>Already have an account</Text>
                            <View style={styles.actionBtnCont}>
                                <Text onPress={goToSignIn} style={styles.logInText}>LOG IN</Text>
                               <Text onPress={()=> setShowModal(false)} style={styles.continueToAccText}>CONTINUE CREATING ACCOUNT</Text>
                            </View>
                        </View>
                </Pressable>
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
        color:'red', 
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