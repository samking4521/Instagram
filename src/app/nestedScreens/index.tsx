import { View, Text, Alert, Image, useWindowDimensions, FlatList, Pressable, NativeScrollEvent, NativeSyntheticEvent} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Video from 'react-native-video';


export default function Gallery(){
  const [assets, setAssets] = useState<Assets[]>([])
  const [mainImg, setMainImg] = useState<Assets>()
  const [paused, setPaused] = useState(false);
  const [showMultiplePicker, setShowMultiplePicker] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Assets[]>([])
  const [imgResizeMode, setImgResizeMode] = useState(false)
  const [selectorIconColor, setSelectorIconColor] = useState(false)
  const { width, height } = useWindowDimensions()
  const [cameraModeIndex, setCameraModeIndex] = useState(0)
  const flatlistRef = useRef<FlatList>(null)
  


  const switchScreens = [
     'POST',
     'STORY',
     'REELS'
  ]
  
  type Assets = {
    mediaType: string,
    uri: string,
    duration?: number
  }

  
  
  const getRecentMedia = async () => {
 try{
  let allAssets: Assets[] = [];
  let hasNextPage = true;
  let after: string | undefined = undefined;

  while (hasNextPage) {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo', 'video'],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
      first: 100, // Fetch in batches (adjust as needed)
      after: after, // Pagination cursor
    });

    allAssets = [...allAssets, ...media.assets];

    hasNextPage = media.hasNextPage;
    after = media.endCursor; // Update cursor for the next fetch
  }

      console.log('Total media fetched:', allAssets.length);
      setAssets(allAssets);
      setMainImg(allAssets[0])
      
  
 }catch(e){
    console.log('Error fetching media: ', e)
 }
   
  };


const enableMultipleImgSelection = ()=>{
  setShowMultiplePicker(!showMultiplePicker)
  if(mainImg){
     selectedImages.push(mainImg)
  }
}

