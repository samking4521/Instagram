import { useState, useRef } from "react"
import { SafeAreaView, View, Text, TextInput, Alert, Pressable, Keyboard, ScrollView, StyleSheet, ActivityIndicator, Modal} from "react-native"
import { AntDesign, Feather } from '@expo/vector-icons'
import { router, useLocalSearchParams } from "expo-router"
import { resetPassword } from "aws-amplify/auth"

// import LinearGradient from 'react-native-linear-gradient';

export default function CreatePassword(){
    const [password, setPassword] = useState('')
    const [showPwd, setShowPwd] = useState(true)
    const [showPwdErr, setShowPwdErr] = useState<boolean | string>(false)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const TxtInputContRef = useRef(null)
    const { userData} = useLocalSearchParams()
    
    const showAlert = ()=>{
        Alert.alert(
           'Network Error',
           "Something went wrong! Please check your internet connection or try again later.",
            [
              { text: "OK", onPress: () => console.log("OK Pressed") },
            ]
          );
    }

    
     async function resetUserPassword(){
        try{
            const regex = /.*\d.*/
            if(password.length >= 6 && regex.test(password) ){
                   setShowLoadingIndicator(true)
                   if(typeof userData !== 'string'){
                       return
                   }
                   const output = await resetPassword({
                       username: userData
                     });
                     const { nextStep } = output;
                     if (nextStep.resetPasswordStep == 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
                         const codeDeliveryDetails = nextStep.codeDeliveryDetails;
                         console.log(
                           `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
                         );
                         router.push({
                           pathname: '/(auth)/confirmResetCode',
                           params: {userData, password}
                         })
                         setShowLoadingIndicator(false)
                     }
               }
           else if(password.length >= 6 && !(regex.test(password))){
               Keyboard.dismiss()
               setShowPwdErr('invalid password')
            }
            else if(password.length >= 1 && password.length < 6 && !(regex.test(password))){
                   Keyboard.dismiss()
                   setShowPwdErr('less than 6')
            }
           else{
                   setShowPwdErr('zero')
           }
        }catch(e){
            if(e instanceof Error){
                console.log('Error resetting password : ', e.name)
                if(e.name == 'NetworkError'){
                    setShowLoadingIndicator(false)
                    showAlert()
                }else{
                    setShowLoadingIndicator(false)
                }
            }
           
        }
        
     }

      const updatePassword = (passwordValue: string)=>{
            setPassword(passwordValue)
            if(showPwdErr){
                setShowPwdErr(false)
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
           <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
            <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />
            
            <View style={{marginTop: 10}}>
                 <Text style={styles.headerText}>Enter new password</Text>
                 <Text style={styles.headerDescText}>Create a new password with at least 6 letters and numbers. It should be something others can't guess.</Text>

                 <Pressable onPress={()=> showPwdErr? setShowPwdErr(false) : null} ref={TxtInputContRef} style={{...styles.TextInputContainer, borderColor: showPwdErr? 'red' : '#4C4C4C'}}>
                   <View style={styles.confirmCodeInputCont}>
                           { showPwdErr !== 'zero' && <Text style={{...styles.label, color: showPwdErr? 'red':'#4C4C4C'}}>Password</Text>}
                            { showPwdErr === 'zero' && <Text style={styles.placeholder}>Password</Text>}
                            { showPwdErr !== 'zero' && <TextInput autoFocus={true} cursorColor='black' secureTextEntry={showPwd? false : true} style={styles.inputBox} keyboardType='default' value={password} onChangeText={updatePassword}  />}                   
                </View>
                        { showPwdErr?  <AntDesign name="exclamationcircleo" size={24} color="red" /> :  <Feather onPress={()=> setShowPwd(!showPwd)} name={showPwd? "eye" : "eye-off"} size={28} color="#4C4C4C" />}                
                 </Pressable>
                 {showPwdErr && <Text style={{color:"red", letterSpacing: 0.5}}>{showPwdErr == 'zero'? 'Password cannot be empty' : showPwdErr == 'less than 6'? 'This password is too short. Create a longer password with at least 6 letters and numbers' : showPwdErr == 'invalid password'? 'Password must contain letters and at least one number' : showPwdErr == 'user exists'? 'User already exists' : 'Something went wrong! check your internet connection or try again later'}</Text>}

            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={resetUserPassword} style={styles.nextBtn}>
                    {showLoadingIndicator? <ActivityIndicator color='white' size='small'/> :  <Text style={styles.nextBtnText}>Next</Text>}
                </Pressable>
            </View>
            
            </ScrollView>
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