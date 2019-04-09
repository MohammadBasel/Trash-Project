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
  Switch,
  Alert,
  Dimensions
} from "react-native";
import {
  Ionicons,
  AntDesign,
  Octicons,
  Entypo,
  FontAwesome,
  Foundation
} from "@expo/vector-icons";
import { Header, Slider, Card, Avatar, Divider } from "react-native-elements"
import { Table, Row, Rows } from 'react-native-table-component';

import { WebBrowser, ImagePicker } from "expo";
import { uploadImageAsync, uploadVideoAsync } from "../ImageUtils.js";

import { MonoText } from "../components/StyledText";
import firebase, { firestore } from "firebase";
import db from "../db.js";
import DialogInput from "react-native-dialog-input";
import Home from "../Login.js";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
// const { width, height, fontScale } = Dimensions.get("window");
// const ASPECT_RATIO = width / height;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    users: {},
    shifts: [],
    user: firebase.auth().currentUser.email,
    zone: "",
    // user: "asma@asma.com",
    switch1Value: false,
    isDialogVisible: false,
    tableHead: ['Shifts/Days', 'Sunday', 'Monday', 'Tuesday', 'Wednesday','Thursday'],
    tableData: [['Morning Shift'],['Evening Shift']]
  }
  users = {}

async componentDidMount() {
 await this.getData()  
//  await this.createCalandar()
}

getData = async () => {
  users = {}
  let zone = ""
  let shifts = []
  await db.collection("Users")
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          if(this.state.user == doc.id){
            users = { id: doc.id, ...doc.data() }
            zone = doc.data().Zone
          }
          this.setState({users, zone})
        })
      })
      console.log("user sasdsadsa", users)
      await  db.collection("Shift")
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          shifts.push({ id: doc.id, ...doc.data() })
        })
        this.setState({shifts})
      })
      // await this.setState({users, zone, shifts})
      console.log("shifts sasdsadsa", shifts)
    // await this.createCalandar(shifts)
    console.log("shifts calendar", shifts)
}

  pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: "All"
    });

    console.log(result);
    if (!result.cancelled) {
      await uploadImageAsync("avatar", result.uri, this.state.user);
      await db
        .collection("Users")
        .doc(this.state.user)
        .update({ Avatar: this.state.user });
    }
  };

 pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: "All"
    });
