import { View, Text, Alert, Image, useWindowDimensions, FlatList, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import * as MediaLibrary from 'expo-media-library';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Video from 'react-native-video';
import { FlatList as GestureFlatlist } from 'react-native-gesture-handler';
import ImageZoom, {ImageZoomProps} from 'react-native-image-pan-zoom';

export default function Gallery(){
  const [permission, setPermission] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState(100)
  const [assets, setAssets] = useState<Assets[]>([])
  const [onPageLoad, setOnPageLoad] = useState(true)
  const [mainImg, setMainImg] = useState<Assets>()
  const [paused, setPaused] = useState(false);
  const [showMultiplePicker, setShowMultiplePicker] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Assets[]>([])
  const [imgResizeMode, setImgResizeMode] = useState(false)
  const [selectorIconColor, setSelectorIconColor] = useState(false)
  const { width, height } = useWindowDimensions()
  const [cameraModeIndex, setCameraModeIndex] = useState(0)
  const flatlistRef = useRef<FlatList>(null)
  const assetsFlatListRef = useRef<GestureFlatlist>(null)
  const outerFlatlistRef = useRef<FlatList>(null)

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setPermission(status);
    if (status !== "granted") {
      Alert.alert("Permission Denied", "You need to enable media access in settings.");
    }
  };


  const switchScreens = [
     'POST',
     'STORY',
     'REELS'
  ]
  
  type Assets = {
    id: string,
    mediaType: string,
    uri: string,
    duration?: number
  }

  
  
  const getRecentMedia = async () => {
 try{
  let allAssets: Assets[] = [];
  let hasNextPage = true;
  let after: string | undefined = undefined;

  if (nextPage) {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo', 'video'],
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

       if(onPageLoad){
          setMainImg(allAssets[0])
          setOnPageLoad(false)
       }
      
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
  setSelectedImages(prev => [...prev, media]);
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
      const selectImgs = selectedImages.length >= 1 ? selectedImages : mainImg ? [...selectedImages, mainImg] : selectedImages;
      router.push({
        pathname: '/(nestedScreens)/PostPreview',
        params: {media: JSON.stringify(selectImgs), imgResizeMode: imgResizeMode.toString(), galleryMedia: JSON.stringify(assets[0])}})
   
   }

   const scrollToTop = () => {
    outerFlatlistRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

   const scrollToIndex = (index: number)=>{ 
      flatlistRef.current?.scrollToIndex({
        index,
        animated: true,
       
      });    
  }

  const assetsScrollToIndex = (index: number)=>{
    try {
          assetsFlatListRef.current?.scrollToIndex({
            index: Math.floor(index/4),
            animated: true,
            viewPosition: 0
          });
            } 
        catch (error) {
            if( error instanceof Error){
              console.log("scrollToIndex failed, using scrollToOffset instead", error.message);
            }
  }   
  }
  

  

  const navigateToScreens = (index: number)=>{
    console.log('Tesla', index)
      if (index == 1){
         router.push({
          pathname: '/(nestedScreens)/LiveCamera',
          params: {mode: 'STORY', modeIndex: 1}
         })
      }else if(index == 2){
         router.push({
          pathname: '/(nestedScreens)/LiveCamera',
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
        <ExpoStatusBar style='light' backgroundColor='black' />
       
           <FlatList ref={flatlistRef} contentContainerStyle={{paddingRight: 150}} style={{ position:'absolute', zIndex: 10, left: cameraModeIndex == 0? 60/100 * width : cameraModeIndex == 1? 55/100 * width : 50/100 * width , top: 95/100 * height, backgroundColor: 'rgba(0,0,0,0.9)', padding: 15, borderRadius: 20, width: 50/100 * width}} data={switchScreens} renderItem={({item, index})=> {
            return(
                <Text onPress={()=> processCapture(index)} style={{ fontWeight: '800', color: index == cameraModeIndex? 'white' : 'rgba(255,255,255, 0.3)', fontSize: 16, marginRight: 15}}>{item}</Text>
            )
            }} horizontal showsHorizontalScrollIndicator={false}/>
       
      <View style={{flex: 1}}>
      <View style={{flexDirection:'row', alignItems:'center', paddingVertical: 10, paddingHorizontal: 15, backgroundColor:'rgba(0,0,0,0.9)'}}>
              <AntDesign onPress={()=> router.push('/(home)/explore')} name="close" size={30} color="white" style={{marginRight: 20}}/>
              <Text style={{marginRight:'auto', color:'white', fontSize: 20, fontWeight:'800'}}>New Post</Text>
              <Text onPress={goToEditScreen} style={{color: 'blue', fontSize: 16, fontWeight: '600'}}>Next</Text>
          </View>
         
      <Pressable onPress={controlPlayPause}>
      {
        mainImg? mainImg.mediaType == 'photo'? 
        <ImageZoom {...({
         cropWidth: width,
         cropHeight: 50/100 * height,
         imageWidth: width,
         imageHeight: 50/100 * height,
         minScale: 1,
         enableCenterFocus: false,
       } as ImageZoomProps)}>
                   <Image source={{uri: mainImg.uri}} resizeMode={imgResizeMode? 'contain' : 'cover'}  style={{width: '100%', height: 50/100 * height}}/>                    
         </ImageZoom>
         :
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
      { (mainImg?.mediaType == 'photo' && selectedImages.length == 0 ) && <Pressable onPress={()=> setImgResizeMode(!imgResizeMode)} style={{ position:'absolute', top: 44/100 * height, left: 10, backgroundColor:'#4C4C4C', width: 40, height: 40, borderRadius: 40, justifyContent:'center', alignItems:'center'}}>
           <Ionicons name="chevron-expand" size={24} color="white" />
       </Pressable>}

       {
         paused && mainImg?.mediaType == 'video' && <FontAwesome5 name="play" size={40} color="white" style={{position:'absolute', left: '45%', top: 40/100 * (50/100 * height)}}/>
       }

   </Pressable>
   
          
          <View style={{flex: 1}}> 
          <View style={{padding: 10, backgroundColor:'rgba(0,0,0,0.9)', flexDirection:'row', alignItems:'center'}}>
      <View style={{flexDirection:'row', alignItems:'center', marginRight:"auto"}}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '600', marginRight: 10}}>Recents</Text>
        <AntDesign name="down" size={20} color="white" />
      </View>
      <View style={{flexDirection:'row', alignItems:'center'}}>
         <Pressable onPress={enableMultipleImgSelection} style={{width: 35, height: 35, borderRadius: 35, backgroundColor: selectorIconColor? 'white' : '#4C4C4C', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="copy" size={20} color={selectorIconColor? 'blue' : 'white'} />
         </Pressable>
        <Pressable onPress={()=> router.push({ pathname:'/(nestedScreens)/LiveCamera',
          params: {uri: assets[0].uri}
        })} style={{marginLeft: 10, width: 35, height: 35, borderRadius: 35, backgroundColor: '#4C4C4C', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="camera-outline" size={20} color="white" />
        </Pressable>
      </View>
    </View>
          <FlatList onEndReached={getRecentMedia}
        
        onEndReachedThreshold={0.2}
        ref={assetsFlatListRef}
        keyExtractor={(item, index) => item.id.toString()}  
        getItemLayout={(data, index) => ({
          length: 85,
          offset: 85 * index,
          index: index,
        })}
      
          numColumns={4} data={assets} renderItem={({item, index})=>{
          return(
            <Pressable onLongPress={()=> enableMultipleSelection(item)} onPress={()=> { assetsScrollToIndex(index); scrollToTop(); processMultipleImages(item)}} style={{borderWidth: 1, borderColor:'rgba(0,0,0,0.3)'}}>
              <Image
                  source={{ uri: item.uri }}
                  style={{ width: width/4, height: 85 }}
                />
                  {  item == mainImg && <View style={{zIndex: 1, backgroundColor: 'rgba(255,255,255, 0.5)', width: width/4, height: 100, position:'absolute' }}></View>}
                  { showMultiplePicker && <View style={{ zIndex: 2, position:'absolute', top: 2, left: width/4 - 30, width: 25, height: 25, borderRadius: 25, borderColor: 'white', borderWidth: 2, justifyContent:'center', alignItems:'center', backgroundColor: selectedImages.includes(item)? 'blue' : 'rgba(255,255,255,0.4)' }}>
                  { selectedImages.includes(item) && <Text style={{color:'white', fontWeight:'600', fontSize: 14}}>{selectedImages.indexOf(item) + 1}</Text>}
  
             </View>}
             { item.mediaType == 'video' && <Text style={{fontWeight:'600', fontSize: 12, color:'white', letterSpacing: 0.5, zIndex: 3, position:'absolute', top: '85%', left: 65/100 * (width/4)}}>{item.duration? formatDuration(item.duration) : 0}</Text>}
  
            </Pressable>      
          )
      }}/>
  
                   </View>
      </View>
    </SafeAreaView>
  )
}

