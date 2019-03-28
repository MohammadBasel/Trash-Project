import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
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

export default class MaintenanceScreen extends React.Component {
  static navigationOptions = {
    title: "Maintenance Dashboard",
    headerTintColor: "white",
    headerStyle: {
      backgroundColor: "#7a66ff",
      borderWidth: 1,
      borderBottomColor: "white"
    },
    headerTitleStyle: { color: "white" }
  };
  state = {
    zones: []
  };
  componentDidMount() {
    // await this.getdata()
    db.collection("Zone").onSnapshot(querySnapshot => {
      let zones = [];
      console.log("zones", zones);
      let zoneId = 0;
      let zonecount = 0;
      count = 0;
      querySnapshot.forEach(doc => {
        db.collection(`Zone/${doc.id}/Trash`).onSnapshot(querySnapshot => {
          let trashs = [];
          zoneId = doc.id;
          console.log("zone length", zones.length);
          console.log("zone", zones);
          if (zones.length > 0) {
            for (let i = 0; i < zones.length; i++) {
              count = count + 1;
              if (zones[i].id == zoneId) {
                zonecount = zonecount + 1;
                if (this.state.zones[i].length >= 0) {
                  zones.splice(i, 1);
                  console.log("splice", zones);
                  querySnapshot.forEach(doc => {
                    trashs.push({ id: doc.id, ...doc.data() });
                    zones.push({ id: zoneId, trashs });
                    this.setState({ zones });
                    console.log("if wala last");
                  });
                  // zones.push({id: zoneId, trashs})
                  // this.setState({zones})
                }
              }
            }
          } else {
            querySnapshot.forEach(doc => {
              trashs.push({ id: doc.id, ...doc.data() });
            });
            zones.push({ id: zoneId, trashs });
            this.setState({ zones });
            console.log("else wala last");
          }
          if (zonecount == 0 && count > 0) {
            querySnapshot.forEach(doc => {
              trashs.push({ id: doc.id, ...doc.data() });
            });
            zones.push({ id: zoneId, trashs });
            this.setState({ zones });
            console.log("else wala last");
          }

          // zones.push({id: zoneId, trashs})
          // this.setState({zones})
        });
      });
    });
  }
  getdata = async () => {
    db.collection("Zone").onSnapshot(querySnapshot => {
      let zones = [];
      console.log("zones", zones);
      let zoneId = 0;
      let count = 1;
      querySnapshot.forEach(doc => {
        db.collection(`Zone/${doc.id}/Trash`).onSnapshot(querySnapshot => {
          let trashs = [];
          zoneId = doc.id;
          count = count + 1;
          if (zones.length > 0 && count == zones.length) {
            console.log("count", count);
            for (let i = 0; i < zones.length; i++) {
              if (zones[i].id == zoneId) {
                if (this.state.zones[i].length <= 0) {
                  querySnapshot.forEach(doc => {
                    trashs.push({ id: doc.id, ...doc.data() });
                    console.log("if wala last");
                  });
                  // zones.push({id: zoneId, trashs})
                  // this.setState({zones})
                }
              }
            }
          } else {
            querySnapshot.forEach(doc => {
              trashs.push({ id: doc.id, ...doc.data() });
            });
            zones.push({ id: zoneId, trashs });
            this.setState({ zones });
            console.log("else wala last");
          }

          // zones.push({id: zoneId, trashs})
          // this.setState({zones})
        });
      });
    });
  };
  damageTrash = () => {
    let total = 0;
    for (let j = 0; j < this.state.zones.length; j++) {
      for (let i = 0; i < this.state.zones[j].trashs.length; i++) {
        if (this.state.zones[j].trashs[i].Status == "Damaged") {
          total = total + 1;
          // console.log("damage : ", this.state.totaldamageTrash)
        }
      }
    }
    return total;
  };
  maintenanceTrash = () => {
    let total = 0;
    for (let j = 0; j < this.state.zones.length; j++) {
      for (let i = 0; i < this.state.zones[j].trashs.length; i++) {
        if (this.state.zones[j].trashs[i].Status == "Under Maintenance") {
          total = total + 1;
        }
      }
    }
    return total;
  };

  lowBattery = () => {
    let total = 0;
    for (let j = 0; j < this.state.zones.length; j++) {
      for (let i = 0; i < this.state.zones[j].trashs.length; i++) {
        if (this.state.zones[j].trashs[i].Battery < 30) {
          total = total + 1;
        }
      }
    }
    return total;
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View />
        <View>
          <View>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Trash")}
            >
              <Card
                title="Damage Trash"
                titleStyle={{ color: "white" }}
                containerStyle={{ backgroundColor: "red" }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                >
                  <View>
                    <Text style={{ color: "white" }}>
                      Damaged Trash: {this.damageTrash()}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: "white" }}>
                      Under Maintenance Trash: {this.maintenanceTrash()}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Battery")}
            >
              <Card
                title="Low Battery"
                titleStyle={{ color: "white" }}
                containerStyle={{ backgroundColor: "#ffd700" }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                >
                  <View>
                    <Text style={{ color: "white" }}>
                      Low Battery: {this.lowBattery()}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
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
