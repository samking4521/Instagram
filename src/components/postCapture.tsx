import { useCameraPermission, useCameraDevice, Camera, useMicrophonePermission, useCameraFormat, CameraProps } from 'react-native-vision-camera';
import { View, Text, Button, Image, Pressable, useWindowDimensions, StyleSheet, LayoutChangeEvent, Alert, Modal, StatusBar } from 'react-native';
import { AntDesign, MaterialCommunityIcons} from '@expo/vector-icons'
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import Reanimated, { useAnimatedProps, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import EditMediaCapture from './editMediaCapture';

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)


export default function PostCapture({ isFront, uri }: { isFront: boolean, uri: string }) {
  const {width, height} = useWindowDimensions()
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { hasPermission: audioPermission, requestPermission: requestAudioPermission } = useMicrophonePermission();
  const device = useCameraDevice(isFront? 'front' : 'back');
  const format = useCameraFormat(device, [
    { fps: 240 }
  ])
  const [image, setImage] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoType | null>(null)
  const [editCaptureModal, setEditCaptureModal] = useState(false)
  const minFps = format ? Math.max(format.minFps, 20) : 20;
  const maxFps = format ? Math.min(format.maxFps, 30) : 30;
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [flash, setFlash] = useState(false)
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const zoom = useSharedValue(device?.neutralZoom)
  const zoomOffset = useSharedValue(0);

   
 type VideoType = {
    duration: number,
    path: string
 }

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




  


  const showDeviceModalAlert = ()=>{
    Alert.alert(
      "No Camera",
      "This device has no camera available",
      [
        { text: "Cancel", onPress: ()=> router.back()},
        { text: "OK", onPress: ()=> console.log('Pressed Ok') }
      ]
    );
  }

useEffect(()=>{
   if(!hasPermission){
      requestPermission()
   }else{
    if(!audioPermission){
      requestAudioPermission()
    }
   }
}, [hasPermission])


useEffect(()=>{
  if(device == null){
     showDeviceModalAlert()
     setShowDeviceModal(true)
  }
}, [device])
  

  
  const TakePicture = async () => {
    try{
        if(cameraRef.current){
            const photo = await cameraRef.current.takePhoto();
            console.log('Image captured')
            moveToEditScreen(`file://${photo.path}`)
          }
    }catch(e){
        console.log('Error : ', e)
    }
  };

  const moveToEditScreen = (fileUri: string)=>{
    const selectImgs = [{
      id: 1,
      mediaType: 'photo',
      uri: fileUri
     }]
          router.push({
            pathname: '/(nestedScreens)/PostPreview',
            params: {media: JSON.stringify(selectImgs), imgResizeMode: false.toString(), galleryMedia: JSON.stringify({
               uri: uri
            })}})
            if(flash){
               setFlash(false)
            }
  }


  const startRecording = async () => {
    if (!(cameraRef.current)) {
        return
    }
      try {
        await cameraRef.current.startRecording({
          flash: flash? 'on' : 'off',
          onRecordingFinished: (video) => {
            console.log('Video saved');

            setVideo(video)
            if(flash){
              setFlash(false)
            }
            setEditCaptureModal(true)
           
          },
          onRecordingError: (error) => {
            console.error('Recording error:', error);
          },
        });
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
   
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      await cameraRef.current.stopRecording();
      setSeconds(0)
    }
  };


  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value ?? 1
    })
    .onUpdate(event => {
      const z = zoomOffset.value * event.scale
      if (device) {
        zoom.value = interpolate(
          z,
          [1, 10],
          [device.minZoom, device.maxZoom],
          Extrapolation.CLAMP,
        );
      }
    })

  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({ zoom: zoom.value }),
    [zoom]
  )
  
      if(device == null){
        return(
          <Modal visible={showDeviceModal} onRequestClose={()=> setShowDeviceModal(false)} animationType='fade' presentationStyle='overFullScreen' transparent={true}>
                  <View style={{flex: 1, backgroundColor:'rgba(0,0,0,0.5)'}}>       
                   </View>
          </Modal>
        )   
      }

  return (
    <View style={{flex: 1}}>
      {
        editCaptureModal? <EditMediaCapture mode={'post'} video={video} setVideo={setVideo} setImage={setImage} editCaptureModal={editCaptureModal} setEditCaptureModal={setEditCaptureModal} photo={image}/> 
               :
      <View style={{flex: 1, zIndex: 1}}>
         <GestureDetector gesture={gesture}>
        <View style={{flex: 1}}>
                <ReanimatedCamera
                  lowLightBoost={true}
                  exposure={0}
                  torch={flash? 'on' : 'off'}
                  photo={true}
                  format={format}
                  fps={[minFps, maxFps]}
                  ref={cameraRef}
                  style={{flex: 1}}
                  device={device}
                  isActive={true}
                  video={true}
                  audio={true}
                  videoBitRate="high"
                 photoQualityBalance="speed"
                  animatedProps={animatedProps}
                />
                
        
       
            <View style={{position: 'absolute', width: '100%', height: '100%'}}>
              <View style={{ paddingHorizontal: 30, paddingTop: StatusBar.currentHeight, flexDirection:'row', justifyContent:'space-between'}}>
                  <AntDesign onPress={()=> router.push('/(home)/post')} name="close" size={30} color="white" />
                  <MaterialCommunityIcons onPress={()=> setFlash(!flash)} name={flash? 'flash': "flash-off"} size={30} color="white" />
                  <AntDesign name="setting" size={30} color="white" />     
             </View>

           { isRecording && <View style={{alignSelf:'center', position:'absolute', top: 50}}>
                  <Text style={{color:'white', fontWeight:'600', letterSpacing: 0.5, fontSize: 16, marginTop: 20}}>{formatTime(seconds)}</Text>
              </View>}
           
          
           <Pressable onPressOut={()=> {setIsRecording(false); stopRecording()}} onLongPress={()=> {setIsRecording(true); startRecording()}}  onPress={TakePicture} style={{ top: 20, zIndex: 1, alignSelf: 'center', marginTop:'auto', width: 90, height: 90, borderRadius: 90, backgroundColor: isRecording? 'green' : 'white', padding: 5}}>
              <View style={{width: 80, height: 80, borderRadius: 80, borderColor: isRecording? 'white' : 'black', borderWidth: 2, backgroundColor: isRecording? 'green': 'white'}}>
                
              </View>
           </Pressable>
           
         </View>
       </View>
       </GestureDetector>
       </View>
   }
    </View>
  );
}
