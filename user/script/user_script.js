$(document).ready(function(){ 
  //wylogowanie
  $('#navLogout').click(logOut);
  $('#navAddArticles').click(function(){document.location.href='/edit-article'});

  //obsługa przycisków formularza usera
  $('#btnChangeName').click(function(){
    $(this).tooltip('hide');
    $('#modalChangeName').modal();
  });

  $('#btnChangeMail').click(function(){
    $(this).tooltip('hide');
    $('#changeMailNewMail').on('input',checkEmail); //walidacja pola podczas wpisywania
    $('#changeMailOldMail').on('input',checkEmail); 
    $('#changeMailPass').on('input',checkPass);
    $('#modalChangeMail').modal();
  });

  $('#btnChangePass').click(function(){
    $(this).tooltip('hide');
    $('#changePassNewPass').on('input',checkPass);
    $('#changePassNewPass2').bind('input',{idFirstPass: '#changePassNewPass',idSecondPass: '#changePassNewPass2'},checkPass2);
    $('#changePassMail').on('input',checkEmail); 
    $('#changePassOldPass').on('input',checkPass);
    $('#modalChangePass').modal();
  });

  //podpowiedzi dla urządzeń mobilnych
  $(window).on('resize orientationchange',showPillToolTips); 
  showPillToolTips();

  //sprawdzenie czy user jest zalogowany i wypełniamy formularz
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          currUser = user;
          if(currUser.isAnonymous){ //logowanie anonimowe
            document.location.href='/user/login';
          }
          else{
            $('#userNameSpan').text(currUser.displayName);
            $('#profileUserName').val(currUser.displayName);
            $('#profileUserEmail').val(currUser.email);
            $('#profileUserPass').val('######'); 
          }
                  
      } else {
          currUser=null;
          document.location.href='/user/login';
      }
    });
  
  //przekierowanie do konkretnej zakładki
  let tab = window.location.hash;
  if(tab){
    $(tab).click();
  }
});

function showPillToolTips(){
  try{
    if($(window).width()<=768){
      $('[data-toggle="pill"]').attr('data-html',true);
      $('#navProfile').attr('title','<h6>Twój profil</h6>');
      $('#navAddArticles').attr('title','<h6>Dodaj artykuł</h6>');
      $('#navArticles').attr('title','<h6>Twój artykuły</h6>');
      $('#navLogout').attr('title','<h6>Wyloguj...</h6>');
      $('[data-toggle="pill"]').tooltip();
    }
    else{
      $('[data-toggle="pill"]').removeAttr('data-html');
      $('[data-toggle="pill"]').removeAttr('title');  //trzeba usunąć atrybut
      $('[data-toggle="pill"]').tooltip('dispose'); //i wyłączyć tooltip
    }
  }
  catch(err){
    console.error('Tooltip error: '+err);
  }
}

function changeUserName(newName){
  if(newName){
    try{
      if(currUser){
        currUser.updateProfile({
          displayName: newName
        })
        .then(function() {
          $('#profileUserName').val(currUser.displayName);
          showInfo('Zmiana imienia','Twoja imię zostało zmienione.');
        })
        .catch(function(error) {showError('Błąd '+error.code,error.message);});
      } 
    }
    catch(err){
      showError('Change name error',err);
    }
  }
}

function changeUserMail(e,idNewMail,idOldMail,idPass){
  try{
    //weryfikacja formy
    if($(idNewMail).val()=='' | !validateEmail($(idNewMail).val())){
      $(idNewMail).addClass('is-invalid');
    }
    else{
      $(idNewMail).removeClass('is-invalid');
      $(idNewMail).addClass('is-valid');
    }
    if($(idOldMail).val()=='' | !validateEmail($(idOldMail).val())){
      $(idOldMail).addClass('is-invalid');
    }
    else{
      $(idOldMail).removeClass('is-invalid');
      $(idOldMail).addClass('is-valid');
    }
    if($(idPass).val().length<6){
      $(idPass).addClass('is-invalid');
    }
    else{
      $(idPass).removeClass('is-invalid');
      $(idPass).addClass('is-valid');
    }

    if($(idNewMail).hasClass('is-invalid') | $(idOldMail).hasClass('is-invalid') | $(idPass).hasClass('is-invalid')){
      e.preventDefault();
      e.stopPropagation();
    }
    else{
      //ponownie uwierzytelniamy usera
      let credentials = firebase.auth.EmailAuthProvider.credential($(idOldMail).val(), $(idPass).val());

      currUser.reauthenticateWithCredential(credentials)
      .then(function() {
        //zmieniamy mail
        currUser.updateEmail($(idNewMail).val())
        .then(function() { 
          showInfo("Zmiana adresu e-mail","Twój adres e-mail został zmieniony.");
          $('#profileUserEmail').val(currUser.email);
        })
        .catch(function(error) {
          showError('Błąd podczas zmiany adresu e-mail '+error.code,error.message);
          $('#modalChangeMail').modal();
        });
      })
      .catch(function(error) { 
        decodeLogInError(error);
        $('#modalChangeMail').modal();
      });
      
      //czyścimy formę z klas walidacji
      changeModalClear(idNewMail,idOldMail,idPass);
    }
  }
  catch(err){
    showError('Change mail error',err);
  }
}

