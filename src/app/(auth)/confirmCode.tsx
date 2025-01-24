import { useState, useEffect, useRef, useMemo } from "react"
import { SafeAreaView, View, Text, TextInput, Pressable, Keyboard, ScrollView, StyleSheet, ActivityIndicator, Modal} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { confirmSignUp, resendSignUpCode, signIn, getCurrentUser, signOut} from "aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router"
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import type { Schema } from '../../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import { storage } from "./signIn";

const client = generateClient<Schema>()
// import LinearGradient from 'react-native-linear-gradient';

export default function ConfirmCode(){
    const [showConfirmCodeText, setShowConfirmCodeText] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [confirmCode, setConfirmCode] = useState('')
    const [showConfirmCodeErrorText, setShowConfirmCodeErrorText] = useState<string | null>(null)
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const [codeResent, setCodeResent] = useState(false)
    const labelRef = useRef<TextInput>(null)
    const { mobileNo, email, password, resendConfirmCode } = useLocalSearchParams()
    const snapPoints = useMemo(()=> ['70%'], [])
    const bottomSheetRef = useRef<BottomSheet>(null)

    useEffect(()=>{
        if(resendConfirmCode){
            resendConfirmationCode()
            setCodeResent(true)
        }
    }, [])

         const storeDataLocally = (val: boolean)=>{
                if(email){
                    if(typeof email == 'string' ){
                        storage.set(`${email} confirmed`, val)
                    }
                }else{
                    if(typeof mobileNo == 'string' ){
                        storage.set(`${mobileNo} confirmed`, val)
                    }
                }
               
            }

    useEffect(()=>{
        storeDataLocally(false)
        console.log(`${email || mobileNo} confirmed false`)
    }, [])


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

      const AutoSignInUser = async()=>{
        try{
            if(email){
                if(typeof email === 'string' && typeof password === 'string'){
                    //   // get currently authenticated user
                    //   const { userId: userSub } = await getCurrentUser();
                    //   if(userSub){
                    //       await signOut()
                    //       console.log('User signed out successfully')
                    //       const { nextStep } = await signIn({
                    //         username: email,
                    //         password: password,
                    //       });
                    //       console.log('nextStep : ', nextStep)
                    //       if(nextStep.signInStep === 'DONE'){
                    //         console.log('Successfully signed in.');
                    //       }
                    //     const { userId } = await getCurrentUser();
                    //          // Create User model and add sub id
                    //     const createUserSub = await client.models.User.create({
                    //         sub: userId,
                    //         password: password,
                    //         email: email
                    //       })
                    //    console.log('User sub created successfully : ', createUserSub )
                              
                    //   }else{
                        const { nextStep } = await signIn({
                            username: email,
                            password: password,
                          });
                          console.log('nextStep : ', nextStep)
                          if(nextStep.signInStep === 'DONE'){
                            console.log('Successfully signed in.');
                          }
                        const { userId } = await getCurrentUser();
                             // Create User model and add sub id
                        const createUserSub = await client.models.User.create({
                            sub: userId,
                            password: password,
                            email: email
                          })
                       console.log('User sub created successfully : ', createUserSub )
                      }
                    
                       await storeDataLocally(true)
                       console.log(`${email} confirmed true`)
                       router.push({
                            pathname: '/(auth)/enterName',
                            params: {email}
                        })
                        setShowLoadingIndicator(false)
            }else{
                if(typeof mobileNo === 'string' && typeof password === 'string'){
                        // // get currently authenticated user
                        // const { userId: userSub } = await getCurrentUser();
                        // if(userSub){
                        //     await signOut()
                        //     console.log('User signed out successfully')
                        //     const { nextStep } = await signIn({
                        //     username: mobileNo,
                        //     password: password,
                        //     });
                        //     console.log('nextStep : ', nextStep)
                        //     if(nextStep.signInStep === 'DONE'){
                        //     console.log('Successfully signed in.');
                        //     }
                        // const { userId } = await getCurrentUser();
                        //         // Create User model and add sub id
                        // const createUserSub = await client.models.User.create({
                        //     sub: userId,
                        //     password: password,
                        //     mobileNo: mobileNo
                        //     })
                        // console.log('User sub created successfully : ', createUserSub )
                                
                        // }else{
                        const { nextStep } = await signIn({
                            username: mobileNo,
                            password: password,
                            });
                            console.log('nextStep : ', nextStep)
                            if(nextStep.signInStep === 'DONE'){
                            console.log('Successfully signed in.');
                            }
                        const { userId } = await getCurrentUser();
                                // Create User model and add sub id
                        const createUserSub = await client.models.User.create({
                            sub: userId,
                            password: password,
                            mobileNo: mobileNo
                            })
                        console.log('User sub created successfully : ', createUserSub )
                        }
                        await storeDataLocally(true)
                        console.log(`${mobileNo} confirmed true`)
                        router.push({
                            pathname: '/(auth)/enterName',
                            params: {mobileNo}
                        })
                        setShowLoadingIndicator(false)
            }
        }catch(e){
            if(e instanceof Error){
                console.log('Error signing user in ', e.message)
            }
        }
      }


      const confirmationCode = async()=>{
         try{
               if(email){
                    if(typeof email !== 'string'){
                        return
                    }
                    // Confirm sign up with the OTP received
                const { nextStep: confirmSignUpNextStep } = await confirmSignUp({
                    username: email,
                    confirmationCode: confirmCode,
                });

                if (confirmSignUpNextStep.signUpStep === 'DONE') {
                    console.log(`SignUp Complete`);
                    AutoSignInUser()
                    }
               }else{
                    if(typeof mobileNo !== 'string'){
                        return
                    }

                    // Confirm sign up with the OTP received
                const { nextStep: confirmSignUpNextStep } = await confirmSignUp({
                    username: mobileNo,
                    confirmationCode: confirmCode,
                });
    
                if (confirmSignUpNextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
                    console.log(`SignUp Complete`);
                    AutoSignInUser()
                }
               }
            
         }catch(e){
            if(e instanceof Error){
                console.log('Error confirming code', e.name)
                setShowLoadingIndicator(false)
                if(e.name == 'CodeMismatchException'){
                    setShowConfirmCodeErrorText('Invalid code')
                }else{
                    setShowConfirmCodeErrorText('network error')
                }
                
            }
         }
         
      }
   
      const updateConfirmCode = (val: string)=>{
            setConfirmCode(val)
            if(showConfirmCodeErrorText){
                setShowConfirmCodeErrorText(null)
            }
      }

      const resendCode = ()=>{
          Keyboard.dismiss()
          setOpenBottomSheet(true)
      }

      const resendConfirmationCode = async ()=>{
        if(email){
            if(typeof email !== 'string'){
                return
            }
            const { destination, deliveryMedium } = await resendSignUpCode({
                username: email,
            });
            console.log(`A confirmation code has been resent to ${destination}.`);
            console.log(`Please check your ${deliveryMedium} for the code.`);
            setCodeResent(true)
            setOpenBottomSheet(false)
        }else{
            if(typeof mobileNo !== 'string'){
                return
            }
            const { destination, deliveryMedium } = await resendSignUpCode({
                username: mobileNo,
            });
            console.log(`A confirmation code has been resent to ${destination}.`);
            console.log(`Please check your ${deliveryMedium} for the code.`);
            setCodeResent(true)
            setOpenBottomSheet(false)
        }
      
        
      }

      const goToSignUp = ()=>{
         if(email){
            router.push('/(auth)/signUp')
         }else{
            router.push('/(auth)/signUpEmail')
         }
      }

      const changeMedium = ()=>{
        if(email){
            router.push('/(auth)/signUpEmail')
        }else{
            router.push('/(auth)/signUp')
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
                 <Text style={styles.headerText}>Enter the confirmation code?</Text>
                 <Text style={styles.headerDescText}>{codeResent? `A new 6-digit verification code has been resent to your ${email? 'email' : 'text message'} at ${email || mobileNo}. Please check your ${email? 'email' : 'text message'} and enter the code to proceed.` : `To confirm your account enter the 6-digit code we sent via ${email? 'email' : 'text message'} to ${mobileNo || email}`}</Text>
                 <Pressable onPress={()=>{ labelRef.current?.focus(); setShowConfirmCodeText(true)}} style={{...styles.TextInputContainer, borderColor: showConfirmCodeErrorText? 'red' : '#4C4C4C' }}>
                   <View style={styles.confirmCodeInputCont}>
                            { showConfirmCodeText && <Text style={{...styles.label, color: showConfirmCodeErrorText? 'red' : '#4C4C4C' }}>Confirmation code</Text>}
                            {(!showConfirmCodeText  && confirmCode.length == 0) && <Text style={{...styles.placeholder, color: showConfirmCodeErrorText? 'red' : 'gray'}}>Confirmation code</Text>} 
                            { showConfirmCodeText && <TextInput ref={labelRef} autoFocus={true} onBlur={()=> confirmCode.length >= 1? setShowConfirmCodeText(true) : setShowConfirmCodeText(false) } cursorColor='black' style={styles.inputBox} keyboardType='decimal-pad' value={confirmCode} onChangeText={updateConfirmCode}  />}
                   </View>
                  { (confirmCode.length >=1 && keyboardVisible && !showConfirmCodeErrorText) && <MaterialIcons onPress={()=> setConfirmCode('')} name="clear" size={30} color="#4C4C4C" />}
                  { showConfirmCodeErrorText && <AntDesign name="exclamationcircleo" size={24} color="red" /> }

                 </Pressable>
                   { showConfirmCodeErrorText && <Text style={{color:"red", letterSpacing: 0.5}}>{showConfirmCodeErrorText == 'zero'? `Code is required. Check your ${email? 'email': 'text message'} to find the code` : showConfirmCodeErrorText == 'less than 6'? 'Confirmation code must be at least 6 characters long' : showConfirmCodeErrorText == 'network'? 'Something went wrong! Check your internet connection or try again later' : showConfirmCodeErrorText == 'Invalid code'? 'The confirmation code you entered is incorrect. Please try again.' : 'Something went wrong! Please check your internet connection and try again later.' }</Text>}
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
                     <View style={{backgroundColor:'white', borderRadius: 20, padding: 20, marginTop: 20}}>
                         <Text style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}} onPress={()=> resendConfirmationCode()}>Resend confirmation code</Text>
                         <Text style={{marginVertical: 25, fontWeight:"500", letterSpacing: 0.5, fontSize: 17}} onPress={goToSignUp}>{email? 'Use mobile number instead' : 'Use email instead'}</Text>
                         <Text style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}} onPress={changeMedium}>{email? 'Change email' : 'Change mobile number'}</Text>
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