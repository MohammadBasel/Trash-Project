// import React from 'react';
// import {
//   Button,
//   Image,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Switch,
//   Alert
// } from 'react-native';
// import {
//   Ionicons, AntDesign, Octicons, Entypo, FontAwesome,
//   Foundation
// } from "@expo/vector-icons";
// import { Header, Slider, Card, Avatar, Divider } from "react-native-elements"

// import { WebBrowser, ImagePicker } from 'expo';
// import { uploadImageAsync, uploadVideoAsync } from "../ImageUtils.js";

// import { MonoText } from '../components/StyledText';
// import firebase, { firestore } from 'firebase';
// import db from '../db.js';
// import DialogInput from 'react-native-dialog-input';
// import Home from "../Login.js"

// import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

// export default class HomeScreen extends React.Component {
//   static navigationOptions = {
//     header: null,
//   };

//   state = {
//     users: {},
//     // user: firebase.auth().currentUser.email,
//     zone: "",
//     user: "asma@asma.com",
//     switch1Value: false,
//     isDialogVisible: false,
//   }
//   users = {}

// async componentDidMount() {
//  await this.getData()  
// }

// getData = async () => {
//   users = {}
//   let zone = ""
//   db.collection("Users")
//       .onSnapshot(querySnapshot => {
//         querySnapshot.forEach(doc => {
//           if(this.state.user == doc.id){
//             users = { id: doc.id, ...doc.data() }
//             zone = doc.data().Zone
//           }
//           this.setState({users, zone})
//         })
//       })
// }


// pickAvatar = async () => {
//   let result = await ImagePicker.launchImageLibraryAsync({
//     allowsEditing: true,
//     aspect: [4, 3],
//     mediaTypes: "All"
//   });

//   console.log(result);
//   if (!result.cancelled) {
//     await uploadImageAsync("avatar", result.uri, this.state.user)
//     await db.collection('Users').doc(this.state.user).update({ Avatar: this.state.user})
//   }
// };



// avatarURL = (email) => {
//   return email.replace("@", "%40")
// }
// toggleSwitch1 = (value) => {
//   this.setState({switch1Value: value})
// }

// showDialog = async (isShow) => {
//   await this.setState({isDialogVisible: isShow});
// }
// InputPassword = (password)=> {
//     if(password != ""){
//       firebase.auth().currentUser.updatePassword(password).then(function() {
//         Alert.alert("The Password was changed")
//         console.log("password changed")
//       }).catch(function(error) {
//         console.log("password didnt works")
//       });
//   }else{
//     Alert.alert("The Password didnt change")
//   }
//   this.setState({isDialogVisible: false});
// }
// logout = async () => {
//   await firebase.auth().signOut() 
//     await db.collection("Users").doc(this.state.user).update({Online: false})
//     console.log("logout")
// }
// emergency = () => {

//   db.collection("Logging").add({
//     Desc: "The following user is in danger",
//     Time: new Date(),
//     Trash_Id: "",
//     TruckId: "",
//     User_Id: this.state.user,
//     Zone_Id: this.state.zone
//   })
//   db.collection("Users").doc(this.state.user).update({Emergency: true})

//   Alert.alert("The Emergency Call is made")
// }
// list = () =>{
//     // console.log("shift", this.state.users.Shifts.length)
//     }


//   render() {
//     console.log("user auth", firebase.auth().currentUser)
//     return (
//       <View style={styles.container}>
//        <Header
//           placement="left"
//           centerComponent={{ text:this.state.users.Name, style: { color: '#fff' } }}
//           rightComponent={<Text style={{color: "white"}} onPress={() => {this.logout()}}>Log out</Text>}

//       />
//       {this.state.zone == "" ? (<View style={{paddingTop: "50%",paddingLeft: "50%", alignItems: "center" ,justifyContent: "center", width: "50%", heigth: "50%" }}><Image source={require('../assets/images/loading.gif')} /></View>) : 
//         (
//         <View>
//           <View style={{ paddingTop: 5, flexDirection: "row", width: wp('100%') }}>
//             <TouchableOpacity onPress={this.pickAvatar}>
//               <Avatar
//                   size="xlarge"
//                   rounded
//                   source={{
//                       uri: `https://firebasestorage.googleapis.com/v0/b/trashapp-77bcd.appspot.com/o/avatar%2F${this.avatarURL(this.state.users.Avatar)}?alt=media&token=1c79507b-72ea-4d02-9250-72889191c26f`
//                   }}
                  
