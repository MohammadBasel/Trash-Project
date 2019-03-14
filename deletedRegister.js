try {

    await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
    // upload this.state.avatar called this.state.email to firebase storage
    if (this.state.avatar) {
      avatar = this.state.email
      await uploadImageAsync("avatars", this.state.avatar, this.state.email)
    }

    console.log("avatar upload: ", avatar)
    const name = this.state.name || this.state.email
    await db.collection('users').doc(this.state.email).set({ name, avatar, online: true })
  } catch (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    console.log(errorCode)
    console.log(errorMessage)
    if (errorCode == "auth/email-already-in-use") {