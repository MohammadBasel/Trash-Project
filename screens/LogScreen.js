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
export default class Employee extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    logs: [],
    available: "0",
    filteredItems: [{}]
  };
  componentDidMount() {
    // go to db and get all the users
    db.collection("Logging").onSnapshot(querySnapshot => {
      logs = [];
      querySnapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ logs });
      console.log("Current logs: ", this.state.logs.length);
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
            text: "Logs",
            style: { color: "#fff", marginLeft: 20 }
          }}
        />
        {this.state.logs.map(log => (
          <Text>{log.Desc}</Text>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center"
    //justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
