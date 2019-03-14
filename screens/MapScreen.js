import React from "react";
import {
  Text,
  View,
  Image,
  TouchableHighlight,
  Button,
  TouchableOpacity
  /*, StyleSheet*/
} from "react-native";
import { ExpoConfigView } from "@expo/samples";
import MapView, { Callout } from "react-native-maps";
import db from "../db";

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
    zone: "SsEKhFPP19pg0jJLcBBv",
    bins: [],
    coordsArr: [
      { latitude: 25.381649, longitude: 51.479143 },
      { latitude: 25.359159, longitude: 51.478886 },
      { latitude: 25.359314, longitude: 51.494207 },
      { latitude: 25.384426, longitude: 51.49592 }
    ],
    region: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    },
    selectedBin: null
  };

  async componentDidMount() {
    await navigator.geolocation.watchPosition(
      position => {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);

        region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        };
        this.setState({ region }, console.log("new Region: ", region));
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
    db.collection(`Zone/${this.state.zone}/Trash`).onSnapshot(querySnapshot => {
      let bins = [...this.state.bins];
      querySnapshot.forEach(doc => {
        bins.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ bins });
      //console.log("Current login users: ", this.users.length);
    });
  }

  render() {
    console.log(this.state);
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
            showsUserLocation
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
              showsCompass={true}
              showsMyLocationButton={true}
            />

            {this.state.bins.map((marker, i) => (
              <TouchableOpacity key={i} onPress={alert}>
                {console.log("marker is: ", marker.Loc)}
                <MapView.Marker.Animated
                  ref={marker => (this.marker = marker)}
                  title={marker.Id}
                  description={marker.Level}
                  onPress={() => {
                    this.setState({ selectedBin: marker });
                  }}
                  coordinate={marker.Loc}
                >
                  <Image
                    source={require("../assets/images/bin.png")}
                    style={{ width: 20, height: 20, tintColor: "orange" }}
                  />
                  <Callout>
                    <View
                      style={{
                        width: 150,
                        height: 100,
                        justifyContent: "center"
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>
                        Trash Level: 50%
                      </Text>
                      <Text style={{ fontWeight: "bold" }}>
                        Battery Level: 87%
                      </Text>
                      <Text style={{ fontWeight: "bold" }}>Status: Active</Text>
                    </View>
                  </Callout>
                </MapView.Marker.Animated>
              </TouchableOpacity>
            ))}
          </MapView>
          <TouchableOpacity
            onPress={() => {
              console.log("Reserved!");
            }}
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
        </View>
      </View>
    );
  }
}
