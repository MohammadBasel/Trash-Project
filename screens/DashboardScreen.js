import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Dimensions
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
const { width, height, fontScale } = Dimensions.get("window");
fontSize = 15;
export default class DashboardScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    users: [],
    zones: [],
    trash: [],
    zone: "",
    switch: false,
    flag: true
  };
  zone = "";
  async componentWillMount() {
    // go to db and get all the users
    const currentuser = firebase.auth().currentUser.email;
    db.collection("Users").onSnapshot(querySnapshot => {
      users = [];
      querySnapshot.forEach(doc => {
        doc.id == currentuser && (this.zone = doc.data().Zone);

        doc.data().Zone == this.zone &&
          doc.id != currentuser &&
          users.push({ id: doc.id, ...doc.data() });
      });

      this.setState({ users });
      this.setState({ zone: this.zone });
      console.log("Current users: ", this.state.users);
    });
    db.collection("Zone").onSnapshot(querySnapshot => {
      zones = [];
      querySnapshot.forEach(doc => {
        zones.push({ id: doc.id, ...doc.data() });
        this.getTrashData(this.state.zone);
      });
      this.setState({ zones });
    });
  }
  getTrashData = id => {
    let trash = [];
    db.collection(`Zone/${id}/Trash`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        trash.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ trash });
    });
  };
  // getTrashData = id => {
  //   let trash = [...this.state.trash];
  //   db.collection(`Zone/${id}/Trash`).onSnapshot(querySnapshot => {
  //     querySnapshot.forEach(doc => {
  //       trash.push({ id: doc.id, ...doc.data() });
  //     });
  //     this.setState({ trash });

  //     //console.log("Current zones: ", this.state.trash.length);
  //   });
  // };
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
    console.log("Zonee", this.state.zone);
    console.log("This is th trash", this.state.trash);
    this.low = 0;
    this.medium = 0;
    this.full = 0;
    this.state.trash.map(tra =>
      tra.Level < 50
        ? (this.low = this.low + 1)
        : tra.Level >= 50 && tra.Level < 80
        ? (this.medium = this.medium + 1)
        : (this.full = this.full + 1)
    );
  };
  tra = 0;
  turnOn = () => {
    if (this.state.switch == false) this.setState({ switch: true });
    else this.setState({ switch: false });
  };
  saveChange = async () => {
    // this.state.users.map(
    console.log("SWITCH", this.state.trash);
    if (this.state.flag) {
      console.log("I am in");
      for (i = 0; i < this.state.trash.length; i++) {
        if (this.state.trash[i].Status === "Active") {
          await db
            .collection(`Zone/${this.state.zone}/Trash`)
            .doc(this.state.trash[i].id)
            .update({ Status: "Disabled" });
        }
      }
      this.setState({ flag: false });
    } else if (!this.state.flag) {
      for (i = 0; i < this.state.trash.length; i++) {
        if (this.state.trash[i].Status === "Disabled") {
          await db
            .collection(`Zone/${this.state.zone}/Trash`)
            .doc(this.state.trash[i].id)
            .update({ Status: "Active" });
        }
      }
      this.setState({ flag: true });
    }

    // );
  };
  render() {
    console.log("flag", this.state.flag);
    return (
      <View style={styles.container}>
        {this.av === 0 && this.countUser()}
        {this.low === 0 && this.countTrash()}

        <Header
          containerStyle={{ backgroundColor: "#7a66ff" }}
          centerComponent={{
            text: "Supervisor Dashboard",
            style: { color: "#fff", textAlign: "left", fontSize: 15 }
          }}
          rightComponent={
            this.state.switch && (
              <Button
                onPress={this.saveChange}
                title="Emergency"
                type="clear"
                titleStyle={{
                  color: "white",
                  fontSize: this.fontSize / fontScale
                }}
                containerStyle={{ width: 100 }}
              />
            )
          }
        />
        {/* <Switch onValueChange={this.turnOn} value={this.state.switch} /> */}
        {this.state.zones == "" ? (<View style={{paddingTop: "50%",paddingLeft: "50%", alignItems: "center" ,justifyContent: "center", width: "50%", heigth: "50%" }}><Image source={require('../assets/images/loading.gif')} /></View>) :(
        <View style={{ flex: 1, justifyContent: "space-evenly" }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("TrashStatus")}
          >
            <Card
              title="Trash Status"
              containerStyle={{
                backgroundColor: "#2980B9"
              }}
              titleStyle={{ color: "white" }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  padding: 10
                }}
              >
                <Text style={{ fontSize: 20 }}>Full: {this.full}</Text>
                <Text style={{ fontSize: 20 }}>Medium: {this.medium}</Text>
                <Text style={{ fontSize: 20 }}>Low: {this.low}</Text>
              </View>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Employee")}
          >
            <Card
              title="Employee Attendance"
              containerStyle={{
                backgroundColor: "#1F618D"
              }}
              titleStyle={{ color: "white" }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  padding: 10
                }}
              >
                <Text style={{ fontSize: 20 }}>Present: {this.av}</Text>
                <Text style={{ fontSize: 20 }}>Absent: {this.ab}</Text>
                <Text style={{ fontSize: 20 }}> Excused: {this.ex}</Text>
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
                backgroundColor: "#1A5276 "
              }}
              titleStyle={{ color: "white" }}
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

            <AntDesign
              name="warning"
              size={45}
              color="red"
              onPress={this.turnOn}
              //onValueChange={this.turnOn}
              value={this.state.switch}
            />
            <MaterialCommunityIcons
              name="star-four-points"
              size={45}
              color="black"
              onPress={() => this.props.navigation.navigate("PointsScreen")}
            />
          </View>
        </View>
        )}
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
