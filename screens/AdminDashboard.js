import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon } from "react-native-elements"
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"
// import * as admin from "firebase-admin";

import {Entypo, Ionicons, MaterialIcons} from "@expo/vector-icons";




export default class AdminDashboard extends React.Component {
    static navigationOptions = {
        title: 'Admin Dashboard',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: 'blue', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
    email: "",
    password:"",
	name: "",
	phone: "",
	role: "",
	shifts: [],
	zone: "",
	shiftsarray: [],
	location: [],
	crew: [],
	truckLocation: [],
	coordinate: [],
	zoneusers: "",
	shiftDay: "",
	shiftend: "",
	shiftstart: "",
	shiftUsers: [],
	ShiftId: "",
	user:""
    }
    componentDidMount() {}

	createUser = async () =>{
        try{
            await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password) 
            await db.collection('Users').doc(this.state.email).set({
                Avatar: "Bot.png",
                Name: this.state.name,
                Online: false,
                Phone: this.state.phone,
                Points: 0,
                Role: this.state.role,
                Shifts: this.state.shifts,
                Status: "available",
                Zone: this.state.zone
              })
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
    }

// 	createZone = async () =>{
//         new admin.firestore.GeoPoint(
//             lat,
//             long
//           )
//         let corr = []

//       let newZone = await db.collection('Zone').doc().add({})
//       db.collection("Zone/newZone.id").collection()
//         db.collection("Truck").set({
//             Crew: this.state.crew,
//             Distance: 0,
//             Fuel_con: 0,
//             Location: this.state.truckLocation
                    
//         }),
//         Coordinate: this.state.coordinate,
//         User: this.state.zoneusers
//         })
//     }

// 	createShift = async () =>{
// 	  db.collection('Shift').set({
// 		Day: this.state.shiftDay,
// 		End_Time: this.state.shiftend,
// 		Start_Time: this.state.shiftstart,
// 		Users: this.state.shiftUsers
//       })
// }
// addUserShift = async () => {
// 	let shiftsarray = []
// 	db.collection("Shift")
//       .onSnapshot(querySnapshot => {
//         querySnapshot.forEach(doc => {
//             shiftsarray = { id: doc.id, ...doc.data() }

//          }) 
//          this.setState({shiftsarray})
//         }       
//     )

// 	db.collection("Shift").doc(this.state.ShiftId).update({
// 		Users:.push(this.state.user)
// })
// }


    render() {
        return (
            <ScrollView style={styles.container}>
                
                <Entypo name="add-user" onPress={()=>{this.props.navigation.navigate("CreateUser")}}/> 
                <Ionicons name="md-locate" onPress={()=>{this.props.navigation.navigate("CreateZone")}}/>
                <Ionicons name="md-locate" onPress={()=>{this.props.navigation.navigate("CreateTrash")}}/> 
                <Ionicons name="md-locate" onPress={()=>{this.props.navigation.navigate("CreateTruck")}}/>  
                <MaterialIcons name="schedule" onPress={()=>{this.props.navigation.navigate("CreateShift")}}/> 

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

