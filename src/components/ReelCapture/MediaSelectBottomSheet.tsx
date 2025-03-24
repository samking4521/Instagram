import { View, Text, Pressable, Image, useWindowDimensions} from 'react-native'
import { Ionicons, FontAwesome, Feather, FontAwesome5} from '@expo/vector-icons'
import { useState } from 'react';
import { FlatList as GestureFlatList, ScrollView } from 'react-native-gesture-handler'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

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

export default function MediaSelectBottomSheet({ setNextPage, setMediaType, fetchPhotosOnly, fetchVideosOnly, fetchRecentsOnly, completeCategorizedMedia, setAssets, setShowAllMediaDirectories, photoAssets, videoAssets, recentAssets} : { setNextPage: React.Dispatch<React.SetStateAction<number>>, setMediaType: React.Dispatch<React.SetStateAction<string>>, photoAssets: Assets[], videoAssets: Assets[], recentAssets: Assets[], fetchPhotosOnly: ()=> void, fetchVideosOnly: ()=> void, fetchRecentsOnly: ()=> void, completeCategorizedMedia: CategorizedMedia[], setAssets: React.Dispatch<React.SetStateAction<Assets[]>>, setShowAllMediaDirectories: React.Dispatch<React.SetStateAction<boolean>>}){
        
        const { width, height} = useWindowDimensions()
        const [showMediaVertical, setShowMediaVertical] = useState(false)


        function truncateString(str: string) {
                return str.length > 10 ? str.slice(0, 11) + "..." : str;
            }
        
        function processCategorizedMedia(item: CategorizedMedia){
           if(item.folderName == 'Recents'){
                setMediaType('Recents')
                setNextPage(200)
                setAssets(recentAssets)
                setShowAllMediaDirectories(false);
           }
           else if(item.folderName == 'Photos'){
                setMediaType('Photos')
                setNextPage(200)
                setAssets(photoAssets)
                setShowAllMediaDirectories(false);
           }else if(item.folderName == 'Videos'){
                setMediaType('Videos')
                setNextPage(200)
                setAssets(videoAssets)
                setShowAllMediaDirectories(false);
           }else{
                setAssets(item.data);
                setMediaType(item.folderName);
                setShowAllMediaDirectories(false);
           }
        }

  return (
    <BottomSheet index={0} snapPoints={['100%']} enablePanDownToClose={true} onClose={()=> setShowAllMediaDirectories(false)}>
              <BottomSheetView style={{flex: 1, backgroundColor:'white', padding: 10}}>
                
                 { !showMediaVertical? <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text onPress={()=> setShowAllMediaDirectories(false)} style={{width:'20%', marginRight: '15%', fontSize: 18}}>Cancel</Text>
                    <Text style={{fontWeight:'600', letterSpacing: 0.5, fontSize: 18}}>Select album</Text>
                 </View> : <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal: 10, paddingVertical: 15}}>
                      <Ionicons onPress={()=> setShowMediaVertical(false)} name="chevron-back" size={30} color="black" style={{width: 20/100 * width, marginRight: 18/100 * width}} />
                      <Text style={{fontSize: 18}}>Albums</Text>
                 </View> }
                 { !showMediaVertical? <>
                 <View style={{flexDirection:'row', alignItems:'center', marginVertical: 30}}>
                    <Pressable   onPress={()=> { fetchRecentsOnly(); setShowAllMediaDirectories(false)}} style={{alignItems:'center'}}>
                             <View style={{width: 45, height: 45, borderRadius: 45, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.1)'}}>
                                 <FontAwesome5 name="photo-video" size={18} color="rgba(0,0,0,0.8)"  />
                            </View>
                            <Text style={{marginTop: 10}}>Recents</Text>
                    </Pressable>
                    <Pressable onPress={()=> {fetchPhotosOnly(); setShowAllMediaDirectories(false)}} style={{alignItems:'center'}}>
                          <View style={{width: 45, height: 45, borderRadius: 45, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.1)', marginHorizontal: 20}}>
                                 <FontAwesome name="photo" size={20} color="rgba(0,0,0,0.8)"/>
                            </View>
                            <Text style={{marginTop: 10}}>Photos</Text>
                    </Pressable>
                    <Pressable onPress={()=> {fetchVideosOnly(); setShowAllMediaDirectories(false)}} style={{alignItems:'center'}}>
                             <View style={{width: 45, height: 45, borderRadius: 45, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.1)'}}>
                                  <Feather name="play-circle" size={22} color="rgba(0,0,0,0.8)"  />  
                            </View>
                            <Text style={{marginTop: 10}}>Videos</Text>
                    </Pressable>
                 </View>

                 <View>
                      <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 20}}>
                        <Text style={{color:'silver', fontSize: 16}}>Albums</Text>
                        <Text onPress={()=> setShowMediaVertical(true)} style={{fontSize: 16}}>See all</Text>
                      </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                  
                      <View style={{width: 1700, flexWrap:'wrap', flexDirection:'row'}}>
                      { completeCategorizedMedia.map((item, index)=> {
                         return(
                            <Pressable onPress={()=>{processCategorizedMedia(item)}} key={index == 0 || index == 1 || index == 2? item.id : item.data[0].id} style={{justifyContent:'center', alignItems:'center', width: 100, marginLeft: 5, marginBottom: 20}}>
                              <Image source={{uri: item.data[0].uri}} style={{width: 100, height: 100, borderRadius: 5}} resizeMode='cover' />
                              <View style={{marginTop: 5}}>
                                <Text style={{width:'100%', fontSize: 13}}>{truncateString(item.folderName)}</Text>
                                <Text style={{textAlign:'center', color:'gray'}}>{item.data.length}</Text>
                                </View>
                          </Pressable>
                         )
                     }) }
                       </View>
                      </ScrollView> 
                 </View>
                 </> : 
                 <>
                     <GestureFlatList
                        numColumns={2}
                        data={completeCategorizedMedia}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index})=>{
                          return(
                            <Pressable onPress={()=>{processCategorizedMedia(item); setShowMediaVertical(false)}} key={index == 0 || index == 1 || index == 2? item.id : item.data[0].id} style={{justifyContent:'center', alignItems:'center', width: width/2 - 10, padding: 10}}>
                                <Image source={{uri: item.data[0].uri}} style={{width: '100%', height: 180, borderRadius: 5}} resizeMode='cover' />
                                <View style={{marginTop: 5}}>
                                  <Text style={{width:'100%', fontSize: 13}}>{truncateString(item.folderName)}</Text>
                                  <Text style={{textAlign:'center', color:'gray'}}>{item.data.length}</Text>
                                  </View>
                          </Pressable>
                          )
                        }}
                     />  
                 </>}
              </BottomSheetView>
            </BottomSheet>
  )
}