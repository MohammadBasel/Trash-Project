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
  Dimensions 
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';
import firebase, { auth,FirebaseAuth } from 'firebase';
import db from '../db.js';
import { Header,ListItem,Badge,Slider,Divider ,Avatar } from 'react-native-elements';
import { Ionicons,FontAwesome,MaterialIcons } from '@expo/vector-icons';
import ImageZoom from 'react-native-image-pan-zoom';
import {
  Header,
  ListItem,
  Badge,
  Slider,
  Divider,
  Avatar
} from "react-native-elements";

export default class ChatScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    name: "",
    email: "",
    password: "",
    avatar: null,
    caption: "",
    chat: []
  };

  async componentDidMount() {
    console.log("the email logged in is ", firebase.auth().currentUser.email);
    chat = [];
    await db.collection(`Chat`).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        chat.push({ id: doc.id, ...doc.data() });
      });
      console.log("Current chat: ", this.state.chat.length);
      console.log("Current chat: ", this.state.chat);
      this.setState({ chat });
    });
    console.log("Current chat after method: ", this.state.chat);
  }

  keyExtractor = (item, index) => index;

  renderChats = ({ item }) => {
    console.log("the item : ",item)
      console.log("i'm getting inside")
    var rand = Math.floor(1 + (Math.random() * (100-1)));
    check = false
    
    for (i=0; item.Members !== undefined && i<item.Members.length;i++){
      console.log("the memeers " ,item.Members[i])
        if (item.Members[i] === firebase.auth().currentUser.email){
            check = true
           
        }

    }

    if (check == true) {
      return (
        <View>
          <ListItem
            onPress={() =>
              this.props.navigation.navigate("ChatList", {
                data: item.id,
                Members: item.Members,
                title: item.Title
              })
            }
            leftAvatar={{
              source: {
                uri:
                  "https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2Favatar.png?alt=media&token=f45c29e5-2487-49e5-915b-dedc985c297d",
                activeOpacity: 0.9
              }
            }}
            title={item.Title}
            titleStyle={{ textAlign: "left" }}
            // subtitleStyle = {{textAlign : "left"}}
            // subtitle={item.Title}
          />
          <Divider style={{ backgroundColor: "black" }} />
        </View>
      );
    }
  };
  _renderItem = ({ item }) => (
    <ListItem
      id={item.id}
      {...console.log("the id", item.id)}
      onPressItem={this._onPressItem}
      title={item.title}
    />
  );

  render() {
    console.log("the data inside the render : ", this.state.chat);
    return (
      <View style={styles.container}>      
       
      <Header
        containerStyle={{backgroundColor:'#7a66ff'}}
        placement="left"   
      //  leftComponent= {<Ionicons name='md-arrow-round-back'  size={25} color='#fff' onPress={()=>this.props.navigation.navigate('Chat')}/>}
       centerComponent={{ text: "My Chats", style: { color: '#fff' } }}
       rightComponent={ <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <View >
         <MaterialIcons style={{marginRight:40}} name='add'  size={25} color='#fff' onPress={()=>this.props.navigation.navigate('UsersList')}/>
       </View>
      </View> }
   />
         


 <FlatList
        data={this.state.chat}
        extraData={this.state}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderChats}
      /> 

        {/* <ImageZoom cropWidth={Dimensions.get('window').width}
                       cropHeight={Dimensions.get('window').height}
                       imageWidth={200}
                       imageHeight={200}>
                <Image style={{width:200, height:200}}
                       source={{uri:'http://v1.qzone.cc/avatar/201407/07/00/24/53b9782c444ca987.jpg!200x200.jpg'}}/>
            </ImageZoom> */}
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
