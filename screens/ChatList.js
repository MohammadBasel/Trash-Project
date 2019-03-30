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
  Dimensions,
  Animated,
  CameraRoll,
  TouchableWithoutFeedback
} from "react-native";
import { WebBrowser, FileSystem } from "expo";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
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
  Overlay
} from "react-native-elements";

import { ImagePicker, Video, SMS } from "expo";
// import Dialog, { DialogFooter,DialogButton,DialogTitle, DialogContent } from 'react-native-popup-dialog';
import Dialog from "react-native-dialog";
import { uploadImageAsync, uploadVideoAsync } from "../ImageUtils.js";
import { ImagePicker, Video, SMS } from "expo";
import VideoPlayer from "@expo/videoplayer";
// import Dialog, { DialogFooter,DialogButton,DialogTitle, DialogContent } from 'react-native-popup-dialog';
import Dialog from "react-native-dialog";
import ImageZoom from "react-native-image-pan-zoom";
import AntDesign from "@expo/vector-icons/AntDesign";
const { width, height } = Dimensions.get("window");

export default class ChatList extends React.Component {
  _handleVideoRef = component => {};
  static navigationOptions = {
    header: null,
    text: ""
  };

  state = {
    name: "",
    email: "",
    password: "",
    avatar: null,
    caption: "",

    messages: [],
    title: "",
    otherPerson: "",
    phoneNumber: "",
    fadeAnim: new Animated.Value(0),
    visible: false,
    visible1: false,
    resize: false,
    url: "",
    url1: ""
  };
  user = "";

  async componentDidMount() {
    const { navigation } = this.props;
    const id = navigation.getParam("data");
    const members = navigation.getParam("Members");
    const title = navigation.getParam("title");
    console.log("title : ", title);

    console.log("the id", id);
    console.log("the id", members);
    console.log("the email logged in is ", firebase.auth().currentUser.email);
    this.user = firebase.auth().currentUser.email;

    await db
      .collection(`Chat/${id}/Message`)
      .orderBy("Time")
      .onSnapshot(querySnapshot => {
        let messages = [];
        querySnapshot.forEach(doc => {
          messages.push({ id: doc.id, ...doc.data() });
        });

        console.log("Current messages: ", this.state.messages.length);
        console.log("Current messages: ", this.state.messages);
        this.setState({ messages, title });
      });
    await db.collection(`Users`).onSnapshot(querySnapshot => {
      let phoneNumber = [];
      querySnapshot.forEach(doc => {
        if (doc.id == this.user) {
          phoneNumber = doc.data().Phone;
        }
      });

      console.log("Current messages: ", this.state.messages.length);
      console.log("Current messages: ", this.state.messages);
      this.setState({ phoneNumber });
    });

    console.log("Current messages after method: ", this.state.messages);
    // const isAvailable = await SMS.isAvailableAsync();
    // if (isAvailable) {
    //   SMS.sendSMSAsync("+97430733103", "hi")
    // } else {
    //   // misfortune... there's no SMS available on this device
    // }
  }

  clickable = async () => {
    const { navigation } = this.props;
    const id = navigation.getParam("data");
    // console.log("the on press if working and this is the text : ", this.state.text)
    //  await db.collection(`Chat/${id}/Message`).doc().set({Content: this.state.text, Sender_Id :this.user, Time : new Date()})

    const addMessage = firebase.functions().httpsCallable("addMessage");
    console.log("the message is", this.state.text);
    console.log("the id is", id);
    const result = await addMessage({ message: this.state.text, id: id });
    this.setState({ text: "" });
  };

