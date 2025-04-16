import { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Alert, Modal, TextInput, useWindowDimensions, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard, StyleSheet, ActivityIndicator } from 'react-native'
import { AntDesign, FontAwesome6, MaterialIcons, Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/src/Providers/supabaselib'
import { storage } from '../(home)/_layout'
import { anonymousUserAuthSuccess, userAuthSuccess } from '@/src/redux/features/userAuthSlice'
import { useAppDispatch } from '@/src/redux/app/hooks'
import PhoneInput from 'react-native-phone-number-input'

export default function SignIn(){
    const [showUserInput, setShowUserInput] = useState(false)
    const [showPwdInput, setShowPwdInput] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userInputShowX, setUserInputShowX] = useState(true)
    const [borderColorVal, setBorderColorVal] = useState<string | null>(null)
    const {height} = useWindowDimensions()
    const [showPwd, setShowPwd] = useState(true)
    const [mode, setMode] = useState('email')
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const pwdInputRef = useRef<TextInput>(null)
    const userInputRef = useRef<TextInput>(null)
     const phoneInput = useRef<PhoneInput>(null);
     const [phoneValue, setPhoneValue] = useState('')
    const [loadingIndicator, setLoadingIndicator] = useState(false)
    const [keyInStorage, setKeyInStorage] = useState(false)
    const [phoneInputError, setPhoneInputError] = useState<string | null>(null)
    const dispatch = useAppDispatch()

    type UserObj = {
        name: string,
        password: string
    }

    useEffect(()=>{
        getLoginKeys()
      }, [])
    
      const getLoginKeys = ()=>{
          const loginData = storage.getAllKeys()
           if(loginData[0]){
               setKeyInStorage(true)
           }
      }
    
    const showAlert = (error: string, medium: string | null)=>{
        Alert.alert(
            error == 'invalid_credentials'? `Incorrect Credentials` : error == 'invalid_input'? medium=='phone'? 'Incorrect Mobile Number' : 'Incorrect Email' : 'Network Error' ,
            error == 'invalid_credentials'? `The ${medium == 'phone'? 'Mobile number' : 'Email'} or password you entered is incorrect. Please confirm and try again.` : error == 'invalid_input'? `The ${medium == 'phone'? 'Mobile number' : 'Email'} is not valid. Please confirm and try again` : "Something went wrong! Please check your internet connection or try again later.",
            [
              { text: "OK", onPress: () => console.log("OK Pressed") },
            ],
            { cancelable: true }
          );
        
    }
  
    const ShowUserInput = ()=>{
        setShowUserInput(true)
        userInputRef.current?.focus()
    }

    const ShowPasswordInput = ()=>{
        setShowPwdInput(true)
        pwdInputRef.current?.focus()
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


      const signInEmail = async()=>{
        try{
            if(email.length == 0){
                setShowUserInput(true)
            }else if(password.length == 0){
                setShowPwdInput(true)
            }else{
                Keyboard.dismiss()
                setLoadingIndicator(true)
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if(emailRegex.test(email)){
                        const { data: {session}, error } = await supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })
                        if(error){
                            console.log('Error signing in user via email : ',error.message)
                            if(error.code == 'invalid_credentials'){
                                showAlert('invalid_credentials', 'email')  
                            }else{
                                showAlert('Network', null)
                            }
                        }else{
                            if(session){
                                console.log('User signed in successfully')
                                dispatch(anonymousUserAuthSuccess(null))
                                dispatch(userAuthSuccess(session.user.id))
                                const { data } = await supabase
                                .from('User')
                                .select()
                                .eq('id', session.user.id)
                                if(data){
                                    if(data[0].signInStatus){
                                        router.replace('/(home)/explore')
                                    }else{

                                        showCompleteSignUpAlert(data[0])
                                    }

                                }
                               
                            }
                        }
                }else{
                    console.log('Email not correct')
                    showAlert('invalid_input', 'email')
                }
                setLoadingIndicator(false)
            }

        }catch(e){
            if(e instanceof Error){
                    console.log('Error signing in user : ', e.message)
                    showAlert('Network', null)
                    setLoadingIndicator(false)
            }
        }
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
                params: {email: email, password: userObj.password, userData: userObj?.name}
              }),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      };

      const signInMobile = async()=>{
            try{
                const phoneRegex = /^\d{6,15}$/
                const phoneValInput = phoneValue.replace(/^\+/, "");
              
                 if(phoneRegex.test(phoneValInput)){
                    setLoadingIndicator(true)
                    const { data, error } = await supabase.auth.signInWithOtp({
                        phone: phoneValue,
                      })
                      if(error){
                          console.log('Error signing in with otp', error.message)
                          setLoadingIndicator(false)
                          return
                      }

                      if(data){
                          console.log('User login in process : ', data)
                          router.push({
                            pathname: '/(auth)/confirmCode',
                            params: {mobileNo: phoneValue, fromSignIn: 'true'}
                          })
                          setLoadingIndicator(false)
                      }
                 }else if(phoneValInput.length == 0){
                     setPhoneInputError('zero')
                 }else{
                    setPhoneInputError('invalid_length')
                 }
            }catch(e){
                if(e instanceof Error){
                    console.log('Error signing in user : ', e.message)
                    showAlert('Network', null)
                    setLoadingIndicator(false)
            }
          }
      }

      

      const signInUser = ()=>{
        if(mode == 'email'){
            signInEmail()
        }else{
            signInMobile()
        }
      }


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
       style={{flex: 1}}
       behavior={Platform.OS == 'ios'? 'padding' : 'height'}
      >
        <ScrollView keyboardShouldPersistTaps={'handled'} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
           { keyInStorage && <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />}
            <View style={{flex: 1}}>
                 <Image source={require('../../../assets/images/instagram_icon.jpeg')} style={{...styles.image, marginTop: keyboardVisible && mode == 'email'? 5/100 * height : 15/100 * height, marginBottom: keyboardVisible && mode == 'email'? 5/100 * height : 10/100 * height}}/>
                 <View>
               
                {
                mode == 'email'?
                <>
                 <Pressable onPress={ShowUserInput} style={{...styles.userInput, borderColor: borderColorVal == 'data1'? 'black' : '#4C4C4C'}}>
                      <View style={styles.userInputContainer}>
                            { showUserInput && <Text style={styles.label}>Email</Text>}
                            { !showUserInput && <Text style={styles.placeholder}>Email</Text>}
                            { showUserInput && <TextInput ref={userInputRef} onFocus={()=> {setBorderColorVal('data1'); setUserInputShowX(true)}} onBlur={()=>{ if(email.length == 0){ setShowUserInput(false)}else{setUserInputShowX(false)} }} style={styles.inputBox} value={email} onChangeText={setEmail} keyboardType='default' autoFocus={true} />}
                      </View>   
                      { (email.length >=1 && userInputShowX) && <MaterialIcons onPress={()=> setEmail('')} name="clear" size={30} color="#4C4C4C" />}
                    </Pressable>

                    <Pressable onPress={ShowPasswordInput} style={{...styles.userInput, marginBottom: 0, borderColor: borderColorVal == 'data2'? 'black' : '#4C4C4C'}}>
                        <View style={styles.userInputContainer}>
                            { showPwdInput && <Text style={styles.label}>Password</Text>}
                            { !showPwdInput && <Text style={styles.placeholder}>Password</Text>}
                            { showPwdInput && <TextInput ref={pwdInputRef} onFocus={()=> { setBorderColorVal('data2')}} onBlur={()=>{ if(password.length == 0){setShowPwdInput(false)}}} style={styles.inputBox} value={password} onChangeText={setPassword} autoFocus={true} keyboardType='default' secureTextEntry={ showPwd? true : false} cursorColor={'black'} />}
                        </View>
                        { (password.length >=1) && <Feather onPress={()=> setShowPwd(!showPwd)} name={showPwd? "eye" : "eye-off"} size={28} color="#4C4C4C" />}
                    </Pressable>

                    <Pressable onPress={signInUser}  style={[styles.logInContainer, {marginTop: 10}]}>
                        {loadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.logInText}>Log in</Text>}
                    </Pressable>

                    <Text onPress={()=> router.push('/(auth)/forgotPwd')} style={styles.passwordText}>Forgot password?</Text>
                </> : 
                 <Pressable onPress={ShowUserInput}>
                      <PhoneInput
                                                 ref={phoneInput}
                                                 defaultValue={phoneValue}
                                                 defaultCode="NG"
                                                 
                                                 layout="first"
                                                 placeholder="Mobile number"
                                                 onChangeText={(text) => {
                                                 setPhoneValue(text);
                                                 if(phoneInputError){
                                                     setPhoneInputError(null)
                                                 }
                                                 }}
                                                 onChangeFormattedText={(text) => {
                                                    setPhoneValue(text)
                                                 }}
                                                 containerStyle={{borderWidth: 2, width: '100%', borderRadius: 5, borderColor: 'lightgray', height: 65}}
                                                 textContainerStyle={{backgroundColor:'#fff'}}
                                                 flagButtonStyle={{borderRightWidth: 1, borderRightColor: 'gray', width: 60, justifyContent:'center', alignItems:'center'}}
                                               autoFocus
                                              
                                      />
                        { phoneInputError && <Text style={{color:'red', marginTop: 5}}>{phoneInputError == 'zero'? 'Mobile number cannot be empty' : 'Please enter a valid mobile number: 6–15 digits with no symbols or letters.'}</Text>}
                                            <Pressable onPress={signInUser} style={[styles.logInContainer, {marginTop: 15}]}>
                        {loadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.logInText}>Log in</Text>}
                    </Pressable>

               </Pressable>
                 }

                   
                 </View>

                <View style={{marginTop:'auto', display: keyboardVisible? 'none': 'flex'}}>
                    <Pressable onPress={()=> router.push(mode == 'email'? '/(auth)/signUpEmail' : '/(auth)/signUp')} style={styles.createNewAccCont}>
                        <Text style={styles.createNewAccText}>Create new account</Text>
                    </Pressable>

                   <Pressable onPress={()=>{mode=='email'? setMode('mobile') : setMode('email')}} style={[styles.createNewAccCont, {marginTop: 10}]}>
                        <Text style={styles.createNewAccText}>{mode == 'email'? 'Log in mobile number' : 'Log in email'}</Text>
                    </Pressable>
                    <View style={styles.footerCont}>
                        <FontAwesome6 name="meta" size={20} color="#4C4C4C" style={{marginRight: 5}} />
                        <Text style={styles.footerText}>Meta</Text>
                    </View>
                </View>
            </View>
             <Modal visible={loadingIndicator} onRequestClose={()=>{}} presentationStyle='overFullScreen' transparent={true}>
                             <View style={{flex: 1}}>
            
                             </View>
            </Modal>
        </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
    
  )
}

