import { View, Text, Pressable, Image, Modal, FlatList, useWindowDimensions} from 'react-native'
import { AntDesign, Ionicons, MaterialIcons, FontAwesome, Feather, FontAwesome5} from '@expo/vector-icons'
import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { GestureHandlerRootView, FlatList as GestureFlatList, ScrollView } from 'react-native-gesture-handler'
import FastImage from 'react-native-fast-image'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import MediaFlatlist from './MediaFlatlist';
import MediaSelectBottomSheet from './MediaSelectBottomSheet';

type VideoType = {
    duration: number,
    path: string
 }

 type CategorizedMedia = {
    id?: number,
    folderName: string,
    data: Assets[]
}

  
type Assets = {
    id: string,
    mediaType: string,
    uri: string,
    duration?: number
  }

export default function MediaLibraryModal({completeCategorizedMedia, setImage, setVideo, setEditCaptureModal, setOpenAddStoryModal, openAddStoryModal}: {completeCategorizedMedia: CategorizedMedia[], openAddStoryModal: boolean, setImage: React.Dispatch<React.SetStateAction<string | null>>, setVideo: React.Dispatch<React.SetStateAction<VideoType | null>>, setEditCaptureModal: React.Dispatch<React.SetStateAction<boolean>>, setOpenAddStoryModal: React.Dispatch<React.SetStateAction<boolean>>}){
    const [assets, setAssets] = useState<Assets[]>([])    
    const { width, height} = useWindowDimensions()
    const [nextPage, setNextPage] = useState(100)
    const [selectedStoriesList, setSelectedStoriesList] = useState<Assets[]>([])
    const [multipleSelectionEnabled, setMultipleSelectionEnabled] = useState(false)
    const [showLimitAlert, setShowLimitAlert] = useState(false)
    const [mediaType, setMediaType] = useState('Recents')
    const [photoAssets, setPhotoAssets] = useState<Assets[]>([])
    const [videoAssets, setVideoAssets] = useState<Assets[]>([])
    const [selectMediaTypeBox, setShowSelectMediaTypeBox] = useState(false)
    const [recentAssets, setRecentAssets] = useState<Assets[]>([])
    const [showAllMediaDirectories, setShowAllMediaDirectories] = useState(false)
    const [showMediaVertical, setShowMediaVertical] = useState(false)
   
  const enableMultipleSelection = ()=>{
    setMultipleSelectionEnabled(!multipleSelectionEnabled)
}

const closeAddStoryModal = ()=>{
    if(showAllMediaDirectories && !showMediaVertical){
        setShowAllMediaDirectories(false)
    }
    else if(showMediaVertical){
        setShowMediaVertical(false)
    }else{
      setMultipleSelectionEnabled(false)
      setSelectedStoriesList([])
      setOpenAddStoryModal(false)
      setShowSelectMediaTypeBox(false)
    }
   }
   
const deleteSelectedMedia = (item: Assets)=>{
  const filteredItems = selectedStoriesList.filter((theItem)=> theItem !== item )
  setSelectedStoriesList(filteredItems)
}

const fetchPhotosOnly = ()=>{
if(mediaType == 'Photos'){
   return
}else{
 setMediaType('Photos')
 setNextPage(200)
 setAssets(photoAssets)
}
}

const fetchVideosOnly = ()=>{
        if(mediaType == 'Videos'){
            return
        }else{
            setMediaType('Videos')
            setNextPage(200)
            setAssets(videoAssets)
        }
    }

const fetchRecentsOnly = ()=>{
        if(mediaType == 'Recents'){
             return
        }else{
            setMediaType('Recents')
            setNextPage(200)
            setAssets(recentAssets)
        }
    }



    const getMediaAssets = async(val: string)=>{
      try{
        let after: string | undefined = undefined; 
          const media = await MediaLibrary.getAssetsAsync({
            mediaType: val == 'photo'? 'photo' : val == 'video'? 'video' : ['photo', 'video'],
            sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
            first: 100 , // Fetch in batches (adjust as needed)
            after: after, // Pagination cursor
          });

          if(val == 'photo'){
              setPhotoAssets(media.assets)
          }else if(val == 'video'){
            setVideoAssets(media.assets)
          }else{
            setRecentAssets(media.assets)
          }
       }catch(e){
          console.log(`Error fetching first 100 ${val == 'photo'? 'photos' : val == 'video'? 'videos' : 'recents'}: `, e)
       }
    };
      
    const getRecentMedia = async (mediaType: string) => {
     try{
      let allAssets: Assets[] = [];
      let hasNextPage = true;
      let after: string | undefined = undefined;
    
      if (nextPage) {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: mediaType == 'Recents'? ['photo', 'video'] : mediaType == 'Photos'? 'photo' : 'video',
          sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
          first: nextPage , // Fetch in batches (adjust as needed)
          after: after, // Pagination cursor
        });
    
        allAssets.push(...media.assets);
    
        hasNextPage = media.hasNextPage;
        after = media.endCursor; // Update cursor for the next fetch
    
        if(hasNextPage){
          setNextPage(prev => prev += 100)
        }
        
      }
          setAssets((prevData) => {
                const filteredItems = allAssets.filter(item => !prevData.some(prev => prev.id == item.id));
                return [...prevData, ...filteredItems];
              });  
     }catch(e){
        console.log('Error fetching media: ', e)
     }
       
      };

