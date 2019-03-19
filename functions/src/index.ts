import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
// import fetch from 'node-fetch'

admin.initializeApp(functions.config().firebase)

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
    const message = data.message
    const id = data.id
    const email = context.auth.token.email || null
    console.log("Success!!!!", message)
    console.log("Success!!!!", email)

    return await admin.firestore().collection(`Chat/${id}/Message`).add({Content: message, Sender_Id :email, Time : new Date()})
}) 

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
