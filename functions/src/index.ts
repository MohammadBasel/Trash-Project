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

export const trashBinsNotifier = functions.firestore
  .document("Zone/{id}/Trash/{messageId}")
  .onUpdate(async (change, context) => {
    // Get an object with the current document value.
    // If the document does not exist, it has been deleted.
    const trash = change.after.exists ? change.after.data() : null;

    const zoneId = change.after.ref.parent.parent.id;
    console.log("zoneId1 is: ", zoneId);

    // Get an object with the previous document value (for update or delete)
    const oldTrash = change.before.data();

    let chatId = null;
    const messages = [];

    const chats = await admin
      .firestore()
      .collection(`Chat`)
      .where("Title", "==", "Public Chat")
      .get();

    console.log("Chats are: ", chats.docs);

    chats.forEach(async chat => {
      console.log("single chat is: ", chat.id);
      const user = await admin
        .firestore()
        .collection("Users")
        .doc(chat.data().Members[0])
        .get();
      console.log("single user is: ", user.data().Zone);
      if (user.data().Zone === zoneId) {
        chatId = chat.id;
      }
    });
    console.log("trash = ", trash);
    console.log("oldTrash = ", oldTrash);
    // perform desired operations ...

    // choices: user logged in, user logged out, user registered

    if (
      oldTrash !== null &&
      trash !== null &&
      trash.Temp - oldTrash.Temp >= 15
    ) {
      messages.push({
        message:
          "Trash bin number " +
          change.before.id +
          " temperature is " +
          trash.Temp +
          ". It might be on fire!",
        chatId: chatId
      });
    }

    if (
      oldTrash !== null &&
      trash !== null &&
      trash.Level === 100 &&
      oldTrash.Level !== 100
    ) {
      messages.push({
        message:
          "Trash bin number " +
          change.before.id +
          " is 100% and needs to be emptied now!",
        chatId: chatId
      });
    }
    if (
      oldTrash !== null &&
      trash !== null &&
      trash.Level >= 90 &&
      oldTrash.Level < 90
    ) {
      messages.push({
        message:
          "Trash bin number " +
          change.before.id +
          " is 90% or more and needs to be emptied soon!",
        chatId: chatId
      });
    }
    if (
      oldTrash !== null &&
      trash !== null &&
      trash.Battery === 0 &&
      oldTrash.Level !== 0
    ) {
      messages.push({
        message:
          "Trash bin number " +
          change.before.id +
          " battery is 0% and needs to be replaced now!",
        chatId: chatId
      });
    }
    if (
      oldTrash !== null &&
      trash !== null &&
      trash.Battery === 10 &&
      oldTrash.Level > 10
    ) {
      messages.push({
        message:
          "Trash bin number " +
          change.before.id +
          " battery is 10% and needs to be replaced soon!",
        chatId: chatId
      });
    }
    setTimeout(async () => {
      console.log("messages is: ", messages);
      if (messages.length > 0 && chatId) {
        messages.forEach(async m => {
          await admin
            .firestore()
            .collection(`Chat/${chatId}/Message`)
            .add({ Content: m.message, Sender_Id: "Bot@", Time: new Date() });
        });
      }
    }, 1000);
  });

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
  const zones = await admin
    .firestore()
    .collection("Zone")
    .get();

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
  // let temp = null;

  // await fetch(
  //   "https://weather.cit.api.here.com/weather/1.0/report.json?product=observation&latitude=25.381649&longitude=51.479143&oneobservation=true&app_id=PxvQ4FeG3DpNYbNZBjKH&app_code=dkAcfxUgh-PHLxJox3majw"
  // )
  //   .then(response => response.json())
  //   .then(forcast => {
  //     temp = parseInt(
  //       forcast.observations.location[0].observation[0].temperature.split(
  //         "."
  //       )[0]
  //     );
  //   });

  const querySnapshot = await admin
    .firestore()
    .collection("Zone")
    .get();
  const zones = [];
  querySnapshot.forEach(zone => {
    zones.push({ id: zone.id, ...zone.data() });
  });

  zones.forEach(async zone => {
    const trashes = await admin
      .firestore()
      .collection(`Zone/${zone.id}/Trash`)
      .get();

    trashes.docs.forEach(async (trash, j) =>
      setTimeout(async () => {
        let newLevel = trash.data().Level + Math.floor(Math.random() * 10);
        let newBattery = trash.data().Battery - 1;
        let newStaus = "Active";
        // const plusOrMinus = Math.round(Math.random()) * 2 - 1;
        // const fireChance = Math.random() < 0.9 ? true : false;
        // const randomChange = Math.floor(Math.random() * 3);
        // let newTemp = temp + plusOrMinus * randomChange;

        // if (fireChance) {
        //   newTemp = temp + 20;
        // }
        if (
          trash.data().Status !== "Under Maintenance" &&
          trash.data().Status !== "Damaged"
        ) {
          if (newLevel > 100) {
            newLevel = 100;
          }
        } else {
          newLevel = trash.data().Level;
        }
        if (
          trash.data().Status !== "Under Maintenance" &&
          trash.data().Status !== "Damaged"
        ) {
          if (newBattery <= 0) {
            newBattery = 0;
            newStaus = "Under Maintenance";
          }
        }
        await admin
          .firestore()
          .collection(`Zone/${zone.id}/Trash`)
          .doc(trash.id)
          .update({
            Level: newLevel,
            Battery: newBattery,
            Status: newStaus
            // Temp: newTemp
          });
      }, j * 100)
    );
  });
  console.log("dOnE!");
  res.status(200).send();
});

export const updateBinTemp = functions.https.onCall(async (data, context) => {
  const temp = parseInt(data.temp);
  const querySnapshot = await admin
    .firestore()
    .collection("Zone")
    .get();

  querySnapshot.forEach(async zone => {
    const trashes = await admin
      .firestore()
      .collection(`Zone/${zone.id}/Trash`)
      .get();

    trashes.docs.forEach(async (trash, j) =>
      setTimeout(async () => {
        const plusOrMinus = Math.round(Math.random()) * 2 - 1;
        const fireChance = Math.random() < 0.2 ? true : false;
        const randomChange = Math.floor(Math.random() * 3);
        let newTemp = temp + plusOrMinus * randomChange;

        if (fireChance) {
          newTemp = temp + 20;
        }

        await admin
          .firestore()
          .collection(`Zone/${zone.id}/Trash`)
          .doc(trash.id)
          .update({
            Temp: newTemp
          });
      }, j * 100)
    );
  });
  console.log("dOnE!");
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
