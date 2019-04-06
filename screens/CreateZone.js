import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Picker, Alert } from 'react-native';
import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon, CheckBox } from "react-native-elements"
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"
import firebase, { firestore } from 'firebase';
// import * as admin from "firebase-admin";

import {Entypo} from "@expo/vector-icons";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';




export default class CreateZone extends React.Component {
    static navigationOptions = {
        title: 'Admin Dashboard',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: 'blue', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
      zones:[],
      users:[],
      button: false,
      createTrash: false,
      createTruck: false,
      zone: "",
      coordinates: [],
      zoneUsers: [],
      latitude: "",
      longitude: "",
      checked: []


    }
    componentDidMount() {
      let zones = []
      let users = []
      db.collection("Zone")
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
                zones.push({ id: doc.id, ...doc.data() })  
            })
            this.setState({zones})
          })
          db.collection("Users")
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
                users.push({ id: doc.id,  ...doc.data()})
              
            })
            this.setState({users})
          })
    }
    onUpdatebuttonChange = async () => {
      this.setState({button: true})
    }
    onCreatebuttonChange = async () => {
      this.setState({button: false})
      this.setState({email: "", phone: "", name: "", zone: "", role: "Employee"})
    }

    getZone = async () => {
      let zone = this.state.zone
      console.log("updated zone", this.state.zone)
      let zoneobj = {}
      // await this.setState({email})
      await db.collection("Zone")
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          if(zone == doc.id){
            zoneobj = { id: doc.id, ...doc.data() }
          }
          this.setState({zoneobj})
          this.setState({ coordinates: zoneobj.Coordinate, zoneUsers: zoneobj.Users})
          this.userZone()
        })
      })
    }
    addCoordinate = async () => {
      let coordinates = [...this.state.coordinates]
      let GeoPoint = new admin.firestore.GeoPoint(lat = this.state.latitude, long = this.state.longitude)
      coordinates.push(GeoPoint)
      await this.setState({coordinates}) 
    }

    userZone = async () => {
      let checked = Array(this.state.users.length).fill(false)
      console.log("all users",this.state.usersAll)
      console.log("all zoneUsers",this.state.zoneUsers.length)
      for(let i = 0; i < this.state.users.length; i++){
        console.log("user out of if ",this.state.users[i].id )
        for(let j = 0; j < this.state.zoneUsers.length; j ++){
          if (this.state.users[i].id === this.state.zoneUsers[j]){
                console.log("user in if ",this.state.zoneUsers[j] )
                checked[i] = true
                console.log("this check", checked[i])
          }
        }
      }
      await this.setState({checked})
      // console.log("usersAll", usersAll)
      console.log("zoneUsers ", this.state.zoneUsers[2])
      console.log("check", this.state.checked[2])
    }
    press = async (index, id) => {
      console.log("Index of press", index)
      console.log("id of press", id)
      let checked = [...this.state.checked];
      let users = [...this.state.users];
      let zoneUsers = []
      let exist = false;
      let place = 0;
      console.log("the check before splice : ", checked);
      checked.splice(index, 1, !checked[index]);
      console.log("the check after splice : ", checked);
      for (let i = 0; i < users.length; i++) {
        if (users[i] === id) {
          exist = true;
          place = i;
        }
      }
      for (let j = 0; j < checked.length; j ++){
        if (checked[j] == true){
          zoneUsers.push(users[j].id)
        }
      }
      // if (exist === true) {
      //   users.splice(place, 1);
      // } else {
      //   users.push(id);
      // }
  
      console.log("the user after splice : ", users);
      await this.setState({ checked, zoneUsers: zoneUsers });
    };
    Updatesubmit = async () => {
      // await db.collection("Zone").doc(this.state.zone).update({Coordinate: , Users: this.state.zoneUsers });
      Alert.alert("The Zone is Updated")
    }
    Createsubmit = async () => {
      // await db.collection("Zone").add({Coordinate: , Users: this.state.zoneUsers });
      Alert.alert("The Zone is Created")
    }
    
    render() {
      console.log("zone", this.state.coordinates)
        return (
            <ScrollView style={styles.container}>
              <View style={{alignItems: 'center', justifyContent: "center", borderWidth: 0.5}}>
              <View style= {{flexDirection: "row"}}>
                <Button
                    onPress={() => {this.onCreatebuttonChange()}}
                    title="Create Zone"
                    color="blue"
                  />
                  <Button
                    onPress={() => {this.onUpdatebuttonChange()}}
                    title="Update Zone"
                    color="blue"
                  />
                </View>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Zone:</Text>
                  {this.state.button == false ? (
                    <View>
                      <TextInput
                      style={{ paddingTop: 20 }}
                      autoCapitalize="none"
                      placeholder="Enter the Zone"
                      onChangeText={zone => this.setState({ zone })}
                      value={this.state.zone}
                    />
                    <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Latitude:</Text>
                    <TextInput
                      style={{ paddingTop: 20 }}
                      autoCapitalize="none"
                      placeholder="Enter the Latitude"
                      onChangeText={zone => this.setState({ latitude })}
                      value={this.state.latitude}
                    />
                    <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Longitude:</Text>
                    <TextInput
                      style={{ paddingTop: 20 }}
                      autoCapitalize="none"
                      placeholder="Enter the Longitude"
                      onChangeText={zone => this.setState({ longitude })}
                      value={this.state.longitude}
                    />
                    <Button
                      onPress={() => {this.addCoordinate()}}
                      title="Add Coordinate"
                      color="blue"
                    />
                  </View>
                ):
                (
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
                )}
                <View>
                  {/* <View style= {{flexDirection: "row"}}> */}
                    {this.state.coordinates.map((coordinate, i) => 
                      <View style={{flexDirection: "column"}}>
                        <View style={{flexDirection: "row"}}>
                          <TextInput
                            style={{ paddingTop: 20 }}
                            autoCapitalize="none"
                            placeholder="Enter the Latitude"
                            value={coordinate._lat.toString()}
                            // onChangeText={zone => this.setState({ zone })}
                          />
                          <TextInput
                            style={{ paddingTop: 20 }}
                            autoCapitalize="none"
                            placeholder="Enter the Longitude"
                            value={coordinate._long.toString()}
                          />
                          <Button
                            onPress={() => {this.editCoordinate()}}
                            title="Edit"
                            color="blue"
                          />
                        </View>
                      </View>
                    )}
                  
                  {/* </View> */}
                </View>
                
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Choose the Users:</Text>
                  <View>
                    {this.state.users.map(user => 
                      <CheckBox
                        title={user.id}
                        onPress={() =>
                          this.press(this.state.users.indexOf(user), user.id)
                        }
                        checked={this.state.checked[this.state.users.indexOf(user)]}
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

