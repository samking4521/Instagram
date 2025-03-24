import { View, Text } from 'react-native'
import React from 'react'
import { Image } from 'react-native'

export default function Profile(){
  return (
    <View style={{flex: 1, backgroundColor:'white', padding: 20}}>
       <View style={{marginTop: 40}}>
         <Text style={{fontSize: 11, textAlign:'center', color:'black', fontWeight:'800'}}>GTEFINANCIAL TA BA AREA LIBERIAN COM ASSC 138</Text>
          <Text style={{fontSize: 10, textAlign:'center', fontWeight:'600'}}>5700 N Suncoast</Text>
          <Text style={{fontSize: 10, textAlign:'center', fontWeight:'600'}}>blvd crystal river FL 34428</Text>
       </View>
      <View style={{marginTop: 10, flexDirection:"row", alignItems:'center', justifyContent:'space-between'}}>
          <View>
              <Text style={{fontSize: 9, color:'black', fontWeight:'700'}}>BROCK MERLE JONATHAN MERLE DISCOVER BANK</Text>
              <Text style={{fontSize: 9, color:'black', fontWeight:'600'}}>60 E 42nd</Text>
              <Text style={{fontSize: 9, color:'black', fontWeight:'600'}}>St #1427, New York, NY 10165</Text>
          </View>
          <Text style={{fontSize: 9, color:'black', fontWeight:'700'}}>March 19, 2025</Text>
      </View>

      <View style={{marginTop: 20}}>
          <Text  style={{fontSize: 10, textAlign:'center', color:'black', fontWeight:'700'}}>LETTER OF DEPOSIT FOR BROCK JONATHAN MERLE</Text>
      </View>

      <View>
        <Text style={{fontSize: 9, color:'black', fontWeight:'600', marginTop: 10}}>To whom it may concern,</Text>
        <Text style={{fontSize: 9, color:'black', fontWeight:'500', marginVertical: 10, lineHeight: 11}}>Please take receipt of this letter as your permission to proceeed with the payment of a check in the sum of $4000.32 (Four Thousand and 32/100) payable to the Account ending in <Text style={{fontWeight: '900'}}>****</Text>6469 in Clyde Boozer</Text>
        <Text style={{fontSize: 9, color:'black', fontWeight:'500', lineHeight: 11}}>I acknowledge that is my duty to see to the swift remittance of direct deposit. To that effect, please find attached copy of the check from our Account Payable with Key Bank account ending in <Text style={{fontWeight: '900'}}>****</Text>0703</Text>
        <Text style={{fontSize: 9, color:'black', fontWeight:'500'}}>Thank you in advance for your cooperation.</Text>
      </View>

      <View>
          <Image source={require('../../../assets/images/mm.png')} style={{width: 70, height: 50, marginLeft: 30}}/>
          <Text style={{fontSize: 9, color:'black', fontWeight:'700'}}>GTEFINANCIAL TA BA AREA LIBERIAN COM ASSC 138</Text>
      </View>
       
    </View>
  )
}

