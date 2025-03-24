import { View, Text, SafeAreaView, Image, useWindowDimensions, FlatList, Pressable, Modal, ViewToken, StatusBar, TextInput} from 'react-native'
import React, {  useCallback, useRef, useState, useEffect } from 'react'
import { AntDesign, Ionicons, FontAwesome6, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import Video from 'react-native-video';
import { router } from 'expo-router';
import EditSingleMedia from '@/src/components/editSingleMedia';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export default function PostPreview(){
    const { width, height } = useWindowDimensions()
    const { media, imgResizeMode, galleryMedia } = useLocalSearchParams()
    const theMedia: Assets[] = typeof media == 'string'? JSON.parse(media) : []
    const imgResize: boolean = imgResizeMode == 'true'? true : false
    const galleryData = typeof galleryMedia == 'string'? JSON.parse(galleryMedia) : {}
    const [resizeImage, setResizeImage] = useState(imgResize)
    const [showModal, setShowModal] = useState(false)
    const [addOverlayText, setAddOverlayText] = useState(false)
    const [mediaFiles, setMediaFiles] = useState<Assets[]>(theMedia)
    const [currentItem, setCurrentItem] = useState<Assets>()
   const [currentViewableMedia, setCurrentViewableMedia] = useState<ViewToken | undefined>()
    const [selectedItem, setSelectedItem] = useState<Assets>()
    const [showEditModal, setShowEditModal] = useState(false)
    const [muteVideo, setMuteVideo] = useState(false)
   const [openGalleryModal, setOpenGalleryModal] = useState(false)
   const [imageFilterModal, setImageFilterModal] = useState<string | null>(null)
   const [openMusicBottomSheet, setOpenMusicBottomSheet] = useState(false)
   const flatListRef = useRef<FlatList>(null)   

     // Define the viewability configuration
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is considered visible if at least 50% of it is visible
  }).current;

   
    type Assets = {
        id: number | string,
        mediaType: string,
        duration?: number,
        uri: string,
        edit?: boolean
    }

    const deleteImage = (mediaObj: Assets)=>{
      console.log('the files : ', mediaObj)
       const newFiles = mediaFiles.filter(media => media !== mediaObj)
       setMediaFiles(newFiles)
       setShowModal(false)
    }


     // Callback function to handle viewable items change
  const onViewableItemsChanged = ({ viewableItems } : {viewableItems: ViewToken[]}) => {
    setCurrentViewableMedia(viewableItems[0])
    // You can perform actions based on the currently visible items here
  }


  
  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'white', paddingTop: StatusBar.currentHeight}}>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 20}}>
        <AntDesign onPress={()=> router.back()} name="close" size={30} color="black" />
       { (currentViewableMedia?.item.mediaType == 'video') && <Octicons onPress={()=> setMuteVideo(!muteVideo)} name={muteVideo? "mute" : "unmute"} size={28} color="black" />}
      </View>
      <View style={{flex: 1, marginTop: '15%'}}>
            <FlatList 
            ref={flatListRef}
            keyExtractor={(item) => item.id.toString()}
            horizontal 
            showsHorizontalScrollIndicator={false}
            pagingEnabled 
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            data={mediaFiles} 
            // extraData={mediaFiles}
            renderItem={({item, index})=>{
              if(item.mediaType == 'photo'){
                return(
                
              <Pressable style={{ width: width, height: 50/100 * height, paddingHorizontal:10}} onPress={()=>{ setSelectedItem(item); setShowEditModal(true)}}>
                  <Image source={{ uri: item.uri}} style={{width: '100%', height: 50/100 * height, borderRadius: 10, borderWidth: 2, borderColor:'lightgray'}} resizeMode={resizeImage?'contain' : 'cover'}/>
                  <Pressable onPress={()=> setResizeImage(!resizeImage)} style={{position:'absolute', top: (50/100 * height) - 50, left: '5%', width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <FontAwesome6 name="expand" size={24} color="white" />
                  </Pressable>
                  { (mediaFiles.length > 2) && <Pressable onPress={()=>{setShowModal(true); setCurrentItem(item)}} style={{ position:'absolute', left: (width - 10) - 40,  top: 10, justifyContent:"center", alignItems:"center", width: 30, height: 30, borderRadius: 25, backgroundColor:'rgba(0,0,0,0.5)'}}>
                      <AntDesign name="close" size={20} color="white" />
                  </Pressable>}
               </Pressable>
              
  
                )
              }else{
                  return(
              <Pressable  style={{width: width, height: 50/100 * height, borderRadius: 20, paddingHorizontal: 10}} onPress={()=>{ setSelectedItem(item); setShowEditModal(true)}}>
                 <Video 
                 source={{ uri: item.uri }} 
                 style={{width: '100%', height: 50/100 * height}}
                 controls={false}
                 resizeMode="cover"
                 repeat
                 paused={item.id == currentViewableMedia?.item.id? false : true}
                 muted={muteVideo}
                 
               />
                 <Pressable onPress={()=>{setShowModal(true); setCurrentItem(item)}} style={{ position:'absolute', left: 85/100 * width,  top: 10, justifyContent:"center", alignItems:"center", width: 30, height: 30, borderRadius: 25, backgroundColor:'rgba(0,0,0,0.5)', zIndex: 2}}>
                      <AntDesign name="close" size={20} color="white" />
                  </Pressable>
               </Pressable> 
                   
                  )
              }
                    
            }} />

        <View style={{marginTop:'auto', paddingHorizontal: 15, marginBottom: 10}}>
           <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
               <Pressable onPress={()=>{setOpenMusicBottomSheet(true)}} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="musical-notes-outline" size={25} color="black" />
               </Pressable>
                  { currentViewableMedia?.item.mediaType == 'photo'? <Pressable onPress={()=>{ setSelectedItem(currentViewableMedia.item); setShowEditModal(true); setAddOverlayText(true)}} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="text" size={25} color="black" />
               </Pressable> : <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="text" size={25} color="black" />
                  <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent:'center', alignItems:'center', position:'absolute'}}></View>
               </View> }

              { currentViewableMedia?.item.mediaType == 'photo'? <Pressable onPress={()=>{ setSelectedItem(currentViewableMedia.item); setShowEditModal(true); setOpenGalleryModal(true)}} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="images-outline" size={25} color="black" />
               </Pressable> : <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
               <Ionicons name="images-outline" size={25} color="black" />
                  <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent:'center', alignItems:'center', position:'absolute'}}></View>
               </View>}

               { currentViewableMedia?.item.mediaType == 'photo'? <Pressable onPress={()=>{setSelectedItem(currentViewableMedia.item); setShowEditModal(true); setImageFilterModal('filter')}} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                    <Ionicons name="color-filter-outline" size={25} color="black" />
               </Pressable> : <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                    <Ionicons name="color-filter-outline" size={25} color="black" />
                  <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent:'center', alignItems:'center', position:'absolute'}}></View>
               </View>}
         

               { currentViewableMedia?.item.mediaType == 'photo'? <Pressable onPress={()=>{setSelectedItem(currentViewableMedia.item);  setShowEditModal(true); setImageFilterModal('edit')}} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <MaterialCommunityIcons name="tune-variant" size={25} color="black" />
               </Pressable> : <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
               <Ionicons name="images-outline" size={25} color="black" />
                  <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent:'center', alignItems:'center', position:'absolute'}}></View>
               </View>}                
         </View>

           <View style={{ marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
            <Pressable onPress={()=> router.back()}>
               <Image source={{ uri: galleryData.uri}} style={{width: 40, height: 40, borderRadius: 10, marginRight:'auto'}}/>
            </Pressable>
             <Pressable style={{ borderRadius: 10, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'blue', paddingHorizontal: 20, paddingVertical: 10}}>
                <Text style={{fontWeight:'600', color:'white', marginRight: 5}}>Next</Text>
                <Ionicons name="arrow-forward-sharp" size={18} color="white" />
             </Pressable>
           </View>
        </View>
      </View>
      <Modal visible={showModal} onRequestClose={()=> setShowModal(false)} presentationStyle='overFullScreen' transparent={true}>
               <View style={{flex: 1, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:"center"}}>
              <View style={{width: '70%', borderRadius: 20, backgroundColor:'white'}}>
                    <Text style={{fontSize: 16, fontWeight:'600', padding: 30, borderBottomWidth: 0.5, borderColor:"lightgray", textAlign:'center'}}>{currentItem?.mediaType == 'photo'? 'Remove photo?' : 'Remove video'}</Text>
                          <Text onPress={currentItem? ()=> deleteImage(currentItem) : undefined} style={{fontSize: 16, fontWeight:'600', color:'red', padding: 20, borderBottomWidth: 0.5, borderColor:"lightgray", textAlign:'center' }}>Remove</Text>
                          <Text onPress={()=> setShowModal(false)} style={{fontSize: 14, padding: 20,  borderBottomWidth: 0.5, borderColor:"lightgray", textAlign:"center"}}>Cancel</Text>
              </View>
        </View>
     </Modal>
    
     { selectedItem && <EditSingleMedia 
     editModal={showEditModal} 
     setShowEditModal={setShowEditModal} 
     selectedItem={selectedItem} 
     setSelectedItem={setSelectedItem}
     openGalleryModal={openGalleryModal} 
     setOpenGalleryModal={setOpenGalleryModal}
     addOverlayText={addOverlayText}
      setAddOverlayText={setAddOverlayText}
      resizeImage={resizeImage}
      imageFilterModal={imageFilterModal} 
      setImageFilterModal={setImageFilterModal}
      mediaFiles={mediaFiles} 
      setMediaFiles={setMediaFiles}
      setCurrentViewableMedia={setCurrentViewableMedia}
     />}

     {
      openMusicBottomSheet && 
      <BottomSheet index={0} snapPoints={['92%']} enablePanDownToClose onClose={()=> setOpenMusicBottomSheet(false)} containerStyle={{backgroundColor:'rgba(0,0,0,0.3)'}}>
         <BottomSheetView style={{flex: 1, backgroundColor:'white'}}>
               <View style={{flexDirection:"row", alignItems:'center', paddingVertical: 10, paddingHorizontal: 20}}>
                   {/* <Ionicons name="arrow-back" size={24} color="black" style={{marginRight: 20}} /> */}
                   <AntDesign name="search1" size={20} color="black" style={{marginRight: 10}}/>
                   <TextInput style={{ paddingLeft: 10, backgroundColor:'#FAFAFA', borderRadius: 10, height: 30, flex: 1}} placeholder='Search music'/>
               </View>
         </BottomSheetView>
      </BottomSheet>
     }
     
    </SafeAreaView>
  )
}