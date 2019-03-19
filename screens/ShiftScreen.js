import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker
} from "react-native";
import firebase from "firebase";
import functions from "firebase/functions";
import db from "../db.js";
import { Card, ListItem, Button, Icon, Header } from "react-native-elements";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
export default class ShiftScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    shift: [],
    users: []
  };
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

  async componentWillMount() {
    //   await this.fetchAll();
    //   connection.on("items", this.fetchAll);
  }
  render() {
    return (
      <View style={styles.container}>
        <Header
          placement="left"
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
        />
        {this.state.shift.map(shif => (
          <View>
            {this.state.users.map(user => (
              <View>
                {shif.Users.includes(user.id) && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly"
                    }}
                  >
                    <Text>{user.id}</Text>
                    <View>
                      <Text>{shif.Day}</Text>
                      <Text>{shif.End_Time}</Text>
                      <Text>{shif.Start_Time}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
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
