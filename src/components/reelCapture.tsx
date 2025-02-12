import { View, Text, Pressable, Button, Image} from 'react-native'
import { useCameraPermission, useCameraDevice, Camera } from 'react-native-vision-camera';
import { AntDesign, MaterialCommunityIcons, Ionicons} from '@expo/vector-icons'
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';

export default function ReelsCapture({ isFront }: { isFront: boolean }){
    const cameraRef = useRef<Camera>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice(isFront? 'front' : 'back');
    const [flash, setFlash] = useState(false)
    const [image, setImage] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);


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



    if (!hasPermission) {
        return (
          <View>
            <Text>No permission. Please grant camera access.</Text>
            <Button title="Grant Permission" onPress={requestPermission} />
          </View>
        );
      }
    
      if (device == null) return <Text>No camera device found</Text>;

      const TakePicture = async () => {
        try{
            console.log('image captured')
            if (cameraRef.current) {
                const photo = await cameraRef.current.takePhoto();
                console.log(photo.path); // Path to the captured image
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
                console.log('Video saved:', video);
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
    

    return(
        <View style={{flex: 1}}>
         {  image? <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
                    <Image source={{ uri : image}} resizeMode='contain' style={{width: 400, height: 400}}/>
                </View> : 
            <View style={{flex: 1}}>
            <Camera
            torch={flash? 'on' : 'off'}
            photo={true}
            ref={cameraRef}
            style={{flex: 1}}
            device={device}
            isActive={true}
            video={true}
          />
            <View style={{position: 'absolute', width: '100%', height: '100%'}}>
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
                     <Ionicons name="musical-notes-outline" size={35} color="white" style={{width: 40, height: 40, marginRight: 10}} />
                     <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3}}>Music</Text>
                      </View>

                      <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10}}>
                          <Ionicons name="timer-outline" size={35} color="white"  style={{width: 40, height: 40, marginRight: 10}}/>
                          <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3}}>Timer</Text>
                        </View>

                        <View style={{flexDirection:'row', alignItems:'center'}}>
                        <MaterialCommunityIcons name="view-gallery-outline" size={30} color="white" style={{width: 40, height: 40, marginRight: 10}}/>
                          <Text style={{color:'white', fontWeight:'500', letterSpacing: 0.3}}>Gallery</Text>
                        </View>
                </View>
           <Pressable onLongPress={()=> {setIsRecording(true); startRecording()}} onPressOut={()=> {setIsRecording(false); stopRecording();}} onPress={TakePicture} style={{ top: 20, zIndex: 1, alignSelf: 'center', marginTop:'auto', width: 90, height: 90, borderRadius: 90, backgroundColor:isRecording? 'green' : 'white', padding: 5}}>
              <View style={{width: 80, height: 80, borderRadius: 80, borderColor: isRecording? 'white' : 'black', borderWidth: 2, backgroundColor:isRecording? 'green' : 'white'}}>
              </View>
           </Pressable>
         </View>
        </View>
      }
    </View>
    )
}