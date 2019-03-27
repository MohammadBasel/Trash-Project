import React from "react";
import {
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  Ionicons,
  AntDesign,
  Octicons,
  Entypo,
  FontAwesome,
  Foundation
} from "@expo/vector-icons";
import { Header, Slider, Card, Avatar, Divider } from "react-native-elements";

import { WebBrowser } from "expo";

import { MonoText } from "../components/StyledText";
import firebase from "firebase";
import db from "../db.js";

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    users: {},
    user: firebase.auth().currentUser.email
    // user: "achouak@achouak.com"
  };
  users = {};

  async componentDidMount() {
    await this.getData();
    console.log("Current users: ", this.state.users);
    console.log("Current user/////: ", firebase.auth().currentUser);
  }

  getData = async () => {
    users = {};
    db.collection("Users").onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (this.state.user == doc.id) {
          users = { id: doc.id, ...doc.data() };
        }
        this.setState({ users });
      });
      console.log("users length: ", this.state.users);
    });
  };

  avatarURL = email => {
    console.log("email wala user", this.state.user.replace("@", "%40"));
    return email.replace("@", "%40");
  };

  render() {
    console.log("Current usersstate: ", this.state.users);
    return (
      <View style={styles.container}>
        <Header
          placement="left"
          containerStyle={{ backgroundColor: "#7a66ff" }}
          centerComponent={{
            text: this.state.users.Name,
            style: { color: "#fff" }
          }}
          rightComponent={
            <Text>
              <FontAwesome
                name="phone"
                size={20}
                color="white"
                onPress={() => Alert.alert(" Call this number" + items.phone)}
              />
              <Text> </Text>
              <Foundation
                name="video"
                size={20}
                color="white"
                onPress={() =>
                  Alert.alert("Video Call this number" + items.phone)
                }
              />
            </Text>
          }
        />
        <View>
          <View style={{ paddingTop: 5, flexDirection: "row" }}>
            <Avatar
              size="xlarge"
              rounded
              source={{
                uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/${this.avatarURL(
                  this.state.user
                )}%2Favatar.png?alt=media`
              }}
            />
            <Card title={this.state.users.Name}>
              <View style={{ marginBottom: 10 }}>
                <View>
                  <Text>Zone: {this.state.users.Zone}</Text>
                  <Text>Email: {this.state.user}</Text>
                  <Text>Phone: {this.state.users.Phone}</Text>
                  <Text>Role: {this.state.users.Role}</Text>
                </View>
              </View>
            </Card>
          </View>
          <Card title="Points">
            <Text style={{ textAlign: "left" }}>
              Points earn: {this.state.users.Points}
            </Text>
          </Card>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});
