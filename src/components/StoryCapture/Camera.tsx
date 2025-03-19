import { View, Modal, ViewToken, AppState, Alert} from 'react-native'
import { useCameraDevice, Camera, CameraProps, useSkiaFrameProcessor } from 'react-native-vision-camera';
import { useState, useRef, useEffect } from 'react';
import Reanimated, { useAnimatedProps, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Skia,} from "@shopify/react-native-skia";
import CameraOverlay from './CameraOverlay';
import { router } from 'expo-router';

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

type VideoType = {
    duration: number,
    path: string
 }

export default function CameraVision({isFront , setShowModal,  setImage, setVideo, setEditCaptureModal, timer, currentViewableMedia, setCurrentViewableMedia, setOpenAddStoryModal} : { timer: number, isFront: boolean, setImage: React.Dispatch<React.SetStateAction<string | null>>, setVideo: React.Dispatch<React.SetStateAction<VideoType | null>>, setEditCaptureModal: React.Dispatch<React.SetStateAction<boolean>>, currentViewableMedia: ViewToken, setShowModal: React.Dispatch<React.SetStateAction<boolean>>, setOpenAddStoryModal:  React.Dispatch<React.SetStateAction<boolean>>, setCurrentViewableMedia:  React.Dispatch<React.SetStateAction<ViewToken | undefined>>}){
        const cameraRef = useRef<Camera>(null);
        const device = useCameraDevice(isFront? 'front' : 'back');
        const [showDeviceModal, setShowDeviceModal] = useState(false)
        const zoom = useSharedValue(device?.neutralZoom)
        const zoomOffset = useSharedValue(0);
        const [isActive, setIsActive] = useState(true)
        const [flash, setFlash] = useState(false)
     
        const normalMatrix = [
            1, 0, 0, 0, 0,  
            0, 1, 0, 0, 0,  
            0, 0, 1, 0, 0, 
            0, 0, 0, 1, 0
          ]

        const colorFilter = Skia.ColorFilter.MakeMatrix(currentViewableMedia? currentViewableMedia.item.matrice : normalMatrix );
                const paint = Skia.Paint();
                paint.setColorFilter(colorFilter);
              
                const frameProcessor = useSkiaFrameProcessor((frame) => {
                  "worklet";
                  frame.render(paint);
                }, [paint]);
                
                 useEffect(() => {
                          const handleAppStateChange = (nextAppState: string) => {
                            if (nextAppState === "background") {
                              setIsActive(false);
                            }else{
                                setIsActive(true)
                            }
                           
                          };
                        
                          const subscription = AppState.addEventListener("change", handleAppStateChange);
                        
                          return () => subscription.remove();
                        }, []);
                
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

                 if(device == null){
                            return(
                              <Modal visible={showDeviceModal} onRequestClose={()=> setShowDeviceModal(false)} animationType='fade' presentationStyle='overFullScreen' transparent={true}>
                                      <View style={{flex: 1, backgroundColor:'rgba(0,0,0,0.5)'}}>       
                                       </View>
                              </Modal>
                            )   
                          }
                
        
  return (
        <GestureDetector gesture={gesture}>
                       <View style={{flex: 1}}>
                    <ReanimatedCamera
                       onError={(e)=> console.log('cam error : ', e.message)}
                          torch={flash? 'on' : 'off'}
                          photo={true}
                          ref={cameraRef}
                          style={{flex: 1, scaleX: 1}}
                          device={device}
                          isActive={isActive}
                          video={true}
                          audio={true} 
                         photoQualityBalance="speed"
                          animatedProps={animatedProps}
                          frameProcessor={frameProcessor}   
                       />
                     <CameraOverlay
                            cameraRef={cameraRef}
                            flash={flash}
                            setFlash={setFlash}
                            setEditCaptureModal={setEditCaptureModal}
                            timer={timer}
                            setShowModal={setShowModal}
                            setOpenAddStoryModal={setOpenAddStoryModal}
                            currentViewableMedia={currentViewableMedia}
                            setCurrentViewableMedia={setCurrentViewableMedia}
                            setImage={setImage}
                            setVideo={setVideo}
                           
                          
                                  />
                                 
               </View>
              </GestureDetector>
  )
}