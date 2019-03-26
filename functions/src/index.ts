import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import fetch from 'node-fetch'

admin.initializeApp(functions.config().firebase);

// admin.initializeApp(functions.config().firebase)
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const addMessage = functions.https.onCall(async (data, context) => {
  const message = data.message;
  const id = data.id;
  const email = context.auth.token.email || null;
  console.log("Success!!!!", message);
  console.log("Success!!!!", email);

  return await admin
    .firestore()
    .collection(`Chat/${id}/Message`)
    .add({ Content: message, Sender_Id: email, Time: new Date() });
});
export const addChat = functions.https.onCall(async (data, context) => {
  const members = data.Members;
  const title = data.Title;
  // const email = context.auth.token.email || null

  return await admin
    .firestore()
    .collection(`Chat`)
    .add({ Members: members, Title: title });
  //return await admin.firestore().collection(`Chat/${result.id}/Message`).add({Content: message, Sender_Id :email, Time : new Date()});
});

export const updateMembers = functions.https.onCall(async (data, context) => {
  const id = data.id;
  console.log("the id : ", id);
  const members = data.Members;
  const title = data.Title;
  // const title = data.Title
  // const email = context.auth.token.email || null
  if (title === null) {
    return await admin
      .firestore()
      .collection(`Chat`)
      .doc(id)
      .update({ Members: members });
  } else {
    return await admin
      .firestore()
      .collection(`Chat`)
      .doc(id)
      .update({ Members: members, Title: title });
  }
});
export const moveTrucks = functions.https.onRequest(async (req, res) => {
  // find all images (users with captions)
  console.log("Function started!");
  const querySnapshot = await admin
    .firestore()
    .collection("Zone")
    .get();
  console.log("After Getting the zones!");
  let zones = [];
  querySnapshot.forEach(zone => {
    zones.push({ id: zone.id, ...zone.data() });
  });
  console.log("Here are the zones :", zones);
  console.log("No? Maybe they are here :", querySnapshot.docs);

  zones.forEach(async zone => {
    const trucks = await admin
      .firestore()
      .collection(`Zone/${zone.id}/Truck`)
      .get();
    console.log("trucks ", trucks.docs);
    trucks.docs.forEach(async (truck, j) =>
      setTimeout(async () => {
        console.log("Old Point: ", truck.data().Location);
        const newLocation = new admin.firestore.GeoPoint(
          truck.data().Location._latitude + 0.01,
          truck.data().Location._longitude + 0.01
        );
        console.log("New Point: ", newLocation);
        console.log("Truck is: ", truck);
        await admin
          .firestore()
          .collection(`Zone/${zone.id}/Truck`)
          .doc(truck.id)
          .update({ Location: newLocation });
      }, j * 100)
    );
  });
  console.log("dOnE!");
  res.status(200).send();
});

export const changeTrash = functions.https.onRequest(async (req, res) => {
  // find all images (users with captions)
  const querySnapshot = await admin
    .firestore()
    .collection("Zone")
    .get();
  let zones = [];
  querySnapshot.forEach(zone => {
    zones.push({ id: zone.id, ...zone.data() });
  });

  zones.forEach(async zone => {
    const trashes = await admin
      .firestore()
      .collection(`Zone/${zone.id}/Trash`)
      .get();
    console.log("trashes ", trashes.docs);
    trashes.docs.forEach(async (trash, j) =>
      setTimeout(async () => {
        console.log("Old Point: ", trash.data());
        let newLevel = 0;
        let newBattery = 0;
        let newStaus = "Active";
        if (
          trash.data().Level < 100 &&
          trash.data().Status !== "Under Maintenance" &&
          trash.data().Status !== "Damaged"
        ) {
          newLevel = trash.data().Level + 10;
        }
        if (
          trash.data().Battery > 0 &&
          trash.data().Status !== "Under Maintenance" &&
          trash.data().Status !== "Damaged"
        ) {
          newBattery = trash.data().Battery - 10;
          newStaus = "Under Maintenance";
        }
        console.log("trash is: ", trash);
        await admin
          .firestore()
          .collection(`Zone/${zone.id}/Trash`)
          .doc(trash.id)
          .update({ Level: newLevel, Battery: newBattery, Status: newStaus });
      }, j * 100)
    );
  });
  console.log("dOnE!");
  res.status(200).send();
});

//return await admin.firestore().collection(`Chat/${result.id}/Message`).add({Content: message, Sender_Id :email, Time : new Date()});

// export const updateImage = functions.https.onRequest(async (req, res) => {
//     // find all images (users with captions)
//     const querySnapshot = await admin.firestore().collection("users").where("caption", ">", "").get()
//     const emails = new Array()
//     querySnapshot.forEach(doc =>
//         emails.push(doc.id)
//     )
//     console.log("emails", emails.length)

//     // pick one at random
//     const email = emails[Math.floor(emails.length * Math.random())]
//     console.log("email", email)

//     // change user document in image collection
//     await admin.firestore().collection("image").doc("user").update({ email: email })

//     res.status(200).send();
// })
