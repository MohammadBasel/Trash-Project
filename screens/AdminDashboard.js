import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon } from "react-native-elements"
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"
// import * as admin from "firebase-admin";

import {Entypo, Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons} from "@expo/vector-icons";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';




export default class AdminDashboard extends React.Component {
    static navigationOptions = {
        title: 'Admin Dashboard',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: '#7a66ff', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
    }
    componentDidMount() {}


    render() {
        return (
            <ScrollView style={styles.container}>
                <View style={{flex: 1, flexDirection: "row", justifyContent: 'space-between', flexWrap: "wrap",  paddingTop: hp("10%"),paddingRight: wp("10%"),paddingLeft: wp("10%")}}>
                    <TouchableOpacity style={{
                        width: wp("25%"),
                        height: hp("15%"),
                        backgroundColor: '#7a66ff',
                        borderWidth: 0.5,
                        borderRadius: 10,
                        flexDirection: "column",
                        // flexWrap: "wrap",
                        justifyContent: "center", alignItems: "center",
                    }}
                    onPress={()=>{this.props.navigation.navigate("CreateUser")}}
                    >
                        <View style={{justifyContent: "center", alignItems: "center"}}>
                            <Entypo size ={wp("5.5%")} color = {"white"} name="add-user" onPress={()=>{this.props.navigation.navigate("CreateUser")}}/> 
                            <Text style={{ textAlignVertical: "center", textAlign: "center", fontWeight: 'bold', fontSize: wp("4.5%"), color: "white" }}> Create User </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        width: wp("25%"),
                        height: hp("15%"),
                        backgroundColor: '#7a66ff',
                        borderWidth: 0.5,
                        borderRadius: 10,
                        flexDirection: "column",
                        // flexWrap: "wrap",
                        justifyContent: "center", alignItems: "center",
                    }}
                    onPress={()=>{this.props.navigation.navigate("CreateZone")}}
                    >
                        <View style={{justifyContent: "center", alignItems: "center"}}>
                            <Ionicons size ={wp("5.5%")} color = {"white"} name="md-locate" onPress={()=>{this.props.navigation.navigate("CreateZone")}}/>
                            <Text style={{ textAlignVertical: "center", textAlign: "center", fontWeight: 'bold', fontSize: wp("4.5%"), color: "white" }}> Create Zone </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        width: wp("25%"),
                        height: hp("15%"),
                        backgroundColor: '#7a66ff',
                        borderWidth: 0.5,
                        borderRadius: 10,
                        flexDirection: "column",
                        // flexWrap: "wrap",
                        justifyContent: "center", alignItems: "center",
                    }}
                    onPress={()=>{this.props.navigation.navigate("CreateTrash")}}
                    >
                        <View style={{justifyContent: "center", alignItems: "center"}}>
                            <FontAwesome size ={wp("5.5%")} color = {"white"} name="trash" onPress={()=>{this.props.navigation.navigate("CreateTrash")}}/> 
                            <Text style={{ textAlignVertical: "center", textAlign: "center", fontWeight: 'bold', fontSize: wp("4.5%"), color: "white" }}> Create Trash </Text>
                        </View>
                    </TouchableOpacity>
                
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: 'space-between', flexWrap: "wrap",  paddingTop: hp("5%"),paddingRight: wp("20%"),paddingLeft: wp("20%")}}>

                    <TouchableOpacity style={{
                        width: wp("25%"),
                        height: hp("15%"),
                        backgroundColor: '#7a66ff',
                        borderWidth: 0.5,
                        borderRadius: 10,
                        flexDirection: "column",
                        // flexWrap: "wrap",
                        justifyContent: "center", alignItems: "center",
                    }}
                    onPress={()=>{this.props.navigation.navigate("CreateTruck")}}
                    >
                        <View style={{justifyContent: "center", alignItems: "center"}}>
                            <MaterialCommunityIcons  size ={wp("5.5%")} color = {"white"} name="truck" onPress={()=>{this.props.navigation.navigate("CreateTruck")}}/>  
                            <Text style={{ textAlignVertical: "center", textAlign: "center", fontWeight: 'bold', fontSize: wp("4.5%"), color: "white" }}> Create Truck </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        width: wp("25%"),
                        height: hp("15%"),
                        backgroundColor: '#7a66ff',
                        borderWidth: 0.5,
                        borderRadius: 10,
                        flexDirection: "column",
                        // flexWrap: "wrap",
                        justifyContent: "center", alignItems: "center",
                    }}
                    onPress={()=>{this.props.navigation.navigate("CreateShift")}}
                    >
                        <View style={{justifyContent: "center", alignItems: "center"}}>
                        <MaterialIcons size ={wp("5.5%")} color = {"white"} name="schedule" onPress={()=>{this.props.navigation.navigate("CreateShift")}}/> 
                            <Text style={{ textAlignVertical: "center", textAlign: "center", fontWeight: 'bold', fontSize: wp("4.5%"), color: "white" }}> Create Shift </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        paddingTop: 25,
        backgroundColor: '#fff',
    },
});

