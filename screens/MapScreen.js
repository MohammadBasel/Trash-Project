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
import MapView from "react-native-maps";
import Geolocation from "react-native-geolocation-service";

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
    }
  };

  async componentDidMount() {
    await navigator.geolocation.getCurrentPosition(
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
    console.log("render print:", this.state.region);
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
              flex: 1
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
            <MapView.Polygon
              coordinates={this.state.coordsArr}
              strokeColor="green"
              strokeWidth={2}
              showsCompass={true}
              showsMyLocationButton={true}
            />
            {this.state.markers.map((marker, i) => (
              <TouchableOpacity key={i} onPress={alert}>
                <MapView.Marker onPress={alert} coordinate={marker}>
                  <Image
                    source={require("../assets/images/bin.png")}
                    style={{ width: 20, height: 20, tintColor: "orange" }}
                  />
                </MapView.Marker>
              </TouchableOpacity>
            ))}
          </MapView>
        </View>
      </View>
    );
  }
}
