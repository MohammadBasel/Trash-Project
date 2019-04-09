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
import { Permissions, ImagePicker, Notifications } from "expo";
import db from "../db";
import Polyline from "@mapbox/polyline";
import { Popup } from "react-native-map-link";
import { Card, Divider, Overlay } from "react-native-elements";
import Dialog, {
  SlideAnimation,
  DialogContent,
  DialogTitle,
  DialogButton,
  DialogFooter
} from "react-native-popup-dialog";

const { width, height, fontScale } = Dimensions.get("window");
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
    zones: [],
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
    flag: false,
    countDown: 30,
    visiable: false,
    directions: [],
    bestRoutePoints: [],
    token: null,
    notification: null,
    title: "Hello World",
    body: "Say something!"
  };
  fontSize = 16;
  timer = null;
  mapView = null;
  bestRoutePoints = [];

  async componentDidMount() {
    //this.getDirections();
    this.getWhether();
    setInterval(this.tempUpdater, 30000);
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
    if (user.Role === "Maintainer") {
      await db.collection("Zone").onSnapshot(querySnapshot => {
        let zones = [];
        let bins = [];
        querySnapshot.forEach(async doc => {
          let coordsArr = this.convertToObjects(doc.data().Coordinate);
          const zoneObj = { id: doc.id, ...doc.data() };

          zones.push({ zoneObj, coordsArr });
          await db
            .collection(`Zone/${doc.id}/Trash`)
            .onSnapshot(querySnapshot => {
              querySnapshot.forEach(doc => {
                bins.push({ id: doc.id, ...doc.data() });
              });
            });
          this.setState({ bins });
        });
        const zone = zones.find(zad => zad.zoneObj.id === zoneId);
        console.log("Zone is: ", zone);
        this.setState({ zones, zone, user });
        bins = [];
      });
    } else {
      await db
        .collection("Zone")
        .doc(zoneId)
        .onSnapshot(querySnapshot => {
          const id = querySnapshot.id;
          const coordsArr = this.convertToObjects(
            querySnapshot.data().Coordinate
          );
          const zoneObj = { id, ...querySnapshot.data() };
          const zone = { zoneObj, coordsArr };
          this.setState({ zone, user });
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
  }

  tempUpdater = async () => {
    let data = null;
    const result = await fetch(
      "https://weather.cit.api.here.com/weather/1.0/report.json?product=observation&latitude=25.381649&longitude=51.479143&oneobservation=true&app_id=PxvQ4FeG3DpNYbNZBjKH&app_code=dkAcfxUgh-PHLxJox3majw"
    )
      .then(response => response.json())
      .then(forcast => {
        data = forcast.observations.location[0].observation[0].temperature.split(
          "."
        )[0];
      });
    const updateBinTemp = firebase.functions().httpsCallable("updateBinTemp");
    await updateBinTemp({ temp: data });
  };

  startTimer = () => {
    this.setState({ countDown: this.state.countDown - 1 }, () => {
      if (this.state.countDown === 0) {
        console.log("Time is in: ", this.state.countDown);
        clearInterval(this.timer);
        this.timer = null;
        this.setState({ countDown: 30 });
        this.deductPoints();
      }
    });
  };

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

  resetRoutePoints = () => {
    this.setState({ bestRoutePoints: [] });
  };

  addRoutePoint = () => {
    let bestRoutePoints = [...this.state.bestRoutePoints];
    bestRoutePoints.push(this.state.selectedBin);
    this.setState({ bestRoutePoints });
  };

  clacBestRoute = async () => {
    if (this.state.directions.length === 0) {
      let locations = [];
      this.state.bestRoutePoints.forEach(point => {
        let segment = point.Loc._lat + "," + point.Loc._long;
        locations.push(segment);
      });

      const req = {
        locations: locations
      };

      if (this.state.bestRoutePoints.length > 1) {
        try {
          let resp = await fetch(
            `http://www.mapquestapi.com/directions/v2/optimizedroute?key=0nQiUEMlaswV1NZOEs28vqk0VORCLSCZ`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(req)
            }
          )
            .then(response => response.json())
            .then(data => {
              let directions = [];
              console.log("data: ", data);
              console.log(
                "data.route.locationSequence: ",
                data.route.locationSequence
              );

              const sequence = data.route.locationSequence;
              for (let i = 0; i < sequence.length; i++) {
                directions.push(this.state.bestRoutePoints[sequence[i]]);
              }
              console.log("directions are:", directions);
              this.setState({ directions, dialogIsVisiable: true });
            });
        } catch (error) {
          alert(error);
          return error;
        }
      } else {
        alert("You need to select two trash bins at least!");
      }
    } else {
      this.setState({ dialogIsVisiable: true });
    }
  };

  getDirections = async (startLoc, destinationLoc) => {
    const req = {
      locations: [
        "25.380331,51.489722",
        "25.359082,51.48184",
        "25.375834,51.48307",
        "25.36199,51.483364"
      ]
      // options: {
      //   avoids: [],
      //   avoidTimedConditions: false,
      //   doReverseGeocode: true,
      //   shapeFormat: "raw",
      //   generalize: 0,
      //   routeType: "fastest",
      //   timeType: 1,
      //   unit: "k",
      //   enhancedNarrative: false,
      //   drivingStyle: 2,
      //   highwayEfficiency: 21.0
      // }
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
        .collection(`Zone/${this.state.zone.zoneObj.id}/Trash`)
        .doc(this.state.selectedBin.id)
        .update({ Status: "Active" });
      clearImmediate(this.timer);
      this.timer = null;
      this.setState({ countDown: 30 });

      const Desc = "Trash bin reservation has been cancelled";
      const Time = new Date();
      const Trash_Id = this.state.selectedBin.id;
      const Truck_Id = truckId;
      const User_Id = this.state.user.id;
      const Zone_Id = this.state.zone.zoneObj.id;

      db.collection("Logging").add({
        Desc,
        Time,
        Trash_Id,
        Truck_Id,
        User_Id,
        Zone_Id
      });
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
    const Desc = "Trash bin has been reserved";
    const Time = new Date();
    const Trash_Id = this.state.selectedBin.id;
    const Truck_Id = truckId;
    const User_Id = this.state.user.id;
    const Zone_Id = this.state.zone.zoneObj.id;

    db.collection("Logging").add({
      Desc,
      Time,
      Trash_Id,
      Truck_Id,
      User_Id,
      Zone_Id
    });
    //console.log("Truck Id is: ", truckId);
    const result = await db
      .collection(`Reserve_Bin`)
      .where("Status", "==", "inprogress")
      .where("Truck_Id", "==", truckId)
      .get();

    //console.log("result is: ", result.size);

    if (result.size <= 0) {
      db.collection(`Zone/${this.state.zone.zoneObj.id}/Trash`)
        .doc(this.state.selectedBin.id)
        .update({ Status: "Reserved" });

      const result = await db.collection("Reserve_Bin").add({
        Status: "inprogress",
        Time: new Date(),
        Trash_Id: this.state.selectedBin.id,
        Truck_Id: truckId
      });
      timer = setInterval(this.startTimer, 1000);
      this.timer = timer;
      this.setState({ reservationId: result.id });
    } else {
      alert("You can not reserve more than one trash bin at a time!");
    }
  };

  deductPoints = async () => {
    let turck = null;
    for (let i = 0; i < this.state.trucks.length; i++) {
      let user = this.state.trucks[i].Crew.find(c => c === this.state.user.id);
      if (user !== undefined) {
        turck = this.state.trucks[i];
        break;
      }
    }
    const Desc = "Team points was deducted from";
    const Time = new Date();
    const Trash_Id = this.state.selectedBin.id;
    const Truck_Id = truckId;
    const User_Id = this.state.user.id;
    const Zone_Id = this.state.zone.zoneObj.id;

    db.collection("Logging").add({
      Desc,
      Time,
      Trash_Id,
      Truck_Id,
      User_Id,
      Zone_Id
    });

    await db
      .collection(`Zone/${this.state.zone.zoneObj.id}/Trash`)
      .doc(this.state.selectedBin.id)
      .update({ Status: "Active" });

    await db
      .collection(`Reserve_Bin`)
      .doc(this.state.reservationId)
      .update({ Status: "Abandoned" });

    for (let i = 0; turck.Crew.length; i++) {
      const user = await db
        .collection("Users")
        .doc(turck.Crew[i])
        .get();
      await db
        .collection("Users")
        .doc(turck.Crew[i])
        .update({ Points: user.data().Points - 2 });
    }
    clearImmediate(this.timer);
    this.timer = null;
    this.setState({ countDown: 30 });
  };

  emptyBin = async () => {
    clearImmediate(this.timer);
    this.timer = null;
    this.setState({ countDown: 30 });
    let turck = null;
    for (let i = 0; i < this.state.trucks.length; i++) {
      let user = this.state.trucks[i].Crew.find(c => c === this.state.user.id);
      if (user !== undefined) {
        turck = this.state.trucks[i];
        break;
      }
    }

    const Desc = "Trash bin was emptied";
    const Time = new Date();
    const Trash_Id = this.state.selectedBin.id;
    const Truck_Id = truckId;
    const User_Id = this.state.user.id;
    const Zone_Id = this.state.zone.zoneObj.id;

    db.collection("Logging").add({
      Desc,
      Time,
      Trash_Id,
      Truck_Id,
      User_Id,
      Zone_Id
    });

    await db
      .collection(`Zone/${this.state.zone.zoneObj.id}/Trash`)
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

  inArray = id => {
    let bin = this.state.bestRoutePoints.find(bin => bin.id === id);
    return bin !== undefined;
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
    //console.log(this.state.route);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center"
        }}
      >
        <View>
          <Dialog
            hasOverlay
            visible={this.state.dialogIsVisiable}
            onTouchOutside={() => {
              this.setState({ dialogIsVisiable: false });
            }}
            dialogTitle={
              <DialogTitle title="Please Follow These Instructions" />
            }
            dialogAnimation={
              new SlideAnimation({
                slideFrom: "bottom"
              })
            }
          >
            <DialogContent>
              {this.state.directions.map((trashBin, i) => (
                <Text
                  key={i}
                  style={{ fontWeight: "bold", color: "#7a66ff" }}
                  onPress={() =>
                    this.setState({
                      selectedBin: trashBin,
                      dialogIsVisiable: false
                    })
                  }
                >
                  {trashBin.id}
                </Text>
              ))}
            </DialogContent>
            <DialogFooter>
              <DialogButton
                text="Close"
                onPress={() => {
                  this.setState({ dialogIsVisiable: false });
                }}
              />
            </DialogFooter>
          </Dialog>
        </View>
        <Popup
          isVisible={this.state.visiable}
          onCancelPressed={() => this.setState({ visiable: false })}
          onAppPressed={() => this.setState({ visiable: false })}
          onBackButtonPressed={() => this.setState({ visiable: false })}
          modalProps={{
            // you can put all react-native-modal props inside.
            animationIn: "slideInUp"
          }}
          options={
            this.state.selectedBin !== null
              ? {
                  latitude: this.state.selectedBin.Loc._lat,
                  longitude: this.state.selectedBin.Loc._long,
                  sourceLatitude: this.state.region.latitude,
                  sourceLongitude: this.state.region.longitude
                }
              : {}
          }
          style={
            {
              /* Optional: you can override default style by passing your values. */
            }
          }
        />
        <View
          style={{
            flex: 1,
            padding: "1%"
          }}
        >
          {this.state.forcast !== null && (
            <Card
              containerStyle={{
                backgroundColor: "rgba(56, 172, 236, 1.0)",
                borderWidth: 0,
                margin: 0,
                width: width
              }}
            >
              <Text style={{ fontSize: this.fontSize / fontScale }}>
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
                <Text style={{ fontSize: 38 / fontScale }}>
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
                <Text style={{ fontSize: this.fontSize / fontScale }}>
                  {
                    this.state.forcast.observations.location[0].observation[0]
                      .description
                  }
                </Text>
                <Text style={{ fontSize: this.fontSize / fontScale }}>
                  {
                    this.state.forcast.observations.location[0].observation[0].temperature.split(
                      "."
                    )[0]
                  }
                  {"\u00b0"}C
                </Text>
              </View>
              {this.timer !== null && (
                <View>
                  <Divider
                    style={{ backgroundColor: "#dfe6e9", marginVertical: 20 }}
                  />
                  <Text style={{ fontSize: this.fontSize / fontScale }}>
                    You have
                    <Text
                      style={{
                        fontSize: this.fontSize / fontScale,
                        fontWeight: "bold",
                        color: this.state.countDown < 11 ? "red" : "black"
                      }}
                    >
                      {" "}
                      {this.state.countDown}{" "}
                    </Text>
                    seconds to empty this trash bin!
                  </Text>
                </View>
              )}
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
            {this.state.user !== null && this.state.user.Role === "Maintainer"
              ? this.state.zones.map((z, i) => (
                  <MapView.Polygon
                    coordinates={z.coordsArr}
                    strokeColor="green"
                    strokeWidth={2}
                  />
                ))
              : this.state.user !== null &&
                this.state.user.Zone === this.state.zone.zoneObj.id && (
                  <MapView.Polygon
                    coordinates={this.state.zone.coordsArr}
                    strokeColor="green"
                    strokeWidth={2}
                  />
                )}

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
                  source={require("../assets/images/bin1.png")}
                  style={{
                    width: 40,
                    height: 40,
                    tintColor: [
                      bin.Status === "Damaged" ||
                      bin.Status === "Under Maintenance" ||
                      bin.Status === "Disabled"
                        ? "black"
                        : bin.Status === "Reserved"
                        ? "blue"
                        : this.inArray(bin.id)
                        ? "yellow"
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
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: this.fontSize / fontScale
                      }}
                    >
                      Bin Id: {"" + bin.id}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: this.fontSize / fontScale
                      }}
                    >
                      Bin Level: {"" + bin.Level}%
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: this.fontSize / fontScale
                      }}
                    >
                      Battery Level: {"" + bin.Battery}%
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: this.fontSize / fontScale
                      }}
                    >
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
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: this.fontSize / fontScale
                      }}
                    >
                      truck Id: {"" + truck.id}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: this.fontSize / fontScale
                      }}
                    >
                      Crew:
                    </Text>
                    {truck.Crew.map((memeber, i) => (
                      <Text key={i}>{memeber}</Text>
                    ))}
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
                strokeColor="#173fc4"
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
              this.state.selectedBin.Status === "Under Maintenance" ||
              this.state.selectedBin.Status === "Disabled" ||
              this.state.user.Role === "Maintainer"
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
              top: height * 0.28,
              left: width * 0.03
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 15 / fontScale
              }}
            >
              {this.state.isReserved ? "Cancel" : "Reserve"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.emptyBin}
            disabled={
              this.state.selectedBin === null ||
              this.state.selectedBin.Status === "Damaged" ||
              this.state.selectedBin.Status === "Under Maintenance" ||
              this.state.selectedBin.Status === "Disabled" ||
              this.state.user.Role === "Maintainer"
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
              top: height * 0.35,
              left: width * 0.03
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: this.fontSize / fontScale
              }}
            >
              Empty
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Chat")}
            disabled={
              this.state.selectedBin === null ||
              this.state.selectedBin.Status === "Damaged" ||
              this.state.selectedBin.Status === "Under Maintenance" ||
              this.state.selectedBin.Status === "Disabled" ||
              this.state.user.Role === "Maintainer"
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
              top: height * 0.42,
              left: width * 0.03
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: this.fontSize / fontScale
              }}
            >
              Report
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ visiable: true })}
            disabled={
              this.state.selectedBin === null ||
              this.state.selectedBin.Status === "Damaged" ||
              this.state.selectedBin.Status === "Under Maintenance" ||
              this.state.selectedBin.Status === "Disabled"
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
              top: height * 0.49,
              left: width * 0.03
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 12 / fontScale }}>
              Navigate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.addRoutePoint}
            disabled={
              this.state.selectedBin === null ||
              this.state.selectedBin.Status === "Damaged" ||
              this.state.selectedBin.Status === "Under Maintenance" ||
              this.state.selectedBin.Status === "Disabled"
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
              top: height * 0.56,
              left: width * 0.03
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: this.fontSize / fontScale
              }}
            >
              Add
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.clacBestRoute}
            style={{
              backgroundColor: "#7a66ff",
              opacity: 1,
              borderRadius: 10,
              border: "1px solid #7a66ff",
              padding: "15%",
              width: width * 0.2,
              height: height * 0.06,
              position: "absolute",
              top: height * 0.63,
              left: width * 0.03
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 13 / fontScale }}>
              Claculate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.resetRoutePoints}
            style={{
              backgroundColor: "#7a66ff",
              opacity: 1,
              borderRadius: 10,
              border: "1px solid #7a66ff",
              padding: "15%",
              width: width * 0.2,
              height: height * 0.06,
              position: "absolute",
              top: height * 0.7,
              left: width * 0.03
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: this.fontSize / fontScale
              }}
            >
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