useEffect(()=>{
        if(!openAddStoryModal) return
            getMediaAssets('photo')
            getMediaAssets('video')
            getMediaAssets('recents')
      }, [openAddStoryModal])

      useEffect(()=>{
                   if(!openAddStoryModal) return
                   getRecentMedia(mediaType)
               }, [openAddStoryModal])
     
     
               useEffect(()=>{
                   if(!multipleSelectionEnabled){
                      if(selectedStoriesList.length >=1){
                          setSelectedStoriesList([])
                      }
                   }
     
               }, [multipleSelectionEnabled])
  
  return (
    <Modal visible={openAddStoryModal} onRequestClose={closeAddStoryModal} animationType='slide' presentationStyle='overFullScreen'>
            <GestureHandlerRootView style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor:'black'}}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:"space-between", padding: 15}}>
                        <AntDesign onPress={closeAddStoryModal} name="close" size={24} color="white" />
                        <Text style={{fontSize: 18, color:'white', fontWeight:'600', letterSpacing:0.5}}>Add to story</Text>
                        <AntDesign name="setting" size={24} color="white" />  
                  </View>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop: 15}}>
                    <View style={{width: 70, height: 70, borderRadius: 10, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center'}}>
                       <Ionicons name="musical-notes-outline" size={20} color="white"/>
                       <Text style={{color:'white', fontWeight: '600',fontSize: 12, marginTop:10 }}>Music</Text>
                    </View>
                    <Pressable onPress={fetchPhotosOnly}  style={{width: 70, height: 70, borderRadius: 10, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center', marginHorizontal: 20}}>
                        <FontAwesome name="photo" size={18} color="white" />
                        <Text style={{color:'white', fontWeight: '600', fontSize: 12, marginTop:10}}>Photos</Text>
                    </Pressable>
                    <Pressable onPress={fetchVideosOnly} style={{width: 70, height: 70, borderRadius: 10, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center'}}>
                          <Feather name="play-circle" size={20} color="white" />   
                          <Text style={{color:'white', fontWeight: '600', fontSize: 12, marginTop:10}}>Videos</Text>
                    </Pressable>
                </View>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 15, marginTop: 20}}>
                   <Pressable onPress={()=> setShowSelectMediaTypeBox(!selectMediaTypeBox)} style={{flexDirection:'row', alignItems:"center"}}>
                      <Text style={{color:'white', fontSize: 16, fontWeight:'600', marginRight: 5}}>{mediaType}</Text>
                      <AntDesign name="down" size={16} color="white" />
                   </Pressable>
                   <Pressable onPress={enableMultipleSelection} style={{width: 30, height: 30, borderRadius: 30, backgroundColor: multipleSelectionEnabled? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center'}}>
                        <Ionicons name="copy-outline" size={20} color={multipleSelectionEnabled? "black" : "white"} />
                   </Pressable>
                </View>
                 {/* Flatlist of photos and videos in device */}
                 <MediaFlatlist mediaType={mediaType} setOpenAddStoryModal={setOpenAddStoryModal} setImage={setImage} setVideo={setVideo} setEditCaptureModal={setEditCaptureModal} assets={assets} setAssets={setAssets} setShowLimitAlert={setShowLimitAlert} setShowSelectMediaTypeBox={setShowSelectMediaTypeBox}/>

            </View>

           { showLimitAlert && <View style={{position:'absolute', top: 50/100 * height, left: 20/100 * width, backgroundColor:'rgba(0,0,0,0.4)', width: 60/100 * width, borderRadius: 10, padding: 15}}>
              <Text style={{fontSize: 12, fontWeight: '600', color:'white', letterSpacing: 0.5, textAlign:'center'}}>The limit is 10 photos or videos</Text>
          </View>
          }
          { selectedStoriesList.length >= 1 && <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.8)', padding: 5}}>
                <FlatList 
                style={{width: '60%'}}
                contentContainerStyle={{gap: 5}}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={selectedStoriesList}
                renderItem={({item})=>{
                  return(
                    <View>
                      <FastImage
                        style={{width: 35, height: 50, borderRadius: 5}}
                        source={{
                        uri: item.uri,
                        priority: FastImage.priority.high,
                            }}
                        resizeMode={FastImage.resizeMode.cover}
                        />
                      {/* <Image source={{uri : item.uri}} style={{width: 35, height: 50, borderRadius: 5}}/> */}
                      <Pressable onPress={()=> deleteSelectedMedia(item)} style={{ position:'absolute', top: 2, left: 15,  width: 18, height: 18, borderRadius: 18, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center'}}>
                         <AntDesign name='close' size={10} color="white"/>
                      </Pressable>
                    </View>
                  )
                }}
             />
                <View style={{flexDirection:'row', marginHorizontal: 5, width: '30%', height: 40, justifyContent:'center', alignItems:'center', borderRadius: 20, backgroundColor:'white'}}>
                   <Text style={{fontSize: 14, marginRight: 2}}>Next</Text>
                   <MaterialIcons name="navigate-next" size={20} color="black" />
                </View>
          </View>
            }
          { selectMediaTypeBox &&
            <View style={{position:'absolute', left: 20, top: 30/100 * height, padding: 20, backgroundColor:'rgba(0,0,0,0.8)', borderRadius: 20}}>
                <Pressable onPress={()=>{ fetchRecentsOnly(); setShowSelectMediaTypeBox(false)}} style={{flexDirection:'row', alignItems:'center'}}>
                      <FontAwesome5 name="photo-video" size={20} color="white" style={{width: 35}}  />
                      <Text style={{fontSize: 15, color:'white'}}>Recents</Text>
                     { mediaType == 'Recents' && <Ionicons name="checkmark-outline" size={24} color="white" style={{marginLeft: 20}}/>}
                </Pressable>
                <Pressable onPress={()=>{fetchPhotosOnly(); setShowSelectMediaTypeBox(false)}} style={{flexDirection:'row', alignItems:'center', marginVertical: 20}}>
                      <FontAwesome name="photo" size={20} color="white" style={{width: 35}}/>
                     <Text style={{fontSize: 15, color:'white'}}>Photos</Text>
                     { mediaType == 'Photos' && <Ionicons name="checkmark-outline" size={24} color="white" style={{marginLeft: 20}} />}
                </Pressable>
                  <Pressable onPress={()=>{fetchVideosOnly(); setShowSelectMediaTypeBox(false)}} style={{flexDirection:'row', alignItems:'center'}}>
                      <Feather name="play-circle" size={22} color="white" style={{width: 35}} />  
                     <Text style={{fontSize: 15, color:'white'}}>Videos</Text>
                     { mediaType == 'Videos' && <Ionicons name="checkmark-outline" size={24} color="white" style={{marginLeft: 20}}/>}
                  </Pressable>
                  <Pressable onPress={()=> { setShowSelectMediaTypeBox(false); setShowAllMediaDirectories(true)}}  style={{flexDirection:'row', alignItems:'center', marginTop: 20}}>
                     <Ionicons name="grid-outline" size={20} color="white" style={{width: 35}}/>
                      <Text style={{fontSize: 15, color:'white'}}>All Albums</Text>
                  </Pressable>
            </View>
         }
          { showAllMediaDirectories &&
                <>
                     {/* Bottom Sheet showing all media directories on user device*/}
                     <MediaSelectBottomSheet setNextPage={setNextPage} setMediaType={setMediaType} fetchPhotosOnly={fetchPhotosOnly} fetchVideosOnly={fetchVideosOnly} fetchRecentsOnly={fetchRecentsOnly} completeCategorizedMedia={completeCategorizedMedia} setAssets={setAssets} setShowAllMediaDirectories={setShowAllMediaDirectories} photoAssets={photoAssets} videoAssets={videoAssets} recentAssets={recentAssets}/>
                </>
          }
          </GestureHandlerRootView>
          </Modal>
  )
}