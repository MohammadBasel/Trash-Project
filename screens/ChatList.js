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
  Linking
} from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons,FontAwesome } from '@expo/vector-icons';
import functions from 'firebase/functions';
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
    otherPerson : "",
    phoneNumber:""
    
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
     
    await db.collection(`Chat/${id}/Message`).orderBy("Time")
    .onSnapshot(querySnapshot => {
      let messages = []
      querySnapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() })
        
      })

      
      console.log("Current messages: ", this.state.messages.length)
      console.log("Current messages: ", this.state.messages)
      this.setState({messages,title})
    })
    await db.collection(`Users`)
    .onSnapshot(querySnapshot => {
      let phoneNumber = []
      querySnapshot.forEach(doc => {
        if(doc.id == this.user){
          phoneNumber = doc.data().Phone
        }
        
        
      })

      
      console.log("Current messages: ", this.state.messages.length)
      console.log("Current messages: ", this.state.messages)
      this.setState({phoneNumber})
    })
    
    console.log("Current messages after method: ", this.state.messages)
   
    
      
  }
   clickable = async () =>{
    const { navigation } = this.props;
    const id = navigation.getParam('data');
    // console.log("the on press if working and this is the text : ", this.state.text)
    //  await db.collection(`Chat/${id}/Message`).doc().set({Content: this.state.text, Sender_Id :this.user, Time : new Date()})

      const addMessage = firebase.functions().httpsCallable('addMessage')
      console.log("the message is", this.state.text)
      console.log("the id is", id)
      const result = await addMessage({ message: this.state.text , id: id})
      this.setState({ text: ""  })
    
  }
  
  keyExtractor = (item, index) => index
  imageURL = (email) => {
    console.log("the email : ", email)
    removespace = email.trim()
    theemail = removespace.replace("@", "%40")
    console.log("the email after : ", theemail)
    return  theemail
  }
  callingMethod = () =>{
    Linking.openURL(`tel:${parseInt(this.state.phoneNumber)}`)
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
    const { goBack } = this.props.navigation;
    return (
      
      <View style={styles.container}>
      
      <Text></Text>
<View> 
<Header
        containerStyle={{backgroundColor:'purple'}}
        placement="left"   
       leftComponent= {<Ionicons name='md-arrow-round-back'  size={25} color='#fff' onPress={()=>this.props.navigation.navigate('Chat')}/>}
       centerComponent={{ text: this.state.title, style: { color: '#fff' } }}
       rightComponent={ <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <View >
         <FontAwesome style={{marginRight:40}} name='phone'  size={25} color='#fff' onPress={this.callingMethod}/>
       </View>
      </View> }
   />
{/* <Card title={<Text style={{fontSize : 40,textAlign : "center"}}>{this.state.title}</Text>} >
<Divider style={{ backgroundColor: 'black' }} /> */}
<ScrollView style={{height: "80%"}} scrollsToTop={true}> 
 <FlatList
        data={this.state.messages}
        extraData={this.state}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderChats}
      /> 
      </ScrollView> 
      {/* </Card> */}



      </View>
      <KeyboardAvoidingView style={styles.container} behavior="position" enabled>

<View style={{flexDirection: 'row', position:"absolute",borderBottomWidth: 2,borderTopWidth: 1,borderLeftWidth:1, borderRightWidth:1
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
          placeholder=""
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
