
try{
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDg0c1mTbkxsHiFEO_qacswxvcmV2seSeo",
    authDomain: "ciekawi-historii.firebaseapp.com",
    databaseURL: "https://ciekawi-historii.firebaseio.com",
    projectId: "ciekawi-historii",
    storageBucket: "ciekawi-historii.appspot.com",
    messagingSenderId: "597997039136",
    appId: "1:597997039136:web:cfab90032b8435068e9645"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Get a reference to the database service
  var db = firebase.firestore();
}
catch(err){
  console.error("Error initialize Firebase: ", err);
}

