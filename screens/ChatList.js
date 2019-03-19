import React from 'react';
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
  KeyboardAvoidingView
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';
import firebase, { auth,FirebaseAuth } from 'firebase';
import db from '../db.js';
import { Header,ListItem,Badge,Slider,Divider ,Avatar,Card,Input,Icon } from 'react-native-elements';

export default class ChatList extends React.Component {
  static navigationOptions = {
    header: null,
    text :""
  };

  state = {
    name: "",
    email: "",
    password: "",
    avatar: null,
    caption: "",
    messages : [],
    title : "",
    otherPerson : ""
    
  }
  user = ""
  
  
  async componentDidMount(){
    const { navigation } = this.props;
    const id = navigation.getParam('data');
    const members = navigation.getParam('Members');
    const title = navigation.getParam('title');
    console.log("title : ", title)
    
    console.log("the id", id)
    console.log("the id", members)
      console.log("the email logged in is ",firebase.auth().currentUser.email)
      this.user = firebase.auth().currentUser.email
      let messages = []
    await db.collection(`Chat/${id}/Message`).orderBy("Time")
    .onSnapshot(querySnapshot => {
        
      querySnapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() })
        
      })
      console.log("Current messages: ", this.state.messages.length)
      console.log("Current messages: ", this.state.messages)
      this.setState({messages,title})
    })
    console.log("Current messages after method: ", this.state.messages)
   
    
      
  }
   clickable = async () =>{
    const { navigation } = this.props;
    const id = navigation.getParam('data');
    console.log("the on press if working and this is the text : ", this.state.text)
     await db.collection(`Chat/${id}/Message`).doc().set({Content: this.state.text, Sender_Id :this.user, Time : new Date()})
  }
  
  keyExtractor = (item, index) => index
  imageURL = (email) => {
    console.log("the email : ", email)
    removespace = email.trim()
    theemail = removespace.replace("@", "%40")
    console.log("the email after : ", theemail)
    return  theemail
  }
  renderChats = ({ item }) => {
   if (item.Sender_Id == this.user){
        

    return(
      <View>
    <ListItem
   
    rightAvatar= {{ source: { uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2Favatar.png?alt=media&token=f45c29e5-2487-49e5-915b-dedc985c297d` ,activeOpacity:0.9 }}}
    title={item.Sender_Id}
    titleStyle = {{textAlign : "right"}}
    subtitleStyle = { styles.Sender }
    subtitle={item.Content}

    />
    <Divider style={{ backgroundColor: 'black' }} />
  </View>)
   }else{
      
    return(
        <View>
            
      <ListItem
     
      leftAvatar={{  source: {uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2Favatar.png?alt=media&token=f45c29e5-2487-49e5-915b-dedc985c297d` ,activeOpacity:0.9 }}}
      title={item.Sender_Id}
      titleStyle = {{textAlign : "left"}}
      subtitleStyle = {styles.Receiver}
      subtitle={item.Content}
  
      />
      <Divider style={{ backgroundColor: 'black' }} />
     
    </View>)
   }
    
  }
  





  render() {
    return (
      
      <View style={styles.container}>
      
      <Text></Text>
<View style={styles.contentContainer}>
<Card title={<Text style={{fontSize : 40,textAlign : "center"}}>{this.state.title}</Text>} >
<Divider style={{ backgroundColor: 'black' }} />
 <FlatList
        data={this.state.messages}
        extraData={this.state}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderChats}
      /> 
      </Card>
      </View>
      
      <KeyboardAvoidingView style={styles.container} behavior="position" enabled>

      <View style={{flexDirection: 'row', position:"absolute",top:100,borderBottomWidth: 1,borderTopWidth: 1,borderLeftWidth:1, borderRightWidth:1
              }}>
      
         {/* style={{}} */}
      {/* <Input
  placeholder='INPUT WITH ICON'
  rightIcon={{ type: 'font-awesome', name: 'send', onPress: this.clickable }}
  onChangeText={(text) => this.setState({text})}
  inputComponent={this.state.text}
/> */}
<View style={{flex:1}}>
<TextInput
                style={{ paddingTop: 20 }}
                autoCapitalize="none"
                placeholder="Enter text"
                multiline = {true}
                onChangeText={text => this.setState({ text })}
                value={this.state.text}
              />
              </View>
              <View style={{paddingTop: "4%"}}>
<Icon
  name='send'  onPress={this.clickable} color="green"/>
  </View>
</View>
</KeyboardAvoidingView>

      </View>
      
          
        
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 15,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },Sender: {
      textAlign : "right",
      backgroundColor : "lightgreen"
  },
  Receiver :{
    textAlign : "left",
    backgroundColor : "lightblue"
  }
});
