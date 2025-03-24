import { View, Text, Pressable, Modal } from 'react-native'
import { AntDesign, Fontisto } from '@expo/vector-icons'
import { useState } from 'react';

export default function CaptureDelayTimer({showModal, setShowModal, setTimer}: { showModal: boolean, setShowModal: React.Dispatch<React.SetStateAction<boolean>>, setTimer: React.Dispatch<React.SetStateAction<number>>}){
        const [timerPlaceholder, setTimerPlaceholder] = useState(0)

  return (
    <Modal visible={showModal} onRequestClose={()=> setShowModal(false)} transparent={true} presentationStyle='overFullScreen' animationType='slide'>
    <View style={{flex: 1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center'}}>
       <View style={{width: '60%', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor:'white'}}>
        <View style={{borderBottomWidth: 2, flexDirection:'row', alignItems:'center'}}>
                <AntDesign name="close" onPress={()=> setShowModal(false) } size={25} color="black" style={{marginRight: 20}} />
                <Text style={{fontSize: 20, fontWeight:'600'}}>SET DELAY</Text>
        </View>
        <Pressable onPress={()=> {setTimerPlaceholder(0)}} style={{flexDirection:'row', alignItems:"center", marginTop: 15}}>
           <Fontisto name={timerPlaceholder == 0? "radio-btn-active" : "radio-btn-passive"} size={24} color="black" style={{marginRight: 15}}/>
           <Text style={{fontSize: 18, fontWeight:'500', letterSpacing:0.3}}>0 seconds</Text>
        </Pressable>
        <Pressable onPress={()=> {setTimerPlaceholder(3)}} style={{flexDirection:'row', alignItems:"center", marginVertical: 15}}>
           <Fontisto name={timerPlaceholder == 3? "radio-btn-active" : "radio-btn-passive"} size={24} color="black" style={{marginRight: 15}}/>
           <Text style={{fontSize: 18, fontWeight:'500', letterSpacing:0.3}}>3 seconds</Text>
        </Pressable>
        <Pressable onPress={()=> {setTimerPlaceholder(10)}} style={{flexDirection:'row', alignItems:"center"}}>
           <Fontisto name={timerPlaceholder == 10? "radio-btn-active" : "radio-btn-passive"} size={24} color="black" style={{marginRight: 15}} />
           <Text  style={{fontSize: 18, fontWeight:'500', letterSpacing:0.3}}>10 seconds</Text>
        </Pressable>

        <Pressable onPress={()=>{setTimer(timerPlaceholder); setShowModal(false)}} style={{backgroundColor:'black', alignSelf:'center', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 5, marginTop: 10}} >
           <Text style={{color:'white', fontSize: 16, fontWeight:'600'}}>SET</Text>
        </Pressable> 
       </View>
    </View>
  </Modal>
  )
}

