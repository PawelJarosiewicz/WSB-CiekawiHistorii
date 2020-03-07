function validateEmail(email) 
{
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Firebase
var currUser;   //zmienna globalna do przechowywania info o zalogowanym użytkowniku

function firebaseLogInAnonymous(){
   return firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        console.error(errorCode+' '+errorMessage);
      });
}
function friebaseLogOut(){
    if(currUser){
        firebase.auth().signOut().then(function() {
            console.log('User log out');
          }).catch(function(error) {
            console.error('Error during log out ',error);
          });
          
    }
}
