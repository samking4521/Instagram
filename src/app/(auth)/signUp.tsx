import { useState, useEffect, useRef } from "react"
import { SafeAreaView, View, Text, Pressable, Keyboard, ScrollView, Modal, StyleSheet, ActivityIndicator} from "react-native"
import { AntDesign } from '@expo/vector-icons'
import { StatusBar } from "expo-status-bar"
import { router } from "expo-router"
import PhoneInput from "react-native-phone-number-input";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from "./signIn"
// import LinearGradient from 'react-native-linear-gradient';

export default function SignUp(){
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [mobileNo, setMobileNo] = useState('')
    const [showErrorText, setShowErrorText] = useState<string | null>(null)
    const [value, setValue] = useState("");
    const [loadingIndicator, setLoadingIndicator] = useState(false)
    const phoneInput = useRef<PhoneInput>(null);
  
    const getStorageValues = ()=>{
            const signedUpStatus = storage.getString(mobileNo)
            const confirmStatus = storage.getBoolean(`${mobileNo} confirmed`)
            return {signedUpStatus, confirmStatus}
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

      const goToPassword = async()=>{
          if(value.length >=6 && value.length<=15){
            setLoadingIndicator(true)

            const { signedUpStatus, confirmStatus} = await getStorageValues()

            if(signedUpStatus && !confirmStatus){
                // navigate to confirmCode screen 
                router.push({
                    pathname: '/(auth)/confirmCode',
                    params: { mobileNo, password: signedUpStatus, resendConfirmCode: 'true'}
                })
                setLoadingIndicator(false)
            }else if(signedUpStatus && confirmStatus){
                // navigate to enterName screen 
                router.push({
                    pathname: '/(auth)/enterName',
                    params: { mobileNo }
                })
                setLoadingIndicator(false)
            }else{
                // navigate to password screen 
                router.push({
                    pathname: '/(auth)/createPassword',
                    params: {mobileNo}
                })
                setLoadingIndicator(false)
            }
          }else if (value.length == 0) {
            setShowErrorText('zero')
            setLoadingIndicator(false)
          }
          else{
            setShowErrorText('less than 6')
            setLoadingIndicator(false)
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
                            flagButtonStyle={{borderRightWidth: 1, borderRightColor: showErrorText? 'red':'gray', width: 60, justifyContent:'center', alignItems:'center'}}
                            autoFocus
                            
                 />
                 {/* <Pressable onPress={()=>{ mobileRef.current?.focus(); setShowMobileNo(true); setShowErrorText(null)}} style={{...styles.textInputCont, borderColor: showErrorText? 'red' : '#4C4C4C'}}> */}
               
                   {/* <View style={styles.mobileInputCont}>
                            { (showMobileNo && !showErrorText) && <Text style={{...styles.label, color: showErrorText? 'red' : '#4C4C4C'}}>Mobile number</Text>}
                            {((!showMobileNo && mobileNo.length == 0) || showErrorText == 'zero') && <Text style={{...styles.placeholder, color: showErrorText? 'red' : 'gray'}}>Mobile number</Text>} 
                            { (showMobileNo && !showErrorText) && <TextInput ref={mobileRef} autoFocus={true} onBlur={()=> mobileNo.length >= 1? setShowMobileNo(true) : setShowMobileNo(false) } cursorColor='black' style={styles.inputBox} keyboardType='decimal-pad' value={mobileNo} onChangeText={updateMobileNo}  />}
                   </View>
                  { !showErrorText && <MaterialIcons onPress={()=> setMobileNo('')} name="clear" size={30} color="#4C4C4C" />}
                    {showErrorText && <AntDesign name="exclamationcircleo" size={24} color="red" />} */}
                 {/* </Pressable> */}
                  <Text style={{...styles.descText, color: showErrorText? 'red' : '#4C4C4C', marginTop: 2}}>{showErrorText == 'zero'? 'Mobile number cannot be empty' : showErrorText == 'less than 6'? 'Invalid Number!, Mobile number must be at least 6 digits long.' : 'You may receive Whatsapp and SMS notifications from us for security and login purposes'}</Text>
            </View>

            <View style={styles.pressableContainer}> 
                <Pressable onPress={goToPassword} style={styles.nextBtn}>
                   { loadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.nextBtnText}>Next</Text>}
                </Pressable>
                <Pressable onPress={()=> router.push('/(auth)/signUpEmail')} style={styles.emailBtn}>
                    <Text style={styles.signUpText}>Sign up with email</Text>
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
                                <Text onPress={()=> router.push('/(auth)/signIn')} style={styles.logInText}>LOG IN</Text>
                                <Text onPress={()=> setShowModal(false)} style={styles.continueToAccText}>CONTINUE CREATING ACCOUNT</Text>
                            </View>
                        </View>
                </Pressable>
            </Modal>
            <Modal visible={loadingIndicator} onRequestClose={()=>{}} presentationStyle='overFullScreen' transparent={true}>
                 <View style={{flex: 1}}>

                 </View>
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