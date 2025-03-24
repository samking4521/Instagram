import { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, useWindowDimensions, Pressable, Image, ViewToken, AppState} from 'react-native'
import { Ionicons, MaterialCommunityIcons, AntDesign, FontAwesome, FontAwesome6, Octicons } from '@expo/vector-icons'
import Video from 'react-native-video';
import * as MediaLibrary from 'expo-media-library';
import EditTextModal from './editTextModal';
import { Canvas, Image as SkiaImage, Group, Skia, useImage, ColorMatrix, makeImageFromView, SkImage } from "@shopify/react-native-skia";
import ImageFilters from '../../assets/colorMatrices.json'
import Draggable from 'react-native-draggable';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView, FlatList, ScrollView } from 'react-native-gesture-handler';
import { Stickers } from '../../assets/stickers'

type VideoType = {
    duration: number,
    path: string
}

export default function EditMediaCapture ({mode, editCaptureModal, setEditCaptureModal, video, photo, setVideo, setImage, filterMatrice} : {mode: string, editCaptureModal: boolean, setEditCaptureModal: React.Dispatch<React.SetStateAction<boolean>>, video: VideoType | null, photo: string | null, setVideo: React.Dispatch<React.SetStateAction<VideoType | null>>, setImage: React.Dispatch<React.SetStateAction<string | null>>, filterMatrice: number[] } ){
    const { width, height } = useWindowDimensions()
    const [muteVideo, setMuteVideo] = useState(false)
    const [videoPaused, setVideoPaused] = useState(false)
    const [displayPaused, setDisplayPaused] = useState(false)
    const [showDiscardModal, setShowDiscardModal] = useState(false)
    const [showSaveDeviceCont, setShowSaveDeviceCont] = useState(false)
     const [editTextData, setEditTextData] = useState<TextEdit[]>([])
     const snapRef = useRef<View | null>(null);
    const skiaImage = useImage(photo); // Replace with your image
    const [indexArray, setIndexArray] = useState<TextEdit[]>([])
     const [alignTextVal, setAlignTextVal] = useState<string>('center')
    const [addOverlayText, setAddOverlayText] = useState(false)
     const [fontSize, setFontSize] = useState(20)
        const [textBackgroundColor, setTextBackgroundColor] = useState<string | null>(null)
        const [onlyTextColor, setOnlyTextColor] = useState<string | null>('white')
        const [onlyTextColorPlaceholder, setOnlyTextColorPlaceholder] =  useState<string | null>(null)
    const [selectorState, setSelectorState] = useState<string>('font')
     const [overlayText, setOverlayText] = useState('')
     const [currentItem, setCurrentItem] = useState<ViewToken>({} as ViewToken)
const [openGalleryModal, setOpenGalleryModal] = useState(false)
 const [appState, setAppState] = useState(AppState.currentState);
 
     type TextEdit = {
        fontSize?: number,
        textBackgroundColor?: string, 
        onlyTextColor?: string,
        fontFamily?: string,
        overlayText?: string,
        onlyTextColorPlaceholder?: string,
        alignTextVal?: string,
        uri?: any
       }
  
        useEffect(() => {
             const subscription = AppState.addEventListener("change", (nextAppState) => {
               setAppState(nextAppState);
             });
         
             return () => {
               subscription.remove();
             };
           }, [appState]);
       

    useEffect(()=>{
        if(!displayPaused) return
        setTimeout(()=>{
            setDisplayPaused(false)
        }, 1000)
    }, [displayPaused])

    const exitEditScreen = ()=>{
        if(addOverlayText){
              if(overlayText.length >= 1){
                   setAddOverlayText(false)
                   setOverlayText('')
                   setTextBackgroundColor(null)
                   setOnlyTextColorPlaceholder(null)
                   setOnlyTextColor('white')
                   setSelectorState('font')
                 }
                 else{
                    setAddOverlayText(false)
                  }
        }
                else if(openGalleryModal){
                    setOpenGalleryModal(false)
                }
        else{
            setShowDiscardModal(true)
        }
       
    }
   
       
    const discardChanges = ()=>{
        if(video){
            setVideo(null)
            setShowDiscardModal(false)
            setEditCaptureModal(false)
        }else{
            if(photo){
                setImage(null)
                setShowDiscardModal(false)
                setEditCaptureModal(false)
            }
        }
    }
   
    const saveToDevice = ()=>{
        if(typeof video?.path == 'string'){
            saveMediaToFolder(video.path)
        }
        if(typeof photo == 'string'){
            saveMediaToFolder(photo)
        }
    }

    const saveMediaToFolder = async (path: string) => {
        try {
         const asset = await MediaLibrary.createAssetAsync(path);
          // Create a folder if it doesn't exist
          const albumName = 'Instagram';
          let album = await MediaLibrary.getAlbumAsync(albumName);
          if (!album) {
            album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          console.log('Media saved successfully');
          setShowDiscardModal(false)
          setEditCaptureModal(false)
          setVideo(null)
        } catch (error) {
          console.error('Error saving media:', error);
        }

      };

      const deleteTextEditItem = (item: TextEdit)=>{
        const newItems = editTextData.filter((editItem, index)=> editItem !== item  )
        setEditTextData(newItems)
    }
  
    const toggleDelItem = (text: TextEdit)=>{
       if(indexArray.includes(text)){
          const newIndexArray = indexArray.filter((item, itemIndex) => item !== text )
          setIndexArray(newIndexArray)
       }else{
          setIndexArray((prev)=> [...prev, text])
       }
    }
    
    const loadResizeImage = async (uri: string)=>{
        setEditTextData((prev) => [...prev, {uri: uri}])
        setOpenGalleryModal(false)
    }

  return (
     <Modal visible={editCaptureModal} onRequestClose={exitEditScreen} animationType='slide' presentationStyle='overFullScreen'>
        <GestureHandlerRootView style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor:'black'}}>
             { photo?
                                      <View collapsable={false} ref={snapRef} style={{width: width, height: 85/100 * height, alignItems:'center'}}>
                                                               <Canvas style={{ width: width, height: 85/100 * height }}>
                                                                  <Group clip={Skia.RRectXY(Skia.XYWHRect(0, 0, width, 85/100 * height), 20, 20)}>
                                                                    <SkiaImage image={skiaImage} fit={"cover"} x={0} y={0} width={width} height={85/100 * height}>
                                                                      <ColorMatrix matrix={filterMatrice}/>
                                                                    </SkiaImage>
                                                                   </Group>
                                                                   
                                                                </Canvas>
                                                                {
                                                                          editTextData.length >= 1? editTextData.map((text, index) => {
                                                                            return(
                                                                             
                                                                              <Draggable  maxX={width} maxY={85/100 * height} minX={0} minY={0} onShortPressRelease={()=>toggleDelItem(text)} key={index} x={alignTextVal == 'center' && !addOverlayText? 40/100 * width : alignTextVal == 'left'  && !addOverlayText? 5/100 * width : 60/100 * width} y={35/100 * (45/100 * height)}> 
                                                                                      { !(text.uri)? <View style={{ padding: 20, justifyContent:'center', alignItems:'center', backgroundColor: text.textBackgroundColor? text.textBackgroundColor : undefined}}>
                                                                                      {(indexArray.includes(text)) && <Pressable onPress={()=> deleteTextEditItem(text)} style={{position:'absolute',top: 5, left: 5, zIndex: 1, backgroundColor:'white', width: 18, height: 18, borderRadius: 18, alignItems:'center', justifyContent:'center'}}>
                                                                                            <AntDesign name="close" size={14} color="black" />
                                                                                        </Pressable>}
                                                                                         <Text style={{ color: text.onlyTextColor? text.onlyTextColor : text.onlyTextColorPlaceholder? text.onlyTextColorPlaceholder : 'white', fontSize: text.fontSize, fontWeight:'800', fontFamily: text.fontFamily, textAlign:"center"}}>{text.overlayText}</Text>
                                                                                      </View> : <View>
                                                                                        {(indexArray.includes(text)) && <Pressable onPress={()=> deleteTextEditItem(text)} style={{position:'absolute', top: 5, left: 100 - 23, zIndex: 1, backgroundColor:'white', width: 18, height: 18, borderRadius: 18, alignItems:'center', justifyContent:'center'}}>
                                                                                            <AntDesign name="close" size={14} color="black" />
                                                                                        </Pressable>}
                                                                                     
                                                                                            <Image source={text.uri} style={{ width: 100, height: 100, borderRadius: 10}}/>
                                                                                     
                                                                                      </View>}
                                                                              </Draggable>
                                                                            
                                                                          
                                                                            )
                                                                          }) : null
                                                                        }
                                                                      
                                          
                                            
                                          </View>
                : 
                <Pressable onPress={()=>{ setVideoPaused(!videoPaused); setDisplayPaused(true)}} style={{ width: width, height: 85/100 * height}}>
                    <Video 
                        source={{ uri: video?.path }} 
                        style={{width: '100%', height: '100%'}}
                        controls={false}
                        resizeMode="cover"
                        repeat
                        muted={muteVideo}
                        paused={videoPaused}
                    />

                 { displayPaused && <View style={{ position:'absolute', left: 45/100 * width, top: 45/100 * (85/100 * height), width: 40, height: 40, justifyContent:'center', alignItems:'center', borderRadius: 40, backgroundColor:'rgba(0,0,0,0.5)'}}>
                      <FontAwesome6 name={videoPaused? "pause" : "play"} size={16} color="white" />
                  </View>}
            </Pressable>
             }
             <View style={{flex: 1, justifyContent:'flex-end'}}>
                {mode == 'post'? <View style={{backgroundColor: '#0095F6', alignSelf:'flex-end', padding: 15, flexDirection:'row', alignItems:'center', borderRadius: 25, marginRight: 20, marginBottom: 10}}>
                                            <Text style={{color:'white', fontWeight:'600', fontSize: 12, marginRight: 5}}>Next</Text>    
                                            <AntDesign name="arrowright" size={14} color="white" />
                                        </View>

                                : 

                    <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal: 20, paddingBottom: 10}}>
                                    <View style={{flexDirection:'row', alignItems:'center', marginRight:'auto', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20}}>
                                           <FontAwesome name="user-circle-o" size={20} color="white" style={{marginRight: 5}} />
                                            <Text style={{fontWeight:'600', color:'white', fontSize: 12}}>{mode == 'story'? 'Your story' : 'Your reel'}</Text>
                                    </View>

                                <View style={{width: 45, height: 45, justifyContent:'center', alignItems:'center', borderRadius: 45, backgroundColor:'white'}}>
                                    <AntDesign name="right" size={16} color="black" />
                                </View>
                         </View>
                }
             </View>
               <View style={{ ...StyleSheet.absoluteFillObject, padding: 10}}>
                  <View style={{flexDirection:'row', alignItems: 'center'}}>
                        <Pressable onPress={()=> setShowDiscardModal(true)} style={{width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)', marginRight: 'auto'}}>
                                <Ionicons name="chevron-back-sharp" size={22} color="white"/>
                        </Pressable>
                        { video && <View style={{width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)', marginHorizontal: 2}}>
                                <Ionicons onPress={()=> setMuteVideo(!muteVideo)} name={ muteVideo? "volume-mute-outline" : "volume-high-outline" } size={22} color="white"/>
                        </View>}
                        <View style={{width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor: 'rgba(0,0,0,0.5)', marginHorizontal: 2}}>
                                <Ionicons name="musical-notes-outline" size={22} color="white"/>
                        </View>
                        <Pressable onPress={()=> setAddOverlayText(true)} style={{width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)', marginHorizontal: 2}}>
                                <Ionicons name="text" size={22} color= {video? "rgba(255,255,255,0.6)" : "white"}/>
                        </Pressable>
                        <Pressable onPress={()=> setOpenGalleryModal(true)} style={{width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)', marginHorizontal: 2}}>
                                <Ionicons name="images-outline" size={22} color= {video? "rgba(255,255,255,0.6)" : "white"} />
                        </Pressable>
                        <Pressable onPress={()=> setShowSaveDeviceCont(!showSaveDeviceCont)} style={{width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
                                <MaterialCommunityIcons name="dots-horizontal" size={22} color="white" />
                        </Pressable>
                  </View>
                  {showSaveDeviceCont && <Pressable onPress={saveToDevice} style={{top: 20, left: 50/100 * width, backgroundColor:'rgba(0,0,0,0.5)', padding: 15, borderRadius: 20, width: 45/100 * width}}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Octicons style={{marginRight: 10}} name="download" size={20} color="white" />
                            <Text style={{color:'white', fontWeight: '600', fontSize: 14}}>Save to device</Text>
                        </View>
                  </Pressable>}
                 
               </View>
          </View>
               { showDiscardModal && <View style={{...StyleSheet.absoluteFillObject, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
                        <View style={{width: 60/100 * width, borderRadius: 20, backgroundColor:'white'}}>
                            <View style={{padding: 30, borderBottomWidth: 0.5, borderColor:'lightgray'}}>
                                <Text style={{fontWeight:'600', textAlign:'center'}}>Discard edits?</Text>
                                <Text style={{fontSize: 13, textAlign:'center'}}>If you go back now, you'll lose all the edits you've made.</Text>
                            </View>
                            <Pressable onPress={discardChanges} style={{padding: 20, borderBottomWidth: 0.5, borderColor:'lightgray'}}>
                                <Text style={{color:'red', fontWeight:'600', textAlign:'center'}}>Discard</Text>
                            </Pressable>
                            <Pressable onPress={saveToDevice} style={{padding: 20, borderBottomWidth: 0.5, borderColor:'lightgray'}}>
                                <Text style={{textAlign:'center'}}>Save draft</Text>
                            </Pressable>
                            <Pressable onPress={()=> setShowDiscardModal(false)} style={{padding: 20}}>
                                <Text style={{textAlign:'center'}}>Keep editing</Text>
                            </Pressable>
                        </View>
                </View>}
                { addOverlayText && <EditTextModal exitEditScreen={exitEditScreen}
               textBackgroundColor={textBackgroundColor || ''} 
               onlyTextColor={onlyTextColor || ''} 
               onlyTextColorPlaceholder={onlyTextColorPlaceholder || ''}
               setOnlyTextColor={setOnlyTextColor}
               setOnlyTextColorPlaceholder={setOnlyTextColorPlaceholder}
               setTextBackgroundColor={setTextBackgroundColor}
               fontSize={fontSize}
               setFontSize={setFontSize}
               currentItem={currentItem}
               setCurrentItem={setCurrentItem}
               editTextData={editTextData}
               setEditTextData={setEditTextData}
               selectorState={selectorState}
               setSelectorState={setSelectorState}
               overlayText={overlayText}
               setOverlayText={setOverlayText}
               alignTextVal={alignTextVal} 
               setAlignTextVal={setAlignTextVal}
                 /> 
            }
              { openGalleryModal && <Pressable onPress={()=> setOpenGalleryModal(false)} style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.4)'}}></Pressable>}

{
  openGalleryModal &&
   <BottomSheet 
        handleIndicatorStyle={{backgroundColor:'white', width: 60}} 
        handleStyle={{backgroundColor: 'rgba(0,0,0,0.8)'}} 
        onClose={()=> setOpenGalleryModal(false)} 
        index={1}  
        snapPoints={[5/100 * height, 90/100 * height]} 
        enablePanDownToClose 
        onChange={(index) => console.log('BottomSheet moved to:', index)}
     >
    <BottomSheetView  style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
       <Text style={{fontSize: 16, fontWeight:'600', textAlign:'center', marginVertical: 15, color:'white'}}>Stickers</Text>
       
       <FlatList
       numColumns={3}
         data={Stickers}
         contentContainerStyle={{paddingBottom: 200}}
         renderItem={({item})=>{
            return(
                <Pressable key={item.id} onPress={()=>{loadResizeImage(item.uri)}}  style={{paddingVertical: 5, width: width/3, height: 80}}>
                        <Image resizeMode='contain' source={item.uri} style={{width: '100%', height: '100%'}}/>
                </Pressable>
            )
         }}
       />
  </BottomSheetView>
</BottomSheet>
}
</GestureHandlerRootView>
     </Modal>
  )
}

