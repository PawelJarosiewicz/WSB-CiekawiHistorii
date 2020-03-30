$(document).ready(function(){
  //obsługa przycisków przełączających formy
  $("#btnLogin").click(function(){
    if($('#loginFrm').hasClass('collapse')){
      $('#loginFrm').removeClass('collapse');
      $('#newUserFrm').addClass('collapse');
      $("#btnLogin").addClass('text-light myActiveBtn');
      $('#btnNewUser').removeClass('text-light myActiveBtn');
      $('#btnNewUser').addClass('myInActiveBtn');
    }
  });

  $('#btnNewUser').click(function(){
    if($('#newUserFrm').hasClass('collapse')){
      $('#newUserFrm').removeClass('collapse');
      $('#loginFrm').addClass('collapse');
      $("#btnNewUser").addClass('text-light myActiveBtn');
      $('#btnLogin').removeClass('text-light myActiveBtn');
      $('#btnLogin').addClass('myInActiveBtn');
    }
  });

  //logowanie
  $('#loginFrm').submit(validateLogIn);
  $('#loginEmail').on('input',checkEmail);
  $('#loginPass').on('input',checkPass);

  //nowy user
  $('#newUserFrm').submit(validateNewUser);
  $('#newUserName').on('input',checkName);
  $('#newUserEmail').on('input',checkEmail); 
  $('#newUserPass').on('input',checkPass);
  //podpięcie funkcji z przekazaniem parametrów
  $('#newUserPass2').bind('input',{idFirstPass: '#newUserPass',idSecondPass: '#newUserPass2'},checkPass2);

  //reset hasła
  $('#resetPassEmail').on('input',checkEmail);
  $('#resetPassFrm').submit(validateResetPass);

  //sprawdzamy cookie
  let cookieVal = getCookie('userMail');
  if(cookieVal){
    $('#loginEmail').val(cookieVal);
    $('#loginCheck').attr('checked','true');
  }
});

function validateResetPass(e){
  try{
    if($('#resetPassEmail').val()=='' | !validateEmail($('#resetPassEmail').val())){
      $('#resetPassEmail').addClass('is-invalid');
    }
    else{
      $('#resetPassEmail').removeClass('is-invalid');
      $('#resetPassEmail').addClass('is-valid');
    }
    if($('#resetPassEmail').hasClass('is-invalid')){
      e.preventDefault();
      e.stopPropagation();
    }
    else{
      e.preventDefault();
      let auth = firebase.auth();
      auth.sendPasswordResetEmail($('#resetPassEmail').val()).then(function() {
        showInfo('E-mail wysłany','Na podany adres e-mail została wysłana wiadomość. Postępuj zgodnie z poleceniami zawartymi w wiadomości.',function(){e.target.submit();});
        
      })
      .catch(function(error) { showError('Błąd '+error.code,error.message); });
    }
  }
  catch(err){
    console.log('Reset password error: '+err);
  }
}

function checkPass(){
  try{
    if($(this).val().length>5){
      this.classList.remove('is-invalid');
      this.classList.add('is-valid');
    }
    else{
      this.classList.remove('is-valid');
      this.classList.add('is-invalid');
    }
  }
  catch(err){
    console.log('Check password error: '+err);
  }
}

function checkPass2(event){
  try{
    let fp = event.data.idFirstPass;
    let sp = event.data.idSecondPass;
    if($(sp).val().length>5 & $(sp).val()==$(fp).val()){
      $(sp).removeClass('is-invalid');
      $(sp).addClass('is-valid');
    }
    else{
      $(sp).removeClass('is-valid');
      $(sp).addClass('is-invalid');
    }
  }
  catch(err){
    console.log('Check password error: '+err);
  }
}

function checkName(){
  try{
    if($(this).val().length>2){
      this.classList.remove('is-invalid');
      this.classList.add('is-valid');
    }
    else{
      this.classList.remove('is-valid');
      this.classList.add('is-invalid');
    }
  }
  catch(err){
    console.log('Check name error: '+err);
  }
}

