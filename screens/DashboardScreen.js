import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import firebase from "firebase";
import functions from "firebase/functions";
import db from "../db.js";
import { Card, ListItem, Button, Icon, Header } from "react-native-elements";
import {
  Ionicons,
  FontAwesome,
  AntDesign,
  MaterialCommunityIcons
} from "@expo/vector-icons";
export default class DashboardScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    users: []
  };
  componentDidMount() {
    // go to db and get all the users
    db.collection("Users").onSnapshot(querySnapshot => {
      users = [];
      querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ users });
      console.log("Current users: ", this.state.users.length);
    });

    // go to db and get all the records
  }

  av = 0;
  ex = 0;
  ab = 0;
  count = () => {
    this.state.users.map(user =>
      user.Status == "available"
        ? (this.av = this.av + 1)
        : user.Status == "absent"
        ? (this.ab = this.ab + 1)
        : (this.ex = this.ex = 1)
    );
    // this.setState({ available: av });
    // this.setState({ absent: ab });
    // this.setState({ excused: ex });
  };
  render() {
    return (
      <View style={styles.container}>
        {this.count()}
        {console.log("available", this.av)}
        {console.log("absent", this.ab)}
        {console.log("excused", this.ex)}
        <Header
          centerComponent={{
            text: "Supervisor Dashboard",
            style: { color: "#fff", textAlign: "left", fontSize: 20 }
          }}
        />

        <View style={{ flex: 1, justifyContent: "space-evenly" }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("TrashStatus")}
          >
            <Card
              title="Trash Status"
              containerStyle={{
                backgroundColor: "red"
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, padding: 10 }}>
                  Full: 5{"    "}Emptied: 2{"    "}Medium: 1
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Employee")}
          >
            <Card
              title="Employee Attendance"
              containerStyle={{
                backgroundColor: "green"
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, padding: 10 }}>
                  Present: {this.av}
                  {"    "}Absent: {this.ab}
                  {"    "}Excused: {this.ex}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Log")}
          >
            <Card
              containerStyle={{
                paddingTop: 40,
                paddingBottom: 40,
                backgroundColor: "yellow"
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, padding: 10, fontWeight: "bold" }}>
                  View Logs
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
          <View
            style={{ flexDirection: "row", justifyContent: "space-evenly" }}
          >
            <AntDesign
              name="table"
              size={25}
              color="black"
              onPress={() => this.props.navigation.navigate("ShiftScreen")}
            />
            <MaterialCommunityIcons
              name="star-four-points"
              size={25}
              color="black"
              onPress={() => this.props.navigation.navigate("ShiftScreen")}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
    //backgroundColor: "lightblue"
    //alignItems: "center",
    //justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
