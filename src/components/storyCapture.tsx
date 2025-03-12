import { View, Text, Pressable, Image, Modal, Alert, FlatList, useWindowDimensions, StatusBar, Platform, ViewToken} from 'react-native'
import { useCameraPermission, useCameraDevice, Camera, useCameraFormat, CameraProps, useMicrophonePermission, useSkiaFrameProcessor, DrawableFrameProcessor } from 'react-native-vision-camera';
import { AntDesign, MaterialCommunityIcons, Ionicons, Fontisto, MaterialIcons} from '@expo/vector-icons'
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import Reanimated, { useAnimatedProps, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import EditMediaCapture from './editMediaCapture';
import ColorMatrices from '../../assets/colorMatrices.json'
import { Canvas, Image as SkiaImage, Group, Skia, useImage, ColorMatrix, makeImageFromView, SkImage } from "@shopify/react-native-skia";


Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

export default function StoryCapture({ isFront }: { isFront: boolean }){
   const [assets, setAssets] = useState<Assets[]>([])
    const cameraRef = useRef<Camera>(null);

    const { hasPermission, requestPermission } = useCameraPermission();
    const { hasPermission: audioPermission, requestPermission: requestAudioPermission } = useMicrophonePermission();
    
    const device = useCameraDevice(isFront? 'front' : 'back');
    const format = useCameraFormat(device, [
        { fps: 240 }
      ])
      const minFps = format ? Math.max(format.minFps, 20) : 20;
      const maxFps = format ? Math.min(format.maxFps, 30) : 30;
    const [flash, setFlash] = useState(false)
    const [showDeviceModal, setShowDeviceModal] = useState(false)
    const [image, setImage] = useState<string | null>(null)
    const [video, setVideo] = useState<VideoType | null>(null)
    const [editCaptureModal, setEditCaptureModal] = useState(false)
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [handsFree, setHandsFree] = useState(false)
    const [timerPlaceholder, setTimerPlaceholder] = useState(0)
    const [timer, setTimer] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [displayTimer, setDisplayTimer] = useState(-1)
    const [openGallery, setOpenGallery] = useState(true)
    const { width, height} = useWindowDimensions()
    const [currentViewableMedia, setCurrentViewableMedia] = useState<ViewToken>()
    const zoom = useSharedValue(device?.neutralZoom)
    const zoomOffset = useSharedValue(0);
    const skiaImage = useImage(require('../../assets/images/modelImg.jpeg'))


    type VideoType = {
       duration: number,
       path: string
    }

    type Assets = {
      mediaType: string,
      uri: string,
      duration: number
    }

    // Define the viewability configuration
      const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 100, // Item is considered visible if at least 50% of it is visible
      }).current;

 // Callback function to handle viewable items change
  const onViewableItemsChanged = ({ viewableItems } : {viewableItems: ViewToken[]}) => {
    setCurrentViewableMedia(viewableItems[0])
    // You can perform actions based on the currently visible items here
  }
  
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
          
        
    
    
    
    const getRecentMedia = async () => {
        try {
          // Request permissions
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Allow access to media library');
            return;
          }
      
          // Fetch media (sorted by creation time, most recent first)
          const media = await MediaLibrary.getAssetsAsync({
            mediaType: ['photo', 'video'], // Fetch both images and videos
            sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Sort descending (recent first)
          });
      
          setAssets(media.assets);
        } catch (error) {
          console.error('Error fetching media:', error);
        }
      };



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
                setImage(`file://${photo.path}`)
                setEditCaptureModal(true)
              }
        }catch(e){
          if(e instanceof Error){
            console.log('Error msg : ', e.message)
          }
            
        }
      
      };

      const startRecording = async () => {
        if (!(cameraRef.current)) {
            return
        }
          try {
            await cameraRef.current.startRecording({
              flash: flash? 'on' : 'off' ,
              onRecordingFinished: (video) => {
                console.log('Video saved');
                setVideo(video)
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

     
        const countdownTimer = (initialTime: number, mode: string)=>{
          let time = initialTime
          const interval = setInterval(()=>{
              if(time == 0){
                clearInterval(interval)
                setDisplayTimer(-1)
               if(mode == 'video'){
                  setIsRecording(true)
                  startRecording()
               }else{
                  TakePicture()
               }
               
              }else{
                  
                  setDisplayTimer(time -= 1)
              }
          }, 1000)

        }

        useEffect(()=>{
            if(!openGallery) return
            getRecentMedia()
        }, [openGallery])

     
         

          const recordVideoAfterTimer = (time: number)=>{
               countdownTimer(time + 1, 'video')
          }

          const snap = (time: number)=>{
              if(timer>0 && !isRecording){
                  countdownTimer(time + 1, 'photo')
              }else{
                 if(isRecording){
                   setIsRecording(false)
                   stopRecording()
                 }else{
                    TakePicture()
                 }
              }
          }

          const formatDuration = (seconds: number)=>{
            if (isNaN(seconds) || seconds < 0) {
                return "Invalid input";
            }
        
            // Round to nearest integer
            seconds = Math.round(seconds);
        
            // Calculate hours, minutes, and remaining seconds
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
        
            // Format time components with leading zeros
            const mm = String(minutes).padStart(2, '0');
            const ss = String(secs).padStart(2, '0');
        
            if (hours > 0) {
                return `${hours}:${mm}:${ss}`; // Hour format
            } else if (minutes > 0) {
                return `${minutes}:${ss}`; // Minute format
            } else {
                return `0:${ss}`; // Seconds format
            }
        }

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
         {  editCaptureModal?
                   <EditMediaCapture mode={'story'} video={video} setVideo={setVideo} photo={image} setImage={setImage} editCaptureModal={editCaptureModal} setEditCaptureModal={setEditCaptureModal} currentViewableMedia={currentViewableMedia as ViewToken}  /> 
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
                   style={{flex: 1, scaleX: 1}}
                   device={device}
                   isActive={true}
                   video={true}
                   audio={true}
                   videoBitRate="high"
                  photoQualityBalance="speed"
                   animatedProps={animatedProps}
                   frameProcessor={frameProcessor}
                   pixelFormat={Platform.OS == 'ios'? 'rgb' : 'yuv'}
                   outputOrientation={'device'}
                  
                />
            <View style={{position: 'absolute', width: '100%', height: '100%', paddingTop: StatusBar.currentHeight,}}>
              <View style={{ paddingHorizontal: 30,  flexDirection:'row', justifyContent:'space-between'}}>
                <AntDesign onPress={()=> router.push('/(home)/post')} name="close" size={30} color="white" />
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

                        <View style={{flexDirection:'row', alignItems:'center', alignSelf:'flex-start'}}>
                        <MaterialCommunityIcons name="view-gallery-outline" size={30} color="white" style={{width: 35, height: 35, marginRight: 10}}/>
                          <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3, fontSize: 13}}>Gallery</Text>
                        </View>

                        
                </View>}
           
            <View style={{ marginTop:'auto'}}>
              <Pressable style={{zIndex: 1, position:'absolute', left: (50/100 * width - 40), top: 5, width: 90, height: 90, borderRadius: 90, borderWidth: 2, borderColor: 'white'}}>
              </Pressable>
              <FlatList 
               style={{borderTopLeftRadius: 90, borderBottomLeftRadius: 90, width: (50/100 * width) + 40, top: 5, alignSelf:'flex-end', borderColor:'white', zIndex: 2}}
                contentContainerStyle={{alignItems:'center', paddingRight: 180}}
                horizontal
                snapToInterval={90} // Snap to each item
                snapToAlignment="start"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                data={ColorMatrices} renderItem={(({item, index})=>{
                  const whiteMatrix = [
                    0, 0, 0, 0, 1,  
                    0, 0, 0, 0, 1,  
                    0, 0, 0, 0, 1,  
                    0, 0, 0, 1, 0   
                  ]
                  return(
                    
                        <View style={{width: 90, height: 90, alignItems:'center', justifyContent:'center'}}>
                          <Pressable onLongPress={ timer>0? ()=> recordVideoAfterTimer(timer) : ()=> {setIsRecording(true); startRecording()}} onPressOut={ handsFree? ()=>{} : ()=> {setIsRecording(false); stopRecording()}} onPress={()=> snap(timer)}>
                          <Canvas style={{ width: item == currentViewableMedia?.item? 80 : 70, height: item == currentViewableMedia?.item? 80 : 70}}>
                                                      <Group clip={Skia.RRectXY(Skia.XYWHRect(0, 0, item == currentViewableMedia?.item? 80 : 70, item == currentViewableMedia?.item? 80 : 70), item == currentViewableMedia?.item? 80: 10, item == currentViewableMedia?.item? 80 : 10)}>
                                                            <SkiaImage image={skiaImage} fit={"cover"} x={0} y={0} width={item == currentViewableMedia?.item? 80 : 70} height={item == currentViewableMedia?.item? 80 : 70}>
                                                              <ColorMatrix matrix={index == 0? whiteMatrix : item.matrice} />
                                                            </SkiaImage>
                                                          </Group>
                                                        </Canvas>
                          </Pressable>
                            
                        </View>
                  )
                })}/>

                            </View>
          
         </View>
        </View>
       </GestureDetector>
    </View>
      }
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
      <Modal visible={false} onRequestClose={()=>{}} presentationStyle='overFullScreen' animationType='slide'>
          <View style={{flex: 1,  backgroundColor:"black"}}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 20}}>
                  <AntDesign name="close" onPress={()=> setShowModal(false) } size={30} color="white" style={{marginRight: 20}} />
                  <Text style={{color:'white', fontWeight:'600', letterSpacing: 0.2, fontSize: 18}}>Add to story</Text>
                  <AntDesign name="setting" size={30} color="white" />     
              </View>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 20}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text style={{fontSize: 18, color:'white', fontWeight:'600'}}>Recents</Text>
                    <AntDesign name="down" size={16} color="white" style={{marginLeft: 10}}/>
                </View>
                <View style={{width: 40, height:40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(255,255,255,0.3)'}}>
                    <Ionicons name="copy-outline" size={20} color="white" />
                </View>
                
              </View>
              <FlatList style={{marginTop: 10}} numColumns={3} contentContainerStyle={{gap: 2}} data={assets} renderItem={({item, index})=> {
                if(index == 0){
                  return(
                    <View style={{marginRight: 2, backgroundColor:'rgba(255,255,255,0.3)', width: width/3}}>
                      <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
                            <Ionicons name="camera-outline" size={30} color="white" style={{marginTop: 20}} />
                        </View>
                        
                          <Text style={{padding: 10, fontSize: 16, fontWeight:'600', color:'white'}}>Camera</Text>
                      </View>
                  )
                }
                return(
                  <View style={{marginRight: 2}}>
                           <Image source={{uri : item.uri}} style={{width: width/3, height: 200}}   />
                           { item.mediaType == 'video' && <Text style={{fontWeight:'600', color:'white', letterSpacing: 0.5, position:'absolute', top: '85%', left: 70/100 * (width/3)}}>{formatDuration(item.duration)}</Text>}
                    </View>
                )
              }}/>
          </View>
        </Modal>
    </View>
    )
}