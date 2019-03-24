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
import { Permissions, ImagePicker } from "expo";
import db from "../db";
import Polyline from "@mapbox/polyline";
import { Card, Divider } from "react-native-elements";

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
    coords: [
      {
        latitude: 38.893165,
        longitude: -77.077957
      },
      {
        latitude: 38.893276,
        longitude: -77.077407
      },
      {
        latitude: 38.893276,
        longitude: -77.077407
      },
      {
        latitude: 38.892032,
        longitude: -77.077247
      },
      {
        latitude: 38.890857,
        longitude: -77.077087
      }
    ],
    forcast: null,
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
    this.getWhether();
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

  getWhether = async () => {
    const result = await fetch(
      "https://weather.cit.api.here.com/weather/1.0/report.json?product=observation&latitude=25.381649&longitude=51.479143&oneobservation=true&app_id=PxvQ4FeG3DpNYbNZBjKH&app_code=dkAcfxUgh-PHLxJox3majw"
    )
      .then(response => response.json())
      .then(forcast => {
        this.setState({ forcast }), console.log("Forcast is: ", forcast);
      });
  };

  getDirections = async (startLoc, destinationLoc) => {
    console.log("Start Loco: ", startLoc);
    console.log("destination Loco: ", destinationLoc);

    const req = {
      location: [
        {
          latLng: {
            lng: 25.3604823,
            lat: 51.4801991
          },
          latLng: {
            lng: 25.375834,
            lat: 51.48307
          }
        }
      ],
      options: {
        avoids: [],
        avoidTimedConditions: false,
        doReverseGeocode: true,
        shapeFormat: "raw",
        generalize: 0,
        routeType: "fastest",
        timeType: 1,
        unit: "k",
        enhancedNarrative: false,
        drivingStyle: 2,
        highwayEfficiency: 21.0
      }
    };
    //&from=25.3604823,51.4801991&to=25.375834,51.48307
    try {
      // let resp = await fetch(
      //   `http://www.mapquestapi.com/directions/v2/route?key=0nQiUEMlaswV1NZOEs28vqk0VORCLSCZ`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json"
      //     },
      //     body: JSON.stringify(req)
      //   }
      // );
      //console.log("Res is: ", resp);
      // let respJson = await resp.json();
      // let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      // let coords = points.map((point, index) => {
      //   return {
      //     latitude: point[0],
      //     longitude: point[1]
      //   };
      // });
      // this.setState({ coords: coords });
      // return coords;
    } catch (error) {
      alert(error);
      return error;
    }
  };

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
    let turck = null;
    for (let i = 0; i < this.state.trucks.length; i++) {
      let user = this.state.trucks[i].Crew.find(c => c === this.state.user.id);
      if (user !== undefined) {
        turck = this.state.trucks[i];
        break;
      }
    }

    await db
      .collection(`Zone/${this.state.zone.id}/Trash`)
      .doc(this.state.selectedBin.id)
      .update({ Status: "Active", Level: 0 });

    await db
      .collection(`Reserve_Bin`)
      .doc(this.state.reservationId)
      .update({ Status: "Complete" });
    for (let i = 0; turck.Crew.length; i++) {
      const user = await db
        .collection("Users")
        .doc(turck.Crew[i])
        .get();
      await db
        .collection("Users")
        .doc(turck.Crew[i])
        .update({ Points: user.data().Points + 1 });
    }
  };

  convertToObjects = arr => {
    let temp = [];
    arr.forEach(cor => {
      temp.push({ latitude: cor._lat, longitude: cor._long });
    });
    return temp;
  };

  handleMarker = (markerCoords, bin) => {
    const origin =
      "" + this.state.region.latitude + "," + this.state.region.longitude;
    const distination =
      "" + markerCoords.latitude + "," + markerCoords.longitude;
    //this.getDirections(origin, distination);
    console.log("BIN isss: ", bin);
    if (bin.Status === "Reserved") {
      this.setState({ selectedBin: bin, isReserved: true });
    } else {
      this.setState({ selectedBin: bin, isReserved: false });
    }
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
          <View>
            {this.state.forcast !== null && (
              <Card
                containerStyle={{
                  backgroundColor: "rgba(56, 172, 236, 1)",
                  borderWidth: 0,
                  borderRadius: 10
                }}
              >
                <Text>
                  {this.state.forcast.observations.location[0].country},{" "}
                  {this.state.forcast.observations.location[0].state},{" "}
                  {this.state.forcast.observations.location[0].city}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Image
                    style={{ width: 50, height: 50 }}
                    source={{
                      uri: this.state.forcast.observations.location[0]
                        .observation[0].iconLink
                    }}
                  />
                  <Text style={{ fontSize: 38 }}>
                    {new Date().getHours() + ":" + new Date().getMinutes()}
                  </Text>
                </View>
                <Divider
                  style={{ backgroundColor: "#dfe6e9", marginVertical: 20 }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                >
                  <Text>
                    {
                      this.state.forcast.observations.location[0].observation[0]
                        .description
                    }
                  </Text>
                  <Text>
                    {
                      this.state.forcast.observations.location[0].observation[0]
                        .temperature
                    }
                    {"\u00b0"}C
                  </Text>
                </View>
              </Card>
            )}
          </View>
          <MapView
            showsCompass={true}
            showsMyLocationButton={true}
            showsUserLocation
            onPress={() => {
              this.setState({ selectedBin: null, isReserved: false });
            }}
            style={{
              flex: 1,
              width: width,
              height: height,
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
                  onPress={() =>
                    this.handleMarker(
                      {
                        latitude: bin.Loc._lat,
                        longitude: bin.Loc._long
                      },
                      bin
                    )
                  }
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
            {this.state.coords !== null && (
              <MapView.Polyline
                coordinates={this.state.coords}
                strokeWidth={2}
                strokeColor="red"
              />
            )}
          </MapView>
          <TouchableOpacity
            onPress={
              this.state.isReserved ? this.cancelReservation : this.reserveBin
            }
            disabled={this.state.selectedBin === null ? true : false}
            style={{
              backgroundColor: "#7a66ff",
              opacity: this.state.selectedBin === null ? 0.5 : 1,
              borderRadius: 10,
              border: "1px solid #7a66ff",
              padding: "15%",
              width: width * 0.2,
              height: height * 0.06,
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
              backgroundColor: "#7a66ff",
              opacity: this.state.selectedBin === null ? 0.5 : 1,
              borderRadius: 10,
              border: "1px solid #7a66ff",
              padding: "15%",
              width: width * 0.2,
              height: height * 0.06,
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
              backgroundColor: "#7a66ff",
              opacity: this.state.selectedBin === null ? 0.5 : 1,
              borderRadius: 10,
              border: "1px solid #7a66ff",
              padding: "15%",
              width: width * 0.2,
              height: height * 0.06,
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
