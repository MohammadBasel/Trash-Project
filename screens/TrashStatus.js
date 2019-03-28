import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
import firebase from "firebase";
import functions from "firebase/functions";
import db from "../db.js";
import { Card, ListItem, Button, Icon, Header } from "react-native-elements";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");
export default class TrashStatus extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    zones: [],
    trash: [],
    zone: ""
  };
  async componentWillMount() {
    const currentuser = firebase.auth().currentUser.email;

    db.collection("Users").onSnapshot(querySnapshot => {
      zone = "";
      querySnapshot.forEach(doc => {
        doc.id == currentuser && (zone = doc.data().Zone);
      });
      this.setState({ zone });
      console.log("Zone his", zone);

      // console.log("Current zones: ", this.state.zones.length);
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
    let trash = [...this.state.trash];
    db.collection(`Zone/${id}/Trash`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        trash.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ trash });

      //console.log("Current zones: ", this.state.trash.length);
    });
  };
  render() {
    console.log(this.state);
    return (
      <View style={styles.container}>
        <ScrollView>
          <Header
            containerStyle={{ backgroundColor: "#7a66ff" }}
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
              text: "Trash Status",
              style: { color: "#fff", marginLeft: 20 }
            }}
          />
          <Card title="FULL">
            {this.state.trash.map(
              (u, i) =>
                u.Level > 80 && (
                  <View>
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}
                    >
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>Id:</Text>
                        {u.id}
                      </Text>
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>Trash Level:</Text>
                        {u.Level}
                      </Text>
                    </View>
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}
                    >
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>
                          Battery Level:
                        </Text>
                        {u.Battery}
                      </Text>
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>Status: </Text>
                        {u.Status}
                      </Text>
                    </View>
                    <Text>
                      {"\n"} {"\n"}
                    </Text>
                  </View>
                )
            )}
          </Card>
          <Card title="MEDIUM">
            {this.state.trash.map((u, i) =>
              u.Level >= 50 && u.Level < 80 ? (
                <View>
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Id:</Text>
                      {u.id}
                    </Text>
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Trash Level:</Text>
                      {u.Level}
                    </Text>
                  </View>
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Battery Level:</Text>
                      {u.Battery}
                    </Text>
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Status: </Text>
                      {u.Status}
                    </Text>
                  </View>
                  <Text>
                    {"\n"} {"\n"}
                  </Text>
                </View>
              ) : null
            )}
          </Card>
          <Card title="LOW">
            {this.state.trash.map(
              (u, i) =>
                u.Level <= 50 && (
                  <View>
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}
                    >
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>Id:</Text>
                        {u.id}
                      </Text>
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>Trash Level:</Text>
                        {u.Level}
                      </Text>
                    </View>
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}
                    >
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>
                          Battery Level:
                        </Text>
                        {u.Battery}
                      </Text>
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>Status: </Text>
                        {u.Status}
                      </Text>
                    </View>
                    <Text>
                      {"\n"} {"\n"}
                    </Text>
                  </View>
                )
            )}
          </Card>
        </ScrollView>
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
