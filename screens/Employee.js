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
  Avatar
} from "react-native-elements";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

export default class Employee extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    users: [],
    available: "0",
    filteredItems: [{}],
    zoneid: ""
  };
  zone = "";
  async componentWillMount() {
    const currentuser = firebase.auth().currentUser.email;
    db.collection("Users").onSnapshot(querySnapshot => {
      users = [];
      querySnapshot.forEach(doc => {
        doc.id == currentuser && (this.zone = doc.data().Zone);

        doc.data().Zone == this.zone &&
          doc.id != currentuser &&
          users.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ zoneid: this.zone });
      this.setState({ users });
      console.log("Current users: ", this.state.users);
    });
    console.log("The zone", this.state.zoneid);
  }

  // go to db and get all the records

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
  avatarURL = id => {
    console.log("IDDDD", id);
    if (id != null) {
      return id.replace("@", "%40");
    }
  };
  list = item => {
    return (
      <View>
        <TouchableOpacity>
          <ListItem
            onPress={() => Linking.openURL(`mailto:${item.id}`)}
            key={item.id}
            title={item.Name}
            subtitle={item.Status}
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
            subtitleStyle={{ textAlign: "left" }}
            titleStyle={{ textAlign: "left" }}
          />

          <Divider style={{ backgroundColor: "blue" }} />
        </TouchableOpacity>
      </View>
    );
  };
  render() {
    console.log("the user", this.state.users);
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
            text: "Employee List",
            style: { color: "#fff", marginLeft: 20 }
          }}
        />
        {/* <Text>
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
        </Text> */}
        {/* <Picker
          selectedValue={this.state.available}
          style={{ height: 50, width: 150 }}
          onValueChange={(itemValue, itemIndex) => this.handlePicker(itemValue)}
        >
          <Picker.Item label="All" value="0" />
          <Picker.Item label="Absent" value="absent" />
          <Picker.Item label="Available" value="available" />
          <Picker.Item label="Excused" value="excused" />
        </Picker> */}
        <View
          style={{
            height: height * 0.15,
            width: width * 1,
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Picker
            selectedValue={this.state.available}
            style={{ paddingLeft: 20, height: 50, width: 200 }}
            onValueChange={(itemValue, itemIndex) =>
              this.handlePicker(itemValue)
            }
          >
            <Picker.Item label="All" value="0" />
            <Picker.Item label="Absent" value="absent" />
            <Picker.Item label="Available" value="available" />
            <Picker.Item label="Excused" value="excused" />
          </Picker>
        </View>
        {console.log(this.state.available)}
        <FlatList
          data={
            this.state.available == "0"
              ? this.state.users
              : this.state.filteredItems
          }
          extraData={this.state}
          keyExtractor={item => item.id}
          style={{ height: height * 0.8 }}
          renderItem={({ item }) => <View>{this.list(item)}</View>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    //
    //flex: 1
    //alignItems: "center"
    //justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
