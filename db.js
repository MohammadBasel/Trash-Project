import firebase from 'firebase'
import 'firebase/firestore'
var config = {
  apiKey: "AIzaSyDzPKe1sCOCWeYv4RUo73kzBv2pi4K-MIA",
  authDomain: "trashapp-77bcd.firebaseapp.com",
  databaseURL: "https://trashapp-77bcd.firebaseio.com",
  projectId: "trashapp-77bcd",
  storageBucket: "trashapp-77bcd.appspot.com",
  messagingSenderId: "231469861186"
};
firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// Disable deprecated features
db.settings(
  {
  // timestampsInSnapshots: true
}
);

export default db