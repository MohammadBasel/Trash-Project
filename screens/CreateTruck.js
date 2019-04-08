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
        title: 'Create Truck',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: '#7a66ff', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
      zones:[],
      users: [],
      trucks: [],
      truckobj: {},
      button: false,
      zone: "",
      truck: "",
      crew: [],
      checked: []
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
    }

    getZone = async () => {
      let trucks = this.state.trucks      
      db.collection(`Zone/${this.state.zone}/Truck`).get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            trucks.push({ id: doc.id, ...doc.data() })  
          })
          this.setState({trucks})
      })
    }
    getTruck = async () => {
        let truckobj = {}
        await db.collection(`Zone/${this.state.zone}/Truck`).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                if(doc.id == this.state.truck){
                    truckobj = { id: doc.id, ...doc.data() }
                    console.log("one truck",truckobj )
                }
            })
            this.setState({truckobj, crew: truckobj.Crew})
            this.userTruck()
        })
      }

      userTruck = async () => {
        let checked = Array(this.state.users.length).fill(false)
        // console.log("all users",this.state.users)
        console.log("all crew",this.state.crew)
        for(let i = 0; i < this.state.users.length; i++){
          console.log("user out of if ",this.state.users[i].id )
          for(let j = 0; j < this.state.crew.length; j ++){
            if (this.state.users[i].id === this.state.crew[j]){
                  console.log("user in if ",this.state.crew[j] )
                  checked[i] = true
                  console.log("this check", checked[i])
            }
          }
        }
        await this.setState({checked})
        // console.log("usersAll", usersAll)
        console.log("zoneUsers ", this.state.crew[2])
        console.log("check", this.state.checked[2])
      }
      press = async (index, id) => {
        console.log("Index of press", index)
        console.log("id of press", id)
        let checked = [...this.state.checked];
        let users = [...this.state.users];
        let crew = []
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
            crew.push(users[j].id)
          }
        }
        // if (exist === true) {
        //   users.splice(place, 1);
        // } else {
        //   users.push(id);
        // }
    
        console.log("the user after splice : ", users);
        await this.setState({ checked, crew: crew });
      };
    Createsubmit = async () => {
      let GeoPoint = new new firebase.firestore.GeoPoint(lat = 25.286106,long = 51.534817)
      await db.collection(`Zone/${this.state.zone}/Truck`).add({Crew: crew, Distance: 0, Fuel_con: 0, Loc: GeoPoint})
      Alert.alert("The Truck is created")
    }
    Updatesubmit = async () => {
      await db.collection(`Zone/${this.state.zone}/Truck`).doc(this.state.truck).update({Crew: this.state.crew})
      Alert.alert("The Truck is Updated")
    }
    render() {
      console.log("zone", this.state.zones)
        return (
            <ScrollView style={styles.container}>
              <View style={{alignItems: 'center', justifyContent: "center", borderWidth: 0.5}}>
               <View style= {{flexDirection: "row"}}>
                  <TouchableOpacity style={styles.buttonContainer} onPress={() => {this.onCreatebuttonChange()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Create User</Text> 
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonContainer} onPress={() => {this.onUpdatebuttonChange()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%") }}>Update User</Text> 
                  </TouchableOpacity>
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
                            <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Truck:</Text>
                            <Picker
                                selectedValue={this.state.truck}
                                style={{height: hp("5%"), width: wp("50%")}}
                                selectedValue={this.state.truck}
                                onValueChange={(itemValue, itemIndex) =>
                                this.setState({truck: itemValue})
                                }>
                                <Picker.Item label="Select" value="" />
                                {this.state.trucks.map((truck,i) => (
                                    <Picker.Item key = {i} label={truck.id} value={truck.id}/>
                                )) 
                                }
                            </Picker>
                            <Button
                                onPress={() => {this.getTruck()}}
                                title="Truck Selected"
                                color="blue"
                            />
                            
                        </View>
                    )}
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
    buttonContainer: {
      // marginTop:hp(3),
      height:hp("5%"),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      // marginBottom:hp(3),
      width:wp("15%"),
      borderRadius:10,
      backgroundColor: "#7a66ff",
      padding: wp("3%")
    },
});

