import { View, Pressable, FlatList, useWindowDimensions, ViewToken} from 'react-native'
import { Camera } from 'react-native-vision-camera';
import React, { useState, useRef } from 'react';
import ColorMatrices from '../../../assets/colorMatrices.json'
import { Canvas, Image as SkiaImage, Group, Skia, useImage, ColorMatrix} from "@shopify/react-native-skia";

type VideoType = {
    duration: number,
    path: string
 }

export default function CameraPreviewFilterFlatlist({ cameraRef, isRecording, setIsRecording, flash, handsFree, timer, setImage, setVideo, setDisplayTimer, setEditCaptureModal, setSeconds, currentViewableMedia, setCurrentViewableMedia} : {cameraRef: React.RefObject<Camera>, isRecording: boolean, flash: boolean, timer: number, setImage: React.Dispatch<React.SetStateAction<string | null>>, setVideo: React.Dispatch<React.SetStateAction<VideoType | null>>, setDisplayTimer: React.Dispatch<React.SetStateAction<number>>, setEditCaptureModal: React.Dispatch<React.SetStateAction<boolean>>, setSeconds:  React.Dispatch<React.SetStateAction<number>>, handsFree: boolean, currentViewableMedia: ViewToken, setCurrentViewableMedia: React.Dispatch<React.SetStateAction<ViewToken | undefined>> , setIsRecording: React.Dispatch<React.SetStateAction<boolean>>  }){
   
    const { width, height} = useWindowDimensions()
    const skiaImage = useImage(require('../../../assets/images/modelImg.jpeg'))
    const flatlistRef = useRef<FlatList>(null)
    const [showVideoIndicator, setShowVideoIndicator] = useState<string | null>(null)

      // Define the viewability configuration
      const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 100, // Item is considered visible if at least 50% of it is visible
    }).current;

    // Callback function to handle viewable items change
    const onViewableItemsChanged = ({ viewableItems } : {viewableItems: ViewToken[]}) => {
    setCurrentViewableMedia(viewableItems[0])
    // You can perform actions based on the currently visible items here
    }

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

    const stopVideoRecording = ()=>{
        setShowVideoIndicator(null)
        if(handsFree){
            return
        }else{
          setIsRecording(false); 
          stopRecording()
          }
      }

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

      const recordVideoAfterTimer = (time: number)=>{
        countdownTimer(time + 1, 'video')
   }

      const startVideoRecording = ()=>{
        const normalMatrix = [
          1, 0, 0, 0, 0,  
          0, 1, 0, 0, 0,  
          0, 0, 1, 0, 0, 
          0, 0, 0, 1, 0
        ]
        setCurrentViewableMedia({key: currentViewableMedia?.key ?? '', index: currentViewableMedia?.index ?? 0, isViewable: true, item: {...currentViewableMedia?.item, matrice: normalMatrix}})
        setShowVideoIndicator(currentViewableMedia?.item.id ?? '')
        if(timer>0){
          recordVideoAfterTimer(timer)
        }else{
         setIsRecording(true)
         startRecording()
      }
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

      const snapPicture = (item: number[], index: number)=>{
        if(currentViewableMedia?.item.matrice == item){
           snap(timer)
        }else{
           flatlistRef.current?.scrollToIndex({
             index: index,
             animated: true,
             viewPosition: 0
           })
        }
     }

  return (
    <FlatList 
    ref={flatlistRef}
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

      const greenColorMatrix = [
        0, 0, 0, 0, 0,  
        0, 1, 0, 0, 0,  
        0, 0, 0, 0, 0,  
        0, 0, 0, 0, 1  
      ]

      return(
        
            <View style={{width: 90, height: 90, alignItems:'center', justifyContent:'center'}}>
              <Pressable onLongPress={startVideoRecording} onPressOut={stopVideoRecording} onPress={()=> snapPicture(item.matrice, index)}>
              <Canvas style={{ width: item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80 : 70, height: item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80 : 70}}>
                                          <Group clip={Skia.RRectXY(Skia.XYWHRect(0, 0, item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80 : 70, item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80 : 70), item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80: 10, item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80 : 10)}>
                                                <SkiaImage image={skiaImage} fit={"cover"} x={0} y={0} width={item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80 : 70} height={item == currentViewableMedia?.item || item.id == currentViewableMedia?.item.id? 80 : 70}>
                                                  <ColorMatrix matrix={item.id == showVideoIndicator? greenColorMatrix : index == 0 ? whiteMatrix :  item.matrice} />
                                                </SkiaImage>
                                              </Group>
                                            </Canvas>
              </Pressable>
                
            </View>
      )
    })}/>
  )
}