  keyExtractor = (item, index) => index;
  imageURL = email => {
    console.log("the email : ", email);
    removespace = email.trim();
    theemail = removespace.replace("@", "%40");
    console.log("the email after : ", theemail);
    return theemail;
  };
  callingMethod = () => {
    Linking.openURL(`tel:${parseInt(this.state.phoneNumber)}`);
  };
  renderChats = ({ item }) => {
    const converting = String(item.Content);
    console.log("the content : ", converting);
    const first = String(item.Content).substring(0, 4);
    console.log("first is : ", first);
    if (first == "http") {
      // let type = firebase.storage().downloadUrl(item.Content).getMetadata().storageMetadata.getContentType()
      // ref().child(item.Content).Type
    }

    if (item.Sender_Id == this.user) {
      return (
        //   <View style={styles.row1}>
        //   <Image style={styles.avatar1} source={{ uri: "https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar.png?alt=media&token=07ce4817-ba10-4922-afe9-864236d7fda9" }} />
        //   <View style={styles.rowText}>
        //     <Text style={styles.sender1}>{item.Sender_Id}</Text>
        //     <Text style={styles.message1}>{item.Content}</Text>
        //   </View>
        // </View>)
        <View>
          <ListItem
            rightAvatar={{
              source: {
                uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2Favatar.png?alt=media&token=f45c29e5-2487-49e5-915b-dedc985c297d`,
                activeOpacity: 0.9
              }
            }}
            title={"me"}
            titleStyle={{ textAlign: "right" }}
            subtitleStyle={styles.Sender}
            subtitle={
              first === "http" ? (
                <View>
                  <View style={{ width: width * 0.5, height: 300 }}>
                    {/* <Overlay isVisible = {true}> */}

                    <TouchableOpacity
                      onLongPress={() => {
                        this.changeVisibleKeepUrl(item.Content);
                      }}
                      onPress={this.resizeImage}
                      style={{}}
                    >
                      <Image
                        source={{ uri: item.Content }}
                        style={
                          this.state.resize
                            ? styles.imagesize1
                            : styles.imagesize2
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onLongPress={() => {
                      this.changeVisibleKeepUrl1(item.Content);
                    }}
                    onPress={this.resizeImage}
                  >
                    <Video
                      source={{ uri: item.Content }}
                      shouldPlay
                      isLooping
                      resizeMode="cover"
                      style={{ width: "100%", height: 300 }}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                item.Content
              )
            }
          />
          {/* <Divider style={{ backgroundColor: 'black' }} /> */}
        </View>
      );
    } else {
      const name = item.Sender_Id.split("@");
      return (
        //   <View style={styles.row}>
        //   <Image style={styles.avatar} source={{ uri: "https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar.png?alt=media&token=07ce4817-ba10-4922-afe9-864236d7fda9" }} />
        //   <View style={styles.rowText}>
        //     <Text style={styles.sender}>{item.Sender_Id}</Text>
        //     <Text style={styles.message}>{item.Content}</Text>
        //   </View>
        // </View>)
        <View>
          <ListItem
            leftAvatar={{
              source: {
                uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2Favatar.png?alt=media&token=f45c29e5-2487-49e5-915b-dedc985c297d`,
                activeOpacity: 0.9
              }
            }}
            title={name[0]}
            titleStyle={{ textAlign: "left" }}
            subtitleStyle={styles.Receiver}
            subtitle={
              first === "http" ? (
                <View>
                  <View style={{ width: width * 0.5, height: height * 0.5 }}>
                    <TouchableOpacity
                      onLongPress={() => {
                        this.changeVisibleKeepUrl(item.Content);
                      }}
                      onPress={this.resizeImage}
                    >
                      <Image
                        source={{ uri: item.Content }}
                        onPress={() => {
                          this.setState({ visible: true });
                        }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onLongPress={() => {
                      this.changeVisibleKeepUrl(item.Content);
                    }}
                    onPress={this.resizeImage}
                  >
                    {console.log("i'm getting inside the touchable opacity")}
                    <Video
                      source={{ uri: item.Content }}
                      shouldPlay
                      isLooping
                      resizeMode="cover"
                      style={{ width: width * 0.5, height: height * 0.5 }}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                item.Content
              )
            }
          />
          {/* <Divider style={{ backgroundColor: 'black' }} />
           */}
        </View>
      );
    }
  };
  changeVisibleKeepUrl = url => {
    console.log("the url : ", url);
    console.log("I'm getting here");
    this.setState({ visible: true });
    this.setState({ url: url });
    // var promise = CameraRoll.saveImageWithTag(url);
  };
  changeVisibleKeepUrl1 = url => {
    this.setState({ visible1: true });
    this.setState({ url1: url });
  };
  changeVisible = () => {
    this.setState({ visible: false });
  };
  changeVisible1 = () => {
    this.setState({ visible: false });
  };
  resizeImage = () => {
    console.log("ii'm here in resi");
    console.log("the resize before : ", this.state.resize);
    this.setState({ resize: !this.state.resize });
    console.log("the resize after : ", this.state.resize);
  };
  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: "All"
    });

    console.log(result);

    if (!result.cancelled) {
      const url = await uploadImageAsync(this.user, result.uri, new Date());
      console.log("the url : ", url);
      this.setState({ text: url });
      this.clickable();
    }
  };

  takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: "All"
    });

    console.log(result);

    if (!result.cancelled) {
      const url = await uploadImageAsync(this.user, result.uri, new Date());
      console.log("the url : ", url);
      this.setState({ text: url });
      this.clickable();
    }
  };
  saveImage = () => {
    console.log("the url in the save  image is : ", this.state.url);
    if (Platform.OS === "ios") {
      var promise = CameraRoll.saveToCameraRoll(this.state.url);
      this.setState({ visible: false });
    } else {
      FileSystem.downloadAsync(
        this.state.url,
        FileSystem.documentDirectory + "small.png"
      )
        .then(({ uri }) => {
          console.log("Finished downloading to ", uri);
          var promise = CameraRoll.saveToCameraRoll(uri);
          this.setState({ visible: false });
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  saveVideo = () => {
    // console.log("the url in the save  image is : ", this.state.url1)
    // if (Platform.OS === 'ios'){
    //   var promise =  CameraRoll.saveToCameraRoll(this.state.url1)
    //   this.setState({visible1 : false})
    // }else{
    FileSystem.downloadAsync(
      this.state.url1,
      FileSystem.documentDirectory + "small.mp4"
    )
      .then(({ uri }) => {
        console.log("Finished downloading to ", uri);
        var promise = CameraRoll.saveToCameraRoll(uri);
        this.setState({ visible1: false });
      })
      .catch(error => {
        console.error(error);
      });
    // }
  };

  render() {
    const { goBack } = this.props.navigation;
    const { navigation } = this.props;
    const Members = navigation.getParam("Members");
    const id = navigation.getParam("data");
    return (
      <View style={styles.container}>
        <Header
          containerStyle={{ backgroundColor: "#7a66ff" }}
          // placement="left"
          leftComponent={
            <Ionicons
              name="md-arrow-round-back"
              size={25}
              color="#fff"
              onPress={() => this.props.navigation.navigate("Chat")}
            />
          }
          centerComponent={{ text: this.state.title, style: { color: "#fff" } }}
          rightComponent={
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <AntDesign
                  style={{ marginRight: 40 }}
                  name="bars"
                  size={25}
                  color="#fff"
                  onPress={() =>
                    this.props.navigation.navigate("MyUsersList", {
                      Members: Members,
                      id: id
                    })
                  }
                />
              </View>
            </View>
          }
        />

        {/* <StatusBar backgroundColor="lightseagreen" barStyle="light-content" /> */}
        <Text style={styles.title}>{this.state.title}</Text>
        <FlatList
          data={this.state.messages}
          renderItem={this.renderChats}
          // inverted
        />
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.footer}>
            <TextInput
              value={this.state.text}
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="Type something nice"
              onChangeText={text => this.setState({ text: text })}
            />
            <TouchableOpacity onPress={this.pickImage}>
              <FontAwesome
                style={{ marginRight: 10, paddingTop: "5%" }}
                name="photo"
                size={25}
                color="lightseagreen"
              />
              {/* <Text style={styles.send}>Image</Text> */}
            </TouchableOpacity>
            <TouchableOpacity onPress={this.takeImage}>
              <FontAwesome
                style={{ paddingTop: "5%" }}
                name="camera"
                size={25}
                color="lightseagreen"
              />
              {/* <Text style={styles.send}>Image</Text> */}
            </TouchableOpacity>
            <TouchableOpacity onPress={this.clickable}>
              <Text style={styles.send}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Dialog.Container visible={this.state.visible}>
          <Dialog.Title>Save Image</Dialog.Title>
          <Dialog.Description>
            Do you want to save the picture to the gallery?
          </Dialog.Description>
          <Dialog.Button label="Cancel" onPress={this.changeVisible} />
          <Dialog.Button label="Save" onPress={this.saveImage} />
        </Dialog.Container>

        <Dialog.Container visible={this.state.visible1}>
          <Dialog.Title>Save Video</Dialog.Title>
          <Dialog.Description>
            Do you want to save the Video to the gallery?
          </Dialog.Description>
          <Dialog.Button label="Cancel" onPress={this.changeVisible1} />
          <Dialog.Button label="Save" onPress={this.saveVideo} />
        </Dialog.Container>
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
  },
  subtitleView: {
    flexDirection: "row",
    paddingLeft: 10,
    paddingTop: 5
  },
  ratingImage: {
    height: 19.21,
    width: 100
  },
  imagesize1: {
    width: width * 1,
    height: height * 1
  },
  imagesize2: {
    width: "100%",
    height: "100%"
  }
});
