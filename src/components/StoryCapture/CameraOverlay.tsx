import { View, Text, Pressable, Modal, useWindowDimensions, StatusBar, ViewToken} from 'react-native'
import { AntDesign, MaterialCommunityIcons, Ionicons, MaterialIcons} from '@expo/vector-icons'
import { router } from 'expo-router';
import CameraPreviewFilterFlatlist from './cameraPreviewFilterFlatlist';
import {useState, useEffect} from 'react'
import { Camera } from 'react-native-vision-camera';


type VideoType = {
    duration: number,
    path: string
 }

export default function CameraOverlay({ cameraRef, flash, setFlash, timer, setShowModal, setImage, setVideo, setEditCaptureModal, setOpenAddStoryModal, currentViewableMedia, setCurrentViewableMedia} : {cameraRef: React.RefObject<Camera> , flash: boolean, timer: number, setShowModal: React.Dispatch<React.SetStateAction<boolean>>, setFlash: React.Dispatch<React.SetStateAction<boolean>>, setImage: React.Dispatch<React.SetStateAction<string|null>> , setVideo: React.Dispatch<React.SetStateAction<VideoType|null>>, setEditCaptureModal: React.Dispatch<React.SetStateAction<boolean>> , setOpenAddStoryModal: React.Dispatch<React.SetStateAction<boolean>>, currentViewableMedia: ViewToken, setCurrentViewableMedia: React.Dispatch<React.SetStateAction<ViewToken | undefined>> }){
    const [seconds, setSeconds] = useState(0);
     const [handsFree, setHandsFree] = useState(false)
    const { width, height} = useWindowDimensions()  
    const [isRecording, setIsRecording] = useState(false)
    const [displayTimer, setDisplayTimer] = useState(-1)

    useEffect(() => {
        let interval: number | null = null;
    
        if (isRecording) {
          interval = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds + 1);
          }, 1000) as unknown as number;
        } else if (interval) {
          clearInterval(interval);
        }
    
        return () => {
          if (interval) clearInterval(interval);
        };
      }, [isRecording]);

     const formatTime = (totalSeconds: number) => {
       const minutes = Math.floor(totalSeconds / 60);
       const secs = totalSeconds % 60;
       return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
     };

  return (
    <>
    <View style={{position: 'absolute', width: '100%', height: '100%', paddingTop: StatusBar.currentHeight,}}>
                     <View style={{ paddingHorizontal: 30,  flexDirection:'row', justifyContent:'space-between'}}>
                       <AntDesign onPress={()=> router.back()} name="close" size={30} color="white" />
                       <MaterialCommunityIcons onPress={()=> setFlash(!flash)} name={flash? 'flash': "flash-off"} size={30} color="white" />
                       <AntDesign name="setting" size={30} color="white" />     
                    </View>
                   {isRecording && <View style={{alignSelf:'center'}}>
                         <Text style={{color:'white', fontWeight:'600', letterSpacing: 0.5, fontSize: 16, marginTop: 20}}>{formatTime(seconds)}</Text>
                     </View>}
       
                     { displayTimer>=1? <Modal visible={true} presentationStyle='overFullScreen' transparent={true} animationType='slide'>
                                 <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                                           <Text style={{fontSize: 50, fontWeight: '800', color:'white'}}>
                                                    {displayTimer}
                                           </Text>
                                    </View>
                     </Modal> :  <View style={{top:'40%', marginLeft: 10}}>
                            <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10}}>
                            <Ionicons name="musical-notes-outline" size={30} color="white" style={{width: 35, height: 35, marginRight: 10}} />
                            <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3, fontSize: 13}}>Music</Text>
                             </View>
       
                          <Pressable onPress={()=> setHandsFree(!handsFree)} style={{flexDirection:'row', alignItems:'center', marginBottom: 10, alignSelf:'flex-start'}}>
                           <View style={{backgroundColor: handsFree? 'white' : undefined, borderRadius: handsFree? 40: undefined, width: handsFree? 35 : undefined, height: handsFree? 35 : undefined, alignItems: handsFree? 'center' : undefined,  justifyContent:handsFree? 'center' : undefined, marginRight: 10}}>
                               <Ionicons name="stop-circle-outline" size={30}  color={handsFree? 'red' : "white"} />
                           </View>
                               <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3, fontSize: 13}}>Hands-free</Text>
                             </Pressable>
       
                             <Pressable onPress={()=> setShowModal(true)} style={{flexDirection:'row', alignItems:'center', marginBottom: 10, alignSelf:'flex-start'}}>
                                 <Ionicons name="timer-outline" size={30} color={timer>0? "red" : "white"}  style={{width: 35, height: 35, marginRight: 10}}/>
                                 { timer>0? <MaterialIcons name={ timer == 3? "timer-3" : "timer-10"} size={24} color="white" /> : <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3}}>Timer</Text>}
                             </Pressable>
       
                               <Pressable onPress={()=> setOpenAddStoryModal(true)} style={{flexDirection:'row', alignItems:'center', alignSelf:'flex-start'}}>
                               <MaterialCommunityIcons name="view-gallery-outline" size={30} color="white" style={{width: 35, height: 35, marginRight: 10}}/>
                                 <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3, fontSize: 13}}>Gallery</Text>
                               </Pressable>
       
                               
                       </View>}
                  
                   <View style={{ marginTop:'auto'}}>
                     <Pressable style={{zIndex: 1, position:'absolute', left: (50/100 * width - 40), top: 5, width: 90, height: 90, borderRadius: 90, borderWidth: 2, borderColor: 'white'}}>
                     </Pressable>
                      <CameraPreviewFilterFlatlist isRecording={isRecording} setIsRecording={setIsRecording} flash={flash} setImage={setImage} setVideo={setVideo} setDisplayTimer={setDisplayTimer} setEditCaptureModal={setEditCaptureModal} setSeconds={setSeconds} handsFree={handsFree} timer={timer} currentViewableMedia={currentViewableMedia} setCurrentViewableMedia={setCurrentViewableMedia} cameraRef={cameraRef}/>
                </View>
            </View>
    </>
  )
}

