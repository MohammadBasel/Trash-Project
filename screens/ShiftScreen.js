import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker,
  TextInput,
  Switch,
  Dimensions
} from "react-native";
import firebase from "firebase";
import functions from "firebase/functions";
import db from "../db.js";
import { Card, ListItem, Button, Icon, Header } from "react-native-elements";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
  Cell
} from "react-native-table-component";
import SwitchToggle from "react-native-switch-toggle";
const { width, height, fontScale } = Dimensions.get("window");
export default class ShiftScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    shift: [],
    users: [],
    switch: false,
    schedule: null,
    changed: [],
    clicked: false
  };
  zone = "";
  componentDidMount() {
    // go to db and get all the users
    db.collection("Shift").onSnapshot(querySnapshot => {
      shift = [];
      querySnapshot.forEach(doc => {
        shift.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ shift });
      console.log("Current shift: ", this.state.shift.length);
    });
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
      console.log("Current users: ", this.state.users.length);
    });
    // go to db and get all the records
  }

  async componentWillMount() {
    //   await this.fetchAll();
    //   connection.on("items", this.fetchAll);
  }
  turnOn = () => {
    if (this.state.switch == false) this.setState({ switch: true });
    else this.setState({ switch: false });
  };

  handlePicker = async value => {
    await this.setState({ schedule: value });
    console.log("dbshwe", this.state.schedule);
  };
  change = (shiftid, userid) => {
    console.log("shiftid is, ", shiftid);
    console.log("user is, ", userid);
    if (shiftid !== undefined) {
      let changes = [...this.state.shift];
      let shift = changes.find(
        u => u.id === shiftid && u.Users.includes(userid)
      );
      let shiftNew = null;
      changes.map(change =>
        change.Day == shift.Day && change.id != shift.id
          ? (shiftNew = change)
          : null
      );
      changed = [...this.state.changed];
      let shifted = changed.find(u => u.oldid.id === shiftid);
      console.log("SHIFTED", shifted);
      if (shifted == undefined) {
        {
          changed.push({ user_id: userid, oldid: shift, newid: shiftNew });
        }
      }
      this.setState({ changed });
      console.log("new id is, ", changed);
    }
  };
  saveChange = async () => {
    this.setState({ switch: false });
    let tempNew = [];
    let tempOld = [];
    for (i = 0; i < this.state.changed.length; i++) {
      tempNew = this.state.changed[i].newid.Users;

      tempNew.push(this.state.changed[i].user_id);
      console.log("tempNew", tempNew);
      tempOld = this.state.changed[i].oldid.Users;

      tempOld.splice(tempOld.indexOf(this.state.changed[i].user_id), 1);
      console.log("tempOld", tempOld.indexOf(this.state.changed[i].user_id));
      await db
        .collection("Shift")
        .doc(this.state.changed[i].newid.id)
        .update({ Users: tempNew });

      await db
        .collection("Shift")
        .doc(this.state.changed[i].oldid.id)
        .update({ Users: tempOld });
      //console.log("TEMPORARY ARRAY", temp);
    }

    this.setState({ changed: [] });
  };
  undo = async () => {
    changed = [...this.state.changed];
    changed.splice(this.state.changed.length - 1, 1);
    await this.setState({ changed });
    console.log("Changed", this.state.changed);
  };
  fontSize = 13;
  render() {
    return (
      <View style={styles.container}>
        <Header
          containerStyle={{ backgroundColor: "#7a66ff" }}
          leftComponent={
            <Ionicons
              name="md-arrow-round-back"
              size={25}
              color="#fff"
              onPress={() => this.props.navigation.navigate("Dashboard")}
            />
          }
          centerComponent={{
            text: "Shifts Table",
            style: { color: "#fff", marginLeft: 20 }
          }}
          rightComponent={
            this.state.switch && (
              <Button
                onPress={this.saveChange}
                title="Save changes"
                titleStyle={{
                  color: "white",
                  fontSize: this.fontSize / fontScale
                }}
                containerStyle={{ width: 100 }}
                type="clear"
              />
            )
          }
        />
        <ScrollView>
          {/* <Switch onValueChange={this.turnOn} value={this.state.switch} /> */}
          {this.state.switch && this.state.changed.length != 0 && (
            <View>
              <View>
                <TouchableOpacity
                  onPress={this.undo}
                  style={{
                    backgroundColor: "#7a66ff",
                    opacity: 1,
                    borderRadius: 10,
                    border: "1px solid #7a66ff",
                    //  padding: "15%",
                    width: width * 0.2,
                    height: height * 0.06,
                    alignItems: "center",
                    justifyContent: "center"
                    // position: "absolute",
                    // top: height * 0.87,
                    // left: width * 0.4
                  }}
                >
                  <Text>Undo Last Change</Text>
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  fontWeight: "bold",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                Changes to be Made
              </Text>

              {this.state.changed.map(change => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}> User:{"  "}</Text>
                  <Text>
                    {" "}
                    {change.user_id}
                    {"  "}
                  </Text>

                  <Text style={{ fontWeight: "bold" }}> Day:{"  "}</Text>
                  <Text> {change.newid.Day}</Text>
                </View>
              ))}
            </View>
          )}
          {this.state.users.map(user => (
            <Card>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: width * 0.7
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18
                  }}
                >
                  {user.id}
                </Text>

                {this.state.shift.map(
                  shif =>
                    shif.Users.includes(user.id) && (
                      <TouchableOpacity
                        onPress={() => this.change(shif.id, user.id)}
                        disabled={!this.state.switch}
                      >
                        <View
                          style={{
                            // width: width * 0.8
                            flexDirection: "row",
                            justifyContent: "space-between"
                          }}
                        >
                          <Text style={{ width: width * 0.2, fontSize: 15 }}>
                            {shif.Day}
                          </Text>
                          <Text style={{ fontSize: 15 }}>{shif.End_Time}</Text>
                          <Text style={{ fontSize: 15 }}>
                            {shif.Start_Time}
                          </Text>
                          <Text>{"\n"}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                )}
                <View />
              </View>
            </Card>
          ))}
        </ScrollView>
        <View>
          <TouchableOpacity
            onPress={this.turnOn}
            style={{
              backgroundColor: "#7a66ff",
              opacity: 1,
              borderRadius: 10,
              border: "1px solid #7a66ff",
              //  padding: "15%",
              width: width * 0.2,
              height: height * 0.06,
              alignItems: "center",
              justifyContent: "center"
              // position: "absolute",
              // top: height * 0.87,
              // left: width * 0.4
            }}
          >
            <Text>{!this.state.switch ? "Start Edit" : "Stop Edit"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center"
    //justifyContent: "center"
    //justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
