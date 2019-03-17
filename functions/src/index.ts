// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin'
// import fetch from 'node-fetch'

admin.initializeApp(functions.config().firebase)
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// export const getEmail = functions.https.onCall(async (data, context) => {

//     const email = context.auth.token.email || null


//     return await email
// })