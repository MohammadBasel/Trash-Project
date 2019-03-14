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
    users: [],
    available: "0",
    filteredItems: [{}]
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
  handlePicker = async value => {
    await this.setState({ available: value });
    this.handleFilter();
  };
  handleFilter = async () => {
    let itemFilter = [];

    console.log("First", itemFilter);
    if (this.state.available == "0") {
      this.state.users.map((item, i) => itemFilter.push(item));

      console.log("All", itemFilter);
    } else {
      {
        this.state.users.map(
          (item, i) =>
            item.Status == this.state.available && itemFilter.push(item)
        );
      }

      console.log("Last", itemFilter);
    }

    await this.setState({ filteredItems: itemFilter });
    console.log("Lastestst", itemFilter);
  };

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
            text: "Employee List",
            style: { color: "#fff", marginLeft: 20 }
          }}
        />
        <Picker
          selectedValue={this.state.available}
          style={{ height: 50, width: 150 }}
          onValueChange={(itemValue, itemIndex) => this.handlePicker(itemValue)}
        >
          <Picker.Item label="All" value="0" />
          <Picker.Item label="Absent" value="absent" />
          <Picker.Item label="Available" value="available" />
          <Picker.Item label="Excused" value="excused" />
        </Picker>
        {console.log(this.state.available)}
        {this.state.available == "0"
          ? this.state.users.map(user => (
              <View key={user.id}>
                <View>
                  <Text>Name: {user.Name}</Text>
                  <Text>Availability: {user.Status}</Text>
                </View>
              </View>
            ))
          : this.state.filteredItems.map(user => (
              <View key={user.id}>
                <View>
                  <Text>Name: {user.Name}</Text>
                  <Text>Availability: {user.Status}</Text>
                </View>
              </View>
            ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
