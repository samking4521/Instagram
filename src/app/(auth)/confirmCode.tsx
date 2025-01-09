import { useState, useEffect, useRef, useMemo } from "react"
import { SafeAreaView, View, Text, TextInput, Pressable, Keyboard, ScrollView, StyleSheet, useWindowDimensions} from "react-native"
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from "expo-router"
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
// import LinearGradient from 'react-native-linear-gradient';

export default function ConfirmCode(){
    const [showConfirmCodeText, setShowConfirmCodeText] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [confirmCode, setConfirmCode] = useState('')
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const labelRef = useRef<TextInput>(null)
    const {height} = useWindowDimensions()
    const { mobileNo, email } = useLocalSearchParams()
    const snapPoints = useMemo(()=> ['70%'], [])
    const bottomSheetRef = useRef<BottomSheet>(null)


console.log(openBottomSheet)
    
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
                 <Text style={styles.headerText}>Enter the confirmation code?</Text>
                 <Text style={styles.headerDescText}>To confirm your account enter the 6-digit code we sent via WhatsApp to {mobileNo || email}</Text>

                 <Pressable onPress={()=>{ labelRef.current?.focus(); setShowConfirmCodeText(true)}} style={styles.TextInputContainer}>
                   <View style={styles.confirmCodeInputCont}>
                            { showConfirmCodeText && <Text style={styles.label}>Confirmation code</Text>}
                            {(!showConfirmCodeText && confirmCode.length == 0) && <Text style={styles.placeholder}>Confirmation code</Text>} 
                            { showConfirmCodeText && <TextInput ref={labelRef} autoFocus={true} onBlur={()=> confirmCode.length >= 1? setShowConfirmCodeText(true) : setShowConfirmCodeText(false) } cursorColor='black' style={styles.inputBox} keyboardType='decimal-pad' value={confirmCode} onChangeText={setConfirmCode}  />}
                   </View>
                  { (confirmCode.length >=1 && keyboardVisible) && <MaterialIcons onPress={()=> setConfirmCode('')} name="clear" size={30} color="#4C4C4C" />}
                 </Pressable>
            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable style={styles.nextBtn}>
                    <Text style={styles.nextBtnText}>Next</Text>
                </Pressable>
                <Pressable onPress={()=> setOpenBottomSheet(true)} style={styles.mobileBtn}>
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
                         <Text style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Resend confirmation code</Text>
                         <Text style={{marginVertical: 25, fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Change mobile number</Text>
                         <Text style={{fontWeight:"500", letterSpacing: 0.5, fontSize: 17}}>Confirm by email</Text>
                     </View>
                     </View>
                </BottomSheetView>
                 
          </BottomSheet>}
          
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
        borderColor:'#4C4C4C', 
        backgroundColor:'#FFFFFF', 
        marginBottom: 10
    },
    confirmCodeInputCont: {
        marginRight:'auto', 
        width:'90%'
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