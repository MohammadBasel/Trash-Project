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
  FlatList,
  TextInput
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
  Avatar,
  Badge
} from "react-native-elements";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import SwitchToggle from "react-native-switch-toggle";

export default class PointsScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    users: [],
    switch: false,
    updateduser: []
  };
  componentDidMount() {
    const currentuser = firebase.auth().currentUser.email;
    db.collection("Users").onSnapshot(querySnapshot => {
      users = [];
      querySnapshot.forEach(doc => {
        doc.id == currentuser && (this.zone = doc.data().Zone);

        doc.data().Zone == this.zone &&
          users.push({ id: doc.id, ...doc.data() });
      });

      this.setState({ users });
      this.setState({ zone: this.zone });
      console.log("Current users: ", this.state.users);
    });
    // go to db and get all the records
  }

  fun = () => {
    let arr = [{ user: "lsdfjklsdjf", points: 75 }];
    let user = arr.find(u => u.user == "skldfjkls");
  };
  async componentWillMount() {
    //   await this.fetchAll();
    //   connection.on("items", this.fetchAll);
  }
  turnOn = () => {
    if (this.state.switch == false) this.setState({ switch: true });
    else this.setState({ switch: false });
  };
  list = item => {
    let point = 0;
    return (
      <View>
        <TouchableOpacity>
          <ListItem
            // onPress={() => this.props.navigation.navigate("Info", { item })}
            key={item.id}
            title={item.Name}
            subtitle={item.Phone}
            leftAvatar={
              <Avatar
                rounded
                source={{
                  uri: "../assets/images/bin.png"
                }}
              />
            }
            rightAvatar={
              <View>
                <TextInput
                  style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
                  onChangeText={text => this.getValue(text, item.id)}
                  value={!Number.isNaN(item.Points) ? "" + item.Points : ""}
                  editable={this.state.switch}

                  //placeholder="Points"
                />
                {/* */}
              </View>
            }
            // onPress={() => this.props.navigation.navigate("Info")}
          />
          <Divider style={{ backgroundColor: "blue" }} />
        </TouchableOpacity>
      </View>
    );
  };

  saveChange = async () => {
    // this.state.users.map(
    for (i = 0; i < this.state.users.length; i++) {
      await db
        .collection("Users")
        .doc(this.state.users[i].id)
        .update({ Points: this.state.users[i].Points });
    }
    // );
  };
  getValue = (value, id) => {
    console.log("Val is, ", value);
    console.log("Id is, ", id);
    if (value !== undefined) {
      let changes = [...this.state.users];
      let user = changes.find(u => u.id === id);
      user.Points = parseInt(value);
      let index = changes.indexOf(user);
      changes.splice(index, 1, user);
      this.setState({ users: changes });
    }
  };

  render() {
    console.log(this.state.users);
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
          rightComponent={
            this.state.switch && (
              <Button onPress={this.saveChange} title="Save changes" />
            )
          }
        />
        <SwitchToggle
          containerStyle={{
            marginTop: 16,
            width: 108,
            height: 48,
            borderRadius: 25,
            backgroundColor: "#ccc",
            padding: 5
          }}
          circleStyle={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "white" // rgb(102,134,205)
          }}
          switchOn={this.state.switch}
          onPress={this.turnOn}
          circleColorOff="white"
          circleColorOn="red"
          duration={500}
        />

        <FlatList
          data={this.state.users}
          keyExtractor={item => item.id}
          extraData={this.state}
          renderItem={
            ({ item }) => this.list(item)
            //console.log("items", item);
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1

    // alignItems: "center"
    //justifyContent: "center"
    //justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
