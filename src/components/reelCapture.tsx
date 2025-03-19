import { View, Text, Pressable, Alert, Image, Modal, StatusBar, useWindowDimensions} from 'react-native'
import { useCameraPermission, useCameraDevice, Camera, useMicrophonePermission, useCameraFormat, CameraProps, useSkiaFrameProcessor} from 'react-native-vision-camera';
import { AntDesign, MaterialCommunityIcons, Ionicons} from '@expo/vector-icons'
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import Reanimated, { useAnimatedProps, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Skia } from '@shopify/react-native-skia';

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

export default function ReelsCapture({ isFront }: { isFront: boolean }){
   const { width, height } = useWindowDimensions()
    const cameraRef = useRef<Camera>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const { hasPermission: audioPermission, requestPermission: requestAudioPermission } = useMicrophonePermission();
    const device = useCameraDevice(isFront? 'front' : 'back');
      const format = useCameraFormat(device, [
        { fps: 240 }
      ])
      const minFps = format ? Math.max(format.minFps, 20) : 20;
      const maxFps = format ? Math.min(format.maxFps, 30) : 30;
      const [showDeviceModal, setShowDeviceModal] = useState(false)
    const [flash, setFlash] = useState(false)
    const [image, setImage] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
     const zoom = useSharedValue(device?.neutralZoom)
        const zoomOffset = useSharedValue(0);

        const normalMatrix = [
            1, 0, 0, 0, 0,  
            0, 1, 0, 0, 0,  
            0, 0, 1, 0, 0, 
            0, 0, 0, 1, 0
          ]
            
               
                const colorFilter = Skia.ColorFilter.MakeMatrix(normalMatrix );
                const paint = Skia.Paint();
                paint.setColorFilter(colorFilter);
              
                const frameProcessor = useSkiaFrameProcessor((frame) => {
                  "worklet";
                  frame.render(paint);
                }, [paint]);
                  
                
            
            

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
    if(device == null){
       showDeviceModalAlert()
       setShowDeviceModal(true)
    }
  }, [device])

  useEffect(()=>{
    if(!hasPermission){
       requestPermission()
    }else{
     if(!audioPermission){
       requestAudioPermission()
     }
    }
 }, [hasPermission])
   

      const TakePicture = async () => {
        try{
            console.log('image captured')
            if (cameraRef.current) {
                const photo = await cameraRef.current.takePhoto();
              }
        }catch(e){
            console.log('Error : ', e)
        }
      
      };

      const startRecording = async () => {
        if (!(cameraRef.current)) {
            return
        }
          try {
            const video = await cameraRef.current.startRecording({
              flash: flash? 'on' : 'off' ,
              onRecordingFinished: (video) => {
                console.log('Video saved');
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
          

    return(
        <View style={{flex: 1}}>
         {  image? <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
                    <Image source={{ uri : image}} resizeMode='cover' style={{width: width, height: height}}/>
                </View> : 
            <View style={{flex: 1, zIndex: 1}}>
                 <GestureDetector gesture={gesture}>
                   <View style={{flex: 1}}>
               {/* <ReanimatedCamera
                   torch={flash? 'on' : 'off'}
                   photo={true}
                  
                   ref={cameraRef}
                   style={{flex: 1, scaleX: 1}}
                   device={device}
                   isActive={true}
                  
                   video={true}
                   audio={true}
                   
                  photoQualityBalance="speed"
                   animatedProps={animatedProps}
                  
                   androidPreviewViewType="texture-view"
                   pixelFormat={'yuv'}
                /> */}
            <View style={{position: 'absolute', width: '100%', height: '100%', paddingTop: StatusBar.currentHeight}}>
              <View style={{ paddingHorizontal: 30, paddingTop: 15, flexDirection:'row', justifyContent:'space-between'}}>
                <AntDesign onPress={()=> router.push('/(home)/post')} name="close" size={30} color="white" />
                <MaterialCommunityIcons onPress={()=> setFlash(!flash)} name={flash? 'flash': "flash-off"} size={30} color="white" />
                <AntDesign name="setting" size={30} color="white" />     
             </View>
            {isRecording && <View style={{alignSelf:'center'}}>
                  <Text style={{color:'white', fontWeight:'600', letterSpacing: 0.5, fontSize: 16, marginTop: 20}}>{formatTime(seconds)}</Text>
              </View>}

              <View style={{top:'40%', marginLeft: 10}}>
                     <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10}}>
                     <Ionicons name="musical-notes-outline" size={30} color="white" style={{width: 35, height: 35, marginRight: 10}} />
                     <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3, fontSize: 13}}>Music</Text>
                      </View>

                      <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10}}>
                          <Ionicons name="timer-outline" size={30} color="white"  style={{width: 35, height: 35, marginRight: 10}}/>
                          <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3, fontSize: 13}}>Timer</Text>
                        </View>

                        <View style={{flexDirection:'row', alignItems:'center'}}>
                        <MaterialCommunityIcons name="view-gallery-outline" size={25} color="white" style={{width: 35, height: 35, marginRight: 10}}/>
                          <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3, fontSize: 13}}>Gallery</Text>
                        </View>
                </View>
           <Pressable onLongPress={()=> {setIsRecording(true); startRecording()}} onPressOut={()=> {setIsRecording(false); stopRecording();}} onPress={TakePicture} style={{ top: 20, zIndex: 1, alignSelf: 'center', marginTop:'auto', width: 90, height: 90, borderRadius: 90, backgroundColor:isRecording? 'green' : 'white', padding: 5}}>
              <View style={{width: 80, height: 80, borderRadius: 80, borderColor: isRecording? 'white' : 'black', borderWidth: 2, backgroundColor:isRecording? 'green' : 'white'}}>
              </View>
           </Pressable>
         </View>
         </View>
         </GestureDetector>
        </View>
      }
    </View>
    )
}