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

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: "Map"
  };
  lat = null;
  long = null;
  setLocation = position => {
    this.lat = position.coords.latitude;
    this.long = position.coords.longitude;
  };

  loc = navigator.geolocation.getCurrentPosition(position => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);

    region = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    };
    this.setState({ region });
  }, console.log("I am here"));

  state = {
    markers: [
      { latitude: 37.78825, longitude: -122.433 },
      { latitude: 38.78825, longitude: -123.433 },
      { latitude: 34.78825, longitude: -121.433 },
      { latitude: 32.78825, longitude: -112.433 }
    ],
    region: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    }
  };

  render() {
    console.log(this.lat);
    console.log(this.long);

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
            loc
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
            initialRegion={this.state.region}
            showsCompass={true}
            showsScale={true}
          >
            {this.state.markers.map((marker, i) => (
              <TouchableOpacity key={i} onPress={alert}>
                <MapView.Marker onPress={alert} coordinate={marker}>
                  <Image
                    source={require("../assets/images/bin.png")}
                    style={{ width: 50, height: 50, tintColor: "orange" }}
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