avatarURL = (email) => {
  return email.replace("@", "%40")
}
toggleSwitch1 = (value) => {
  this.setState({switch1Value: value})
}

    console.log(result);
    if (!result.cancelled) {
      await uploadImageAsync("image", result.uri, this.state.user);
      await db
        .collection("Users")
        .doc(this.state.user)
        .update({ Image: this.state.user });
    }
  };

  avatarURL = email => {
    console.log("the email : ", email);
    if (email !== undefined && email !== null) {
      return email.replace("@", "%40");
    }
  };
  toggleSwitch1 = value => {
    this.setState({ switch1Value: value });
  };

  showDialog = async isShow => {
    await this.setState({ isDialogVisible: isShow });
  };
  InputPassword = password => {
    if (password != "") {
      firebase
        .auth()
        .currentUser.updatePassword(password)
        .then(function() {
          Alert.alert("The Password was changed");
          console.log("password changed");
        })
        .catch(function(error) {
          console.log("password didnt works");
        });
    } else {
      Alert.alert("The Password didnt change");
    }
    this.setState({ isDialogVisible: false });
  };
  logout = async () => {
    await firebase.auth().signOut();
    await db
      .collection("Users")
      .doc(this.state.user)
      .update({ Online: false });
    console.log("logout");
  };
  emergency = () => {
    db.collection("Logging").add({
      Desc: "The following user is in danger",
      Time: new Date(),
      Trash_Id: "",
      TruckId: "",
      User_Id: this.state.user,
      Zone_Id: this.state.zone
    });
    db.collection("Users")
      .doc(this.state.user)
      .update({ Emergency: true });
  Alert.alert("The Emergency Call is made")
}
createCalandar = async (shifts) =>{
    let header = [...this.state.tableHead]
    // let shifts = shifts
    console.log("shifts", shifts)
    let tableData = [...this.state.tableData]
    for (let i = 0; i < header.length; i++){
      console.log("shift header", header[i])
      for(let j = 0; j < shifts.length; j++){
        console.log("shift day",shifts[j].Day)
        if(header[i] === shifts[j].Day){
          if(shifts[j].Start_Time.includes("am")){
            console.log("shift am", shifts[j].Start_Time.includes("am"))
            if(shifts[j].Users.contains(this.state.user)){
              let time = shifts[j].Start_Time + " - " + shifts[j].End_Time
              console.log("shift ON", time)
              tableData[0].push(time)
            }else{
              let time = "Off Shift"
              console.log("shift OFF")
              tableData[0].push(time)
            }
          }else if (shifts[j].Start_Time.includes("pm")){
            console.log("shift pm", shifts[j].Start_Time.includes("pm"))
            if(shifts[j].Users.contains(this.state.user)){
              let time = shifts[j].Start_Time + " - " + shifts[j].End_Time
              tableData[1].push(time)
            }else {
              let time = "Off Shift"
              tableData[1].push(time)
            }
          }
        }
      }
    }
    this.setState(tableData)
  }

  render() {
    // console.log("user auth", firebase.auth().currentUser)
    console.log("render shifts" ,this.state.shifts)
    return (
      <ScrollView style={styles.container}>
       <Header
          containerStyle={{ backgroundColor: "#7a66ff" }}
          placement="left"
          centerComponent={{ text:this.state.users.Name, style: { color: '#fff' } }}
          rightComponent={<Text style={{color: "white"}} onPress={() => {this.logout()}}>Log out</Text>}
      />
      {this.state.zone == "" ? (<View style={{paddingTop: "50%",paddingLeft: "50%", alignItems: "center" ,justifyContent: "center", width: "50%", heigth: "50%" }}><Image source={require('../assets/images/loading.gif')} /></View>) : 
          (
          <ScrollView style={{ width: wp("100%"), height: hp("100%") }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={this.pickImage} style={styles.header}>
                {console.log("Image", this.state.users)}
                <Image
                  source={{
                    uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/image%2F${this.avatarURL(
                      this.state.users.Image
                    )}?alt=media&token=613694a1-285e-41b0-82f8-00e52de4bd60`
                  }}
                  style={styles.backgroundImage}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={this.pickAvatar}
              style={styles.avatarview}
            >
              {console.log("AVATAR", this.state.users)}

              <Image
                style={styles.avatar}
                source={{
                  uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2F${this.avatarURL(
                    this.state.users.Avatar
                  )}?alt=media&token=c1f1e7b7-7262-40e7-9e73-de2dbd504d17`
                }}
              />
            </TouchableOpacity>
            <View style={styles.body}>
              <View style={styles.bodyContent}>
                <Text style={styles.name}>{this.state.users.Name}</Text>
                <Text style={styles.info}>Zone: {this.state.users.Zone}</Text>
                <Text style={styles.info}>Email: {this.state.user}</Text>
                <Text style={styles.info}>Phone: {this.state.users.Phone}</Text>
                <Text style={styles.info}>Role: {this.state.users.Role}</Text>

                <Text style={styles.info}>Points earn: {this.state.users.Points}</Text>
                {this.state.users.Role === "Admin" ? (
                  <TouchableOpacity style={styles.buttonContainer}  onPress={()=>{this.props.navigation.navigate("Admin")}}>
                    <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Admin DashBoard</Text> 
                  </TouchableOpacity>
                ):(
                  this.state.users.Role === "Supervisor" ? (
                    <TouchableOpacity style={styles.buttonContainer}  onPress={()=>{this.props.navigation.navigate("Dashboard")}}>
                      <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Supervisor DashBoard</Text> 
                    </TouchableOpacity>
                  ):(
                    this.state.users.Role === "Maintainer" ? (
                      <TouchableOpacity style={styles.buttonContainer}  onPress={()=>{this.props.navigation.navigate("Maintenance")}}>
                      <Text style={{color: "white",fontWeight: "bold", fontSize: wp("2%"), alignItems: "center" }}>Maintainer DashBoard</Text> 
                    </TouchableOpacity>
                    ):(
                      null
                    )
                  )
                )}
              </View> 
              <View>
              <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                <Row data={this.state.tableHead} style={styles.head} textStyle={styles.text}/>
                <Rows data={this.state.tableData} textStyle={styles.text}/>
              </Table>

              </View>
              <View />
              <View style={styles.bodyContent}>
                <Switch
                  onValueChange={this.toggleSwitch1}
                  value={this.state.switch1Value}
                />
                {this.state.switch1Value == true && (
                  <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress={() => {
                      this.emergency();
                    }}
                  >
                    <Text style={{ color: "white" }}>EMERGENCY</Text>
                  </TouchableOpacity>
                )}

                <View style = {{paddingLeft: '15%',paddingTop:"5%" ,alignSelf: 'center',width: wp('50%')}}>
                  <TouchableOpacity onPress={()=>{this.showDialog(true)}}>
                    <Text style={{color: 'blue', textDecorationLine: 'underline'}}>Change Password</Text>
                  </TouchableOpacity>
                </View>
                <DialogInput
                  isDialogVisible={this.state.isDialogVisible}
                  title={"Change Passowrd"}
                  message={"Enter your new password"}
                  hintInput={"Input Password"}
                  submitInput={password => {
                    this.InputPassword(password);
                  }}
                  closeDialog={() => {
                    this.showDialog(false);
                  }}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    // backgroundColor: "#00BFFF",
    height: 200
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover" // or 'stretch'
  },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6 },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    // borderWidth: 4,
    borderColor: "white",
    // marginBottom:10,
    alignSelf: "center"
    // position: 'absolute',
    // marginTop:0.01
  },
  avatarview: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 10,
    alignSelf: "center",
    position: "absolute",
    marginTop: 130
  },
  body: {
    marginTop: 40
  },
  bodyContent: {
    flex: 1,
    alignItems: "center",
    padding: 30
  },
  name: {
    fontSize: 28,
    // color: "#696969",
    color: "blue",
    fontWeight: "600"
  },
  info: {
    fontSize: 16,
    color: "black",
    marginTop: 10,
    textAlign: "left"
  },
  buttonContainer: {
    marginTop: 10,
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 150,
    borderRadius: 30,
    backgroundColor: "red"
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
