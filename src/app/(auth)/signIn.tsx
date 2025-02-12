import { useState, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, Image, Alert, Modal, TextInput, useWindowDimensions, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard, StyleSheet, ActivityIndicator } from 'react-native'
import { AntDesign, FontAwesome6, MaterialIcons, Feather } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { MMKV } from 'react-native-mmkv'
import { signIn } from 'aws-amplify/auth'
export const storage = new MMKV()

export default function SignIn(){
    const [showUserInput, setShowUserInput] = useState(false)
    const [showPwdInput, setShowPwdInput] = useState(false)
    const [userInput, setUserInput] = useState('')
    const [password, setPassword] = useState('')
    const [userInputShowX, setUserInputShowX] = useState(true)
    const [borderColorVal, setBorderColorVal] = useState<string | null>(null)
    const {height} = useWindowDimensions()
    const [showPwd, setShowPwd] = useState(true)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const pwdInputRef = useRef<TextInput>(null)
    const userInputRef = useRef<TextInput>(null)
    const [loadingIndicator, setLoadingIndicator] = useState(false)
    const { noNav } = useLocalSearchParams() 
    
    const showAlert = (error: string)=>{
        Alert.alert(
            error == 'NotAuthorizedException'? 'Incorrect username or password' : 'Network Error',
            error == 'NotAuthorizedException'? "The username or password you entered is incorrect. Please check your username or password and try again." : "Something went wrong! Please check your internet connection or try again later.",
            [
              { text: "OK", onPress: () => console.log("OK Pressed") },
            ]
          );
    }
  
    const ShowUserInput = ()=>{
        setShowUserInput(true)
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

      const signInUser = async (userInput: string, password: string)=>{
        try{
            if(userInput.length == 0){
                setShowUserInput(true)
            }else if(password.length == 0){
                setShowPwdInput(true)
            }else{
                Keyboard.dismiss()
                setLoadingIndicator(true)
                await signIn({
                    username: userInput,
                    password: password,
                    })
                console.log('User signed in successfully')
                router.push('/(home)/homeScreen')
                setLoadingIndicator(false)
            }
        }catch(e){
            if(e instanceof Error){
                console.log('Error signing in user : ', e.name)
                if(e.name == 'NotAuthorizedException'){
                    showAlert('NotAuthorizedException')
                }else{
                    showAlert('Network')
                }
            }
            setLoadingIndicator(false)
        }
      }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
       style={{flex: 1}}
       behavior={Platform.OS == 'ios'? 'padding' : 'height'}
      >
        <ScrollView keyboardShouldPersistTaps={'handled'} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
           { !noNav && <AntDesign onPress={()=> router.push('/(auth)/autoSignIn')} name="arrowleft" size={24} color="black" />}
            <View style={{flex: 1}}>
                 <Image source={require('../../../assets/images/instagram_icon.jpeg')} style={{...styles.image, marginTop: keyboardVisible? 5/100 * height : 15/100 * height, marginBottom: keyboardVisible? 5/100 * height : 10/100 * height}}/>
                 <View>
                    <Pressable onPress={ShowUserInput} style={{...styles.userInput, borderColor: borderColorVal == 'data1'? 'black' : '#4C4C4C'}}>
                      <View style={styles.userInputContainer}>
                            { showUserInput && <Text style={styles.label}>Username, email or mobile number</Text>}
                            { !showUserInput && <Text style={styles.placeholder}>Username, email or mobile number</Text>}
                            { showUserInput && <TextInput ref={userInputRef} onFocus={()=> {setBorderColorVal('data1'); setUserInputShowX(true)}} onBlur={()=>{ if(userInput.length == 0){ setShowUserInput(false)}else{setUserInputShowX(false)} }} style={styles.inputBox} value={userInput} onChangeText={setUserInput} keyboardType='default' autoFocus={true} />}
                      </View>   
                      { (userInput.length >=1 && userInputShowX) && <MaterialIcons onPress={()=> setUserInput('')} name="clear" size={30} color="#4C4C4C" />}
                    </Pressable>

                    <Pressable onPress={ShowPasswordInput} style={{...styles.userInput, borderColor: borderColorVal == 'data2'? 'black' : '#4C4C4C'}}>
                        <View style={styles.userInputContainer}>
                            { showPwdInput && <Text style={styles.label}>Password</Text>}
                            { !showPwdInput && <Text style={styles.placeholder}>Password</Text>}
                            { showPwdInput && <TextInput ref={pwdInputRef} onFocus={()=> { setBorderColorVal('data2')}} onBlur={()=>{ if(password.length == 0){setShowPwdInput(false)}}} style={styles.inputBox} value={password} onChangeText={setPassword} autoFocus={true} keyboardType='default' secureTextEntry={ showPwd? true : false} cursorColor={'black'} />}
                        </View>
                        { (password.length >=1) && <Feather onPress={()=> setShowPwd(!showPwd)} name={showPwd? "eye" : "eye-off"} size={28} color="#4C4C4C" />}
                    </Pressable>
                    <Pressable onPress={()=>signInUser(userInput, password)} style={styles.logInContainer}>
                        {loadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.logInText}>Log in</Text>}
                    </Pressable>

                    <Text onPress={()=> router.push('/(auth)/forgotPwd')} style={styles.passwordText}>Forgot password?</Text>
                 </View>

                <View style={{marginTop:'auto', display: keyboardVisible? 'none': 'flex'}}>
                    <Pressable onPress={()=> router.push({
                        pathname: '/(auth)/signUp'
                    })} style={styles.createNewAccCont}>
                        <Text style={styles.createNewAccText}>Create new account</Text>
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

