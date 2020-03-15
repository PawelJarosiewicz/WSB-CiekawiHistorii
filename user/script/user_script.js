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
  $('#newUserPass2').on('input',checkPass2);
});

function checkPass(){
  try{
    if($(this).hasClass('is-invalid') || $(this).hasClass('is-valid')){
      if($(this).val().length>5){
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
    console.log('Check password error: '+err);
  }
}

function checkPass2(){
  try{
    if($(this).hasClass('is-invalid') || $(this).hasClass('is-valid')){
      if($(this).val().length>5 & $(this).val()==$('#newUserPass').val()){
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
    console.log('Check password error: '+err);
  }
}

function checkName(){
  try{
    if($(this).hasClass('is-invalid') || $(this).hasClass('is-valid')){
      if($(this).val().length>2){
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
    console.log('Check name error: '+err);
  }
}

function validateLogIn(e){
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
      event.preventDefault();
      event.stopPropagation();
    }
    else{
      //logujemy się...
      alert('Logowanie');
      e.target.submit();
    }
  }
  catch(err){
    console.log('Login error: '+err);
  }
}

function validateNewUser(e){
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
      //logujemy się...
      alert('Tworzymy user');
      e.target.submit();
    }
  }
  catch(err){
    console.log('Create user error: '+err);
  }
}








  
  