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
    users: [],
    zones: [],
    trash: []
  };

  async componentWillMount() {
    // go to db and get all the users
    db.collection("Users").onSnapshot(querySnapshot => {
      users = [];
      querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ users });
      console.log("Current users: ", this.state.users.length);
    });

    db.collection("Zone").onSnapshot(querySnapshot => {
      zones = [];
      querySnapshot.forEach(doc => {
        zones.push({ id: doc.id, ...doc.data() });
        this.getTrashData(doc.id);
      });
      this.setState({ zones });
      //  console.log("Zone", doc.id);

      console.log("Current zones: ", this.state.zones.length);
    });
    this.count();
  }
  getTrashData = id => {
    let trash = [...this.state.trash];
    db.collection(`Zone/${id}/Trash`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        trash.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ trash });

      //console.log("Current zones: ", this.state.trash.length);
    });
  };
  av = 0;
  ex = 0;
  ab = 0;
  full = 0;
  low = 0;
  medium = 0;
  countUser = () => {
    this.state.users.map(user =>
      user.Status == "available"
        ? (this.av = this.av + 1)
        : user.Status == "absent"
        ? (this.ab = this.ab + 1)
        : (this.ex = this.ex + 1)
    );
  };
  countTrash = () => {
    this.state.trash.map(tra =>
      tra.Level < 50
        ? (this.low = this.low + 1)
        : tra.Level >= 50 && tra.Level < 80
        ? (this.medium = this.medium + 1)
        : (this.full = this.full + 1)
    );
  };
  tra = 0;
  render() {
    return (
      <View style={styles.container}>
        {this.av === 0 && this.countUser()}
        {this.countTrash()}
        {console.log("full", this.full)}
        {console.log("medium", this.medium)}
        {console.log("low", this.low)}

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
                  Full: {this.full}
                  {"    "}Medium: {this.medium}
                  {"    "}Low: {this.low}
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
              size={45}
              color="black"
              onPress={() => this.props.navigation.navigate("ShiftScreen")}
            />
            <MaterialCommunityIcons
              name="star-four-points"
              size={45}
              color="black"
              onPress={() => this.props.navigation.navigate("PointsScreen")}
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