function changeUserPass(e,idNewPass,idNewPass2,idMail,idOldPass){
  try{
    //weryfikacja formy
    if($(idMail).val()=='' | !validateEmail($(idMail).val())){
      $(idMail).addClass('is-invalid');
    }
    else{
      $(idMail).removeClass('is-invalid');
      $(idMail).addClass('is-valid');
    }
    if($(idNewPass).val().length<6){
      $(idNewPass).addClass('is-invalid');
    }
    else{
      $(idNewPass).removeClass('is-invalid');
      $(idNewPass).addClass('is-valid');
    }
    if($(idOldPass).val().length<6){
      $(idOldPass).addClass('is-invalid');
    }
    else{
      $(idOldPass).removeClass('is-invalid');
      $(idOldPass).addClass('is-valid');
    }
    if($(idNewPass2).val().length<6 || $(idNewPass).val()!=$(idNewPass2).val()){
      $(idNewPass2).addClass('is-invalid');
    }
    else{
      $(idNewPass2).removeClass('is-invalid');
      $(idNewPass2).addClass('is-valid');
    }

    if($(idMail).hasClass('is-invalid') | $(idNewPass).hasClass('is-invalid') | $(idOldPass).hasClass('is-invalid') | $(idNewPass2).hasClass('is-invalid')){
      e.preventDefault();
      e.stopPropagation();
    }
    else{
      //ponownie uwierzytelniamy usera
      let credentials = firebase.auth.EmailAuthProvider.credential($(idMail).val(), $(idOldPass).val());

      currUser.reauthenticateWithCredential(credentials)
      .then(function() {
        //zmieniamy mail
        currUser.updatePassword($(idNewPass).val())
        .then(function() { showInfo("Zmiana hasła","Twoje hasło zostało zmienione.");})
        .catch(function(error) {
          showError('Błąd podczas zmiany hasła '+error.code,error.message);
          $('#modalChangePass').modal();
        });
      })
      .catch(function(error) { 
        decodeLogInError(error);
        $('#modalChangePass').modal();
      });
      //czyścimy formę z klas walidacji
      changeModalClear(idNewPass,idNewPass2,idMail,idOldPass);
    }
  }
  catch(err){
    showError('Change password error',err);
  }
}

function deleteUser(e,idMail,idPass){
  try{
    //wolidacja podczas wpisywania
    $(idMail).on('input',checkEmail); 
    $(idPass).on('input',checkPass);

    //weryfikacja formy
    if($(idMail).val()=='' | !validateEmail($(idMail).val())){
      $(idMail).addClass('is-invalid');
    }
    else{
      $(idMail).removeClass('is-invalid');
      $(idMail).addClass('is-valid');
    }
    if($(idPass).val().length<6){
      $(idPass).addClass('is-invalid');
    }
    else{
      $(idPass).removeClass('is-invalid');
      $(idPass).addClass('is-valid');
    }
    if($(idMail).hasClass('is-invalid') | $(idPass).hasClass('is-invalid')){
      e.preventDefault();
      e.stopPropagation();
    }
    else{
      let credentials = firebase.auth.EmailAuthProvider.credential($(idMail).val(), $(idPass).val());

      currUser.reauthenticateWithCredential(credentials)
      .then(function() {
        //zmieniamy mail
        currUser.delete()
        .then(function() { 
          showInfo("Usuwanie konta","Twoje konto zostało usunięte.");
        })
        .catch(function(error) {
          showError('Błąd podczas usuwania konta '+error.code,error.message);
          $('#modalDelUser').modal();
        });
      })
      .catch(function(error) { 
        decodeLogInError(error);
        $('#modalDelUser').modal();
      });

      changeModalClear(idMail,idPass);
    }
  }
  catch(err){
    showError('Delete user error',err);
  }
}

//usunięcie klas walidujących formę
function changeModalClear(id1,id2,id3,id4){
  try{
    if(id1){
      $(id1).removeClass('is-invalid');
      $(id1).removeClass('is-valid');
    }
    if(id2){
      $(id2).removeClass('is-invalid');
      $(id2).removeClass('is-valid');
    }
    if(id3){
      $(id3).removeClass('is-invalid');
      $(id3).removeClass('is-valid');
    }
    if(id4){
      $(id4).removeClass('is-invalid');
      $(id4).removeClass('is-valid');
    }
  }
  catch(err){
    console.error('Clear modal error: '+err);
  }
}