//               />
//             </TouchableOpacity>
//             <Card
//                 title={this.state.users.Name}>
//                 <View style={{ marginBottom: 10 }}>
//                     <View>
//                         <Text>Zone: {this.state.users.Zone}</Text>
//                         <Text>Email: {this.state.user}</Text>
//                         <Text>Phone: {this.state.users.Phone}</Text>
//                         <Text>Role: {this.state.users.Role}</Text>
//                         <Text>Role: {this.state.users.Avatar}</Text>
//                     </View>
//                 </View>
//             </Card>
//           </View >
//           <View>
//             <Card
//                 title='Points'>
//                 <Text style={{ textAlign: "left" }}>Points earn: {this.state.users.Points}</Text>
//             </Card>
//             <Card>
//               {this.list()}
//             </Card>
//             <Switch
//               onValueChange = {this.toggleSwitch1}
//               value = {this.state.switch1Value}/>
//               {this.state.switch1Value == true && (
//               <View  style = {{paddingLeft: '10%', alignSelf: 'center', width: wp('50%')}}>
//               <Button
//                 onPress={() => {this.emergency()}}
//                 title="EMERGENCY"
//                 color="red"
//                 accessibilityLabel="EMERGENCY"
//               />
//               </View>
//               )}
//               <View style = {{paddingLeft: '12%',paddingTop:"5%" ,alignSelf: 'center',width: wp('50%')}}>
//               <TouchableOpacity onPress={()=>{this.showDialog(true)}}>
//                 <Text style={{color: 'blue', textDecorationLine: 'underline'}}>Change Password</Text>
//               </TouchableOpacity>
//               </View>
//               <DialogInput isDialogVisible={this.state.isDialogVisible}
//                 title={"Change Passowrd"}
//                 message={"Enter your new password"}
//                 hintInput ={"Input Password"}
//                 submitInput={ (password) => {this.InputPassword(password)} }
//                 closeDialog={ () => {this.showDialog(false)}}>
//               </DialogInput>
//               </View>
//         </View>
//         )}
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     backgroundColor: '#fff',
//   },
//   developmentModeText: {
//     marginBottom: 20,
//     color: 'rgba(0,0,0,0.4)',
//     fontSize: 14,
//     lineHeight: 19,
//     textAlign: 'center',
//   },
//   contentContainer: {
//     paddingTop: 30,
//   },
//   welcomeContainer: {
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   welcomeImage: {
//     width: 100,
//     height: 80,
//     resizeMode: 'contain',
//     marginTop: 3,
//     marginLeft: -10,
//   },
//   getStartedContainer: {
//     alignItems: 'center',
//     marginHorizontal: 50,
//   },
//   homeScreenFilename: {
//     marginVertical: 7,
//   },
//   codeHighlightText: {
//     color: 'rgba(96,100,109, 0.8)',
//   },
//   codeHighlightContainer: {
//     backgroundColor: 'rgba(0,0,0,0.05)',
//     borderRadius: 3,
//     paddingHorizontal: 4,
//   },
//   getStartedText: {
//     fontSize: 17,
//     color: 'rgba(96,100,109, 1)',
//     lineHeight: 24,
//     textAlign: 'center',
//   },
//   tabBarInfoContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     ...Platform.select({
//       ios: {
//         shadowColor: 'black',
//         shadowOffset: { height: -3 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//       },
//       android: {
//         elevation: 20,
//       },
//     }),
//     alignItems: 'center',
//     backgroundColor: '#fbfbfb',
//     paddingVertical: 20,
//   },
//   tabBarInfoText: {
//     fontSize: 17,
//     color: 'rgba(96,100,109, 1)',
//     textAlign: 'center',
//   },
//   navigationFilename: {
//     marginTop: 5,
//   },
//   helpContainer: {
//     marginTop: 15,
//     alignItems: 'center',
//   },
//   helpLink: {
//     paddingVertical: 15,
//   },
//   helpLinkText: {
//     fontSize: 14,
//     color: '#2e78b7',
//   },
// });
