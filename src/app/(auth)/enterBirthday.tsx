import { useState, useEffect } from "react"
import { View, Text, Pressable, Keyboard, ScrollView, StyleSheet, Modal, ActivityIndicator} from "react-native"
import { AntDesign } from '@expo/vector-icons'
import { router, useLocalSearchParams, useNavigation } from "expo-router"
import { StatusBar } from "expo-status-bar"
import DatePicker from 'react-native-date-picker'
import { useAppSelector } from "@/src/redux/app/hooks"
import { supabase } from "@/src/Providers/supabaselib"
import { SafeAreaView } from "react-native-safe-area-context"
import { parse, getYear } from 'date-fns';
import { storage } from "../(home)/_layout"

export default function EnterBirthday(){
    const userAuth = useAppSelector((state) => state.auth.userAuth)
    const {name, email, mobileNo, password, userData} = useLocalSearchParams()
    const userDob = typeof userData == 'string'? userData : undefined
    const dateObject = userDob? parse(userDob, 'MMMM d, yyyy', new Date()) : undefined;
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [date, setDate] = useState(dateObject || new Date())
    const [open, setOpen] = useState(userDob? false : true)
    const [showModal, setShowModal] = useState(false)
    const [dateValue, setDateValue] = useState(userDob || '')
    const [userDobDb, setUserDobDb] = useState(true)
    const [userAge, setUserAge] = useState(0)
    const [showDateError, setShowDateError] = useState<string | boolean>(false)
    const [loadingIndicator, setLoadingIndicator] = useState(false)
    const navigation = useNavigation()

    

    const getUserAge = ()=>{
        if(userDob && userDobDb){
            const currentDate = new Date().getFullYear();
            const dateString = userDob
            const parsedDate = dateString ? parse(dateString, 'MMMM d, yyyy', new Date()) : new Date();
            const year = getYear(parsedDate);
            const user_Dob = currentDate - year
            setUserAge(user_Dob)
            setUserDobDb(false)
        }else{
            const currentDate = new Date().getFullYear();
            const theUserAge = currentDate - date.getFullYear()
            setUserAge(theUserAge)
        }
        
    }

   
    useEffect(()=>{
        getUserAge()
    }, [date])

    useEffect(()=>{
        if(userDob){
            return
        }
        const currentDate = new Date();

        // Get the parts of the date
        const options: {} = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);

        console.log(formattedDate);
        setDateValue(formattedDate)
    }, [])
   
    const formatDate = (dateObj: Date)=>{
            // Get the parts of the date
            const options: {} = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);

            console.log('Date selected : ', formattedDate);
            setDateValue(formattedDate)
    }

    
     const validateDate = ()=>{
          if(userAge == 0 || userAge < 13){
                setShowDateError(true)
                return
          }
          setLoadingIndicator(true)
          addUserBirthdayToDb()
          
     }

     const addUserBirthdayToDb = async()=>{
        try{
            if(!userAuth){
                return
            }
            const { data } = await supabase
                        .from('User')
                        .update({ dob: dateValue })
                        .eq('id', userAuth)
                        .select()
         
                console.log('User birthday added successfully', data)
                router.push({
                    pathname: '/(auth)/profilePicture',
                    params: {name, email, mobileNo, password}
                  })
                setLoadingIndicator(false)
        }catch(e){
            if(e instanceof Error){
                console.log('Error adding user birthday : ', e.message)
            }
            setShowDateError('network')
            setLoadingIndicator(false)
        }
    }

     useEffect(()=>{
        if(userAge >= 13){
            setShowDateError(false)
        }
     }, [userAge])

    
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

       const goToSignIn = ()=>{
                     setShowModal(false)
                     const keys = storage.getAllKeys()
             
                         navigation.reset({
                             index: 0,
                             routes: keys[0]? [
                                 { name: 'autoSignIn' as never }
                             ] : 
                             [
                                 { name: 'signIn' as never }
                             ]
                         });
                    
                     
                   }
   
    return(
        <SafeAreaView style={styles.container}>
           <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
            <AntDesign onPress={()=> router.back()} name="arrowleft" size={24} color="black" />
            
            <View style={{marginTop: 10}}>
                 <Text style={styles.headerText}>What's your birthday?</Text>
                 <Text style={styles.headerDescText}>Use your own birthday, even if this account is for a business, a pet or something else. No one will see this unless you choose to share it.</Text>

                 <Pressable onPress={()=> setOpen(true)} style={{...styles.TextInputContainer, borderColor: showDateError? 'red' : '#4C4C4C'}}>
                           <Text style={{...styles.label, color: showDateError? 'red':'#4C4C4C'}}>Birthday ({userAge+' years old'})</Text>
                           <Text style={styles.placeholder}>{dateValue}</Text>
                 </Pressable>
                { showDateError && <Text style={styles.errorText}>{ showDateError == 'network'? 'Something went wrong! Please check your internet connection and try again.' : 'You must be at least 13 years old.'}</Text>}
            </View>

            <View style={styles.pressableBtnCont}> 
                <Pressable onPress={validateDate} style={styles.nextBtn}>
                  { loadingIndicator? <ActivityIndicator size='small' color='white'/> : <Text style={styles.nextBtnText}>Next</Text>}
                </Pressable>
            </View>
            <View style={{ display: keyboardVisible? 'none' : 'flex'}}>
                <Text onPress={()=> setShowModal(true)} style={styles.alreadyHaveAccText}>I already have an account</Text>
            </View>
            <DatePicker
                modal
                title='Set date'
                confirmText="SET"
                cancelText="CANCEL"
                mode='date'
                open={open}
                date={date}
                maximumDate={new Date()}
                onConfirm={(date) => {
                setOpen(false)
                setDate(date)
                formatDate(date)
                }}
                onCancel={() => {
                setOpen(false)
                }}
             />
            </ScrollView>
            <Modal visible={showModal} onRequestClose={()=> setShowModal(false)} presentationStyle='overFullScreen' animationType='fade' transparent={true}>
                <StatusBar style='light' backgroundColor="rgba(0,0,0,0.3)"/>
                <Pressable onPress={()=> setShowModal(false)} style={styles.modalCont}>
                        <View style={styles.alertBox}>
                            <Text style={styles.haveAnAccText}>Already have an account?</Text>
                            <View style={styles.actionBtnCont}>
                                <Text onPress={goToSignIn} style={styles.logInText}>LOG IN</Text>
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
        paddingHorizontal: 15,
        borderWidth: 1, 
        height: 60, 
        borderRadius: 10,
        backgroundColor:'#FFFFFF', 
        marginBottom: 10
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
        color:'black', 
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
    errorText: {
        color: 'red', 
        letterSpacing: 0.3
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