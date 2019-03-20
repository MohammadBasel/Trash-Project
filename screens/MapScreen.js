import React from "react";
import {
  Text,
  View,
  Image,
  TouchableHighlight,
  Button,
  TouchableOpacity,
  Dimensions
  /*, StyleSheet*/
} from "react-native";
import { ExpoConfigView } from "@expo/samples";
import MapView, { Callout } from "react-native-maps";
import firebase from "firebase";
import { Permissions } from "expo";
import db from "../db";

const { width, height } = Dimensions.get("window");

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: "Map"
  };
  // [
  //   { latitude: 25.380331, longitude: 51.489722 },
  //   { latitude: 25.375834, longitude: 51.48307 },
  //   { latitude: 25.36199, longitude: 51.483364 },
  //   { latitude: 25.359082, longitude: 51.48184 }
  // ],
  // coordsArr: [
  //   { latitude: 25.381649, longitude: 51.479143 },
  //   { latitude: 25.359159, longitude: 51.478886 },
  //   { latitude: 25.359314, longitude: 51.494207 },
  //   { latitude: 25.384426, longitude: 51.49592 }
  // ]

  state = {
    user: null,
    zone: null,
    bins: [],
    trucks: [],
    coordsArr: [{ latitude: 25.381649, longitude: 51.479143 }],
    region: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    },
    selectedBin: null,
    reservationId: null,
    isReserved: false,
    flag: false
  };
  async componentDidMount() {
    await Permissions.askAsync(Permissions.LOCATION);
    const email = firebase.auth().currentUser.email;
    await navigator.geolocation.watchPosition(
      position => {
        region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        };
        this.setState({ region });
      },
      error => {
        console.warn("Error Code: ", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
    const result = await db
      .collection("Users")
      .doc(email)
      .get();

    const zoneId = result.data().Zone;
    const user = { id: result.id, ...result.data() };
    db.collection("Zone")
      .doc(zoneId)
      .onSnapshot(querySnapshot => {
        const id = querySnapshot.id;
        const coordsArr = this.convertToObjects(
          querySnapshot.data().Coordinate
        );
        const zone = { id, ...querySnapshot.data() };
        this.setState({ zone, coordsArr, user });
      });

    db.collection(`Zone/${zoneId}/Trash`).onSnapshot(querySnapshot => {
      let bins = [];
      querySnapshot.forEach(doc => {
        bins.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ bins });
    });

    db.collection(`Zone/${zoneId}/Truck`).onSnapshot(querySnapshot => {
      let trucks = [];
      querySnapshot.forEach(doc => {
        trucks.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ trucks });
    });
  }

  cancelReservation = async () => {
    let truckId = null;
    for (let i = 0; i < this.state.trucks.length; i++) {
      let user = this.state.trucks[i].Crew.find(c => c === this.state.user.id);
      if (user !== undefined) {
        truckId = this.state.trucks[i].id;
        break;
      }
    }
    let reservation = null;

    const result = await db
      .collection(`Reserve_Bin`)
      .where("Trash_Id", "==", this.state.selectedBin.id)
      .where("Status", "==", "inprogress")
      .get();
    result.forEach(doc => {
      reservation = { id: doc.id, ...doc.data() };
    });

    if (reservation.Truck_Id === truckId) {
      await db
        .collection(`Reserve_Bin`)
        .doc(reservation.id)
        .update({ Status: "Cancelled" });
      await db
        .collection(`Zone/${this.state.zone.id}/Trash`)
        .doc(this.state.selectedBin.id)
        .update({ Status: "Active" });
    } else {
      alert(
        "You cannot cancel this reservation because you did not created it!"
      );
    }
  };

  reserveBin = async () => {
    if (this.state.selectedBin.Status === "Reserved") {
      alert("This bin is already reserved!");
      return;
    } else if (this.state.selectedBin.Status === "Damaged") {
      alert("This bin is damaged and cannot be reserved!");
      return;
    } else if (this.state.selectedBin.Status === "Under Maintenance") {
      alert("This bin is Under Maintenance and cannot be reserved!");
      return;
    }

    let truckId = null;
    for (let i = 0; i < this.state.trucks.length; i++) {
      let user = this.state.trucks[i].Crew.find(c => c === this.state.user.id);
      if (user !== undefined) {
        truckId = this.state.trucks[i].id;
        break;
      }
    }
    console.log("Truck Id is: ", truckId);
    const result = await db
      .collection(`Reserve_Bin`)
      .where("Status", "==", "inprogress")
      .where("Truck_Id", "==", truckId)
      .get();

    console.log("result is: ", result.size);

    if (result.size <= 0) {
      db.collection(`Zone/${this.state.zone.id}/Trash`)
        .doc(this.state.selectedBin.id)
        .update({ Status: "Reserved" });

      const result = await db.collection("Reserve_Bin").add({
        Status: "inprogress",
        Time: new Date(),
        Trash_Id: this.state.selectedBin.id,
        Truck_Id: truckId
      });
      this.setState({ reservationId: result.id });
    } else {
      alert("You can not reserve more than one trash bin at a time!");
    }
  };

  emptyBin = async () => {
    let truckId = null;
    for (let i = 0; i < this.state.trucks.length; i++) {
      let user = this.state.trucks[i].Crew.find(c => c === this.state.user.id);
      if (user !== undefined) {
        truckId = this.state.trucks[i].id;
        break;
      }
    }

    await db
      .collection(`Zone/${this.state.zone.id}/Trash`)
      .doc(this.state.selectedBin.id)
      .update({ Status: "Active", Level: 0 });

    console.log("Trash Id: ", this.state.selectedBin.id);
    await db
      .collection(`Reserve_Bin`)
      .doc(this.state.reservationId)
      .update({ Status: "Complete" });
  };

  convertToObjects = arr => {
    let temp = [];
    arr.forEach(cor => {
      temp.push({ latitude: cor._lat, longitude: cor._long });
    });
    return temp;
  };

  render() {
    // console.log(this.state);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center"
        }}
      >
        <View
          style={{
            flex: 1
          }}
        >
          <Text>Welcome Map!</Text>
          <MapView
            showsCompass={true}
            showsMyLocationButton={true}
            showsUserLocation
            onPress={() => {
              this.setState({ selectedBin: null, isReserved: false });
            }}
            style={{
              flex: 1,
              zIndex: -1
            }}
            customMapStyle={[
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [
                  {
                    color: "#000000"
                  },
                  {
                    weight: 1
                  }
                ]
              }
            ]}
            region={this.state.region}
          >
            <MapView.Polygon
              coordinates={this.state.coordsArr}
              strokeColor="green"
              strokeWidth={2}
            />
            {this.state.bins.map((bin, i) => (
              <TouchableOpacity key={i}>
                <MapView.Marker
                  tracksViewChanges
                  ref={marker => {
                    this.marker = marker;
                  }}
                  onPress={() => {
                    bin.Status === "Reserved"
                      ? this.setState({ selectedBin: bin, isReserved: true })
                      : this.setState({ selectedBin: bin, isReserved: false });
                  }}
                  coordinate={{
                    latitude: bin.Loc._lat,
                    longitude: bin.Loc._long
                  }}
                >
                  <Image
                    source={require("../assets/images/bin.png")}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: [
                        bin.Status === "Damaged" ||
                        bin.Status === "Under Maintenance"
                          ? "black"
                          : bin.Status === "Reserved"
                          ? "blue"
                          : bin.Level < 50
                          ? "green"
                          : 50 <= bin.Level && bin.Level < 80
                          ? "orange"
                          : "red"
                      ]
                    }}
                  />
                  <Callout>
                    <View
                      style={{
                        width: width * 0.5,
                        height: height * 0.15,
                        justifyContent: "center"
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>
                        Bin Id: {"" + bin.id}
                      </Text>
                      <Text style={{ fontWeight: "bold" }}>
                        Bin Level: {"" + bin.Level}%
                      </Text>
                      <Text style={{ fontWeight: "bold" }}>
                        Battery Level: {"" + bin.Battery}%
                      </Text>
                      <Text style={{ fontWeight: "bold" }}>
                        Status: {bin.Status}
                      </Text>
                    </View>
                  </Callout>
                </MapView.Marker>
              </TouchableOpacity>
            ))}
          </MapView>
          <TouchableOpacity
            onPress={
              this.state.isReserved ? this.cancelReservation : this.reserveBin
            }
            disabled={this.state.selectedBin === null ? true : false}
            style={{
              backgroundColor: "lightgreen",
              padding: "15%",
              width: width * 0.3,
              height: height * 0.1,
              position: "absolute",
              top: 600,
              bottom: 20,
              left: 40,
              right: 50
            }}
          >
            <Text style={{ textAlign: "center" }}>
              {this.state.isReserved ? "Cancel" : "Reserve"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.emptyBin}
            disabled={
              this.state.selectedBin === null ||
              this.state.selectedBin.Status === "Damaged" ||
              this.state.selectedBin.Status === "Under Maintenance"
                ? true
                : false
            }
            style={{
              backgroundColor: "lightgreen",
              padding: "15%",
              width: width * 0.3,
              height: height * 0.1,
              position: "absolute",
              top: 600,
              bottom: 20,
              left: 175,
              right: 50
            }}
          >
            <Text style={{ textAlign: "center" }}>Empty</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.emptyBin}
            disabled={
              this.state.selectedBin === null ||
              this.state.selectedBin.Status === "Damaged" ||
              this.state.selectedBin.Status === "Under Maintenance"
                ? true
                : false
            }
            style={{
              backgroundColor: "lightgreen",
              padding: "15%",
              width: width * 0.3,
              height: height * 0.1,
              position: "absolute",
              top: 600,
              bottom: 20,
              left: 300,
              right: 50
            }}
          >
            <Text style={{ textAlign: "center" }}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
