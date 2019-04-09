import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Picker, Alert, Platform } from 'react-native';
import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon, CheckBox } from "react-native-elements"
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"
import firebase, { firestore } from 'firebase';
// import * as admin from "firebase-admin";

import {Entypo} from "@expo/vector-icons";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';




export default class CreateShift extends React.Component {
    static navigationOptions = {
        title: 'Create Shift',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: '#7a66ff', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
      shifts: [],
      shift: {},
      shiftId: "",
      startTime: "",
      endTime: "",
      Day: "",
      shiftUsers:[],
      users: [],
      allusers: [],
      search: "",
      checked: [],
      zoneId: "",
      members: [],
      oldmembers: []
    }
    async componentDidMount() {
      let shifts = []
      let users = []
      await db.collection("Shift")
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
              shifts.push({ id: doc.id, ...doc.data() })
              
            })
            this.setState({shifts})
            // console.log("shifts", shifts)
          })
      await db.collection("Users")
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          users.push({ id: doc.id})
          
        })
        this.setState({users})
        // console.log("users", users)
      })
    }

    getShift = async () => {
      let usersAll = [...this.state.users]
      let checked = Array(this.state.users.length).fill(false)
      let shiftUsers = []
      // this.setState(this.state.checked)
      // console.log(checked[2])
      let shiftId = this.state.shiftId
      // console.log("updated shift", this.state.shiftId)
      let shift = {}
      await db.collection("Shift")
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          if(shiftId == doc.id){
            shift = { id: doc.id, ...doc.data() }
            shiftUsers = [...doc.data().Users]
          }
          this.setState({shift})
          this.setState({Day: shift.Day, startTime: shift.Start_Time, endTime:shift.End_Time,shiftUsers: shiftUsers})
          this.userShift()
        })
      })
    }
    userShift = async () => {
      let checked = Array(this.state.users.length).fill(false)
      console.log("all users",this.state.usersAll)
      console.log("all shiftuser",this.state.shiftUsers.length)
      for(let i = 0; i < this.state.users.length; i++){
        console.log("user out of if ",this.state.users[i].id )
        for(let j = 0; j < this.state.shiftUsers.length; j ++){
          if (this.state.users[i].id === this.state.shiftUsers[j]){
                console.log("user in if ",this.state.shiftUsers[j] )
                checked[i] = true
                console.log("this check", checked[i])
          }
        }
      }
      await this.setState({checked})
      // console.log("usersAll", usersAll)
      console.log("shift users", this.state.shiftUsers[2])
      console.log("check", this.state.checked[2])
    }
    press = async (index, id) => {
      console.log("Index of press", index)
      console.log("id of press", id)
      let checked = [...this.state.checked];
      let users = [...this.state.users];
      let shiftUser = []
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
          shiftUser.push(users[j].id)
        }
      }
      // if (exist === true) {
      //   users.splice(place, 1);
      // } else {
      //   users.push(id);
      // }
  
      console.log("the user after splice : ", users);
      await this.setState({ checked, shiftUsers: shiftUser });
    };

	submit = async () =>{
    await db.collection("Shift").doc(this.state.shift.id).update({End_Time: this.state.endTime, Start_Time: this.state.startTime ,Users: this.state.shiftUsers });
    Alert.alert("The user is Updated")
    }
    render() {
      console.log("shift user render", this.state.shiftUsers.length)
        return (
            <ScrollView style={styles.container}>
              <View style={{alignItems: 'center', justifyContent: "center", borderWidth: 0.5}}>
                  <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Shift:</Text>
                  <View>
                      <Picker
                      selectedValue={this.state.shiftId}
                      style={{height: hp("5%"), width: wp("50%")}}
                      selectedValue={this.state.shiftId}
                      onValueChange={(itemValue, itemIndex) =>
                        this.setState({shiftId: itemValue})
                      }>
                    <Picker.Item label="Select" value="" />
                    {this.state.shifts.map((shift, i) => (
                        <Picker.Item key = {i} label={shift.Day} value={shift.id}/>
                    ))
                    }
                </Picker>
                <TouchableOpacity style={styles.buttonContainer}  onPress={() => {this.getShift()}}>
                  <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Shift Select</Text> 
                </TouchableOpacity>
              </View>
                <Text style={{ color: "red" }}>{this.state.erroremail}</Text>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Start Time:</Text>
                <TextInput
                  style={{ paddingTop: 20 }}
                  autoCapitalize="words"
                  placeholder="Enter the Start Time"
                  onChangeText={startTime => this.setState({ startTime })}
                  value={this.state.startTime}
                />
                <Text style={{ color: "red" }}>{this.state.errorstartTime}</Text>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the End Time:</Text>
                <TextInput
                  style={{ paddingTop: 20 }}
                  autoCapitalize="none"
                  placeholder="Enter the End Time"
                  onChangeText={endTime => this.setState({ endTime })}
                  value={this.state.endTime}
                />
                <Text style={{ color: "red" }}>{this.state.errorendTime}</Text>
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
                  <TouchableOpacity style={styles.buttonContainer}  onPress={() => {this.submit()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>SUBMIT</Text> 
                  </TouchableOpacity>
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

