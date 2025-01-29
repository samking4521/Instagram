import { useState, useRef } from "react"
import { SafeAreaView, View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet, Modal} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { router } from "expo-router"
// import LinearGradient from 'react-native-linear-gradient';

export default function ForgotPassword(){
    const [showUserData, setShowUserData] = useState(false)
    const userInputRef = useRef<TextInput>(null)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const [errorText, setErrorText] = useState(false)

    const [userData, setUserData] = useState('')


      const resetUserPassword = async ()=>{
            const regEx = /(^\d{5,}$)|(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)/
            if(userData.length == 0){
                setShowUserData(true)
            }else if(!(regEx.test(userData))){
                setErrorText(true)
            }else{
                router.push({
                    pathname:'/(auth)/newPassword',
                    params: {userData}
                })
           
            }
      }

      const updateUserData = (val: string)=>{
            setUserData(val)
            if(errorText){
                setErrorText(false)
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
                 <Text style={styles.headerText}>Forgot Password</Text>
                 <Text style={styles.headerDescText}>Enter your email or mobile number</Text>

                 <Pressable onPress={()=>{ userInputRef.current?.focus(); setShowUserData(true)}} style={{...styles.textInputCont, borderColor: errorText? 'red' : '#4C4C4C' }}>
                   <View style={styles.userInputCont}>
                            { showUserData && <Text style={styles.label}>Email or mobile number</Text>}
                            {(!showUserData && userData.length == 0) && <Text style={styles.placeholder}>Email or Mobile number</Text>} 
                            { showUserData && <TextInput ref={userInputRef} autoFocus={true} onBlur={()=> userData.length >= 1? setShowUserData(true) : setShowUserData(false) } cursorColor='black' style={styles.inputBox} keyboardType={'default'} value={userData} onChangeText={updateUserData}/>}
                   </View>
                  { (userData.length >=1 ) && <MaterialIcons onPress={()=> setUserData('')} name="clear" size={30} color="#4C4C4C" />}
                 </Pressable>
                 <Text style={{...styles.descText, color: errorText? 'red' : '#4C4C4C'}}>{errorText? 'Invalid email or mobile number' : 'You may receive email or SMS notifications from us for security and login purposes'}</Text>
            </View>

            <View style={styles.pressableContainer}> 
                <Pressable onPress={resetUserPassword} style={styles.nextBtn}>
                    {showLoadingIndicator? <ActivityIndicator color='white' size='small'/> :  <Text style={styles.nextBtnText}>Continue</Text>}
                    
                </Pressable>
            </View>
             <Modal visible={showLoadingIndicator} onRequestClose={()=>{}} presentationStyle='overFullScreen' transparent={true}>
                             <View style={{flex: 1}}>
            
                             </View>
                        </Modal>
            </ScrollView>
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
    userInputCont: {
        marginRight:'auto', 
        width: '90%'
    },
    label: {
        color:'#4C4C4C', 
        paddingTop: 5, 
        fontWeight:'500', 
        letterSpacing: 0.2, 
        fontSize: 13
    },
    placeholder: {
        fontSize: 16, 
        fontWeight:'500', 
        color:'gray', 
        letterSpacing: 0.3
    },
    inputBox: {
        width: '100%', 
        height: 40, 
        fontSize: 18
    },
    descText: {
        letterSpacing: 0.2
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
    switchBtn: {
        borderWidth: 0.5, 
        padding: 10, 
        borderRadius: 25, 
        borderColor:'#4C4C4C', 
        marginTop: 10
    },
    switchText: {
        fontWeight:'500', 
        fontSize: 16, 
        alignSelf:'center', 
        letterSpacing: 0.5
    }
})