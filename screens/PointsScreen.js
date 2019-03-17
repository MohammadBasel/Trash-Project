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
  FlatList
} from "react-native";
import firebase from "firebase";
import functions from "firebase/functions";
import db from "../db.js";
import {
  Card,
  ListItem,
  Button,
  Icon,
  Header,
  Divider,
  Avatar
} from "react-native-elements";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
export default class PointsScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    users: []
  };
  componentDidMount() {
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

  list = item => {
    return (
      <View>
        <TouchableOpacity>
          <ListItem
            // onPress={() => this.props.navigation.navigate("Info", { item })}
            key={item.id}
            title={item.Name}
            //  subtitle={item.Phone}

            leftAvatar={
              <Avatar
                rounded
                source={{
                  uri: "../assets/images/bin.png"
                }}
              />
            }

            // onPress={() => this.props.navigation.navigate("Info")}
          />
          <Divider style={{ backgroundColor: "blue" }} />
        </TouchableOpacity>
      </View>
    );
  };
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
            text: "Points Table",
            style: { color: "#fff", marginLeft: 20 }
          }}
        />
        {this.state.users.map(user => (
          <View
            style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            key={user.id}
          >
            <Text style={{ padding: 10 }}>{user.Name}</Text>
            <Text style={{ padding: 10 }}>{user.Points}</Text>
          </View>
        ))}

        {/* <FlatList
          data={this.state.users}
          keyExtractor={item => item.id}
          extraData={this.state}
          renderItem={
            ({ item }) => this.list(item)
            //console.log("items", item);
          }
        /> */}
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
