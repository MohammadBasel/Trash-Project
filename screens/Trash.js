import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Picker
} from "react-native";
import { ExpoLinksView } from "@expo/samples";
import db from "../db.js";

import {
  Header,
  ListItem,
  Divider,
  Badge,
  Avatar,
  Card,
  Button,
  Icon
} from "react-native-elements";

let bins = [];
export default class Trash extends React.Component {
  static navigationOptions = {
    title: "Damaged Trash",
    headerTintColor: "white",
    headerStyle: {
      backgroundColor: "#7a66ff",
      borderWidth: 1,
      borderBottomColor: "white"
    },
    headerTitleStyle: { color: "white" }
  };
  state = {
    trashs: [],
    zones: [],
    filter: "All"
  };
  // trashs = []
  // zones = []

  async componentDidMount() {
    await this.getZoneData();
  }

  getZoneData = async () => {
    db.collection("Zone").onSnapshot(querySnapshot => {
      let zones = [];
      let zoneId = 0;
      querySnapshot.forEach(doc => {
        db.collection(`Zone/${doc.id}/Trash`).onSnapshot(querySnapshot => {
          let trashs = [];
          zoneId = doc.id;
          querySnapshot.forEach(doc => {
            trashs.push({ id: doc.id, ...doc.data() });
          });
          zones.push({ id: zoneId, trashs });
          this.setState({ zones });
        });
      });
    });
  };

  getData = async () => {
    let trashs = [];
    let zones = [];
    await this.setState({ zones, trashs });
    console.log("new method", this.state.trashs);
  };
  Update = async (id, condition) => {
    let zoneid = 0;
    status = "";
    if (condition === "fix") {
      status = "Under Maintenance";
    } else {
      status = "Active";
    }
    db.collection("Zone").onSnapshot(querySnapshot => {
      let zones = [];
      querySnapshot.forEach(doc => {
        db.collection(`Zone/${doc.id}/Trash`)
          .get()
          .then(querySnapshot => {
            zoneid = doc.id;
            querySnapshot.forEach(doc => {
              if (doc.id == id) {
                db.collection(`Zone/${zoneid}/Trash`)
                  .doc(doc.id)
                  .update({ Status: status });
              }
            });
          });
      });
      this.getZoneData();
    });
  };
  render() {
    return (
      <ScrollView style={styles.container}>
        <Picker
          selectedValue={this.state.filter}
          style={{ height: 50, width: 200 }}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({ filter: itemValue })
          }
        >
          <Picker.Item label="All" value="All" />
          <Picker.Item label="Damaged" value="Damaged" />
          <Picker.Item label="Under Maintenance" value="Under Maintenance" />
        </Picker>
        <View>
          {this.state.zones.map((item, i) =>
            item.trashs.map(
              (trash, j) =>
                trash.Status != "Active" &&
                trash.Status != "Reserved" &&
                (this.state.filter == "All" ? (
                  <ListItem
                    key={j}
                    title={`Status: ${trash.Status}`}
                    subtitle={`id: ${trash.id}`}
                    leftIcon={{ name: trash.icon }}
                    rightElement={
                      trash.Status == "Damaged" ? (
                        <Text
                          onPress={() => this.Update(trash.id, "fix")}
                          style={{ color: "blue" }}
                        >
                          Fix
                        </Text>
                      ) : (
                        <Text
                          onPress={() => this.Update(trash.id, "clear")}
                          style={{ color: "blue" }}
                        >
                          Clear
                        </Text>
                      )
                    }
                  />
                ) : (
                  this.state.filter == trash.Status && (
                    <ListItem
                      key={j}
                      title={`Status: ${trash.Status}`}
                      subtitle={`id: ${trash.id}`}
                      leftIcon={{ name: trash.icon }}
                      rightElement={
                        trash.Status == "Damaged" ? (
                          <Text
                            onPress={() => this.Update(trash.id, "fix")}
                            style={{ color: "blue" }}
                          >
                            Fix
                          </Text>
                        ) : (
                          <Text
                            onPress={() => this.Update(trash.id, "clear")}
                            style={{ color: "blue" }}
                          >
                            Clear
                          </Text>
                        )
                      }
                    />
                  )
                ))
            )
          )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff"
  }
});
