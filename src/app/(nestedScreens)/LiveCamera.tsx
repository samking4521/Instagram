import { View, Text, Image, SafeAreaView, Pressable, FlatList } from 'react-native';
import { FontAwesome5} from '@expo/vector-icons'
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import PostCapture from '@/src/components/postCapture';
import StoryCapture from '@/src/components/storyCapture';
import ReelCapture from '@/src/components/reelCapture';

export default function LiveCamera() {
  const [isFront, setIsFront] = useState(false)
  const { uri, mode, modeIndex } = useLocalSearchParams()
  const [cameraModeIndex, setCameraModeIndex] = useState(modeIndex || 0)
  const [captureMode, setCaptureMode] = useState(mode || 'POST')
   
  const flatlistRef = useRef<FlatList>(null)

  

  const cameraMode = [
     'POST',
     'STORY',
     'REEL'
  ]

  type CropBox = {
    x: number,
    y: number,
    width: number,
    height: number

  }

  type ImgResult = {
    height: number,
    width: number
  }


 
  const scrollToIndex = (index: number)=>{
    flatlistRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }


  
  return (
    <SafeAreaView style={{flex: 1, paddingTop: 20}}>
      {
          captureMode == 'POST'? <PostCapture isFront={isFront} uri={typeof uri === 'string' ? uri : uri[0]}/> : captureMode == 'STORY'? <StoryCapture isFront={isFront} /> : <ReelCapture isFront={isFront}/>
      }
       <View style={{ marginTop:'auto', paddingHorizontal: 20, height: '10%', alignItems:'center', flexDirection:'row', justifyContent:'space-between', backgroundColor:'black'}}>
          <Pressable onPress={()=> router.push('/(home)/post')} style={{borderWidth: 2, borderColor:'white', borderRadius: 10, marginRight: '30%'}}>
             <Image style={{width: 50, height: 50}} source={{uri : typeof uri == 'string'? uri : undefined}}/>
          </Pressable>
          <FlatList ref={flatlistRef}
          contentContainerStyle={{gap: 15, paddingRight: 50}} horizontal showsHorizontalScrollIndicator={false} data={cameraMode} renderItem={({item, index})=>{
              return(
                <Text onPress={()=> {setCameraModeIndex(index); setCaptureMode(item); scrollToIndex(index)}}  style={{color: index == cameraModeIndex? 'white' : 'rgba(255,255,255, 0.3)', fontSize: 16, fontWeight: '500', letterSpacing: 0.5}}>{item}</Text>
              )
          }}/>
          <Pressable onPress={()=> setIsFront(!isFront)} style={{marginLeft: 10}}>
             <FontAwesome5 name="sync-alt" size={24} color="white" />
          </Pressable>
       
      </View>
    </SafeAreaView>
   
  );
}
