import { View, Text, Image, FlatList } from 'react-native'
import React, { useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native'
import { useFonts } from 'expo-font'
import { Feather } from '@expo/vector-icons'
import UsersFollowing from '../../../assets/users.json'
import LinearGradient from 'react-native-linear-gradient';

export default function Explore(){
 
  useFonts({
    'Pacifico-Regular': require('../../../assets/fonts/Pacifico-Regular.ttf'),
   });
 
  

  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'white'}}>
       <View style={{flex: 1}}>
            <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal: 10}}>
                  <Text style={{fontSize: 30, fontWeight:'500', fontFamily:'Pacifico-Regular'}}>Instagram</Text>
                  <View style={{marginLeft:'auto', flexDirection:'row', alignItems:'center'}}>
                  <Feather name="heart" size={30} color="black" />
                  <Image source={require('../../../assets/images/insta_messenger_icon.png')} style={{marginLeft: 15, width: 43, height: 43}}/>
                  </View>
            </View>
            <View style={{paddingVertical: 10, borderBottomWidth: 0.5, borderColor:'lightgray', }}>
                 <FlatList contentContainerStyle={{gap: 15, paddingHorizontal: 10}} horizontal showsHorizontalScrollIndicator={false} data={UsersFollowing} renderItem={({item, index})=>{
                    if(index == 0){
                      return(
                        <View style={{alignItems:'center'}}>
                          <Image source={require('../../../assets/images/addStoryImg.jpeg')} style={{width: 100, height: 100}}/>
                          <Text>Your story</Text>
                        </View>
                    )
                    }else{
                      if(item.following == 'true'){
                        return(
                          <View style={{alignItems:'center'}}>
                              <LinearGradient
                                  colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={{width: 100, height: 100, borderRadius: 100, justifyContent:'center', alignItems:'center'}}
                                >
                         
                              <View style={{width: 95, height: 95, borderColor: 'white', borderWidth: 5, borderRadius: 95}}>
                                <Image source={{ uri : item.image}} style={{width: 85, height: 85, borderRadius: 85}}/>
                              </View>
                       
                          </LinearGradient>
                          <Text>{item.username}</Text>
                         
                        </View>
                        )
                      }
                      else{
                        return(
                          <View style={{alignItems:'center'}}>
                          <View style={{width: 100, height: 100, borderRadius: 100}}>
                              <View>
                                <Image source={{ uri : item.image}} style={{width: 90, height: 90, borderRadius: 90}}/>
                                <View style={{zIndex: 1, position:'absolute', left: 22, top: 70, width: 45, height: 30, justifyContent:'center', alignItems:'center', backgroundColor:'white', borderRadius: 15, elevation: 3}}>
                                  <Feather name="user-plus" size={18} color="black" />
                                </View>
                              </View>
                             
                          </View>
                          <Text>{item.username}</Text>
                        </View>
                        )
                      }
                    }
                      
                 }}/>
            </View>
       </View>
    </SafeAreaView>
  )
}

