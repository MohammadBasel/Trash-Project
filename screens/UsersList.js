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
  KeyboardAvoidingView,
  Linking,
  StatusBar
} from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons,FontAwesome } from '@expo/vector-icons';
import functions from 'firebase/functions';
import { MonoText } from '../components/StyledText';
import firebase, { auth,FirebaseAuth } from 'firebase';
import db from '../db.js';
import { Header,ListItem,Badge,Slider,Divider ,Avatar,Card,Input,Icon,SearchBar } from 'react-native-elements';

export default class UsersList extends React.Component {
  static navigationOptions = {
    header: null,
    text :""
  };

  state = {
    users: [],
    search :""
    
  }
  user = ""
  
  
  async componentDidMount(){
    
    console.log("the email logged in is ",firebase.auth().currentUser.email)
    users = []
  await db.collection(`Users`)
  .onSnapshot(querySnapshot => {
    querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() })
    })
    
    this.setState({users})
  })
  console.log("Current chat after method: ", this.state.users)
  }
  addChat = async (id, Name) =>{
    const { navigation } = this.props;
    // const id = navigation.getParam('data');
    // console.log("the on press if working and this is the text : ", this.state.text)
    //  await db.collection(`Chat/${id}/Message`).doc().set({Content: this.state.text, Sender_Id :this.user, Time : new Date()})
    const title = Name  + " "
      const addChat = firebase.functions().httpsCallable('addChat')
      console.log("the message is", this.state.text)
      console.log("the id is", id)
      const result = await addChat({ message: this.state.text , id: id})
      this.setState({ text: ""  })
      this.props.navigation.navigate("ChatScreen")
    
  }

  renderUsers = ({ item }) => {
    
    const match  = this.searchForMatch(item.id)    
    if(match){

    
     return(
     <View>
     <ListItem
    onPress= { this.addChat(item.id,item.Name)} 
     rightAvatar= {{ source: { uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2Favatar.png?alt=media&token=f45c29e5-2487-49e5-915b-dedc985c297d` ,activeOpacity:0.9 }}}
     title={item.id}
     
 
     />
     <Divider style={{ backgroundColor: 'black' }} />
   </View>)            
     }
   }
   updateSearch = search => {
    this.setState({ search });
  };

  searchForMatch = firstname => {
    const regex = new RegExp(`.*${this.state.search}.*`, "ig");
    const match = regex.test(firstname);
    return match;
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

        <SearchBar
        placeholder="Type Here..."
        onChangeText={this.updateSearch}
        value={this.state.search}
        />

         <FlatList
        data={this.state.users}
        extraData={this.state}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderUsers}
      /> 
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
      // backgroundColor : "lightgreen"
  },
  Receiver :{
    textAlign : "left",
    // backgroundColor : "lightblue"
  },
  header: {
    height: 80,
    backgroundColor: 'lightseagreen',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 10,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  row: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  row1: {
    flexDirection: 'row-reverse',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
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
    height: 40,
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
    fontWeight: 'bold',
    paddingRight: 10
  },
  sender1: {
    fontWeight: 'bold',
    // paddingLeft: 90,
    paddingLeft: "50%"
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#eee'
  },
  input: {
    paddingHorizontal: 20,
    fontSize: 18,
    flex: 1
  },
  send: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20
  }

});
