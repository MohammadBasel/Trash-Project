import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Picker, Alert } from 'react-native';
import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon, CheckBox } from "react-native-elements"
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"
import firebase, { firestore } from 'firebase';
// import * as admin from "firebase-admin";

import {Entypo} from "@expo/vector-icons";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';




export default class CreateTrash extends React.Component {
    static navigationOptions = {
        title: 'Admin Dashboard',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: 'blue', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
      zones:[],
      trashs: [],
      trashobj: {},
      button: false,
      zone: "",
      trash: "",
      location: {},
      latitude: "",
      longitude: "",
      errorlat: "",
      errorlong: ""
    }
    componentDidMount() {
      let zones = []
      let users = []
      db.collection("Zone")
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
                zones.push({ id: doc.id })  
            })
            this.setState({zones})
          })
    }
    onUpdatebuttonChange = async () => {
      this.setState({button: true})
    }
    onCreatebuttonChange = async () => {
      this.setState({button: false})
      this.setState({location: {}, latitude: "", longitude: ""})
    }

    getZone = async () => {
      let trashs = this.state.trashs
      console.log("updated zone", this.state.zone)
      
      db.collection(`Zone/${this.state.zone}/Trash`).get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            trashs.push({ id: doc.id, ...doc.data() })  
          })
          this.setState({trashs})
      })
    }
    getTrash = async () => {
        let trashobj = {}
        await db.collection(`Zone/${this.state.zone}/Trash`).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                if(doc.id == this.state.trash){
                    trashobj = { id: doc.id, ...doc.data() }
                }
            })
            this.setState({trashobj, latitude: trashobj.Loc._lat.toString(),longitude: trashobj.Loc._long.toString()})
        })
      }
    Createsubmit = async () => {
        let latitude = parseFloat(this.state.latitude)
        let longitude = parseFloat(this.state.longitude)
        console.log("lat",this.state.latitude)
        console.log("long",this.state.longitude)
        if(this.state.latitude == ""){
            this.setState({errorlat: "Please enter latitude"})
        }else if (this.state.longitude == ""){
            this.setState({errorlat: "", errorlong: "Please enter longitude"})
        }else{
           let GeoPoint = new firebase.firestore.GeoPoint(lat = latitude,long = longitude)
           console.log("geopoint", GeoPoint)
          await db.collection(`Zone/${this.state.zone}/Trash`).add({Battery: 100, Level: 0, Loc: GeoPoint, Status: "Active", Temp: 0})
          Alert.alert("The Trash is created")
        }
       
    }
    Updatesubmit = async () => {
        let latitude = parseFloat(this.state.latitude)
        let longitude = parseFloat(this.state.longitude)
        // let GeoPoint = new admin.firestore.GeoPoint(lat = latitude,long = longitude)
        // await db.collection(`Zone/${this.state.zone}/Trash`).doc(this.state.trash).update({Loc: GeoPoint})
      Alert.alert("The Trash is Updated")
    }
    render() {
      console.log("zone", this.state.zones)
        return (
            <ScrollView style={styles.container}>
              <View style={{alignItems: 'center', justifyContent: "center", borderWidth: 0.5}}>
               <View style= {{flexDirection: "row"}}>
                <Button
                    onPress={() => {this.onCreatebuttonChange()}}
                    title="Create Trash"
                    color="blue"
                  />
                  <Button
                    onPress={() => {this.onUpdatebuttonChange()}}
                    title="Update Trash"
                    color="blue"
                  />
                </View>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Zone:</Text>
                  <View>
                    <Picker
                        selectedValue={this.state.zone}
                        style={{height: hp("5%"), width: wp("50%")}}
                        selectedValue={this.state.zone}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({zone: itemValue})
                        }>
                            <Picker.Item label="Select" value="" />
                            {this.state.zones.map((zone, i) => (
                                <Picker.Item key = {i} label={zone.id} value={zone.id}/>
                            ))
                            }
                        </Picker>
                        <Button
                        onPress={() => {this.getZone()}}
                        title="Zone Selected"
                        color="blue"
                        />
                </View>
                <View>
                    {this.state.button == true && (
                        <View>
                            <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Trash:</Text>
                            <Picker
                                selectedValue={this.state.trash}
                                style={{height: hp("5%"), width: wp("50%")}}
                                selectedValue={this.state.trash}
                                onValueChange={(itemValue, itemIndex) =>
                                this.setState({trash: itemValue})
                                }>
                                <Picker.Item label="Select" value="" />
                                {this.state.trashs.map((trash,i) => (
                                    <Picker.Item key = {i} label={trash.id} value={trash.id}/>
                                )) 
                                }
                            </Picker>
                            <Button
                                onPress={() => {this.getTrash()}}
                                title="Trash Selected"
                                color="blue"
                            />
                            
                        </View>
                    )}
                    <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Latitude:</Text>
                  <TextInput
                    style={{ paddingTop: 20 }}
                    autoCapitalize="none"
                    placeholder="Enter the Latitude"
                    onChangeText={latitude => this.setState({ latitude })}
                    value={this.state.latitude}
                  />
                  <Text style={{ color: "red" }}>{this.state.errorlat}</Text>
                  <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Longitude:</Text>
                  <TextInput
                    style={{ paddingTop: 20 }}
                    autoCapitalize="none"
                    placeholder="Enter the Longitude"
                    onChangeText={longitude => this.setState({ longitude })}
                    value={this.state.longitude}
                  />
                  <Text style={{ color: "red" }}>{this.state.errorlong}</Text>
                  {this.state.button == false ? (
                    <Button
                    onPress={() => {this.Createsubmit()}}
                    title="SUBMIT"
                    color="blue"
                  />
                  ):(
                    <Button
                    onPress={() => {this.Updatesubmit()}}
                    title="SUBMIT"
                    color="blue"
                  />
                  )}
                  
                </View>
              </View>

            </ScrollView>
        );
    }
  }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
});
