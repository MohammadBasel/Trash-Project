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
    flag: false
  };
  async componentDidMount() {
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
      .doc("fida@fida.com")
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

  reserveBin = async () => {
    let truckId = null;
    for (let i = 0; i < this.state.trucks.length; i++) {
      let user = this.state.trucks[i].Crew.find(c => c === this.state.user.id);
      if (user !== undefined) {
        truckId = this.state.trucks[i].id;
        break;
      }
    }

    const result = await db
      .collection(`Reserve_Bin`)
      .where("Status", "==", "inprogress")
      .where("Truck_Id", "==", truckId)
      .get();

    if (result.size <= 0) {
      db.collection(`Zone/${this.state.zone.id}/Trash`)
        .doc(this.state.selectedBin.id)
        .update({ Status: "Reserved" });

      db.collection("Reserve_Bin")
        .doc()
        .set({
          Status: "inprogress",
          Time: new Date(),
          Trash_Id: this.state.selectedBin.id,
          Truck_Id: truckId
        });
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
    this.setState({ selectedBin: null });

    console.log("Current trash: ", this.state.selectedBin.id);
    await db
      .collection(`Reserve_Bin`)
      .where("Trash_Id", "==", this.state.selectedBin.id)
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
              this.setState({ selectedBin: null });
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
                    this.setState({ selectedBin: bin });
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
                        bin.Status === "Damaged"
                          ? "black"
                          : bin.Status === "Reserved"
                          ? "lightblue"
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
                        width: 200,
                        height: 115,
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
            onPress={this.reserveBin}
            disabled={
              this.state.selectedBin === null ||
              (this.state.selectedBin.Status === "Reserved" && false)
            }
            style={{
              backgroundColor: "lightgreen",
              width: 75,
              height: 50,
              position: "absolute",
              top: 600,
              bottom: 20,
              left: 20,
              right: 50
            }}
          >
            <Text style={{ textAlign: "center" }}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.emptyBin}
            disabled={
              this.state.selectedBin === null ||
              (this.state.selectedBin.Status === "Reserved" && false)
            }
            style={{
              backgroundColor: "lightgreen",
              width: 75,
              height: 50,
              position: "absolute",
              top: 600,
              bottom: 20,
              left: 200,
              right: 50
            }}
          >
            <Text style={{ textAlign: "center" }}>Empty</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
