import { useState, useEffect } from "react"
import { SafeAreaView, View, Text, TextInput, Pressable, Keyboard, ScrollView, Modal, StyleSheet, ActivityIndicator} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { StatusBar } from "expo-status-bar"
import { router, useLocalSearchParams } from "expo-router"
// import LinearGradient from 'react-native-linear-gradient';
import type { Schema } from '../../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import { debounce } from 'lodash';
import { useAppSelector } from "@/src/redux/app/hooks"


const client = generateClient<Schema>()


export default function EnterUserName(){
    const userAuth = useAppSelector((state) => state.auth.userAuth)
    const { email, mobileNo, password } = useLocalSearchParams()
    const getIndex = email?.indexOf('@')
    const formatEmail: any = email?.slice(0, getIndex)
    const [name, setName] = useState(formatEmail? formatEmail : '')
    const [checkingIndicator, setCheckingIndicator] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<string | boolean>(false)
    const [showNameError, setShowNameError] = useState<string | boolean>(false)
    const [loadingIndicator, setLoadingIndicator] = useState(false)


       useEffect(()=>{
           if(email){
             checkUsernameAvailability()
           }
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

      const processTextInput = debounce(()=>{
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?!.*[@_]{2,})[a-zA-Z\d@_]{4,}$/
        if(regex.test(name)){
            if(isUsernameAvailable){
                setIsUsernameAvailable(false)
                setCheckingIndicator(true)
                checkUsernameAvailability()
            }else{
                setCheckingIndicator(true)
                checkUsernameAvailability()
            }
        }else{
            setCheckingIndicator(false)
            setIsUsernameAvailable(false)
        }
      }, 300)

      useEffect(()=>{
        if(name.length == 0){
            return
        }
        processTextInput()

        return ()=> processTextInput.cancel()
      }, [name])
      

      const updateUsername = (usernameVal: string)=>{
          setName(usernameVal)
          if(showNameError){
             setShowNameError(false)
          }
      }


      const createUsernameNameInDb = async ()=>{
        try{
            
            // if userId returns true
            if(userAuth){
                const { data: user } = await client.models.User.list({
                    filter: {
                    sub: {
                        'eq': userAuth
                    }
                    }
                });
                console.log('User : ', user)

                const updatedUserDataObj = {
                    id: user[0].id,
                    username: name
                    };
                    // update user obj with username
                    const { data: updatedUserData } = await client.models.User.update(updatedUserDataObj);
                    console.log('Username created : ', updatedUserData)
                    router.push({
                        pathname: '/(auth)/enterBirthday',
                        params: {name, email, mobileNo, password}
                    })
                    setLoadingIndicator(false)
    }
        }catch(e){
            if(e instanceof Error){
                console.log('Error adding user to database : ', e.message)
             }
             setShowNameError('network')
             setLoadingIndicator(false)
        }
      }

     const goToProfilePicture = ()=>{
           const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?!.*[@_]{2,})[a-zA-Z\d@_]{4,}$/
          if(isUsernameAvailable == 'false'){
            setLoadingIndicator(true); 
            createUsernameNameInDb()
          }else if(name.length == 0){
            setShowNameError('zero')
          }else if(!(regex.test(name))){
            setShowNameError('invalid input')
          }else if(checkingIndicator){
            setCheckingIndicator(false)
            setIsUsernameAvailable(false)
            setShowNameError('checking')
          }
          else{
             setIsUsernameAvailable(false)
             setShowNameError('username exists')
          }
     }

     const checkUsernameAvailability = async()=>{
        try{
                const { data: items } = await client.models.User.list({
                    filter: {
                        username: {
                            'eq' : name
                        }
                    }
                });
                console.log('Users Array : ', items)
                   if(items[0]){
                        setCheckingIndicator(false)
                        setIsUsernameAvailable('true')
                        setShowNameError(false)
                    }else{
                        setCheckingIndicator(false)
                        setIsUsernameAvailable('false')
                        setShowNameError(false)
                    }
           
        }catch(e){
             if(e instanceof Error){
                console.log('Error checking username availabilty : ', e.message)
             }
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
                 <Text style={styles.headerText}>Create a username</Text>
                <Text style={styles.headerDescText}>Add a username or use our suggestion. You can change this anytime</Text>
                 <Pressable style={{...styles.TextInputContainer, borderColor: showNameError? 'red' : '#4C4C4C'}}>
                   <View style={styles.emailInputCont}>
                             <Text style={{...styles.label, color: showNameError? 'red' : '#4C4C4C'}}>Username</Text>
                            <TextInput cursorColor='black' style={styles.inputBox} keyboardType='default' autoCapitalize='words' value={name} onChangeText={updateUsername} autoFocus={email? false : true} />
                   </View>
                   {/* <AntDesign name="checkcircleo" size={24} color="green" /> */}
                  { (name.length >=1 && keyboardVisible && !showNameError && !checkingIndicator && !isUsernameAvailable) && <MaterialIcons onPress={()=> setName('')} name="clear" size={30} color="#4C4C4C" />}
                  { showNameError && <AntDesign name="exclamationcircleo" size={24} color="red" />}
                 
                  { isUsernameAvailable == 'true'? <MaterialIcons name="cancel" size={24} color="red" /> : isUsernameAvailable == 'false'?   <AntDesign name="checkcircle" size={24} color="green" /> : null }
                  {checkingIndicator && <ActivityIndicator size='small' color='#4C4C4C'/>}
                 </Pressable>
                 { showNameError && <Text style={{color: 'red', letterSpacing: 0.3}}>{ showNameError == 'zero'? 'Username cannot be empty' : showNameError == 'invalid input'? 'Invalid input! username must include both letters and numbers and may contain @ or _ symbol' : showNameError == 'checking'? 'Please wait while we check the availability of the username...' : showNameError == 'network'? 'Something went wrong! Please check your internet connection or try again later.' : 'This username is already taken. Please choose a different one.'}</Text>}
            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={goToProfilePicture} style={styles.nextBtn}>
                    {loadingIndicator? <ActivityIndicator size={'small'} color='white'/> : <Text style={styles.nextBtnText}>Next</Text>}
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
        marginBottom: 15
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
        marginTop: 10, 
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