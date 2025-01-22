import { useState, useEffect, useRef } from "react"
import { SafeAreaView, View, Text, TextInput, Pressable, Keyboard, ScrollView, Modal, StyleSheet, ActivityIndicator} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { StatusBar } from "expo-status-bar"
import { router, useLocalSearchParams } from "expo-router"
// import LinearGradient from 'react-native-linear-gradient';
import type { Schema } from '../../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from "aws-amplify/auth"

const client = generateClient<Schema>()

export default function EnterName(){
    const [name, setName] = useState('')
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [showNameError, setShowNameError] = useState<string | boolean>(false)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const { email, mobileNo } = useLocalSearchParams()
    

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
   
      const goToUsernameScreen = ()=>{
        const regex = /^[A-Za-z]+ [A-Za-z]+$/
            if(regex.test(name)){
                setShowLoadingIndicator(true)
                createNameInDb()
            }else if(name.length == 0){
                setShowNameError('zero')
            }else{
                setShowNameError('invalid name')
            }
      }

      const updateEmail = (nameVal: string)=>{
                setName(nameVal)
                if(showNameError){
                    setShowNameError(false)
                }
      }

      const createNameInDb = async()=>{
        try{
             const { userId } = await getCurrentUser()
             const {data: user} = await client.models.User.list({
                filter: {
                    sub: {
                        'eq': userId
                    }
                }
             })

             if(user[0]){
                const createName = await client.models.User.update({
                   id: user[0].id,
                   name: name
                })
                console.log('User name created successfully : ', createName )
                console.log('enterName set as false to local storage')
                router.push({
                    pathname: '/(auth)/createUsername',
                    params: { email, mobileNo }
                })
                setShowLoadingIndicator(false)
             }
            
        }catch(e){
            if(e instanceof Error){
                console.log('Error creating name in db : ', e.message)
            }
            setShowLoadingIndicator(false)
            setShowNameError('network')
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
                 <Text style={styles.headerText}>What's your name?</Text>
                 <Pressable style={{...styles.TextInputContainer, borderColor: showNameError? 'red' : '#4C4C4C'}}>
                   <View style={styles.emailInputCont}>
                             <Text style={{...styles.label, color: showNameError? 'red' : '#4C4C4C'}}>Full name</Text>
                            <TextInput autoFocus={true} cursorColor='black' style={styles.inputBox} keyboardType='default' autoCapitalize='words' value={name} onChangeText={updateEmail}  />
                   </View>
                  { (name.length >=1 && keyboardVisible && !showNameError) && <MaterialIcons onPress={()=> setName('')} name="clear" size={30} color="#4C4C4C" />}
                  { showNameError && <AntDesign name="exclamationcircleo" size={24} color="red" />}
                 </Pressable>
                 { showNameError && <Text style={{color: 'red', letterSpacing: 0.3}}>{ showNameError == 'zero'? 'Name cannot be empty' : showNameError == 'network'? 'Something went wrong. Check your internet connection or try again later' : "Invalid name format. Please ensure you enter your name in the format 'First name Last name', with no number or symbol included"}</Text>}
            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={goToUsernameScreen} style={styles.nextBtn}>
                    { showLoadingIndicator? <ActivityIndicator size='small' color='white'/> :  <Text style={styles.nextBtnText}>Next</Text>}
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