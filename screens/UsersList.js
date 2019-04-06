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
  View,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  StatusBar,
  Dimensions
} from "react-native";
import { WebBrowser } from "expo";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import functions from "firebase/functions";
import { MonoText } from "../components/StyledText";
import firebase, { auth, FirebaseAuth } from "firebase";
import db from "../db.js";
import {
  Header,
  ListItem,
  Badge,
  Slider,
  Divider,
  Avatar,
  Card,
  Input,
  Icon,
  SearchBar,
  CheckBox
} from "react-native-elements";
const { width, height } = Dimensions.get("window");
export default class UsersList extends React.Component {
  static navigationOptions = {
    header: null,
    text: ""
  };

  state = {
    users: [],
    allusers: [],
    search: "",
    checked: [],
    zoneId: "",
    members: [],
    oldmembers: []
  };
  user = "";

  async componentDidMount() {
    const { navigation } = this.props;
    const members = navigation.getParam("Members");
    console.log("the email logged in is ", firebase.auth().currentUser.email);
    allusers = [];
    users = [];
    zoneId = "";
    checked = [];
    await db.collection(`Users`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (doc.id === firebase.auth().currentUser.email) {
          zoneId = doc.data().Zone;
        }

        console.log("the zone is : ", zoneId);
      });
    });

    await db.collection(`Users`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (doc.data().Zone === zoneId) {
          if (doc.id != firebase.auth().currentUser.email) {
            users.push({ id: doc.id, ...doc.data() });
            checked.push(false);
          }
        }
      });

      this.setState({ users, checked });
    });
    this.state.members.push(firebase.auth().currentUser.email);
    console.log("Current chat after method: ", this.state.users);
    console.log("the checked : ", this.state.checked);
  }

  check = async () => {
    check = false;
    oldmembers = [];
    await db.collection(`Chat`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        oldmembers.push(doc.data().members);

        console.log("the zone is : ", zoneId);
      });
    });

    for (let i = 0; i < oldmembers.length; i++) {
      console.log("the memebers in old is : ", oldmembers[i]);
      if (oldmembers[i] == this.state.members) {
        check = true;
      }
      
    }
    return check;
  }


  addChat = async () => {
    console.log("the check is : ", this.check());
    check = false;
    oldmembers = [];
    await db.collection(`Chat`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        oldmembers.push(doc.data().members);

        console.log("the zone is : ", zoneId);
      });
    });

    for (let i = 0; i < oldmembers.length; i++) {
      console.log("the memebers in old is : ", oldmembers[i]);
      if (oldmembers[i] == this.state.members) {
        check = true;
      }
    }
    if (check === false) {
      const { navigation } = this.props;
      let title = "";
      // const id = navigation.getParam('data');
      // console.log("the on press if working a nd this is the text : ", this.state.text)
      //  await db.collection(`Chat/${id}/Message`).doc().set({Content: this.state.text, Sender_Id :this.user, Time : new Date()})
      if (this.state.members.length > 2) {
        myId = firebase.auth().currentUser.email;
        email = String(myId).split("@");
        myname = email[0];
        title = myname + " 's Group";
      } else {
        if (this.state.members[0] != firebase.auth().currentUser.email) {
          title = this.state.members[0];
        } else {
          title = this.state.members[1];
        }
      }
      finalTitle = title.split("@");
      name = finalTitle[0];

      const addChat = firebase.functions().httpsCallable("addChat");

      const result = await addChat({
        Members: this.state.members,
        Title: name
      });

      this.props.navigation.navigate("Chat");
    };
  };

  renderUsers = ({ item }) => {
    const match = this.searchForMatch(item.id);
    if (match) {
      return (
        <View>
          <ListItem
            // onPress= { this.addChat(item.id,item.Name)}
            leftAvatar={{
              source: {
                uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2Favatar.png?alt=media&token=f45c29e5-2487-49e5-915b-dedc985c297d`,
                activeOpacity: 0.9
              }
            }}
            title={
              <View>
                <CheckBox
                  title={item.id}
                  onPress={() =>
                    this.press(this.state.users.indexOf(item), item.id)
                  }
                  checked={this.state.checked[this.state.users.indexOf(item)]}
                />
              </View>
            }
          />
          <Divider style={{ backgroundColor: "black" }} />
        </View>
      );
    }
  };
  updateSearch = search => {
    this.setState({ search });
  };

  searchForMatch = firstname => {
    const regex = new RegExp(`.*${this.state.search}.*`, "ig");
    const match = regex.test(firstname);
    return match;
  };

  press = (index, id) => {
    let checked = [...this.state.checked];
    let members = [...this.state.members];
    let exist = false;
    let place = 0;
    console.log("the check before splice : ", checked);
    checked.splice(index, 1, !checked[index]);
    console.log("the check after splice : ", checked);
    for (let i = 0; i < members.length; i++) {
      if (members[i] === id) {
        exist = true;
        place = i;
      }
    }

    if (exist === true) {
      members.splice(place, 1);
    } else {
      members.push(id);
    }

    console.log("the check after splice : ", members);
    this.setState({ checked, members });
  };
  render() {
    const { goBack } = this.props.navigation;

    return (
      <View style={styles.container}>
        {/* <Text> THIS IS THE USERS PAGE</Text>
        {
            this.state.users.map(user =>
            <Text>{user.id}</Text>)
        } */}
        <Header
          containerStyle={{ backgroundColor: "#7a66ff" }}
          // placement="left"
          leftComponent={
            <Ionicons
              name="md-arrow-round-back"
              size={25}
              color="black"
              onPress={() => this.props.navigation.navigate("Chat")}
            />
          }
          centerComponent={{
            text: "New Chat",
            style: { color: "black", fontWeight: "bold" }
          }}
          rightComponent={
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <TouchableOpacity
                  style={{ color: "black" }}
                  onPress={this.addChat}
                >
                  <Text style={{ color: "black", fontWeight: "bold" }}>
                    create
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />

        <SearchBar
          style={{ height: height * 0.5 }}
          placeholder="Type Here..."
          onChangeText={this.updateSearch}
          value={this.state.search}
        />

        <FlatList
          data={this.state.users}
          extraData={this.state}
          keyExtractor={this.keyExtractor}
          renderItem={item => this.renderUsers(item)}
        />
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
    paddingTop: 15
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
  },
  Sender: {
    textAlign: "right"
    // backgroundColor : "lightgreen"
  },
  Receiver: {
    textAlign: "left"
    // backgroundColor : "lightblue"
  },
  header: {
    height: 80,
    backgroundColor: "lightseagreen",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 10
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24
  },
  row: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  row1: {
    flexDirection: "row-reverse",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 10
  },
  avatar1: {
    borderRadius: 20,
    width: 40,
    height: 40
    // marginLeft: 10
    // marginLeft: 90
  },
  rowText: {
    flex: 1
  },
  message: {
    fontSize: 18
  },
  message1: {
    fontSize: 18,
    // textAlign : "right",
    paddingLeft: "70%"
  },
  sender: {
    fontWeight: "bold",
    paddingRight: 10
  },
  sender1: {
    fontWeight: "bold",
    // paddingLeft: 90,
    paddingLeft: "50%"
  },
  footer: {
    flexDirection: "row",
    backgroundColor: "#eee"
  },
  input: {
    paddingHorizontal: 20,
    fontSize: 18,
    flex: 1
  },
  send: {
    alignSelf: "center",
    color: "lightseagreen",
    fontSize: 16,
    fontWeight: "bold",
    padding: 20
  }
});
