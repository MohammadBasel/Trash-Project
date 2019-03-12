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

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: "Map"
  };

  state = {
    markers: [
      { latitude: 25.380331, longitude: 51.489722 },
      { latitude: 25.375834, longitude: 51.48307 },
      { latitude: 25.36199, longitude: 51.483364 },
      { latitude: 25.359082, longitude: 51.48184 }
    ],
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
              // position: "absolute",
              // top: 0,
              // left: 0,
              // right: 0,
              // bottom: 0
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
            <TouchableOpacity
              onPress={() => {
                console.log("Reserved!");
              }}
              style={{ backgroundColor: "lightgreen" }}
            >
              <Text>Reserve</Text>
            </TouchableOpacity>
            <MapView.Polygon
              coordinates={this.state.coordsArr}
              strokeColor="green"
              strokeWidth={2}
              showsCompass={true}
              showsMyLocationButton={true}
            />

            {this.state.markers.map((marker, i) => (
              <TouchableOpacity key={i} onPress={alert}>
                <MapView.Marker.Animated
                  ref={marker => (this.marker = marker)}
                  title={"Id goes here"}
                  description={"Capacity percentage goes here"}
                  onPress={() => {
                    this.setState({ selectedBin: marker });
                  }}
                  coordinate={marker}
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
                      {/* <View
                        style={{
                          marginTop: "1%",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <Callout>
                          <TouchableOpacity
                            onPress={() => {
                              console.log("Reserved!");
                            }}
                            style={{ backgroundColor: "lightgreen" }}
                          >
                            <Text>Reserve</Text>
                          </TouchableOpacity>
                        </Callout>
                        <TouchableOpacity
                          onPress={() => {
                            console.log("Emptied!");
                          }}
                          style={{ backgroundColor: "green" }}
                        >
                          <Text>Empty Bin</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            console.log("Reported!");
                          }}
                          style={{ backgroundColor: "red" }}
                        >
                          <Text>Report</Text>
                        </TouchableOpacity>
                      </View> */}
                    </View>
                  </Callout>
                </MapView.Marker.Animated>
              </TouchableOpacity>
            ))}
          </MapView>
        </View>
      </View>
    );
  }
}
