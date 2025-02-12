import { View, Text, Modal, Image, useWindowDimensions, Pressable } from 'react-native'
import React, { useState } from 'react'
import { AntDesign, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import Video from 'react-native-video'

type Assets = {
    id: number,
    mediaType: string,
    duration?: number,
    uri: string 
}

export default function EditSingleMedia({editModal, setShowEditModal, selectedItem} : {editModal: boolean, setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>, selectedItem: Assets}){
   const { width, height } = useWindowDimensions()
   const [muteVideo, setMuteVideo] = useState(false)
    
  return (
      <Modal visible={editModal} onRequestClose={()=>{setShowEditModal(false)}} presentationStyle='overFullScreen' animationType='slide'>
            <View style={{flex: 1, backgroundColor:'white'}}>
                        <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal: 20, justifyContent:'space-between', paddingVertical: 15}}>
                                <AntDesign onPress={()=> setShowEditModal(false)} name="close" size={30} color="black" />
                                { selectedItem.mediaType == 'video' && <Octicons onPress={()=> setMuteVideo(!muteVideo)} name={muteVideo? "mute" : "unmute"} size={28} color="black" />}
                        </View>
                        <View style={{flex: 1, marginTop: '20%'}}>
                             {
                                selectedItem.mediaType == 'photo'? 
                                <Image source={{uri: selectedItem.uri}} style={{width: width, height: 50/100 * height, borderRadius: 20}} resizeMode='cover'/> :
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
                             <View style={{marginTop:'auto', padding: 20}}>
                             <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                                    <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="musical-notes-outline" size={25} color="black" />
                                    </View>

                                    {selectedItem.mediaType == 'photo' && <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="text" size={25} color="black" />
                                    </View> }

                                    {selectedItem.mediaType == 'photo' && <View style={{width: 60, height: 40, borderRadius: 10, backgroundColor: 'rgba(192,192,192,0.3)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="images-outline" size={25} color="black" />
                                    </View> }

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
      </Modal>
  )
}