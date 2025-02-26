import { View, Text, Modal, Image, TextInput, useWindowDimensions, StyleSheet, Pressable, Keyboard, ViewToken} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { AntDesign, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import Video from 'react-native-video'
import ImageZoom, { ImageZoomProps } from 'react-native-image-pan-zoom';
import { GestureHandlerRootView, FlatList } from 'react-native-gesture-handler';
import Draggable from 'react-native-draggable';
import EditTextModal from './editTextModal';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import * as MediaLibrary from 'expo-media-library';

type Assets = {
    id: number | string,
    mediaType: string,
    duration?: number,
    uri: string 
}



export default function EditSingleMedia({editModal, setShowEditModal, selectedItem} : {editModal: boolean, setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>, selectedItem: Assets}){
   const { width, height } = useWindowDimensions()
   const [nextPage, setNextPage] = useState(50)
   const [muteVideo, setMuteVideo] = useState(false)
   const [addOverlayText, setAddOverlayText] = useState(false)
   const [overlayText, setOverlayText] = useState('')
   const [alignTextVal, setAlignTextVal] = useState<string>('center')
   const inputRef = useRef<TextInput>(null);
   const [currentItem, setCurrentItem] = useState<ViewToken>({} as ViewToken)
    const [fontSize, setFontSize] = useState(20)
    const [textBackgroundColor, setTextBackgroundColor] = useState<string | null>(null)
    const [onlyTextColor, setOnlyTextColor] = useState<string | null>('white')
    const [onlyTextColorPlaceholder, setOnlyTextColorPlaceholder] =  useState<string | null>(null)
    const [selectorState, setSelectorState] = useState<string>('font')
    const [editTextData, setEditTextData] = useState<TextEdit[]>([])
    const [openGalleryModal, setOpenGalleryModal] = useState(false)
    const [images, setImages] = useState<Assets[]>([]);

    type TextEdit = {
      fontSize?: number,
      textBackgroundColor?: string, 
      onlyTextColor?: string,
      fontFamily?: string,
      overlayText?: string,
      onlyTextColorPlaceholder?: string,
      alignTextVal?: string,
      uri?: string
     }

     useEffect(()=>{
      if (!openGalleryModal) return
      fetchImages()
     }, [openGalleryModal])
  

     const fetchImages = async () => {

      let allAssets: Assets[] = [];
      let hasNextPage = true;
      let after: string | undefined = undefined;

  if(nextPage){
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first: nextPage, // Adjust this number based on how many images you want to fetch
      after: after, // Pagination cursor
    });
    allAssets.push(...media.assets);

  hasNextPage = media.hasNextPage;
  after = media.endCursor; // Update cursor for the next fetch

  if(hasNextPage){
    setNextPage(prev => prev += 50)
  }
  
    };
    console.log('Total media fetched:', allAssets.length);

    setImages((prevData) => {
          const filteredItems = allAssets.filter(item => !prevData.some(prev => prev.id == item.id));
          return [...prevData, ...filteredItems];
        });  
     
}
  
    
   const showKeyboard = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  
  useEffect(()=>{
       if(!addOverlayText) return
       showKeyboard()
  }, [addOverlayText])

  
 
  const exitEditScreen = ()=>{
    console.log('Tesla')
    if(addOverlayText){
      if(overlayText.length >= 1){
        Keyboard.dismiss()
        setAddOverlayText(false)
        setOverlayText('')
        setTextBackgroundColor(null)
        setOnlyTextColorPlaceholder(null)
        setOnlyTextColor('white')
        setSelectorState('font')
      }else{
        setAddOverlayText(false)
      }
     
    }else if(openGalleryModal){
        setOpenGalleryModal(false)
    }
    
    else{
       setShowEditModal(false)
       setEditTextData([])
    }
  }


  useEffect(()=>{
    if(!addOverlayText) return
    if(alignTextVal !== 'center'){
      setAlignTextVal('center')
    }
  }, [addOverlayText])


  const loadResizeImage = async (uri: string)=>{
      setEditTextData((prev) => [...prev, {uri: uri}])
      setOpenGalleryModal(false)
  }
 
   
  return (
         <Modal visible={editModal} onRequestClose={exitEditScreen} presentationStyle='overFullScreen' animationType='slide' transparent={true}>
          <GestureHandlerRootView style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor:'white'}}>
                        <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal: 20, justifyContent:'space-between', paddingVertical: 15}}>
                                <AntDesign onPress={exitEditScreen} name="close" size={30} color="black" />
                                { selectedItem.mediaType == 'video' && <Octicons onPress={()=> setMuteVideo(!muteVideo)} name={muteVideo? "mute" : "unmute"} size={28} color="black" />}
                        </View>
                        <View style={{flex: 1, marginTop: '20%'}}>
                             {
                                selectedItem.mediaType == 'photo'? 
                               <ImageZoom {...({
                                               cropWidth: width,
                                               cropHeight: 50/100 * height,
                                               imageWidth: width,
                                               imageHeight: 50/100 * height,
                                               enableCenterFocus: false,
                                               minScale: 1
                                             } as ImageZoomProps)}>
                                    <Image source={{uri: selectedItem.uri}} style={{width:'100%', height: '100%', borderRadius: 20}} resizeMode='cover'/>
                                    {
                                                          editTextData.length >= 1? editTextData.map((text, index) => {
                                                            return(
                                                              <Draggable key={index} x={alignTextVal == 'center' && !addOverlayText? 40/100 * width : alignTextVal == 'left'  && !addOverlayText? 5/100 * width : 60/100 * width} y={35/100 * (50/100 * height)}> 
                                                                      { !(text.uri)? <View style={{ padding: 20, justifyContent:'center', alignItems:'center', backgroundColor: text.textBackgroundColor? text.textBackgroundColor : undefined}}>
                                                                         <Text style={{ color: text.onlyTextColor? text.onlyTextColor : text.onlyTextColorPlaceholder? text.onlyTextColorPlaceholder : 'white', fontSize: text.fontSize, fontWeight:'800', fontFamily: text.fontFamily, textAlign:"center"}}>{text.overlayText}</Text>
                                                                      </View> : <View>
                                                                        <Image source={{uri: text.uri}} style={{ width: 100, height: 200, borderRadius: 10}}/>
                                                                      </View>}
                                                              </Draggable>
                                                          
                                                            )
                                                          }) : null
                                                        }
                             </ImageZoom>
                                 :
                                <Video 
                                    source={{ uri: selectedItem.uri }} 
                                    style={{width: width , height: 50/100 * height}}
                                    controls={false}
                                    resizeMode="cover"
                                    repeat
                                    paused={false}
                                    muted={muteVideo}
                                />
                             }
                             <View  style={{marginTop:'auto', padding: 20}}>
                             <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                                    {selectedItem.mediaType == 'photo' && <Pressable onPress={()=> setAddOverlayText(true)} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="text" size={25} color="black" />
                                    </Pressable> }
                                    {selectedItem.mediaType == 'photo' && <Pressable onPress={()=> setOpenGalleryModal(true)} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="images-outline" size={25} color="black" />
                                    </Pressable> }
                                    { selectedItem.mediaType == 'photo' && <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <MaterialCommunityIcons name="tune-variant" size={25} color="black" />
                                    </View> }
                             </View>
                             <Pressable style={{marginTop: 25, alignSelf:'center', backgroundColor:'black', paddingHorizontal:20, paddingVertical: 10, borderRadius: 10 }}>
                                <Text style={{color:'white', fontWeight:'600', fontSize: 16, textAlign:'center'}}>Done</Text>
                             </Pressable>
                        </View>
            </View>
            </View>
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
              openGalleryModal && <BottomSheet onClose={()=> setOpenGalleryModal(false)} index={1} snapPoints={['5%','90%']} enablePanDownToClose >
              <BottomSheetView style={{flex: 1}}>
                   <Text style={{fontSize: 16, fontWeight:'600', textAlign:'center', marginVertical: 15}}>Gallery</Text>
                  <FlatList 
                  onEndReached={fetchImages} 
                  onEndReachedThreshold={0.5} 
                  data={images} 
                  numColumns={3} 
                  renderItem={({item})=>{
                      return(
                         <Pressable onPress={()=>loadResizeImage(item.uri)}  style={{padding: 3, width: width/3, height: 200}}>
                             <Image source={{ uri : item.uri}} style={{width: '100%', height: '100%', borderRadius: 15}}/>
                         </Pressable>
                      )
                  }}/>
              </BottomSheetView>
           </BottomSheet>
            }
            </GestureHandlerRootView>
</Modal>    
  )
}