function validateLogIn(e){
  let btn = $(this).find('[type="submit"]');
  try{
    if($('#loginEmail').val()=='' | !validateEmail($('#loginEmail').val())){
      $('#loginEmail').addClass('is-invalid');
    }
    else{
      $('#loginEmail').removeClass('is-invalid');
      $('#loginEmail').addClass('is-valid');
    }
    if($('#loginPass').val().length<6){
      $('#loginPass').addClass('is-invalid');
    }
    else{
      $('#loginPass').removeClass('is-invalid');
      $('#loginPass').addClass('is-valid');
    }

    //dane niepoprawne - blokujemy
    if($('#loginEmail').hasClass('is-invalid') | $('#loginPass').hasClass('is-invalid')){
      e.preventDefault();
      e.stopPropagation();
    }
    else{
      //logujemy się...
      e.preventDefault();
      //animacja na przycisku
      $(btn).html('<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>Logowanie...');
      $(btn).removeClass('btn-outline-success');
      $(btn).addClass('btn-success');
      const fetchPromises = [];
      let lu=firebase.auth().signInWithEmailAndPassword($('#loginEmail').val(), $('#loginPass').val())
      .catch(function(error) {
        decodeLogInError(error);
        $(btn).html('Zaloguj się');
        $(btn).addClass('btn-outline-success');
        $(btn).removeClass('btn-success');
      });

      fetchPromises.push(lu);
      Promise.all(fetchPromises).then(()=>{
        if(currUser){
          if($('#loginCheck').is(':checked') ){  //zapamiętujemy login jeśli zaznaczono
            setCookie('userMail',$('#loginEmail').val(),365,'/');
          }
          window.location.href = '/user';
        }
      });
    }
  }
  catch(err){
    showError('Login error: '+err);
    $(btn).html('Zaloguj się');
    $(btn).addClass('btn-outline-success');
    $(btn).removeClass('btn-success');
  }
}

function decodeLogInError(err){
  if(err.code=='auth/user-disabled'){
    showError('Błąd - konto wyłączone','Twoje konto zostało zablokowane.</br>Użyj <a href="/contact">formularza kontaktowego</a> w celu odblokowania konta.');
  }
  else if(err.code=='auth/user-not-found'){
    showError('Błąd - konto nie istnieje','Dla podanego adres e-mail nie ma konta w naszym serwisie.');
  }
  else if(err.code=='auth/wrong-password'){
    showError('Błąd - niepoprawne hasło','Podane hasło jest błędne.</br>Wprowadź poprawne hasło.');
  }
  else{
    showError('Błąd '+err.code,err.message);
  }
}

function validateNewUser(e){
  let btn = $(this).find('[type="submit"]');
  try{
    if($('#newUserEmail').val()=='' | !validateEmail($('#newUserEmail').val())){
      $('#newUserEmail').addClass('is-invalid');
    }
    else{
      $('#newUserEmail').removeClass('is-invalid');
      $('#newUserEmail').addClass('is-valid');
    }
    if($('#newUserName').val().length<3){
      $('#newUserName').addClass('is-invalid');
    }
    else{
      $('#newUserName').removeClass('is-invalid');
      $('#newUserName').addClass('is-valid');
    }
    if($('#newUserPass').val().length<6){
      $('#newUserPass').addClass('is-invalid');
    }
    else{
      $('#newUserPass').removeClass('is-invalid');
      $('#newUserPass').addClass('is-valid');
    }
    if($('#newUserPass2').val().length<6 || $('#newUserPass').val()!=$('#newUserPass2').val()){
      $('#newUserPass2').addClass('is-invalid');
    }
    else{
      $('#newUserPass2').removeClass('is-invalid');
      $('#newUserPass2').addClass('is-valid');
    }

    //dane niepoprawne - blokujemy
    if($('#newUserEmail').hasClass('is-invalid') | $('#newUserName').hasClass('is-invalid') | $('#newUserPass').hasClass('is-invalid') | $('#newUserPass2').hasClass('is-invalid')){
      event.preventDefault();
      event.stopPropagation();
    }
    else{
      //towrzymy konto...
      e.preventDefault();
      //animacja
      $(btn).html('<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>Tworzenie konta...');
      $(btn).removeClass('btn-outline-success');
      $(btn).addClass('btn-success');
      const fetchPromises = [];
      let cu = firebase.auth().createUserWithEmailAndPassword($('#newUserEmail').val(), $('#newUserPass').val())
      .catch(function(error) {
        if(error.code=='auth/email-already-in-use'){
          showError('Błąd - takie konto już istnieje','Istnieje już konto powiązane z podanym adresem e-mail.</br>Użyj innego adresu e-mail lub zaloguj się na podany adres e-mail.</br>Jeśli nie pamiętasz hasła to zawsze możesz je <a href="/user/reset-password">zresetować</a>.');
        }
        else{
          showError('Błąd '+error.code,error.message);
        }
        $(btn).html('Utwórz konto');
        $(btn).addClass('btn-outline-success');
        $(btn).removeClass('btn-success');    
      });
      fetchPromises.push(cu);

      Promise.all(fetchPromises).then(()=>{
        if(currUser){
          let un = currUser.updateProfile({ displayName: $('#newUserName').val() })
          .catch(function(error) {
            console.error(error.code,error.message);
            $(btn).html('Utwórz konto');
            $(btn).addClass('btn-outline-success');
            $(btn).removeClass('btn-success');
          });
          fetchPromises.push(un);
          Promise.all(fetchPromises).then(()=>{ window.location.href = '/user'; });
        }
      });
    }
  }
  catch(err){
    showError('Create user error: '+err);
    $(btn).html('Utwórz konto');
    $(btn).addClass('btn-outline-success');
    $(btn).removeClass('btn-success');
  }
}








  
  