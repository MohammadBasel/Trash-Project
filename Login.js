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
import HomeScreen from "./navigation/MainTabNavigator";
import AppNavigator from "./navigation/AppNavigator";
import { MonoText } from "./components/StyledText";
import { WebBrowser } from "expo";

import firebase from "firebase";
import db from "./db";

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
    flag : true,
    error: "",
    phone: ""
  }
count = 6


  finishLoginOrRegister = async () => {};

  login = async () => {

    this.count = this.count + 1
    console.log("the count", this.count)
        try {
          await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)


          await db.collection('Users').doc(this.state.email).update({ Online: true })
          

          this.push
          this.setState({flag : true})
        } catch (error) {

          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
          console.log(errorMessage)
          this.setState({flag : false})
          if( error.message == "The email address is badly formatted."){
            this.setState({error : error.message})
          }
          this.setState({error : "ops, password or email is wromg try again"})
        }
      
    }


    let avatar = "default.png";
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password);

      if (this.state.avatar) {
        avatar = this.state.email;
        await db
          .collection("users")
          .doc(this.state.email)
          .update({ avatar });
      }

      await db
        .collection("users")
        .doc(this.state.email)
        .update({ online: true });

      if (this.state.name) {
        await db
          .collection("users")
          .doc(this.state.email)
          .update({ name: this.state.name });
      }
      this.push;
      this.setState({ flag: true });
    } catch (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      console.log(errorMessage);
      this.setState({ flag: false });
    }
  };

  render() {
    {
      console.log("the flag", this.state.flag);
    }
    return (
      <View style={styles.container}>
        {this.state.flag == false ? (
          <View style={styles.contentContainer}>
            <View style={styles.welcomeContainer}>
              <Image
                style={{ width: 150, height: 150 }}
                source={{
                  uri:
                    "https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/logo.png?alt=media&token=3a5446d6-2998-46b5-8cef-7f1c1afda0d3"
                }}
              />
              {/* <TextInput
              autoCapitalize="none"
              placeholder="Name"
              onChangeText={name => this.setState({ name })}
              value={this.state.name}
            /> */}

              <TextInput
                style={{ paddingTop: 20 }}
                autoCapitalize="none"
                placeholder="Email"
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
              />



            <TextInput
            secureTextEntry = {true}
            style={{ paddingTop: 20}}
              autoCapitalize="none"
              placeholder="Password"
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
            <Text style={{color:"red"}}>{this.state.error}</Text>
            <Button onPress={this.login} title="Login" style={{ width: 100, paddingTop: 50 }} />
            
          </View>
        </View>
        
       
:  <AppNavigator /> }

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
