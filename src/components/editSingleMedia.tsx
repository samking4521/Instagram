import { View, Text, Modal, Image, TextInput, useWindowDimensions, StyleSheet, Pressable, Keyboard, ViewToken, AppState} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { AntDesign, Ionicons, MaterialCommunityIcons, Octicons, MaterialIcons, Feather } from '@expo/vector-icons'
import Video from 'react-native-video'
import ImageZoom, { ImageZoomProps } from 'react-native-image-pan-zoom';
import { GestureHandlerRootView, FlatList as GestureHandlerFlatlist, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Draggable from 'react-native-draggable';
import EditTextModal from './editTextModal';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import * as MediaLibrary from 'expo-media-library';
import { Canvas, Image as SkiaImage, Group, Skia, useImage, ColorMatrix, makeImageFromView, SkImage } from "@shopify/react-native-skia";
import ImageFilters from '../../assets/colorMatrices.json'
import ImagePicker from 'react-native-image-crop-picker';
import { useSharedValue } from 'react-native-reanimated';
import { Slider } from 'react-native-awesome-slider';

type Assets = {
    id: number | string,
    mediaType: string,
    duration?: number,
    uri: string,
    edit?: boolean
}



export default function EditSingleMedia({resizeImage, 
  editModal, 
  setShowEditModal, 
  selectedItem, 
  setSelectedItem,
  openGalleryModal, 
  setOpenGalleryModal, 
  addOverlayText, 
  setAddOverlayText,
  imageFilterModal, 
  setImageFilterModal,
  mediaFiles,
  setMediaFiles,
  setCurrentViewableMedia
} : {resizeImage: boolean, 
  editModal: boolean, 
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>, 
  selectedItem: Assets, 
  setSelectedItem: React.Dispatch<React.SetStateAction<Assets | undefined>>,
  openGalleryModal: boolean, 
  setOpenGalleryModal: React.Dispatch<React.SetStateAction<boolean>>, 
  addOverlayText: boolean, 
  setAddOverlayText: React.Dispatch<React.SetStateAction<boolean>>,
  imageFilterModal: string | null, 
  setImageFilterModal: React.Dispatch<React.SetStateAction<string | null>>,
  mediaFiles: Assets[],
  setMediaFiles:  React.Dispatch<React.SetStateAction<Assets[]>>,
  setCurrentViewableMedia:  React.Dispatch<React.SetStateAction<ViewToken | undefined>>,
    }){
   const { width, height } = useWindowDimensions()
   const [nextPage, setNextPage] = useState(50)
   const [muteVideo, setMuteVideo] = useState(false)
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
    const [indexArray, setIndexArray] = useState<TextEdit[]>([])
    const [images, setImages] = useState<Assets[]>([]);
    const [filterMatricePlaceholder, setFilterMatricePlaceholder] = useState<number[] | null>(null)
    const [filterMatrice, setFilterMatrice] = useState(ImageFilters[0].matrice)
    const [editMode, setEditMode] = useState<string | null>(null)
    const filterFlatlistRef = useRef<GestureHandlerFlatlist>(null)
    const imageUri = selectedItem.edit? selectedItem.uri.replace(/^data:image\/\w+;base64,/, "") : selectedItem.uri
    const skiaImage = useImage(imageUri); // Replace with your image
    const data = selectedItem.edit? Skia.Data.fromBase64(imageUri) : null
    const encodedSkiaImage = data ? Skia.Image.MakeImageFromEncoded(data) : null
    const progress = useSharedValue(0);
    const contrastProgress = useSharedValue(0)
    const saturationProgress = useSharedValue(0)
    const min = useSharedValue(-100);
    const max = useSharedValue(100);
    const [brightness, setBrightness] = useState(0)
    const [contrast, setContrast] = useState(1)
    const [saturation, setSaturation] = useState(1)
    const [appState, setAppState] = useState(AppState.currentState);
    const snapRef = useRef<View | null>(null);
    const [showCloseModalAlert, setShowCloseModalAlert] = useState(false)


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

    

     useEffect(() => {
      const subscription = AppState.addEventListener("change", (nextAppState) => {
        setAppState(nextAppState);
      });
  
      return () => {
        subscription.remove();
      };
    }, [appState]);


     useEffect(()=>{
      if (!openGalleryModal) return
      fetchImages()
     }, [openGalleryModal])
  
     const adjustImageBrightness = (matrix: number[], val: number)=>{
          let theColorMatrice = [...matrix]
          theColorMatrice[4] += val
          theColorMatrice[9] += val
          theColorMatrice[14] += val
          return theColorMatrice

     }

     const adjustImageContrast = (matrix: number[], val: number)=>{

          const theColorMatrice = [...matrix]
          theColorMatrice[0] = val
          theColorMatrice[4] = ((1 - val) * 0.5)
          theColorMatrice[6] = val
          theColorMatrice[9] = ((1 - val) * 0.5)
          theColorMatrice[12] = val
          theColorMatrice[14] = ((1 - val) * 0.5)
          return theColorMatrice
     }

     const adjustImageSaturation = (matrix: number[], val: number)=>{
      const theColorMatrice = [...matrix]
      theColorMatrice[0] = 0.213 + 0.787 * val
      theColorMatrice[1] = 0.715 - 0.715 * val
      theColorMatrice[1] = 0.072 - 0.072 * val
      theColorMatrice[5] = 0.213 - 0.213 * val
      theColorMatrice[6] = 0.715 + 0.285 * val
      theColorMatrice[7] = 0.072 - 0.072 * val
      theColorMatrice[10] = 0.213 - 0.213 * val
      theColorMatrice[11] = 0.715 - 0.715 * val
      theColorMatrice[12] = 0.072 + 0.928 * val

      return theColorMatrice
         }
    
     const fetchImages = async () => {

      let allAssets: Assets[] = [];
      let hasNextPage = true;
      let after: string | undefined = undefined;
 

  if(nextPage){
    const media = await MediaLibrary.getAssetsAsync({
           mediaType: ['photo'],
           sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
           first: nextPage , // Fetch in batches (adjust as needed)
           after: after, // Pagination cursor
    }); 
    allAssets.push(...media.assets);

  hasNextPage = media.hasNextPage;
  after = media.endCursor; // Update cursor for the next fetch

  if(hasNextPage){
    setNextPage(prev => prev += 50)
  }
  
    };

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

  const adjustImage = ()=>{
      ImagePicker.openCropper({
        path: selectedItem.uri,
        width: 3000,
        height: 3000,
        mediaType: 'photo',
        compressImageQuality: 1
      }).then(img => {
         setSelectedItem({...selectedItem, uri: img.path})
      })
    
  }
  
  useEffect(()=>{
       if(!addOverlayText) return
       showKeyboard()
  }, [addOverlayText])

  
 
  const exitEditScreen = ()=>{
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
    }else if(imageFilterModal){
      closeBottomSheet()
    }
    else{
       setShowCloseModalAlert(true)
    }
  }

  const discardEditChanges = ()=>{
    setShowEditModal(false)
    if(showCloseModalAlert){
      setShowCloseModalAlert(false)
    }
    setEditTextData([])
    setIndexArray([])
    setFilterMatrice(ImageFilters[0].matrice)
    setFilterMatricePlaceholder(null)
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

  const scrollToIndex = (index: number)=>{
      filterFlatlistRef.current?.scrollToIndex({
         index: index,
         animated: true
      })
  }

  const closeBottomSheet = ()=>{
    setImageFilterModal(null)
    if(imageFilterModal == 'edit'){
       if(editMode == 'brightness'){
             progress.value = 0
             setFilterMatrice(filterMatrice)
             setEditMode(null)
             setBrightness(0)
       }else if(editMode == 'contrast'){
        contrastProgress.value = 0
        setFilterMatrice(filterMatrice)
        setEditMode(null)
        setContrast(1)
       }else{
        saturationProgress.value = 0
        setFilterMatrice(filterMatrice)
        setEditMode(null)
        setSaturation(1)
       }
    }else{
      if(filterMatricePlaceholder){
        setFilterMatrice(filterMatricePlaceholder)
      }else{
        setFilterMatrice(ImageFilters[0].matrice)
      }
       
    }
    
  }


  const saveEditState = ()=>{
    setImageFilterModal(null)
    if(imageFilterModal == 'edit'){
      if(editMode=='brightness'){
        setFilterMatrice(adjustImageBrightness(filterMatrice, brightness))
        setEditMode(null)
      }else if(editMode == 'contrast'){
        setFilterMatrice(adjustImageContrast(filterMatrice, contrast))
        setEditMode(null)
      }else{
        setFilterMatrice(adjustImageSaturation(filterMatrice, saturation))
        setEditMode(null)
      }
    }else{
        setFilterMatricePlaceholder(filterMatrice)
    }
  }
   
  const updateSliderValue = (val: number)=>{
    if(editMode == 'brightness'){
        const sliderVal = val/100 * 0.3
        setBrightness(sliderVal)
    }else if(editMode == 'contrast'){
        const sliderVal = 0.5 + (((val + 100) / 200) * (1.5 - 0.5));
        setContrast(sliderVal)
    }else{
      const sliderVal = 0.5 + (((val + 100) / 200) * (1.5 - 0.5));
      setSaturation(sliderVal)
    }
        
  }

  const updateImageInMediaFilesList = (uri: string)=>{
      // Update the selected item in the media list
      const newMediaFiles = mediaFiles.map((item)=>{
            if(item == selectedItem){
                // setMediaFiles([...filterFiles, {...selectedItem, uri : uri, edit: true}])
                return {...selectedItem, uri : uri, edit: true}
            }else{
               return item
            }
      })

      setMediaFiles(newMediaFiles)
      setCurrentViewableMedia({index: 0, isViewable: true, item: {...selectedItem, uri : uri, edit: true}, key:'1'})
      discardEditChanges()
  }

  const ImageEditComplete = ()=>{
    captureImage()
    
  }

  const captureImage = async ()=>{
    try{
      if(snapRef.current){
        const newSnap = await makeImageFromView(snapRef);
       if(newSnap){
        const base64 = await newSnap.encodeToBase64();
        console.log('The Img : uri')
        const uri = `data:image/png;base64,${base64}`
        updateImageInMediaFilesList(uri);
       }
      }
     
    }catch(e){
      console.log('e : ', e)
    }
    
    }
     
  


  return (
         <Modal visible={editModal} onRequestClose={exitEditScreen} presentationStyle='overFullScreen' animationType='slide' transparent={true}>
          <GestureHandlerRootView style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor:'white'}}>
                        <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal: 20, justifyContent:'space-between', paddingVertical: 15}}>
                                <AntDesign onPress={exitEditScreen} name="close" size={30} color="black" />
                                { selectedItem.mediaType == 'video' && <Octicons onPress={()=> setMuteVideo(!muteVideo)} name={muteVideo? "mute" : "unmute"} size={28} color="black" />}
                        </View>
                        <View style={{flex: 1, marginTop: imageFilterModal? 2/100 * height : 10/100 * height}}>
                             {
                                selectedItem.mediaType == 'photo'? 
                            <View collapsable={false} ref={snapRef} style={{width: width, height: 50/100 * height, alignItems:'center'}}>
                           
                               <ImageZoom {...({
                                               cropWidth: width - 20,
                                               cropHeight: 50/100 * height,
                                               imageWidth: width - 20,
                                               imageHeight: 50/100 * height,
                                               enableCenterFocus: false,
                                               minScale: 1
                                             } as ImageZoomProps)}>
                        
                                               <Canvas style={{ width: width - 20, height: 50/100 * height }}>
                                                  <Group clip={Skia.RRectXY(Skia.XYWHRect(0, 0, width - 20, 50/100 * height), 10, 10)}>
                                                    <SkiaImage image={selectedItem.edit? encodedSkiaImage : skiaImage } fit={resizeImage? "contain" : "cover"} x={0} y={0} width={width - 20} height={50/100 * height}>
                                                      <ColorMatrix matrix={editMode == 'brightness'? adjustImageBrightness(filterMatrice, brightness) : editMode == 'contrast'? adjustImageContrast(filterMatrice, contrast) : editMode == 'saturation'? adjustImageSaturation(filterMatrice, saturation) : filterMatrice} />
                                                    </SkiaImage>
                                                   </Group>
                                                   
                                                </Canvas>
                                                {
                                                          editTextData.length >= 1? editTextData.map((text, index) => {
                                                            return(
                                                             
                                                              <Draggable  maxX={width-20} maxY={50/100 * height} minX={0} minY={0} onShortPressRelease={()=>toggleDelItem(text)} key={index} x={alignTextVal == 'center' && !addOverlayText? 40/100 * width : alignTextVal == 'left'  && !addOverlayText? 5/100 * width : 60/100 * width} y={35/100 * (50/100 * height)}> 
                                                                      { !(text.uri)? <View style={{ padding: 20, justifyContent:'center', alignItems:'center', backgroundColor: text.textBackgroundColor? text.textBackgroundColor : undefined}}>
                                                                      {(indexArray.includes(text)) && <Pressable onPress={()=> deleteTextEditItem(text)} style={{position:'absolute',top: 5, left: 5, zIndex: 1, backgroundColor:'white', width: 18, height: 18, borderRadius: 18, alignItems:'center', justifyContent:'center'}}>
                                                                            <AntDesign name="close" size={14} color="black" />
                                                                        </Pressable>}
                                                                         <Text style={{ color: text.onlyTextColor? text.onlyTextColor : text.onlyTextColorPlaceholder? text.onlyTextColorPlaceholder : 'white', fontSize: text.fontSize, fontWeight:'800', fontFamily: text.fontFamily, textAlign:"center"}}>{text.overlayText}</Text>
                                                                      </View> : <View>
                                                                        {(indexArray.includes(text)) && <Pressable onPress={()=> deleteTextEditItem(text)} style={{position:'absolute', top: 5, left: 100 - 23, zIndex: 1, backgroundColor:'white', width: 18, height: 18, borderRadius: 18, alignItems:'center', justifyContent:'center'}}>
                                                                            <AntDesign name="close" size={14} color="black" />
                                                                        </Pressable>}
                                                                     
                                                                            <Image source={{uri: text.uri}} style={{ width: 100, height: 200, borderRadius: 10}}/>
                                                                     
                                                                      </View>}
                                                              </Draggable>
                                                            
                                                          
                                                            )
                                                          }) : null
                                                        }
                                                      
                             </ImageZoom>
                            
                          </View>
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
                                    {selectedItem.mediaType == 'photo' && <Pressable onPress={()=> {setAddOverlayText(true)}} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="text" size={25} color="black" />
                                    </Pressable> }
                                    {selectedItem.mediaType == 'photo' && <Pressable onPress={()=> setOpenGalleryModal(true)} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="images-outline" size={25} color="black" />
                                    </Pressable> }
                                    { selectedItem.mediaType == 'photo' && <Pressable onPress={()=> setImageFilterModal('filter')} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                         <Ionicons name="color-filter-outline" size={25} color="black" />
                                    </Pressable> }
                                    { selectedItem.mediaType == 'photo' && <Pressable onPress={()=> setImageFilterModal('edit')} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <MaterialCommunityIcons name="tune-variant" size={25} color="black" />
                                    </Pressable> }
                             </View>
                             <Pressable onPress={ImageEditComplete} style={{marginTop: 25, alignSelf:'center', backgroundColor:'black', paddingHorizontal:20, paddingVertical: 10, borderRadius: 10 }}>
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

             <Modal visible={showCloseModalAlert} onRequestClose={()=> setShowCloseModalAlert(false)} animationType='fade' transparent={true} presentationStyle='overFullScreen'>
                     <View style={{flex: 1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center'}}>
                                 <View style={{backgroundColor:'white', borderRadius: 20, width: 65/100 * width}}>
                                    <View style={{padding: 30}}>
                                       <Text style={{fontWeight:'600', textAlign:'center', marginBottom: 5}}>Discard edits?</Text>
                                       <Text style={{textAlign:'center'}}>If you go back now, your image edits will be discarded.</Text>
                                    </View>
            
                                    <Pressable onPress={discardEditChanges} style={{padding: 20, borderWidth: 0.5, borderColor:'lightgray'}}>
                                       <Text style={{fontWeight:'600', textAlign:'center'}}>Discard</Text>
                                    </Pressable>
                                    <Pressable onPress={()=> setShowCloseModalAlert(false)} style={{padding: 20}}>
                                       <Text style={{textAlign:'center'}}>Cancel</Text>
                                    </Pressable>
                                 </View>
                     </View>
                 </Modal>
                  { openGalleryModal && <Pressable onPress={()=> setOpenGalleryModal(false)} style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.4)'}}></Pressable>}

            {
              openGalleryModal && <BottomSheet onClose={()=> setOpenGalleryModal(false)} index={1} snapPoints={['5%','90%']} enablePanDownToClose >
              <BottomSheetView style={{flex: 1}}>
                   <Text style={{fontSize: 16, fontWeight:'600', textAlign:'center', marginVertical: 15}}>Gallery</Text>
                  <GestureHandlerFlatlist 
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

            {
              imageFilterModal && <BottomSheet handleStyle={{backgroundColor:'#F2F2F2', borderTopLeftRadius: 20, borderTopRightRadius: 20}} handleIndicatorStyle={{backgroundColor:'silver', width: 40}} onClose={saveEditState} index={1} snapPoints={['5%','40%']} enablePanDownToClose >
              <BottomSheetView style={{flex: 1, backgroundColor:'#F2F2F2'}}>
              { imageFilterModal == 'edit'? !editMode || editMode == 'adjust'? <View style={{marginTop: '20%', flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>
                    <Pressable onPress={()=> { setEditMode('adjust'); adjustImage()}} style={{alignItems:'center'}}>
                      <Text style={{fontWeight:'600', marginBottom: 5, fontSize: 12}}>Adjust</Text>
                    <View style={{width: 80, height: 80, justifyContent:'center', alignItems:'center', borderWidth: 2, borderColor:'lightgray', borderRadius:100}}>
                          <MaterialCommunityIcons name="crop-rotate" size={35} color="black" />
                      </View>
                    </Pressable>

                     <Pressable onPress={()=>{setEditMode('brightness')}} style={{alignItems:'center'}}>
                       <Text style={{fontWeight:'600', marginBottom: 5, fontSize: 12}}>Brightness</Text>
                       <View style={{width: 80, height: 80, justifyContent:'center', alignItems:'center', borderWidth: 2, borderColor:'lightgray', borderRadius:100}}>
                       <MaterialIcons name="brightness-5" size={35} color="black" />
                       </View>
                     </Pressable>


                      <Pressable onPress={()=> setEditMode('contrast')} style={{alignItems:'center'}}>
                      <Text style={{fontWeight:'600', marginBottom: 5, fontSize: 12}}>Contrast</Text>
                      <View style={{width: 80, height: 80, justifyContent:'center', alignItems:'center', borderWidth: 2, borderColor:'lightgray', borderRadius:100}}>
                             <Ionicons name="contrast" size={35} color="black" />
                       </View>
                      </Pressable>

                      <Pressable onPress={()=>{setEditMode('saturation')}} style={{alignItems:'center'}}>
                       <Text style={{fontWeight:'600', marginBottom: 5, fontSize: 12}}>Saturation</Text>
                       <View style={{width: 80, height: 80, justifyContent:'center', alignItems:'center', borderWidth: 2, borderColor:'lightgray', borderRadius:100}}>
                          <Feather name="droplet" size={35} color="black" />
                       </View>
                     </Pressable>
                      </View> :
                     <View style={{flex: 1, justifyContent:'center', alignItems: 'center'}}>
                              { editMode == 'brightness'? <Slider
                              theme={{
                              
                                maximumTrackTintColor: '#fff',
                                minimumTrackTintColor: '#000',
                                bubbleBackgroundColor: '#4C4C4C',
                               
                              }}
                            
                              thumbWidth={10}
                              containerStyle={{backgroundColor:'lightgray'}}
                                    style={{ width: '70%'}}
                                    sliderHeight={2}
                                    progress={progress}
                                    onValueChange={(value: number)=> updateSliderValue(value)}
                                    minimumValue={min}
                                    maximumValue={max}
                                    bubble={(value: number)=> `${Math.round(value)}`}
                                  /> : editMode == 'contrast'?  <Slider
                              theme={{
                              
                                maximumTrackTintColor: '#fff',
                                minimumTrackTintColor: '#000',
                                bubbleBackgroundColor: '#4C4C4C',
                               
                              }}
                            
                              thumbWidth={10}
                              containerStyle={{backgroundColor:'lightgray'}}
                                    style={{ width: '70%'}}
                                    sliderHeight={2}
                                    progress={contrastProgress}
                                    onValueChange={(value: number)=> updateSliderValue(value)}
                                    minimumValue={min}
                                    maximumValue={max}
                                    bubble={(value: number)=> `${Math.round(value)}`}
                                  /> :  
                                  <Slider
                                  theme={{
                                  
                                    maximumTrackTintColor: '#fff',
                                    minimumTrackTintColor: '#000',
                                    bubbleBackgroundColor: '#4C4C4C',
                                   
                                  }}
                                
                                  thumbWidth={10}
                                  containerStyle={{backgroundColor:'lightgray'}}
                                        style={{ width: '70%'}}
                                        sliderHeight={2}
                                        progress={saturationProgress}
                                        onValueChange={(value: number)=> updateSliderValue(value)}
                                        minimumValue={min}
                                        maximumValue={max}
                                        bubble={(value: number)=> `${Math.round(value)}`}
                                      />
                                  
                                  }
                      </View>
                    : 
                    <View style={{marginTop: '10%', flex: 1}}>
                      <GestureHandlerFlatlist ref={filterFlatlistRef} contentContainerStyle={{paddingHorizontal: 20, gap: 10}} horizontal showsHorizontalScrollIndicator={false}  data={ImageFilters} renderItem={({item, index})=>{
                        return(
                          <Pressable onPress={()=>{ scrollToIndex(index); setFilterMatrice(item.matrice)}} style={{alignItems:'center'}} key={item.id}>
                                  <Text style={{marginBottom: 5, fontSize: 12, fontWeight: '600', color: filterMatrice == item.matrice? 'black' : 'gray'}}>{item.filter}</Text>
                               <View style={{borderRadius: 20}}>
                               <Canvas style={{ width: 100, height: 100}}>
                               <Group clip={Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 10, 10)}>
                                    <SkiaImage image={selectedItem.edit? encodedSkiaImage : skiaImage} fit={resizeImage ? "contain" : "cover"} x={0} y={0} width={100} height={100}>
                                      <ColorMatrix matrix={item.matrice} />
                                    </SkiaImage>
                                  </Group>
                                </Canvas>
                                </View>   
                                 
                          </Pressable>
                        )
                      }}/>
                      <Text style={{textAlign:'center', marginTop:'auto', marginBottom: 10}}>Tap to add filter</Text>
                    </View>
                     
                   }
                       
                  

                   <View style={{marginTop: 'auto'}}>
                       <View style={{padding: 15, borderTopWidth: 0.5, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                           <Text onPress={closeBottomSheet} style={{fontSize: 16}}>Cancel</Text>
                           <Text style={{fontSize: 16, fontWeight:'600'}}>{imageFilterModal=='edit'? editMode == 'brightness'? 'brightness': editMode == 'contrast'? 'Contrast' : editMode == 'saturation'? 'Saturation' : 'Edit' : 'Filter'}</Text>
                           <Text onPress={saveEditState} style={{fontSize: 16}}>Done</Text>
                       </View>
                   </View>
              </BottomSheetView>
           </BottomSheet>
            }
            </GestureHandlerRootView>
</Modal>    
  )
}