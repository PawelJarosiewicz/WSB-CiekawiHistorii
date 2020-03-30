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
          if(currUser.isAnonymous){
            $('#btnMnuUser').addClass('collapse');
            $('#btnLogIn').removeClass('collapse');
          } 
          else{
            $('#btnMnuUser').removeClass('collapse'); //pokazujemy menu usera
            $('#btnLogIn').addClass('collapse'); //ukrywamy przycisk logowania
          }         
      } else {
          currUser=null;
          $('#btnMnuUser').addClass('collapse');
          $('#btnLogIn').removeClass('collapse'); 
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

  //wyloguj z głównego menu
  $('#mnuLogOut').click(logOut);
  if(!getCookie('cookieInfo')){
    showCookieInfo();
  }
  showCookieInfo();

  //podpowiedzi - na końcu
  $('[data-toggle="tooltip"]').tooltip();
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

function setCookie(name, val, days, path, domain, secure) {
  if (navigator.cookieEnabled) { //czy ciasteczka są włączone
      const cookieName = encodeURIComponent(name);
      const cookieVal = encodeURIComponent(val);
      let cookieText = cookieName + "=" + cookieVal;

      if (typeof days === "number") {
          const data = new Date();
          data.setTime(data.getTime() + (days * 24*60*60*1000));
          cookieText += "; expires=" + data.toGMTString();
      }
      if (path) {
          cookieText += "; path=" + path;
      }
      if (domain) {
          cookieText += "; domain=" + domain;
      }
      if (secure) {
          cookieText += "; secure";
      }
      document.cookie = cookieText;
  }
}

function getCookie(name) {
  if (document.cookie !== "") {
      const cookies = document.cookie.split(/; */);

      for (let i=0; i<cookies.length; i++) {
          const cookieName = cookies[i].split("=")[0];
          const cookieVal = cookies[i].split("=")[1];
          if (cookieName === decodeURIComponent(name)) {
              return decodeURIComponent(cookieVal);
          }
      }
  }
}

function showCookieInfo(){
  try{
    let cookieTemplate= document.createElement('div');
    cookieTemplate.setAttribute('id', 'cookieInfo');
    cookieTemplate.setAttribute('class', 'container-fluid bg-dark text-light collapse show p-1');
    cookieTemplate.innerHTML='<h6 class="m-1"> Korzystanie z niniejszej witryny oznacza zgodę na wykorzystywanie plików cookies.</h6>' +
      '<p class="text-justify mx-1 my-0">Używamy informacji zapisanych za pomocą plików cookies w celu zapewnienia maksymalnej wygody w korzystaniu z naszego serwisu. Zmiany warunków przechowywania lub uzyskiwania dostępu do plików cookies można dokonać w każdym czasie w swojej przeglądarce.</p>' +
      '<span class="mx-3 d-flex justify-content-between"><a href="http://wszystkoociasteczkach.pl/" target="_blank" title="Odwiedź (link zewnętrzny): wszystkoociasteczkach.pl" class="px-2" data-toggle="tooltip">więcej informacji</a><a href="#" class="px-2" data-toggle="collapse" data-target="#cookieInfo" title="zamknij">zamknij</a></span>';
    document.body.appendChild(cookieTemplate);
    
    $('#cookieInfo [data-toggle="collapse"]').first().on('click',function(){
      $(this).tooltip('hide');
      setCookie('cookieInfo',true,365,'/');
      $('#cookieInfo').addClass('collapse');
    });
  }
  catch(err){
    console.error('Show cookie info error: '+err);
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
            '<div class="modal-content">' +
                '<div class="modal-header text-danger ">' +
                    '<h6 class="modal-title myModal font-weight-bold">' +sHeader+'</h6>'+
                    '<button type="button" class="close myModal" data-dismiss="modal">&times;</button>' +
                '</div>' +
                '<div class="modal-body myModal">' +sBody+'</div>' +
                '<div class="modal-footer ">' +
                    '<button type="button" class="btn btn-warning myModal" data-dismiss="modal">OK</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    console.error(sHeader+' '+sBody);
    $(modalTemplate).modal();
  }
  catch(err){
    console.error('Show modal error: '+err);
  }
}

function showInfo(sHeader,sBody,sFunction){
  try{
    let modalTemplate = document.createElement('div');
    modalTemplate.setAttribute('id', 'm-Info');
    modalTemplate.setAttribute('class','modal fade');
    modalTemplate.innerHTML= '<div class="modal-dialog">' +
                                '<div class="modal-content">' +
                                    '<div class="modal-header text-info">' +
                                        '<h6 class="modal-title myModal font-weight-bold">' +sHeader+'</h6>'+
                                        '<button type="button" class="close myModal" data-dismiss="modal">&times;</button>' +
                                    '</div>' +
                                    '<div class="modal-body myModal">' +sBody+'</div>' +
                                    '<div class="modal-footer ">' +
                                        '<button type="button" class="btn btn-info myModal" data-dismiss="modal" id="btnOK">OK</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';

    if($('#m-Info').length>0){
      $('#m-Info').remove();  //jeśli element istnieje -> usuwamy
    }
    document.body.appendChild(modalTemplate); //podpinamy strukturę okna modalnego
    if(typeof sFunction == 'function'){ //została przekazana funkcja -> podpinamy pod button
      $('#btnOK').on('click',sFunction); 
    }
    $('#m-Info').modal('show');
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
    if($(this).val()!=''){
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