import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Picker, Alert } from 'react-native';
import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon } from "react-native-elements"
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"
import firebase, { firestore } from 'firebase';
// import * as admin from "firebase-admin";

import {Entypo} from "@expo/vector-icons";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';




export default class CreateUser extends React.Component {
    static navigationOptions = {
        title: 'Create User',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: '#7a66ff', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
    email: "",
    name: "",
    phone: "",
    role: "Employee",
    zone: "",
    shifts: [],
    zones: [],
    shiftsarray: [],
    location: [],
    error: "",
    erroremail: "",
    errorname: "",
    errorphone: "",
    button: false,
    users: [],
    user: {}
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

	createUser = async () =>{
    if(this.state.email == ""){
      this.setState({erroremail: "Please enter the Email"})
    }else if(this.state.name == ""){
      this.setState({erroremail: ""})
      this.setState({errorname: "Please enter the Name"})
    }else if(this.state.phone == ""){
      this.setState({errorname: ""})
      this.setState({errorphone: "Please enter the Phone"})
    }else if(this.state.zone != ""){
      this.setState({errorphone: ""})
        try{
            await firebase.auth().createUserWithEmailAndPassword(this.state.email, "12pass") 
            await db.collection('Users').doc(this.state.email).set({
                Avatar: "default.png",
                Name: this.state.name,
                Online: false,
                Phone: this.state.phone,
                Points: 0,
                Role: this.state.role,
                // Shifts: this.state.shifts,
                Status: "available",
                Zone: this.state.zone
              })
              Alert.alert("The user is create")
          }
            catch(error){
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // ...
              // console.log("it's getting here ")
               console.log("Error message1 ", errorMessage)
              // console.log("Error message", errorCode)
              if(errorCode == "auth/email-already-in-use"){
                  Alert.alert("The user already exist.")
              }
            }
          }else if(this.state.zone == ""){
            this.setState({error: "Please enter the Zone"})
          }
    }
    onUpdatebuttonChange = async () => {
      this.setState({button: true})
    }
    onCreatebuttonChange = async () => {
      this.setState({button: false})
      this.setState({email: "", phone: "", name: "", zone: "", role: "Employee"})
    }
    getUser = async () => {
      let email = this.state.email
      console.log("updated email", this.state.email)
      let user = {}
      // await this.setState({email})
      await db.collection("Users")
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          if(email == doc.id){
            user = { id: doc.id, ...doc.data() }
          }
          this.setState({user})
          this.setState({email, phone: user.Phone, name: user.Name,role: user.Role, zone: user.Zone})
        })
      })
    }
    updateUser = async () => {
      await db.collection("Users").doc(this.state.email).update({Phone: this.state.phone, Name: this.state.name,Role: this.state.role, Zone: this.state.zone });
      Alert.alert("The user is Updated")
    }
    render() {
        return (
            <ScrollView style={styles.container}>
              <View style={{alignItems: 'center', justifyContent: "center", alignItems: "center"}}>
              <View style= {{flexDirection: "row", justifyContent: 'space-between', flexWrap: "wrap", alignItems: "center"}}>

                  <TouchableOpacity style={styles.buttonContainer} onPress={() => {this.onCreatebuttonChange()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Create User</Text> 
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonContainer} onPress={() => {this.onUpdatebuttonChange()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%") }}>Update User</Text> 
                  </TouchableOpacity>
                </View>
                  <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Email:</Text>
                  {this.state.button == false ? (
                  <TextInput
                  style={{ paddingTop: 20 }}
                  autoCapitalize="none"
                  placeholder="Enter the Email"
                  onChangeText={email => this.setState({ email })}
                  value={this.state.email}
                />
                ):
                (
                  <View>
                    <Picker
                    selectedValue={this.state.user}
                    style={{height: hp("5%"), width: wp("50%")}}
                    selectedValue={this.state.email}
                    onValueChange={(itemValue, itemIndex) =>
                      this.setState({email: itemValue})
                    }>
                      <Picker.Item label="Select" value="" />
                      {this.state.users.map((user, i) => (
                          <Picker.Item key = {i} label={user.id} value={user.id}/>
                      ))
                      }
                  </Picker>
                  <Button
                    onPress={() => {this.getUser()}}
                    title="User Selected"
                    color="blue"
                  />
              </View>
                )}
                <Text style={{ color: "red" }}>{this.state.erroremail}</Text>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Name:</Text>
                <TextInput
                  style={{ paddingTop: 20 }}
                  autoCapitalize="words"
                  placeholder="Enter the Name"
                  onChangeText={name => this.setState({ name })}
                  value={this.state.name}
                />
                <Text style={{ color: "red" }}>{this.state.errorname}</Text>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Enter the Phone:</Text>
                <TextInput
                  style={{ paddingTop: 20 }}
                  autoCapitalize="none"
                  placeholder="Enter the Phone"
                  onChangeText={phone => this.setState({ phone })}
                  value={this.state.phone}
                />
                <Text style={{ color: "red" }}>{this.state.errorphone}</Text>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Choose the Role:</Text>
                <Picker
                  selectedValue={this.state.role}
                  style={{height: hp("5%"), width: wp("50%")}}
                  selectedValue={this.state.role}
                  onValueChange={(itemValue, itemIndex) =>(
                    console.log("role", itemValue),
                    this.setState({role: itemValue}))
                  }>
                  <Picker.Item label="Employee" value="Employee" />
                  <Picker.Item label="Supervisor" value="Supervisor" />
                  <Picker.Item label="Maintenance" value="Maintenance" />
                </Picker>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Choose the Role:</Text>
                <Picker
                  selectedValue={this.state.zone}
                  style={{height: hp("5%"), width: wp("50%")}}
                  selectedValue={this.state.zone}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({zone: itemValue})
                  }>
                    <Picker.Item label="Select" value="" />
                    {this.state.zones.map((zone, i) => (
                        <Picker.Item label={zone.id} value={zone.id}/>
                    ))
                    }
                </Picker>
                <Text style={{ color: "red" }}>{this.state.error}</Text>
                {this.state.button == false ? (
                  <TouchableOpacity style={styles.buttonContainer}  onPress={() => {this.createUser()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>SUBMIT</Text> 
                  </TouchableOpacity>
                    
                ) : (
                  <TouchableOpacity style={styles.buttonContainer}  onPress={() => {this.updateUser()}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>SUBMIT</Text> 
                  </TouchableOpacity>
                )}
                 
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

