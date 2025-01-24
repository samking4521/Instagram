import { useState, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, Image, TextInput, useWindowDimensions, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard, StyleSheet } from 'react-native'
import { AntDesign, FontAwesome6, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export default function SignIn(){
    const [showUserInput, setShowUserInput] = useState(false)
    const [showPwdInput, setShowPwdInput] = useState(false)
    const [userInput, setUserInput] = useState('')
    const [password, setPassword] = useState('')
    const [userInputShowX, setUserInputShowX] = useState(true)
    const [pwdXshow, setPwdXShow] = useState(true)
    const {width, height} = useWindowDimensions()
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const pwdInputRef = useRef<TextInput>(null)
    const userInputRef = useRef<TextInput>(null)
  
    const ShowUserInput = ()=>{
        setShowUserInput(true)
        setShowUserInput(true)
        userInputRef.current?.focus()
    }

    const ShowPasswordInput = ()=>{
        setShowPwdInput(true)
        setPwdXShow(true)
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
       style={{flex: 1}}
       behavior={Platform.OS == 'ios'? 'padding' : 'height'}
      >
        <ScrollView keyboardShouldPersistTaps={'handled'} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
            <AntDesign name="arrowleft" size={24} color="black" />
            <View style={{flex: 1}}>
                 <Image source={require('../../../assets/images/instagram_icon.jpeg')} style={{...styles.image, marginTop: keyboardVisible? 5/100 * height : 15/100 * height, marginBottom: keyboardVisible? 5/100 * height : 10/100 * height}}/>
                 <View>

                    <Pressable onPress={ShowUserInput} style={styles.userInput}>
                      <View style={styles.userInputContainer}>
                            { showUserInput && <Text style={styles.label}>Username, email or mobile number</Text>}
                            { !showUserInput && <Text style={styles.placeholder}>Username, email or mobile number</Text>}
                            { showUserInput && <TextInput ref={userInputRef} onFocus={()=> setUserInputShowX(true)} onBlur={()=>{ if(userInput.length == 0){ setShowUserInput(false)}else{setUserInputShowX(false)} }} style={styles.inputBox} value={userInput} onChangeText={setUserInput} keyboardType='default' autoFocus={true} />}
                      </View>   
                      { (userInput.length >=1 && userInputShowX) && <MaterialIcons onPress={()=> setUserInput('')} name="clear" size={30} color="#4C4C4C" />}
                    </Pressable>

                    <Pressable onPress={ShowPasswordInput} style={styles.userInput}>
                        <View style={styles.userInputContainer}>
                            { showPwdInput && <Text style={styles.label}>Password</Text>}
                            { !showPwdInput && <Text style={styles.placeholder}>Password</Text>}
                            { showPwdInput && <TextInput ref={pwdInputRef} onFocus={()=> setPwdXShow(true)} onBlur={()=>{ if(password.length == 0){setShowPwdInput(false)}else{setPwdXShow(false)} }} style={styles.inputBox} value={password} onChangeText={setPassword} autoFocus={true} keyboardType='default' secureTextEntry={true} cursorColor={'black'} />}
                        </View>
                        { (password.length >=1 && pwdXshow) && <MaterialIcons onPress={()=> setPassword('')} name="clear" size={30} color="#4C4C4C" />}
                    </Pressable>
                    <Pressable style={styles.logInContainer}>
                        <Text style={styles.logInText}>Log in</Text>
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

