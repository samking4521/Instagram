import { View, Text, useWindowDimensions } from 'react-native'
import React from 'react'

export default function ReelCaptureLibrary(){
    const { width, height} = useWindowDimensions()
  return (
    <View style={{flex: 1, justifyContent:"center", alignItems:'center', backgroundColor:'pink', width: width, height: height}}>
          <Text>reelCaptureLibrary</Text>
        </View>
  )
}

