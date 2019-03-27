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
  Dimensions
} from "react-native";
import firebase from "firebase";
import functions from "firebase/functions";
import db from "../db.js";
import { Card, ListItem, Button, Icon, Header } from "react-native-elements";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import DatePicker from "react-native-datepicker";
const { width, height } = Dimensions.get("window");

export default class Employee extends React.Component {
  static navigationOptions = {
    header: null
  };
  state = {
    logs: [],
    trashid: "0",
    filteredItems: [],
    zones: [],
    zone: "",
    users: [],
    trash: [],
    truckid: "0",
    trucks: [],
    startdate: { date: null },
    enddate: { date: null }
  };
  componentWillMount() {
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
        this.getTruckData(this.state.zone);
      });
      this.setState({ zones });
    });
    db.collection("Logging").onSnapshot(querySnapshot => {
      logs = [];
      querySnapshot.forEach(doc => {
        doc.data().Zone_Id == this.state.zone &&
          logs.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ logs });
      this.setState({ filteredItems: logs });
      console.log("Current logs: ", this.state.logs.length);
    });

    // go to db and get all the records
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

  getTruckData = id => {
    let trucks = [...this.state.trucks];
    db.collection(`Zone/${id}/Truck`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        trucks.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ trucks });

      //console.log("Current zones: ", this.state.trash.length);
    });
  };
  handleFilter = async () => {
    itemfilter = [];
    if (!this.state.startdate.date && !this.state.enddate.date) {
      if (this.state.trashid === "0") {
        if (this.state.truckid === "0") {
          itemfilter = this.state.logs;
        } else {
          for (let i = 0; i < this.state.logs.length; i++) {
            this.state.logs[i].Truck_Id.substring(32) == this.state.truckid &&
              itemfilter.push(this.state.logs[i]);
            console.log("logs", this.state.logs[i]);
          }
        }
      } else if (this.state.truckid === "0") {
        for (let i = 0; i < this.state.logs.length; i++) {
          this.state.logs[i].Trash_Id.substring(32) == this.state.trashid &&
            itemfilter.push(this.state.logs[i]);
          console.log("logs", this.state.logs[i]);
        }
      } else {
        for (let i = 0; i < this.state.logs.length; i++) {
          this.state.logs[i].Trash_Id.substring(32) == this.state.trashid &&
            this.state.logs[i].Truck_Id.substring(32) == this.state.truckid &&
            itemfilter.push(this.state.logs[i]);
          console.log("logs", this.state.logs[i]);
        }
      }
    } else if (!this.state.enddate.date) {
      if (this.state.trashid === "0") {
        if (this.state.truckid === "0") {
          for (let i = 0; i < this.state.logs.length; i++) {
            let time = new Date(this.state.logs[i].Time.toDate());
            let date = new Date(
              time.getFullYear() +
                "-" +
                ("0" + (time.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + (time.getDate() + 1)).slice(-2)
            );

            startdates = new Date(this.state.startdate.date);
            enddates = new Date();
            if (date >= startdates && date <= enddates)
              itemfilter.push(this.state.logs[i]);
          }
        } else {
          for (let i = 0; i < this.state.logs.length; i++) {
            let time = new Date(this.state.logs[i].Time.toDate());
            let date = new Date(
              time.getFullYear() +
                "-" +
                ("0" + (time.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + (time.getDate() + 1)).slice(-2)
            );

            startdates = new Date(this.state.startdate.date);
            enddates = new Date();
            if (
              date >= startdates &&
              date <= enddates &&
              this.state.logs[i].Truck_Id.substring(32) == this.state.truckid
            )
              itemfilter.push(this.state.logs[i]);
          }
        }
      } else if (this.state.truckid === "0") {
        for (let i = 0; i < this.state.logs.length; i++) {
          let time = new Date(this.state.logs[i].Time.toDate());
          let date = new Date(
            time.getFullYear() +
              "-" +
              ("0" + (time.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + (time.getDate() + 1)).slice(-2)
          );

          startdates = new Date(this.state.startdate.date);
          enddates = new Date();
          if (
            date >= startdates &&
            date <= enddates &&
            this.state.logs[i].Trash_Id.substring(32) == this.state.trashid
          )
            itemfilter.push(this.state.logs[i]);
        }
      } else {
        for (let i = 0; i < this.state.logs.length; i++) {
          let time = new Date(this.state.logs[i].Time.toDate());
          let date = new Date(
            time.getFullYear() +
              "-" +
              ("0" + (time.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + (time.getDate() + 1)).slice(-2)
          );

          startdates = new Date(this.state.startdate.date);
          enddates = new Date();
          if (
            date >= startdates &&
            date <= enddates &&
            this.state.logs[i].Trash_Id.substring(32) == this.state.trashid &&
            this.state.logs[i].Truck_Id.substring(32) == this.state.truckid
          )
            itemfilter.push(this.state.logs[i]);
        }
      }
    } else {
      if (this.state.trashid === "0") {
        if (this.state.truckid === "0") {
          for (let i = 0; i < this.state.logs.length; i++) {
            let time = new Date(this.state.logs[i].Time.toDate());
            let date = new Date(
              time.getFullYear() +
                "-" +
                ("0" + (time.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + (time.getDate() + 1)).slice(-2)
            );

            startdates = new Date(this.state.startdate.date);
            enddates = new Date(this.state.enddate.date);
            if (date >= startdates && date <= enddates)
              itemfilter.push(this.state.logs[i]);
          }
        } else {
          for (let i = 0; i < this.state.logs.length; i++) {
            let time = new Date(this.state.logs[i].Time.toDate());
            let date = new Date(
              time.getFullYear() +
                "-" +
                ("0" + (time.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + (time.getDate() + 1)).slice(-2)
            );

            startdates = new Date(this.state.startdate.date);
            enddates = new Date(this.state.enddate.date);
            if (
              date >= startdates &&
              date <= enddates &&
              this.state.logs[i].Truck_Id.substring(32) == this.state.truckid
            )
              itemfilter.push(this.state.logs[i]);
          }
        }
      } else if (this.state.truckid === "0") {
        for (let i = 0; i < this.state.logs.length; i++) {
          let time = new Date(this.state.logs[i].Time.toDate());
          let date = new Date(
            time.getFullYear() +
              "-" +
              ("0" + (time.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + (time.getDate() + 1)).slice(-2)
          );

          startdates = new Date(this.state.startdate.date);
          enddates = new Date(this.state.enddate.date);

          if (
            date >= startdates &&
            date <= enddates &&
            this.state.logs[i].Trash_Id.substring(32) == this.state.trashid
          )
            itemfilter.push(this.state.logs[i]);
        }
      } else {
        for (let i = 0; i < this.state.logs.length; i++) {
          let time = new Date(this.state.logs[i].Time.toDate());
          let date = new Date(
            time.getFullYear() +
              "-" +
              ("0" + (time.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + (time.getDate() + 1)).slice(-2)
          );

          startdates = new Date(this.state.startdate.date);
          enddates = new Date(this.state.enddate.date);

          if (
            date >= startdates &&
            date <= enddates &&
            this.state.logs[i].Trash_Id.substring(32) == this.state.trashid &&
            this.state.logs[i].Truck_Id.substring(32) == this.state.truckid
          )
            itemfilter.push(this.state.logs[i]);
        }
      }
    }
    await this.setState({ filteredItems: itemfilter });
  };
  handlePickerTrash = async value => {
    await this.setState({ trashid: value });
    this.handleFilter();
  };
  handlePickerTruck = async value => {
    await this.setState({ truckid: value });
    this.handleFilter();
  };
  handleStartDate = async startdate => {
    await this.setState({ startdate });
    this.handleFilter();
  };

  handleEndDate = async enddate => {
    await this.setState({ enddate });
    this.handleFilter();
  };
  render() {
    //console.log("TRUCKS", this.state.trucks);
    console.log("StartDate", this.state.startdate.date);
    console.log("EndDate", this.state.enddate.date);
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
            text: "Logs",
            style: { color: "#fff", marginLeft: 20 }
          }}
        />
        <Text>
          {"\n"}
          {"\n"}
        </Text>
        <DatePicker
          style={{ width: 200 }}
          date={this.state.startdate.date}
          mode="date"
          placeholder="select start date"
          format="YYYY-MM-DD"
          minDate="2016-05-01"
          maxDate="2030-06-01"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: "absolute",
              left: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              marginLeft: 36
            }
            // ... You can check the source to find the other keys.
          }}
          onDateChange={date => {
            this.handleStartDate({ date });
          }}
        />

        <DatePicker
          style={{ width: 200 }}
          date={this.state.enddate.date}
          mode="date"
          placeholder="select end date"
          format="YYYY-MM-DD"
          minDate="2016-05-01"
          maxDate="2030-06-01"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: "absolute",
              left: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              marginLeft: 36
            }
            // ... You can check the source to find the other keys.
          }}
          onDateChange={date => {
            this.handleEndDate({ date });
          }}
        />
        <Text>
          {"\n"}
          {"\n"}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text>Choose a Trash</Text>
            <Picker
              selectedValue={this.state.trashid}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue, itemIndex) =>
                this.handlePickerTrash(itemValue)
              }
            >
              <Picker.Item label="All" value="0" />
              {this.state.trash.map(tra => (
                <Picker.Item label={tra.id} value={tra.id} />
              ))}
            </Picker>
          </View>
          <View>
            <Text>Choose a Truck</Text>
            <Picker
              selectedValue={this.state.truckid}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue, itemIndex) =>
                this.handlePickerTruck(itemValue)
              }
            >
              <Picker.Item label="All" value="0" />
              {this.state.trucks.map(truck => (
                <Picker.Item label={truck.id} value={truck.id} />
              ))}
            </Picker>
          </View>
        </View>

        {this.state.filteredItems.map(log => (
          <View>
            {/* {console.log("LOGS", log)} */}
            <Text>{log.Desc}</Text>
            <Text>{log.Trash_Id}</Text>
            <Text>{log.Truck_Id}</Text>
          </View>
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
