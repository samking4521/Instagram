import { View, Text, Image, useWindowDimensions, Pressable, Platform, StyleSheet, ViewToken} from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {Ionicons, Feather, Entypo } from '@expo/vector-icons'
import { FlatList, TextInput } from 'react-native-gesture-handler';
import IosFonts from '../../assets/iosFonts.json'
import AndroidFonts from '../../assets/androidFonts.json'
import VerticalSlider from 'react-native-vertical-slider-component'
import { fontColors } from '../../assets/fontColors'

type TextEdit = {
    fontSize?: number,
    textBackgroundColor?: string, 
    onlyTextColor?: string,
    fontFamily?: string,
    overlayText?: string,
    onlyTextColorPlaceholder?: string,
    alignTextVal?: string,
    uri?: string
   }

const EditTextModal = ({exitEditScreen, 
  setFontSize, 
  setSelectorState, 
  setCurrentItem, 
  setEditTextData, 
  alignTextVal, 
  setAlignTextVal, 
  overlayText, 
  setOverlayText, 
  selectorState, 
  currentItem, 
  editTextData, 
  textBackgroundColor, 
  fontSize, 
  onlyTextColor, 
  onlyTextColorPlaceholder, 
  setOnlyTextColor, 
  setOnlyTextColorPlaceholder, 
  setTextBackgroundColor}
  
  : 
  {
    alignTextVal: string, 
    setAlignTextVal: React.Dispatch<React.SetStateAction<string>>, 
    exitEditScreen: () => void, fontSize: number, textBackgroundColor: string, 
    onlyTextColor: string, 
    currentItem: ViewToken, 
    onlyTextColorPlaceholder: string,  
    setOnlyTextColor: React.Dispatch<React.SetStateAction<string | null>>, 
    selectorState: string, 
    setOnlyTextColorPlaceholder: React.Dispatch<React.SetStateAction<string | null>>, 
    setSelectorState: React.Dispatch<React.SetStateAction<string>>, 
    setTextBackgroundColor:  React.Dispatch<React.SetStateAction<string | null>>, 
    setFontSize:  React.Dispatch<React.SetStateAction<number>>,  
    setCurrentItem: React.Dispatch<React.SetStateAction<ViewToken>>, 
    editTextData: TextEdit[], 
    setEditTextData: React.Dispatch<React.SetStateAction<TextEdit[]>>, 
    overlayText: string, 
  setOverlayText: React.Dispatch<React.SetStateAction<string>> }) => {
            const { width, height } = useWindowDimensions()
            const flatlistRef = useRef<FlatList>(null)
            
           // Define the viewability configuration
             const viewabilityConfig = useRef({
               itemVisiblePercentThreshold: 50, // Item is considered visible if at least 50% of it is visible
             }).current;
           
           
             // Callback function to handle viewable items change
               const onViewableItemsChanged = useCallback(({ viewableItems, changed } : {viewableItems: ViewToken[], changed: ViewToken[]}) => {
                 if(selectorState == 'font'){
                   setCurrentItem(viewableItems[0])
                 }
               }, []);
           

            const addTextToMedia = ()=>{
                if(overlayText.length >= 1){
                    setEditTextData((prev)=> [...prev, { fontSize: fontSize,
                        textBackgroundColor: textBackgroundColor ?? '', 
                        onlyTextColor: onlyTextColor ?? '',
                        fontFamily: currentItem?.item.fontFamily ?? '',
                        overlayText: overlayText,
                        onlyTextColorPlaceholder: onlyTextColorPlaceholder ?? '',
                        alignTextVal: alignTextVal} ])
                        exitEditScreen()
                }else{
                    setEditTextData([...editTextData])
                    exitEditScreen()
                }
            }

            const updateFontSize = (val: number)=>{
                setFontSize(val)
        }

        const scrollToIndex = (index: number)=>{
            flatlistRef.current?.scrollToIndex({
              index,
              animated: true,
            });
          }
        
        
          const alignTextValues = ()=>{
            if(alignTextVal == 'center'){
                setAlignTextVal('left')
            }else if(alignTextVal == 'left'){
              setAlignTextVal('right')
            }else{
              setAlignTextVal('center')
            }
          }
          
          const changeTextColor = ()=>{
             if(onlyTextColor){
                  setTextBackgroundColor('black')
                  setOnlyTextColor(null)
             }else{
              if(onlyTextColorPlaceholder){
                  setOnlyTextColor(onlyTextColorPlaceholder)
                  setTextBackgroundColor(null)
              }else{
                  setOnlyTextColor('white')
                  setTextBackgroundColor(null)
              }
              
               
             }
          }
        
          const updateColor = (color: string)=>{
              if(onlyTextColor){
                 setOnlyTextColor(color)
                 setOnlyTextColorPlaceholder(color)
              }else{
                setTextBackgroundColor(color)
              }
          }

  return (
    <View style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.3)'}}>
    <Text onPress={addTextToMedia} style={{alignSelf:'flex-end', fontSize: 18, color:'white', fontWeight:'800', letterSpacing:0.3, marginRight: 10, marginTop: 10}}>Done</Text>
    <View style={{ alignItems:'center', flexDirection:'row', marginTop: '10%', paddingLeft: 10}} pointerEvents='box-none'>
    <VerticalSlider
       value={fontSize}
       disabled={false}
       min={14}
       max={40}
       onChange={(value: number) => {
         updateFontSize(value)
       }}
      
       width={5}
       height={35/100 * height}
       step={1}
       borderRadius={5}
       minimumTrackTintColor={"#4C4C4C"}
       maximumTrackTintColor={"white"}
       showBallIndicator
       ballIndicatorColor={"gray"}
       ballIndicatorTextColor={"white"}
 />
 <View style={{flexDirection:'row', flex: 1, marginHorizontal: 10, justifyContent: alignTextVal == 'center'? 'center' : alignTextVal == 'left'? 'flex-start' : 'flex-end' }}>
 <TextInput multiline={true} autoFocus={true} value={overlayText} cursorColor={'white'} onChangeText={setOverlayText} style={{ padding: 20, height:'auto', textAlign:'center', color: onlyTextColor? onlyTextColor : onlyTextColorPlaceholder? onlyTextColorPlaceholder : 'white', fontFamily: currentItem?.item?.fontFamily? currentItem?.item?.fontFamily : 'serif', fontSize: fontSize, fontWeight:'800', backgroundColor: textBackgroundColor? textBackgroundColor : undefined }}/>
 </View>

    </View>
    <View style={{marginTop:'auto'}}>
        <FlatList 
        keyboardShouldPersistTaps='always'
        ref={flatlistRef}
        style={{width: width}}
         horizontal
         showsHorizontalScrollIndicator={false}
         contentContainerStyle={{ gap: 10, paddingRight: selectorState == 'font'? '80%' : '10%'}}
         data={ selectorState == 'font'? Platform.OS == 'android'? AndroidFonts : IosFonts : fontColors}
         onViewableItemsChanged={onViewableItemsChanged}
         viewabilityConfig={viewabilityConfig}
         renderItem={({item, index})=>{
           if(selectorState == 'font'){
             return(
               <Pressable onPress={()=> scrollToIndex(index)} style={{borderColor: 'rgba(255,255,255, 0.5)', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: currentItem?.index == index? 'white' : 'rgba(0,0,0,0.4)'}}>
                   <Text style={{fontSize: 16, letterSpacing: 0.5, color: currentItem?.index == index? 'black' : 'white', fontWeight: currentItem?.index == index? '700' : undefined , fontFamily: item.fontFamily}}>{item.fontFamily}</Text>
               </Pressable>
           )
           }else{
             return(
               <Pressable onPress={()=>{scrollToIndex(index); updateColor(item)}} style={{ backgroundColor: item, width: 30, height: 30, borderRadius: 8, borderWidth: 1.5, borderColor:'white'}}>
                   
               </Pressable>
           )
           }
           
        }}/> 
        
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'rgba(0,0,0,0.5)', padding: 15, borderRadius: 10, alignSelf:'center', marginVertical: 10}}>
            <Pressable onPress={()=> setSelectorState('font')} style={{width: 60, height: 40, borderRadius: 10, backgroundColor: selectorState == 'font'? 'rgba(255,255,255,0.2)' : undefined, justifyContent:'center', alignItems:'center'}}>
                <Ionicons name="text" size={25} color="white" />
            </Pressable>
            <Pressable onPress={()=> setSelectorState('color')}  style={{width: 60, height: 40, borderRadius: 10, justifyContent:'center', alignItems:'center', backgroundColor: selectorState == 'color'? 'rgba(255,255,255,0.2)' : undefined}}>
                <Image source={require('../../assets/images/colorPalette.jpeg')} style={{width: 30, height: 30, borderRadius: 30}}/>
            </Pressable>
            <Pressable onPress={alignTextValues} style={{width: 60, height: 40, borderRadius: 10, justifyContent:'center', alignItems:'center'}}>
                <Feather name={alignTextVal == 'center'? "align-center" : alignTextVal == 'left'? "align-left" : "align-right"} size={24} color="white" />
            </Pressable>
            <Pressable onPress={changeTextColor}  style={{flexDirection:'row', borderWidth: 2, borderColor:'white', width: 40, height: 35, borderRadius: 10, justifyContent:'center', alignItems:'center', backgroundColor: textBackgroundColor? 'white' : undefined}}>
                   <Text style={{fontSize: 18, color: textBackgroundColor? 'black' : 'white'}}>A</Text>
                   <Entypo name="star" size={12} color={textBackgroundColor? 'black' : 'white'}/>
            </Pressable>
            
        </View>
    </View>
</View>
  )
}


export default EditTextModal