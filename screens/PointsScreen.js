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
  TextInput,
  Switch,
  Dimensions,
  Linking
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
const { width, height } = Dimensions.get("window");

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
    db.collection("Users")
      .orderBy("Points", "desc")
      .onSnapshot(querySnapshot => {
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
  avatarURL = email => {
    console.log("EMAIL", email);
    return email.replace("@", "%40");
  };
  list = item => {
    let point = 0;
    return (
      <View>
        <TouchableOpacity>
          <ListItem
            onPress={() => Linking.openURL(`mailto:${item.id}`)}
            title="support@example.com"
            key={item.id}
            title={item.Name}
            subtitle={item.Phone}
            leftAvatar={
              <Avatar
                size="small"
                rounded
                source={{
                  uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2F${this.avatarURL(
                    item.id
                  )}?alt=media&token=1c79507b-72ea-4d02-9250-72889191c26f`
                }}
              />
            }
            rightAvatar={
              <View>
                {!this.state.switch ? (
                  <Text style={{ fontSize: 20 }}>{item.Points}</Text>
                ) : (
                  <TextInput
                    style={{
                      height: width * 0.1,
                      width: width * 0.1,
                      borderColor: "gray",
                      borderWidth: 1,
                      fontSize: 20,
                      alignItems: "center"
                    }}
                    onChangeText={text => this.getValue(text, item.id)}
                    value={!Number.isNaN(item.Points) ? "" + item.Points : ""}
                    // editable={this.state.switch}

                    //placeholder="Points"
                  />
                )}

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
    this.setState({ switch: false });
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
    console.log("USERS", this.state.users);
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
            text: "Points Table",
            style: { color: "#fff", marginLeft: 20 }
          }}
          rightComponent={
            this.state.switch && (
              <Button
                onPress={this.saveChange}
                title="Save changes"
                type="clear"
                titleStyle={{ color: "white" }}
                containerStyle={{ width: 100 }}
              />
            )
          }
        />

        <Switch onValueChange={this.turnOn} value={this.state.switch} />
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
