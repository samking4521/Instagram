import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import React, { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';

import FastImage from 'react-native-fast-image'

type VideoType = {
    duration: number,
    path: string
 }

 type Assets = {
    id: string,
    mediaType: string,
    uri: string,
    duration?: number
  }

export default function MediaFlatlist({mediaType,setShowSelectMediaTypeBox, setShowLimitAlert, setOpenAddStoryModal, setImage, setVideo, setEditCaptureModal, assets, setAssets} : { mediaType: string, assets: Assets[], setAssets: React.Dispatch<React.SetStateAction<Assets[]>>, setOpenAddStoryModal: React.Dispatch<React.SetStateAction<boolean>>, setImage: React.Dispatch<React.SetStateAction<string | null>>, setVideo: React.Dispatch<React.SetStateAction<VideoType | null>>, setEditCaptureModal: React.Dispatch<React.SetStateAction<boolean>>, setShowLimitAlert: React.Dispatch<React.SetStateAction<boolean>>, setShowSelectMediaTypeBox:  React.Dispatch<React.SetStateAction<boolean>> }){
    const { width, height} = useWindowDimensions()
    const [nextPage, setNextPage] = useState(100)
    const [selectedStoriesList, setSelectedStoriesList] = useState<Assets[]>([])
    const [multipleSelectionEnabled, setMultipleSelectionEnabled] = useState(false)
    const [showAllMediaDirectories, setShowAllMediaDirectories] = useState(false)
    const [showMediaVertical, setShowMediaVertical] = useState(false)

    const placeholderItem = {
        id: 'item',
        mediaType: 'photo',
        uri: '',
        duration: 0
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
       

      const processSelectedMedia = (item: Assets)=>{
        if(multipleSelectionEnabled){
              if(selectedStoriesList.includes(item)){
                const filteredItems = selectedStoriesList.filter((theItem)=> theItem !== item)
                setSelectedStoriesList(filteredItems)
              }else{
                if(selectedStoriesList.length == 10){
                  setShowLimitAlert(true)
                  setTimeout(()=>{
                   setShowLimitAlert(false)
                  }, 2000)
                  return
              }else{
                setSelectedStoriesList((prev)=> [...prev, item])
              }      
           } 
        }else{
          if(item.mediaType == 'photo'){
              setImage(item.uri)
              setOpenAddStoryModal(false)
              setEditCaptureModal(true)
          }else{
            const videoData = {path: item.uri, duration: item.duration || 0}
            setVideo(videoData)
            setOpenAddStoryModal(false)
            setEditCaptureModal(true)
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
       
       const selectMediaInMultples = (item: Assets)=>{
        setMultipleSelectionEnabled(true)
        setSelectedStoriesList((prev)=> [...prev, item])
       }
       
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
           }   

  return (
    <FlatList data={[placeholderItem, ...assets]}
                onEndReached={ mediaType == 'Recents' || mediaType=='Photos' || mediaType == 'Videos'? ()=>getRecentMedia(mediaType) : ()=>{}}
                onEndReachedThreshold={0.2}
                style={{marginTop: 10}}
                numColumns={3}
                renderItem={({item, index})=>{
                  if(item.mediaType == 'photo'){
                    if(index == 0){
                        return(
                           <Pressable onPress={closeAddStoryModal} style={{width: width/3, height: 200, borderWidth: 1, borderColor:'black', justifyContent:"center", alignItems:'center', backgroundColor:'rgba(255,255,255,0.2)'}}>
                               <FontAwesome name="camera" size={24} color="white" />
                            </Pressable>
                        )
                    }else{
                      return(
                        <Pressable onLongPress={()=> selectMediaInMultples(item)} onPress={()=> processSelectedMedia(item)} >
                           <FastImage
                            style={{width: width/3, height: 200, borderWidth: 1, borderColor:'black'}}
                                source={{
                                    uri: item.uri,
                                    priority: FastImage.priority.high,
                                        }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                            {/* <Image source={{uri: item.uri}} style={{width: width/3, height: 200, borderWidth: 1, borderColor:'black'}}/> */}
                           { multipleSelectionEnabled && <View style={{position:'absolute', top: 10, left: width/3 - 30, width: 25, height: 25, borderRadius: 25, borderWidth: 1, borderColor: 'white', backgroundColor:selectedStoriesList.includes(item)? 'blue' : 'rgba(255,255,255,0.5)', justifyContent:'center', alignItems:'center'}}>
                                      {selectedStoriesList.includes(item) && <Text style={{fontSize: 14, fontWeight:'600', color:'white'}}>{selectedStoriesList.indexOf(item) + 1}</Text>}
                            </View>}
                        </Pressable>
                      ) 
                    }
                    
                  }else{
                    return(
                      <Pressable onLongPress={()=> selectMediaInMultples(item)} onPress={()=> processSelectedMedia(item)} >
                             <FastImage
                            style={{width: width/3, height: 200, borderWidth: 1, borderColor:'black'}}
                                source={{
                                    uri: item.uri,
                                    priority: FastImage.priority.high,
                                        }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                            {/* <Image source={{uri: item.uri}} style={{width: width/3, height: 200, borderWidth: 1, borderColor:'black'}}/> */}
                           { multipleSelectionEnabled && <View style={{position:'absolute', top: 10, left: (width/3) - 30, width: 25, height: 25, borderRadius: 25, borderWidth: 1, borderColor: 'white', backgroundColor:selectedStoriesList.includes(item)? 'blue' : 'rgba(255,255,255,0.5)', justifyContent:'center', alignItems:'center'}}>
                                      {selectedStoriesList.includes(item) && <Text style={{fontSize: 14, fontWeight:'600', color:'white'}}>{selectedStoriesList.indexOf(item) + 1}</Text>}
                            </View>}
                            <View style={{position:'absolute', top: '85%', width:'100%'}}>
                                <Text style={{fontSize: 14, fontWeight:'600', color:'white', letterSpacing: 0.5, textAlign:'right', paddingRight: 5}}>{formatDuration(item.duration || 0)}</Text>
                            </View>
                        </Pressable>
                    )
                  }
                  
                }
              }
                
                />
  )
}

