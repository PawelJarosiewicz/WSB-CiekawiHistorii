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
  //czas trwania sesji
  // Indicates that the state will only persist in the current session or tab, 
  //and will be cleared when the tab or window in which the user authenticated is closed. 
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .catch(function(error) {
    console.error('Session persistence: '+error.code+' '+error.message);
  });

  //podpowiedzi
  $('[data-toggle="tooltip"]').tooltip();
  // $('#btnLogIn').tooltip();
});

function changeNavToggleIcon(){
  if($('#nav').hasClass('show')){    
    $('.fa-times').addClass('collapse');
    $('.fa-bars').removeClass('collapse');
  }
  else{
    $('.fa-bars').addClass('collapse');
    $('.fa-times').removeClass('collapse');
  }
}

function logOut(){
  try{
    let modalTemplate = 
    '<div class="modal fade" id="sign-out">' +
      '<div class="modal-dialog">' +
          '<div class="modal-content">' +
              '<div class="modal-header myModal">' +
                  '<h4 class="modal-title myModal">Wylogowanie...</h4>'+
                  '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
              '</div>' +
              '<div class="modal-body">Czy chcesz się wylogować?</div>' +
              '<div class="modal-footer">' +
                  '<button type="button" class="btn btn-success myModal" data-dismiss="modal">Nie</button>' +
                  '<button type="button" class="btn btn-danger myModal" data-dismiss="modal" onclick="friebaseLogOut()">Tak</button>' +
              '</div>' +
          '</div>' +
      '</div>' +
    '</div>';

    $(modalTemplate).modal();
  }
  catch(err){
    console.error('Log out modal error: '+err);
  }
}

function showError(sHeader,sBody){
  try{
    let modalTemplate =
    '<div class="modal fade">' +
        '<div class="modal-dialog">' +
            '<div class="modal-content myModal ">' +
                '<div class="modal-header text-danger ">' +
                    '<h4 class="modal-title myModal font-weight-bold">' +sHeader+'</h4>'+
                    '<button type="button" class="close myModal" data-dismiss="modal">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +sBody+'</div>' +
                '<div class="modal-footer ">' +
                    '<button type="button" class="btn btn-warning myModal" data-dismiss="modal">OK</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    $(modalTemplate).modal();
  }
  catch(err){
    console.error('Show modal error: '+err);
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
          window.location.href = '/user/login';
          }).catch(function(error) {
            console.error('Error during log out ',error);
          });
    }
    else{
      window.location.href = '/user/login';
    }
}

function validateEmail(email) 
{
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function checkEmail(){
  try{
    //werfyikacja uruchamiana tylko wtedy gdy już pole zostało pierwszy raz sprawdzone
    if($(this).hasClass('is-invalid') || $(this).hasClass('is-valid')){
      if(validateEmail(this.value)){
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
      }
      else{
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
      }
    }
  }
  catch(err){
    console.error('Check email error: '+err);
  }
}