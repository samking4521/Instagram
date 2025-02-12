import { useCameraPermission, useCameraDevice, Camera } from 'react-native-vision-camera';
import { View, Text, Button, Image, Pressable, useWindowDimensions, StyleSheet, LayoutChangeEvent } from 'react-native';
import { AntDesign, MaterialCommunityIcons} from '@expo/vector-icons'
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';

export default function PostCapture({ isFront }: { isFront: boolean }) {
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(isFront? 'front' : 'back');
  const [flash, setFlash] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [imgResult, setImgResult] = useState< ImgResult | null>(null)
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


  type CropBox = {
    x: number,
    y: number,
    width: number,
    height: number

  }

  type ImgResult = {
    height: number,
    width: number
  }

  const {width, height} = useWindowDimensions()


  const cropImage = async (photoUri: string) => {
    if(!cropBox) return
    return new Promise((resolve, reject) => {
      Image.getSize(photoUri, async (imageWidth, imageHeight) => {
        // Scale crop box dimensions to actual image dimensions
        const originX = (cropBox.x / width) * imageWidth;
        const originY = (cropBox.y / height) * imageHeight;
        const cropWidth = (cropBox.width / width) * imageWidth;
        const cropHeight = (cropBox.height / height) * imageHeight;

        // Ensure cropping does not exceed image boundaries
        const finalCropWidth = Math.min(cropWidth, imageWidth - originX);
        const finalCropHeight = Math.min(cropHeight, imageHeight - originY);

        try {
          const result = await ImageManipulator.manipulateAsync(
            photoUri,
            [
              {
                crop: {
                  originX,
                  originY,
                  width: finalCropWidth,
                  height: finalCropHeight,
                }
              }
            ],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );
        
          setImage(result.uri);
          setImgResult(result)
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, reject);
    });
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
            cropImage(`file://${photo.path}`)
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

  


  const getCaptureHeight = (e: LayoutChangeEvent)=>{
    const { x, y, width, height } = e.nativeEvent.layout;
    console.log('x: ',x, 'y: ',y, 'width: ', width, 'height: ', height)
    setCropBox({ x, y, width, height });
  }

  return (
    <View style={{flex: 1}}>
       {  image? <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
            <Image source={{ uri : image}} resizeMode='contain' style={{width: imgResult? imgResult.width : null, height: imgResult? imgResult.height : null}}/>
        </View> : 
        
    <View style={{flex: 1}}>
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
           {/* <View style={[styles.cropBox, { width: CROP_WIDTH, height: CROP_HEIGHT }]} /> */}
            <View style={{position: 'absolute', width: '100%', height: '100%'}}>
              <View style={{ backgroundColor:'rgba(0,0,0,0.7)', height: 20/100 * height,  paddingHorizontal: 30, paddingTop: 15, flexDirection:'row', justifyContent:'space-between'}}>
              <AntDesign onPress={()=> router.push('/(home)/post')} name="close" size={30} color="white" />
              <MaterialCommunityIcons onPress={()=> setFlash(!flash)} name={flash? 'flash': "flash-off"} size={30} color="white" />
              <AntDesign name="setting" size={30} color="white" />     
             </View>
           { isRecording && <View style={{alignSelf:'center', position:'absolute', top: 50}}>
                  <Text style={{color:'white', fontWeight:'600', letterSpacing: 0.5, fontSize: 16, marginTop: 20}}>{formatTime(seconds)}</Text>
              </View>}
           <View onLayout={getCaptureHeight} style={{flex: 1, borderWidth: 2, borderColor:'white', width:'100%'}}>
           </View>
          
           <View style={{backgroundColor:'rgba(0,0,0,0.7)', height: 25/100 * height}}>

           <Pressable onPressOut={()=> {setIsRecording(false); stopRecording()}} onLongPress={()=> {setIsRecording(true); startRecording()}}  onPress={TakePicture} style={{ top: 20, zIndex: 1, alignSelf: 'center', marginTop:'auto', width: 90, height: 90, borderRadius: 90, backgroundColor: isRecording? 'green' : 'white', padding: 5}}>
              <View style={{width: 80, height: 80, borderRadius: 80, borderColor: isRecording? 'white' : 'black', borderWidth: 2, backgroundColor: isRecording? 'green': 'white'}}>
                
              </View>
           </Pressable>
           </View>
         </View>
       </View>
       </View>
}
    </View>
   
  );
}

const styles = StyleSheet.create({
    cropBox: {
        zIndex: 2,
        position: 'absolute',
        top: '25%', // Center vertically
        borderWidth: 2,
        borderColor: 'white', // Crop area border
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)', // Transparent overlay
      },
})