const styles = StyleSheet.create({
    container : {
        flex: 1, 
        padding: 20, 
        backgroundColor:'#F3FAFF'
    },
    image: {
        width: 60, 
        height: 60, 
        alignSelf:'center'
    },
    userInput: {
        flexDirection:'row', 
        alignItems:'center', 
        paddingHorizontal: 15, 
        borderWidth: 1, 
        height: 60, 
        borderRadius: 10, 
        borderColor:'#4C4C4C', 
        backgroundColor:'#FFFFFF', 
        marginBottom: 10
    },
    label: {
        fontSize: 13, 
        paddingTop: 10, 
        color:'#4C4C4C', 
        letterSpacing:0.5
    },
    placeholder: {
        fontSize: 15, 
        fontWeight:'500', 
        letterSpacing: 0.3, 
        color:'gray'
    },
    userInputContainer: {
        marginRight:'auto', 
        width: '90%'
    },
    inputBox: {
        fontSize: 18, 
        height: 40
    },
    logInContainer: {
        padding: 10, 
        borderRadius: 20,
        backgroundColor:'#2337C6'
    },
    logInText: {
        color:'white', 
        fontWeight:'600', 
        fontSize: 15, 
        alignSelf:'center'
    },
    passwordText: {
        fontSize: 15, 
        fontWeight:'600', 
        letterSpacing:0.5, 
        alignSelf:'center', 
        marginTop: 20, 
        fontFamily:'sans-serif'
    },
    createNewAccCont: {
        borderWidth: 1, 
        borderColor:'#2337C6', 
        padding: 10, 
        borderRadius: 25
    },
    createNewAccText: {
        alignSelf:'center', 
        fontWeight:'500', 
        color:'#2337C6', 
        fontSize: 15, 
        letterSpacing: 0.5
    },
    footerCont: {
        flexDirection:'row', 
        alignItems:'center', 
        alignSelf:'center', 
        marginTop: 15
    },
    footerText: {
        fontSize: 16, 
        color:'#4C4C4C', 
        fontWeight:'600'
    }
})