const enableMultipleSelection = (media: Assets)=>{
  selectedImages.push(media)
  setMainImg(media)
  setShowMultiplePicker(true)
}
 
  useEffect(()=>{
      if(!showMultiplePicker){
        setSelectorIconColor(false)
        setSelectedImages([])
      }else{
        setSelectorIconColor(true)
      }
  }, [showMultiplePicker])

  
  useEffect(() => {
    getRecentMedia();
  }, []);

  const processMultipleImages = (imgObj: Assets)=>{
    if(showMultiplePicker){
      if(selectedImages.includes(imgObj)){
        const newImgs = selectedImages.filter(img => img != imgObj)
        const media = newImgs[newImgs.length - 1]
        if(newImgs.length >= 1){
          setMainImg(media)
        }
        setSelectedImages(newImgs)
    }else{
      selectedImages.push(imgObj)
      setMainImg(imgObj)
    }
    }else{
      if(imgObj.mediaType == 'video'){
         if(paused){
            setPaused(false)
         }
         setMainImg(imgObj)
      }else{
        setMainImg(imgObj)
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

   const controlPlayPause = ()=>{
       if(mainImg?.mediaType == 'photo'){
        return
       }
       setPaused(!paused);
   }

   const goToEditScreen = ()=>{
    if(mainImg){
      router.push({
        pathname: '/nestedScreens/PostPreview',
        params: {media: JSON.stringify(selectedImages), singleMedia: JSON.stringify(mainImg)}})
    }
   }

   const scrollToIndex = (index: number)=>{
    flatlistRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }

  const navigateToScreens = (index: number)=>{
    console.log('Tesla', index)
      if (index == 1){
         router.push({
          pathname: '/nestedScreens/LiveCamera',
          params: {mode: 'STORY', modeIndex: 1}
         })
      }else if(index == 2){
         router.push({
          pathname: '/nestedScreens/LiveCamera',
          params: {mode: 'REELS', modeIndex: 2}
         })
      }else{
        //
      }
  }

  const processCapture = (index: number)=>{
      setCameraModeIndex(index)
      scrollToIndex(index)
      navigateToScreens(index)
  }
 
  

  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'rgba(0,0,0,0.9)'}}>
        <StatusBar style='light' backgroundColor='black' />
        <View>
           <FlatList ref={flatlistRef} contentContainerStyle={{paddingRight: 150}} style={{ position:'absolute', zIndex: 10, left: cameraModeIndex == 0? 60/100 * width : cameraModeIndex == 1? 55/100 * width : 50/100 * width , top: 90/100 * height, backgroundColor: 'rgba(0,0,0,0.9)', padding: 15, borderRadius: 20, width: 50/100 * width}} data={switchScreens} renderItem={({item, index})=> {
            return(
                <Text onPress={()=> processCapture(index)} style={{ fontWeight: '800', color: index == cameraModeIndex? 'white' : 'rgba(255,255,255, 0.3)', fontSize: 16, marginRight: 15}}>{item}</Text>
            )
            }} horizontal showsHorizontalScrollIndicator={false}/>
        </View>
      <View style={{flex: 1}}>
          <View style={{flexDirection:'row', alignItems:'center', padding: 15, backgroundColor:'rgba(0,0,0,0.9)'}}>
              <AntDesign onPress={()=> router.back()} name="close" size={30} color="white" style={{marginRight: 20}}/>
              <Text style={{marginRight:'auto', color:'white', fontSize: 20, fontWeight:'800'}}>New Post</Text>
              <Text onPress={goToEditScreen} style={{color: 'blue', fontSize: 16, fontWeight: '600'}}>Next</Text>
          </View>
          <Pressable onPress={controlPlayPause}>
             {
               mainImg? mainImg.mediaType == 'photo'? 
               <Image source={{uri: mainImg.uri}} resizeMode={imgResizeMode? 'contain' : 'cover'}  style={{width: '100%', height: 50/100 * height}}/> :
               <Video 
               source={{ uri: mainImg.uri }} 
               style={{width: width, height: 50/100 * height}}
               controls={false}
               paused={paused}
               resizeMode="contain"
               repeat
             />
              : <View style={{width: '100%', height: 50/100 * height, backgroundColor:'rgba(0,0,0,0.8)'}}></View>
             }
             { mainImg?.mediaType == 'photo' && <Pressable onPress={()=> setImgResizeMode(!imgResizeMode)} style={{ position:'absolute', top: 44/100 * height, left: 10, backgroundColor:'#4C4C4C', width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="chevron-expand" size={24} color="white" />
              </Pressable>}

              {
                paused && mainImg?.mediaType == 'video' && <FontAwesome5 name="play" size={40} color="white" style={{position:'absolute', left: '45%', top: 40/100 * (50/100 * height)}}/>
              }

          </Pressable>
          <View style={{padding: 10, backgroundColor:'rgba(0,0,0,0.9)', flexDirection:'row', alignItems:'center'}}>
            <View style={{flexDirection:'row', alignItems:'center', marginRight:"auto"}}>
              <Text style={{color: 'white', fontSize: 18, fontWeight: '600', marginRight: 10}}>Recents</Text>
              <AntDesign name="down" size={20} color="white" />
            </View>
            <View style={{flexDirection:'row', alignItems:'center'}}>
               <Pressable onPress={enableMultipleImgSelection} style={{width: 35, height: 35, borderRadius: 35, backgroundColor: selectorIconColor? 'white' : '#4C4C4C', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="copy" size={20} color={selectorIconColor? 'blue' : 'white'} />
               </Pressable>
              <Pressable onPress={()=> router.push({ pathname:'/nestedScreens/LiveCamera',
                params: {uri: assets[0].uri}
              })} style={{marginLeft: 10, width: 35, height: 35, borderRadius: 35, backgroundColor: '#4C4C4C', justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name="camera-outline" size={20} color="white" />
              </Pressable>
            </View>
          </View>
          <View style={{flex: 1}}> 
           <FlatList numColumns={4} data={assets} renderItem={({item})=>{
              return(
                <Pressable onLongPress={()=> enableMultipleSelection(item)} onPress={()=> processMultipleImages(item)} style={{borderWidth: 1, borderColor:'rgba(0,0,0,0.3)'}}>
                  <Image source={{ uri : item.uri}} style={{width: width/4, height: 100}}/>
                      {  item == mainImg && <View style={{zIndex: 1, backgroundColor: 'rgba(255,255,255, 0.5)', width: 100, height: 100, position:'absolute' }}></View>}
                      { showMultiplePicker && <View style={{ zIndex: 2, position:'absolute', top: 2, left: 70, width: 30, height: 30, borderRadius: 30, borderColor: 'white', borderWidth: 2, justifyContent:'center', alignItems:'center', backgroundColor: selectedImages.includes(item)? 'blue' : 'rgba(255,255,255,0.4)' }}>
                      { selectedImages.includes(item) && <Text style={{color:'white', fontWeight:'600', fontSize: 16}}>{selectedImages.indexOf(item) + 1}</Text>}

                 </View>}
                 { item.mediaType == 'video' && <Text style={{fontWeight:'600', color:'white', letterSpacing: 0.5, zIndex: 3, position:'absolute', top: '85%', left: 65/100 * (width/4)}}>{item.duration? formatDuration(item.duration) : 0}</Text>}

                </Pressable>      
              )
          }}/>
          </View>
      </View>
    </SafeAreaView>
  )
}

