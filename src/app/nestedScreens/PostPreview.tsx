import { View, Text, SafeAreaView, Image, useWindowDimensions, FlatList, Pressable, Modal, ViewToken} from 'react-native'
import React, { useEffect, useCallback, useRef, useState } from 'react'
import { AntDesign, Ionicons, FontAwesome6, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import Video, {VideoRef} from 'react-native-video';
import { router } from 'expo-router';
import EditSingleMedia from '@/src/components/editSingleMedia';

export default function PostPreview(){
    const { width, height } = useWindowDimensions()
    const { media, singleMedia } = useLocalSearchParams()
    const theMedia: Assets[] = typeof media == 'string'? JSON.parse(media) : []
    const theSingleMedia: Assets = typeof singleMedia == 'string'? JSON.parse(singleMedia) : {}
    const [resizeImage, setResizeImage] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [mediaFiles, setMediaFiles] = useState<Assets[]>(theMedia)
    const [currentItem, setCurrentItem] = useState<Assets>()
    const [currentViewableMedia, setCurrentViewableMedia] = useState<ViewToken>()
    const [selectedItem, setSelectedItem] = useState<Assets>({
      id: 0,
      mediaType: '',
      duration: 0,
      uri: '' 
  })
    const [showEditModal, setShowEditModal] = useState(false)
    const [muteVideo, setMuteVideo] = useState(false)

   const flatListRef = useRef<FlatList>(null)
   const videoRef = useRef<VideoRef>(null)
     // Define the viewability configuration
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is considered visible if at least 50% of it is visible
  }).current;


    console.log('theMedia : ', mediaFiles, mediaFiles.length)
   
    type Assets = {
        id: number,
        mediaType: string,
        duration?: number,
        uri: string 
    }

    const deleteImage = (mediaObj: Assets)=>{
      console.log('the files : ', mediaObj)
       const newFiles = mediaFiles.filter(media => media !== mediaObj)
       setMediaFiles(newFiles)
       setShowModal(false)
    }

     // Callback function to handle viewable items change
  const onViewableItemsChanged = useCallback(({ viewableItems, changed } : {viewableItems: ViewToken[], changed: ViewToken[]}) => {
    console.log('Visible items:', viewableItems);
    console.log('Changed items in this iteration:', changed);
    setCurrentViewableMedia(viewableItems[0])
    // You can perform actions based on the currently visible items here
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'white'}}>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical: 40, paddingHorizontal: 20}}>
        <AntDesign onPress={()=> router.back()} name="close" size={30} color="black" />
       { ((theSingleMedia.mediaType == 'video' && theMedia.length == 0) || currentViewableMedia?.item.mediaType == 'video') && <Octicons onPress={()=> setMuteVideo(!muteVideo)} name={muteVideo? "mute" : "unmute"} size={28} color="black" />}
      </View>
      <View style={{flex: 1, marginTop: '15%'}}>
        {
          theSingleMedia.uri && theMedia.length == 0? 
          <View>
              {
                theSingleMedia.mediaType == 'photo'?  <Image source={{ uri: theSingleMedia.uri}} style={{width: width, height: 400, borderRadius: 20}} resizeMode={resizeImage? 'contain' : 'cover'}/>
                :   
               
               
                   <Video 
                   ref={videoRef}
                source={{ uri: theSingleMedia.uri }} 
                style={{width: width, height: 50/100 * height}}
                controls={false}
                resizeMode="contain"
                repeat
                
              />
              
               

              }
              { theSingleMedia.mediaType == 'photo' && <View style={{position:'absolute', top: 350, left: '5%', width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.8)'}}>
                       <Ionicons onPress={()=> setResizeImage(!resizeImage) } name="chevron-expand" size={24} color="white" />
                     </View>}
            </View> : 
            <FlatList 
            ref={flatListRef}
            keyExtractor={(item) => item.id.toString()}
            horizontal 
            contentContainerStyle={{gap: mediaFiles.length == 1? 0 : 5, paddingHorizontal: mediaFiles.length == 1? 0 : 20}}
            showsHorizontalScrollIndicator={false}
            pagingEnabled 
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            data={theMedia} 
            renderItem={({item, index})=>{
              if(item.mediaType == 'photo'){
                return(
                
              <Pressable style={{ width:mediaFiles.length == 1? width : 90/100 * width, height: mediaFiles.length == 1? 50/100 * height : 40/100 * height}} onPress={()=>{ setSelectedItem(item); setShowEditModal(true)}}>
                  <Image source={{ uri: item.uri}} style={{width:mediaFiles.length == 1? width : 90/100 * width, height: mediaFiles.length == 1? 50/100 * height : 40/100 * height}} resizeMode={resizeImage?'contain' : 'cover'}/>
                  <Pressable onPress={()=> setResizeImage(!resizeImage)} style={{position:'absolute', top: mediaFiles.length == 1? 90/100 * 50/100 * height : 85/100 * 40/100 * height, left: '5%', width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <FontAwesome6 name="expand" size={24} color="white" />
                  </Pressable>
                  <Pressable onPress={()=>{setShowModal(true); setCurrentItem(item)}} style={{ position:'absolute', left: mediaFiles.length == 1? 90/100 * width : 80/100 * width,  top: 10, justifyContent:"center", alignItems:"center", width: 30, height: 30, borderRadius: 25, backgroundColor:'rgba(0,0,0,0.5)'}}>
                      <AntDesign name="close" size={20} color="white" />
                  </Pressable>
               </Pressable>
              
  
                )
              }else{
                  return(
              <Pressable  style={{width: mediaFiles.length == 1? width : 90/100 * width, height: mediaFiles.length == 1? 50/100 * height : 40/100 * height, borderRadius: 20}} onPress={()=>{ setSelectedItem(item); setShowEditModal(true)}}>
                 <Video 
                 source={{ uri: item.uri }} 
                 style={{width: mediaFiles.length == 1? width : 90/100 * width, height: mediaFiles.length == 1? 50/100 * height : 40/100 * height, borderRadius: 20}}
                 controls={false}
                 resizeMode="cover"
                 repeat
                 paused={item.id == currentViewableMedia?.item.id? false : true}
                 muted={muteVideo}
               />
                 <Pressable onPress={()=>{setShowModal(true); setCurrentItem(item)}} style={{ position:'absolute', left: mediaFiles.length == 1? 90/100 * width : 80/100 * width,  top: 10, justifyContent:"center", alignItems:"center", width: 30, height: 30, borderRadius: 25, backgroundColor:'rgba(0,0,0,0.5)', zIndex: 2}}>
                      <AntDesign name="close" size={20} color="white" />
                  </Pressable>
               </Pressable> 
                   
                  )
              }
                    
            }} />
        }

        <View style={{marginTop:'auto', paddingHorizontal: 15, marginBottom: 10}}>
           <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
               <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="musical-notes-outline" size={25} color="black" />
               </View>

               { currentViewableMedia?.item.mediaType == 'photo'? <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="text" size={25} color="black" />
               </View> : <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="text" size={25} color="black" />
                  <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent:'center', alignItems:'center', position:'absolute'}}></View>
               </View> }

              { currentViewableMedia?.item.mediaType == 'photo'? <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="images-outline" size={25} color="black" />
               </View> : <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
               <Ionicons name="images-outline" size={25} color="black" />
                  <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent:'center', alignItems:'center', position:'absolute'}}></View>
               </View>}

               { currentViewableMedia?.item.mediaType == 'photo'? <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                  <MaterialCommunityIcons name="tune-variant" size={25} color="black" />
               </View> : <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
               <Ionicons name="images-outline" size={25} color="black" />
                  <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent:'center', alignItems:'center', position:'absolute'}}></View>
               </View>}
           </View>

           <View style={{ marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
             <Image source={{ uri: theSingleMedia.uri}} style={{width: 40, height: 40, borderRadius: 10, marginRight:'auto'}}/>
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
     { selectedItem && <EditSingleMedia editModal={showEditModal} setShowEditModal={setShowEditModal} selectedItem={selectedItem}/>}

    </SafeAreaView>
  )
}