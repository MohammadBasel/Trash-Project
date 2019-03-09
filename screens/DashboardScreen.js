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

import { Card, ListItem, Button, Icon, Header } from "react-native-elements";

export default class DashboardScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  render() {
    return (
      <View style={styles.container}>
        <Header
          centerComponent={{
            text: "Supervisor Dashboard",
            style: { color: "#fff", textAlign: "left", fontSize: 20 }
          }}
        />
        <View style={{ flex: 1, justifyContent: "space-evenly" }}>
          <Card
            title="Trash Status"
            containerStyle={{
              backgroundColor: "red"
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, padding: 10 }}>
                Full: 5{"    "}Emptied: 2{"    "}Medium: 1
              </Text>
            </View>
          </Card>

          <Card
            title="Employee Attendance"
            containerStyle={{
              backgroundColor: "green"
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, padding: 10 }}>
                Present: 5{"    "}Absent: 2{"    "}Excused: 1
              </Text>
            </View>
          </Card>
          <Card
            containerStyle={{
              paddingTop: 40,
              paddingBottom: 40,
              backgroundColor: "yellow"
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, padding: 10, fontWeight: "bold" }}>
                View Employee Schedule
              </Text>
            </View>
          </Card>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue"
    //alignItems: "center",
    //justifyContent: "space-evenly"
  },
  card: {
    backgroundColor: "lightblue"
  }
});
