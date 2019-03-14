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
import { Ionicons, FontAwesome } from "@expo/vector-icons";
export default class LogScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    logs: []
  };
  componentDidMount() {
    // go to db and get all the users
    db.collection("Log").onSnapshot(querySnapshot => {
      logs = [];
      querySnapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ logs });
      console.log("Current users: ", this.state.logs.length);
    });
    //     // go to db and get all the records
  }
  render() {
    console.log(this.state);
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
            text: "Logs",
            style: { color: "#fff", marginLeft: 20 }
          }}
        />
        <View>
          {/* {this.state.logs.map(log => (
            <Text> {log.Log}</Text>
          ))} */}
        </View>
        <Text>Log here</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1

    //alignItems: "center",
    // justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
