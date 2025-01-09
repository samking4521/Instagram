import { useState, useEffect, useRef } from "react"
import { SafeAreaView, View, Text, TextInput, Pressable, Keyboard, ScrollView, Modal, StyleSheet} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { router } from "expo-router"
// import LinearGradient from 'react-native-linear-gradient';

export default function ForgotPassword(){
    const [showUserData, setShowUserData] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const userInputRef = useRef<TextInput>(null)
    const [userData, setUserData] = useState('')
    const [switchData, SetSwitchData] = useState(false)

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
                 <Text style={styles.headerText}>Find your account</Text>
                 <Text style={styles.headerDescText}>{switchData? 'Enter your mobile number' : 'Enter your email or username'}</Text>

                 <Pressable onPress={()=>{ userInputRef.current?.focus(); setShowUserData(true)}} style={styles.textInputCont}>
                   <View style={styles.userInputCont}>
                            { showUserData && <Text style={styles.label}>{switchData? 'Mobile number' : 'Email or username'}</Text>}
                            {(!showUserData && userData.length == 0) && <Text style={styles.placeholder}>{switchData? 'Mobile number' : 'Email or username'}</Text>} 
                            { showUserData && <TextInput ref={userInputRef} autoFocus={true} onBlur={()=> userData.length >= 1? setShowUserData(true) : setShowUserData(false) } cursorColor='black' style={styles.inputBox} keyboardType={switchData? 'decimal-pad' : 'default'} value={userData} onChangeText={setUserData}  />}
                   </View>
                  { (userData.length >=1 && keyboardVisible) && <MaterialIcons onPress={()=> setUserData('')} name="clear" size={30} color="#4C4C4C" />}
                 </Pressable>
                 <Text style={styles.descText}>You may receive Whatsapp and SMS notifications from us for security and login purposes</Text>
            </View>

            <View style={styles.pressableContainer}> 
                <Pressable onPress={()=> router.push({
                    pathname: '/(auth)/confirmCode',
                    params: {userData}
                })} style={styles.nextBtn}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                </Pressable>
                <Pressable onPress={()=> SetSwitchData(!switchData)} style={styles.switchBtn}>
                    <Text style={styles.switchText}>{switchData? 'Search by email instead' : 'Search by mobile number instead'}</Text>
                </Pressable>
            </View>
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
        borderColor:'#4C4C4C', 
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
        letterSpacing: 0.2, 
        color:'#4C4C4C'
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