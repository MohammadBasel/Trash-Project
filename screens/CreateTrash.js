import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Picker, Alert, Platform } from 'react-native';
import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon, CheckBox } from "react-native-elements"
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"
import firebase, { firestore } from 'firebase';
// import * as admin from "firebase-admin";

import {Entypo} from "@expo/vector-icons";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';




export default class CreateTrash extends React.Component {
    static navigationOptions = {
        title: 'Create Trash',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: '#7a66ff', borderWidth: 1, borderBottomColor: 'white' },
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
              <View style={{alignItems: 'center', justifyContent: "center"}}>
               <View style= {{flexDirection: "row"}}>
               <TouchableOpacity style={styles.buttonContainer} onPress={() => {this.onCreatebuttonChange()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Create Trash</Text> 
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonContainer} onPress={() => {this.onUpdatebuttonChange()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%") }}>Update Trash</Text> 
                  </TouchableOpacity>
                </View>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Zone:</Text>
                  <View>
                    <Picker
                        selectedValue={this.state.zone}
                        style={{height: hp("5%"), width: wp("50%"), marginBottom: Platform.OS === "ios" ? hp("8%"): hp("1%")}}
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
                        <View style={{alignItems: "center"}}>
                        <TouchableOpacity style={styles.buttonContainer1}  onPress={() => {this.getZone()}}>
                            <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Zone Select</Text> 
                        </TouchableOpacity>
                        </View>
                       
                </View>
                <View>
                    {this.state.button == true && (
                        <View style={{alignItems: "center"}}>
                            <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Trash:</Text>
                            <Picker
                                selectedValue={this.state.trash}
                                style={{height: hp("5%"), width: wp("50%"), marginBottom: Platform.OS === "ios" ? hp("8%"): hp("1%")}}
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
                            <TouchableOpacity style={styles.buttonContainer1}  onPress={() => {this.getTrash()}}>
                            <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Trash Select</Text> 
                        </TouchableOpacity>
                            
                        </View>
                    )}
                    <View style={{alignItems: "center"}}>
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
                   <TouchableOpacity style={styles.buttonContainer}  onPress={() => {this.Createsubmit()}}>
                   <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>SUBMIT</Text> 
                 </TouchableOpacity>
                   
               ) : (
                 <TouchableOpacity style={styles.buttonContainer}  onPress={() => {this.Updatesubmit()}}>
                   <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>SUBMIT</Text> 
                 </TouchableOpacity>
                  )}
                  </View>
                  
                  
                </View>
              </View>

        );
    }
  }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
    buttonContainer: {
      // marginTop:hp(3),
      height:hp("6%"),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      // marginBottom:hp(3),
      width:wp("20%"),
      borderRadius:10,
      backgroundColor: "#7a66ff",
      padding: wp("3%")
    },
    buttonContainer1: {
        // marginTop:hp(3),
        height:hp("6%"),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom:hp(3),
        width:wp("20%"),
        borderRadius:10,
        backgroundColor: "#7a66ff",
        padding: wp("3%")
      },
});

