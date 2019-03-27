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
// import PushNotification from "react-native-push-notification";
import { PushNotificationIOS } from "react-native";
import { ExpoConfigView } from "@expo/samples";
import MapView, { Callout, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import firebase from "firebase";
import { Permissions, ImagePicker } from "expo";
import db from "../db";
import Polyline from "@mapbox/polyline";
import { Card, Divider } from "react-native-elements";

// const localNotification = () => {
//   PushNotification.localNotification({
//     autoCancel: true,
//     largeIcon: "ic_launcher",
//     smallIcon: "ic_notification",
//     bigText: "My big text that will be shown when notification is expanded",
//     subText: "This is a subText",
//     color: "green",
//     vibrate: true,
//     vibration: 300,
//     title: "Notification Title",
//     message: "Notification Message",
//     playSound: true,
//     soundName: "default",
//     actions: '["Accept", "Reject"]'
//   });
// };

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_API_KEY = "AIzaSyCYvMpmVhFc0ydILEuXGJNYNGFnBoKPCL8";
export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: "Map",
    headerTintColor: "white",
    headerStyle: {
      backgroundColor: "#7a66ff",
      borderWidth: 1,
      borderBottomColor: "white"
    },
    headerTitleStyle: { color: "white" }
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
    route: null,
    forcast: null,
    bins: [],
    trucks: [],
    coordsArr: [{ latitude: 25.381649, longitude: 51.479143 }],
    region: {
      latitude: 25.381649,
      longitude: 51.479143,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    },
    selectedBin: null,
    reservationId: null,
    isReserved: false,
    flag: false
  };
  mapView = null;
  async componentDidMount() {
    this.getWhether();
    await Permissions.askAsync(Permissions.LOCATION);
    const email = firebase.auth().currentUser.email;
    await navigator.geolocation.watchPosition(
      position => {
        region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
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
    await db
      .collection("Zone")
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
      console.log("Trucks Changed!");
      this.setState({ trucks });
    });
  }

  getWhether = async () => {
    const result = await fetch(
      "https://weather.cit.api.here.com/weather/1.0/report.json?product=observation&latitude=25.381649&longitude=51.479143&oneobservation=true&app_id=PxvQ4FeG3DpNYbNZBjKH&app_code=dkAcfxUgh-PHLxJox3majw"
    )
      .then(response => response.json())
      .then(forcast => {
        this.setState({ forcast });
      });
  };

  onReady = result => {
    this.mapView.fitToCoordinates(result.coordinates, {
      edgePadding: {
        right: width / 20,
        bottom: height / 20,
        left: width / 20,
        top: height / 20
      }
    });
  };

  getDirections = async (startLoc, destinationLoc) => {
    const req = {
      locations: [startLoc, destinationLoc],
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
      // const response = await fetch(
      //   `https://route.api.here.com/routing/7.2/calculateroute.json?app_id=PxvQ4FeG3DpNYbNZBjKH&app_code=dkAcfxUgh-PHLxJox3majw&waypoint0=geo!${startLoc}&waypoint1=geo!${destinationLoc}&mode=fastest;car;traffic:disabled`
      // )
      //   .then(response => response.json())
      //   .then(data => {
      //     console.log("Route is:", data);
      //   });
      // let resp = await fetch(
      //   `http://www.mapquestapi.com/directions/v2/route?key=0nQiUEMlaswV1NZOEs28vqk0VORCLSCZ`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json"
      //     },
      //     body: JSON.stringify(req)
      //   }
      // )
      //   .then(response => response.json())
      //   .then(data => {
      //     let points = data.route.shape.shapePoints;
      //     const route = [];
      //     for (let i = 0; i < points.length; i += 2) {
      //       if (i < points.length - 1)
      //         route.push({ latitude: points[i], longitude: points[i + 1] });
      //     }
      //     this.setState({ route });
      //     //console.log("Route is:", data);
      //   });
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
    //console.log("Truck Id is: ", truckId);
    const result = await db
      .collection(`Reserve_Bin`)
      .where("Status", "==", "inprogress")
      .where("Truck_Id", "==", truckId)
      .get();

    //console.log("result is: ", result.size);

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

  handleMarker = (markerCoords, selectedBin) => {
    const origin = {
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude
    };
    const distination = {
      latitude: markerCoords.latitude,
      longitude: markerCoords.longitude
    };
    const route = [origin, distination];
    this.setState({ route });
    // const origin =
    //   "" + this.state.region.latitude + "," + this.state.region.longitude;
    // const distination =
    //   "" + markerCoords.latitude + "," + markerCoords.longitude;
    //this.getDirections(origin, distination);
    if (selectedBin.Status === "Reserved") {
      this.setState({ selectedBin, isReserved: true });
    } else if (
      selectedBin.Status === "Damaged" ||
      selectedBin.Status === "Under Maintenance"
    ) {
      this.setState({ selectedBin: null, isReserved: false });
    } else {
      this.setState({ selectedBin, isReserved: false });
    }
  };

  unSelect = () => {
    this.setState({
      selectedBin: null,
      isReserved: false,
      route: null,
      flag: false
    });
  };
  onError = errorMessage => {
    alert(errorMessage);
  };

  render() {
    console.log(this.state.route);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center"
        }}
      >
        <View
          style={{
            flex: 1,
            padding: "1%"
          }}
        >
          {this.state.forcast !== null && (
            <Card
              containerStyle={{
                backgroundColor: "rgba(56, 172, 236, 1)",
                borderWidth: 0,
                marginTop: 0,
                marginLeft: "auto",
                marginRight: "auto",
                borderRadius: 10,
                width: width
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
                    this.state.forcast.observations.location[0].observation[0].temperature.split(
                      "."
                    )[0]
                  }
                  {"\u00b0"}C
                </Text>
              </View>
            </Card>
          )}
          <MapView
            ref={c => (this.mapView = c)}
            showsCompass={true}
            toolbarEnabled
            showsMyLocationButton={true}
            showsUserLocation
            provider={PROVIDER_GOOGLE}
            onPress={this.unSelect}
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
              <MapView.Marker
                key={i}
                tracksViewChanges
                ref={marker => {
                  this.marker = marker;
                }}
                onPress={e => {
                  e.stopPropagation();
                  this.handleMarker(
                    {
                      latitude: bin.Loc._lat,
                      longitude: bin.Loc._long
                    },
                    bin
                  );
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
            ))}
            {this.state.trucks.map((truck, i) => (
              <MapView.Marker
                key={i}
                tracksViewChanges
                ref={marker => {
                  this.marker = marker;
                }}
                coordinate={{
                  latitude: truck.Location._lat,
                  longitude: truck.Location._long
                }}
              >
                <Image
                  source={require("../assets/images/truck.png")}
                  style={{
                    width: 50,
                    height: 50
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
                      truck Id: {"" + truck.id}
                    </Text>
                    <Text style={{ fontWeight: "bold" }}>
                      {console.log("Truck is: ", truck)}
                      Crew:
                    </Text>
                    {truck.Crew.map(memeber => {
                      <Text>
                        {memeber} {console.log("Memeber is: ", memeber)}
                      </Text>;
                    })}
                  </View>
                </Callout>
              </MapView.Marker>
            ))}
            {this.state.route !== null && (
              // <MapView.Polyline
              //   coordinates={this.state.route}
              //   strokeWidth={2}
              //   strokeColor="red"
              // />

              <MapViewDirections
                origin={this.state.route[0]}
                destination={this.state.route[1]}
                apikey={GOOGLE_API_KEY}
                strokeWidth={3}
                strokeColor="#7a66ff"
                onReady={this.onReady}
                onError={this.onError}
              />
            )}
          </MapView>
          <TouchableOpacity
            onPress={
              this.state.isReserved ? this.cancelReservation : this.reserveBin
            }
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
              top: height - 190,
              bottom: height - 20,
              left: width - 400,
              right: width - 50
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
              top: height - 190,
              bottom: height - 20,
              left: width - 300,
              right: width - 50
            }}
          >
            <Text style={{ textAlign: "center" }}>Empty</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Chat")}
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
              top: height - 190,
              bottom: height - 20,
              left: width - 200,
              right: width - 50
            }}
          >
            <Text style={{ textAlign: "center" }}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
