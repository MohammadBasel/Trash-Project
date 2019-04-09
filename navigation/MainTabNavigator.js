import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
// import LinksScreen from "../screens/LinksScreen";
import MapScreen from "../screens/MapScreen";
import MaintenanceScreen from "../screens/MaintenanceScreen";
import Battery from "../screens/Battery";
import Trash from "../screens/Trash";
import AdminDashboard from "../screens/AdminDashboard";
import CreateUser from "../screens/CreateUser";
import CreateShift from "../screens/CreateShift";
import CreateZone from "../screens/CreateZone";
import CreateTrash from "../screens/CreateTrash";
import CreateTruck from "../screens/CreateTruck";

import DashboardScreen from "../screens/DashboardScreen";
import TrashStatus from "../screens/TrashStatus";
import Employee from "../screens/Employee";
import ShiftScreen from "../screens/ShiftScreen";
import LogScreen from "../screens/LogScreen";
import PointsScreen from "../screens/PointsScreen";
import ChatScreen from "../screens/ChatScreen";
import ChatList from "../screens/ChatList";
import UsersList from "../screens/UsersList";
import MyUsersList from "../screens/MyUsersList";

import {Entypo, Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons} from "@expo/vector-icons";

import firebase, { firestore } from 'firebase';

role = ""
 export class Role extends React.Component 
 {
    async componentDidMount(){
      // let user = firebase.auth().currentUser.email
      // const userObj = await db.collection("Users").doc(user).get();
      // this.role = userObj.Role
      // console.log("Roleeeeeeeeee", userObj.Role)
      await db.collection("Users")
    .onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {   
      })
    })
 }
}


const HomeStack = createStackNavigator({
  Home: HomeScreen,
  Maintenance: MaintenanceScreen,
  Trash: Trash,
  Battery: Battery,
  Admin: AdminDashboard,
  CreateUser: CreateUser,
  CreateShift: CreateShift,
  CreateZone: CreateZone,
  CreateTrash: CreateTrash,
  CreateTruck: CreateTruck,
  Dashboard: DashboardScreen,
  TrashStatus: TrashStatus,
  Employee: Employee,
  Log: LogScreen,
  ShiftScreen: ShiftScreen,
  PointsScreen: PointsScreen
});

HomeStack.navigationOptions = {
  tabBarLabel: "Home",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-home" : "md-home"}
    />
  )
};

const ChatStack = createStackNavigator({
  Chat: ChatScreen,
  ChatList: ChatList,
  UsersList: UsersList,
  MyUsersList: MyUsersList
});

ChatStack.navigationOptions = {
  tabBarLabel: "Chat",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-chatbubbles" : "md-chatbubbles"}
    />
  )
};



const MapStack = createStackNavigator({
  Map: MapScreen
});

MapStack.navigationOptions = {
  tabBarLabel: "Map",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-map" : "md-map"}
    />
  )
};

const MaintenanceStack = createStackNavigator({
  Maintenance: MaintenanceScreen,
  Trash: Trash,
  Battery: Battery
});

MaintenanceStack.navigationOptions = {
  tabBarLabel: "Maintenance Dashboard",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-link" : "md-link"}
    />
  )
};

const AdminStack = createStackNavigator({
  Admin: AdminDashboard,
  CreateUser: CreateUser,
  CreateShift: CreateShift,
  CreateZone: CreateZone,
  CreateTrash: CreateTrash,
  CreateTruck: CreateTruck
});

AdminStack.navigationOptions = {
  tabBarLabel: "Admin Dashboard",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-link" : "md-link"}
    />
  )
};


const DashboardStack = createStackNavigator({
  Dashboard: DashboardScreen,
  TrashStatus: TrashStatus,
  Employee: Employee,
  Log: LogScreen,
  ShiftScreen: ShiftScreen,
  PointsScreen: PointsScreen
});

DashboardStack.navigationOptions = {
  tabBarLabel: "Dashboard",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-options" : "md-options"}
    />
  )
};

let nav = null
let user = firebase.auth().currentUser
if(user != null){
  let user = user.email
  const userObj = db.collection("Users").doc(user).get();
  this.role = userObj.Role
}


console.log("Role is: ", this.role)
  nav =  createBottomTabNavigator({
    HomeStack,
    MapStack,
    ChatStack
})
export default nav
