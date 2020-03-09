var currUser;   //zmienna globalna do przechowywania info o zalogowanym użytkowniku

$(document).ready(function(){
  //zmiana ikony dla przycisku przełączającego menu
  // document.getElementById("navToggleButton").addEventListener("click", changeNavToggleIcon); 
  $('#navToggleButton').click(changeNavToggleIcon);

  //kontrola stanu zalogowanego użytkownika
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          currUser = user;
          console.log('Logged user id='+currUser.uid);           
      } else {
          currUser=null;
          console.log('User not logged');
      }
    });
});

function changeNavToggleIcon(){
  if($('#nav').hasClass('show')){
    // $('#navToggleButton').html('<i class="fas fa-bars text-light fa-lg"></i>');
    
    $('.fa-times').addClass('collapse');
    $('.fa-bars').removeClass('collapse');
  }
  else{
    // $('#navToggleButton').html('<i class="fas fa-times text-success fa-lg"></i>');
    $('.fa-bars').addClass('collapse');
    $('.fa-times').removeClass('collapse');
  }
}

// Firebase


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

function validateEmail(email) 
{
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}