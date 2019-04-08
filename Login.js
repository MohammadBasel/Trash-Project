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
  Dimensions,
  AsyncStorage,
  ImageBackground,
  KeyboardAvoidingView
} from "react-native";
import HomeScreen from "./navigation/MainTabNavigator";
import AppNavigator from "./navigation/AppNavigator";
import { MonoText } from "./components/StyledText";
import { WebBrowser } from "expo";
import firebase from "firebase";
import db from "./db";
import { Input } from "react-native-elements"
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {AntDesign} from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default class Login extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    name: "",
    email: "",
    password: "",
    avatar: null,
    caption: "",
    Online: false,
    error: "",
    phone: "",
    disable: true,
    user: null
  };
  image = require("./assets/images/park.jpg");
  count = 6;
  async componentDidMount(){
    // firebase.auth().onAuthStateChanged = (user) => {
    //   console.log("login page", user)
    //   if (user) {
    //     this.setState({Online: true})
    //   } else {
    //     this.setState({Online: false})
    //   }
    // }
    await db.collection("Users")
    .onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {   
         if (firebase.auth().currentUser == null){
            this.setState({Online: false})
           console.log("Online", this.state.Online)
       }else{
          this.setState({Online: true})
       }
      })
    })
  }
  login = async () => {
    this.count = this.count + 1;
    console.log("the count", this.count);
    let user = firebase.auth().currentUser;
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password);
      await db
        .collection("Users")
        .doc(this.state.email)
        .update({ Online: true });
      this.push;
      this.setState({ Online: true, user });
    } catch (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      console.log(errorMessage);
      this.setState({ Online: false });
      if (error.message == "The email address is badly formatted.") {
        this.setState({ error: error.message });
      } else {
        this.setState({ error: "ops, password or email is wromg try again" });
      }
    }
  };

  render() {
    {
      console.log("the Online", this.state.Online);
    }
    return (
      
      <View style={styles.container}>
      <ImageBackground
          source={this.image}
          style={{ width: wp("100%"), height: hp("100%") }}
        >
        <KeyboardAvoidingView style={styles.container} behavior="padding" >
        {this.state.Online === false ? (
          <View style={styles.contentContainer}>
            <View style={styles.welcomeContainer}>
              <Image
                style={{ width: wp(40), height: hp(21) }}
                source={{
                  uri:
                    "https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/logo.png?alt=media&token=3a5446d6-2998-46b5-8cef-7f1c1afda0d3"
                }}
              />
              <Text>{"  "}</Text>
                  <Input
                    leftIcon={
                      <AntDesign
                        name='user'
                        size={20}
                        color='#567D46'
                      />
                    }
                    containerStyle={styles.Input}
                    placeholder='Email'
                    value={this.state.email}
                    onChangeText={(email)=>this.setState({email})}
                    placeholderTextColor="#567D46"
                  />
                  <Text>{""}</Text>
                  <Input
                  leftIcon={
                    <AntDesign
                      name='lock'
                      size={20}
                      color='#567D46'
                    />
                  } 
                    placeholder='password'
                    containerStyle={styles.Input}
                    onChangeText={(password)=>this.setState({password})}
                    value={this.state.password}
                    secureTextEntry={true}
                    placeholderTextColor="#567D46"
                  />
                  <Text>{""}</Text>
                  <Text style={{ color: "red", fontWeight: 'bold',fontSize: wp('5%') }}>{this.state.error}</Text>
                  <Text>{""}</Text>
                  
                  <TouchableOpacity style={styles.buttonContainer} onPress={() => {this.login()}}>
                    <Text style={{color: "white",fontWeight: "bold" }}>LOGIN</Text> 
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <AppNavigator />
            )}
             </KeyboardAvoidingView>
        </ImageBackground>
      </View>
     
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use
          useful development tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync(
      "https://docs.expo.io/versions/latest/guides/development-mode"
    );
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      "https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes"
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    //alignItems: "center"
    justifyContent: "center"
  },
  Input: { 
    backgroundColor: '#fff',
    width:wp("80%"),
    borderWidth:1,
    borderColor:"black",
    borderRadius:15
  },
  buttonContainer: {
    // marginTop:hp(3),
    height:hp(5),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom:hp(3),
    width:wp(30),
    borderRadius:30,
    backgroundColor: "blue",
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: hp("20%")
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: hp(10),
    marginBottom: hp(20)
  },
  welcomeImage: {
    width: wp(100),
    height: hp(80),
    resizeMode: "contain",
    marginTop: hp(3),
    marginLeft: wp(-10)
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
