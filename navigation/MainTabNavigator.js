import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import LinksScreen from "../screens/LinksScreen";
import MapScreen from "../screens/MapScreen";
import MaintenanceScreen from "../screens/MaintenanceScreen";
import Battery from "../screens/Battery";
import Trash from "../screens/Trash";

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
const HomeStack = createStackNavigator({
  Home: HomeScreen
});

HomeStack.navigationOptions = {
  tabBarLabel: "Home",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === "ios"
          ? `ios-information-circle${focused ? "" : "-outline"}`
          : "md-information-circle"
      }
    />
  )
};

const ChatStack = createStackNavigator({
  Chat: ChatScreen,
  ChatList : ChatList,
  UsersList : UsersList,
  MyUsersList : MyUsersList
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

const LinksStack = createStackNavigator({
  Links: LinksScreen
});

LinksStack.navigationOptions = {
  tabBarLabel: "Links",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-link" : "md-link"}
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
      name={Platform.OS === "ios" ? "ios-options" : "md-options"}
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
export default createBottomTabNavigator({
  HomeStack,
  LinksStack,
  MapStack,
  MaintenanceStack,
  DashboardStack,
  ChatStack
});
