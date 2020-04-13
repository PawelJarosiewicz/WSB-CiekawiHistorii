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
            $('#btnLogIn').removeAttr('hidden');
          } 
          else{
            $('#btnMnuUser').removeAttr('hidden');//pokazujemy menu usera
          }
          //odczytanie listy ostatnich artykułów 
          loadLastArticles();     
      } else {
          currUser=null;
          $('#btnLogIn').removeAttr('hidden');
          const fetchPromises = [];
            fetchPromises.push(firebaseLogInAnonymous());   //logowanie anonimowe
            Promise.all(fetchPromises)
            .then(()=>{ loadLastArticles(); });  
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

  //podpowiedzi - na końcu
  $('[data-toggle="tooltip"]').tooltip();
});
//END READY

//METODY wspólne dla całej witryny

//OSTATNIE ARTYKUŁY-----------
function loadLastArticles(){
  let contLastArt = document.getElementById('lastArticles');
          if(contLastArt){
            try{
              $(contLastArt).empty();
              $(contLastArt).html('<h5 class="font-weight-bolder pb-3">Ostatnie artykuły</h5>');
              db.collection("Articles").where("PublicDate",">","").orderBy("PublicDate","desc").limit(3)
              .get()
              .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc){  //pętla po wynikach
                  contLastArt.appendChild(createContainerArticle(doc));
                });

              })
              .catch(function(error){
                console.error('Błąd pobierania listy artykułów.',error);
              });
            }
            catch(err){
              console.error('Load last articles',err);
            }
          } 
}
function createContainerArticle(article){
    //article -> obiekt otrzymany z bazy firebase
    //article.id -> id obiektu (dokumentu) zapisanego w bazie
    //article.data() -> treść właściwego artykułu (dokumentu)
    let articleText = article.data().ArticleText;    
    if(articleText.length>200){ //skracamy tekst
      articleText = articleText.substring(0,200)+' ...';
    }
    //zamiana nagłówków na paragrafy - h1..h6 psują wygląd tekstu bocznego panelu
    articleText = articleText.replace(/<h1>/gi, '<p>').replace(/<\h1>/gi, '</p>');
    articleText = articleText.replace(/<h2>/gi, '<p>').replace(/<\h2>/gi, '</p>');
    articleText = articleText.replace(/<h3>/gi, '<p>').replace(/<\h3>/gi, '</p>');
    articleText = articleText.replace(/<h4>/gi, '<p>').replace(/<\h4>/gi, '</p>');
    articleText = articleText.replace(/<h5>/gi, '<p>').replace(/<\h5>/gi, '</p>');
    articleText = articleText.replace(/<h6>/gi, '<p>').replace(/<\h6>/gi, '</p>');
    let title = article.data().Title;

    let articleTemplate= document.createElement('div');
    articleTemplate.setAttribute('class','border-bottom border-dark my-3 lastArticle');
    // articleTemplate.setAttribute('id',article.id);
    articleTemplate.innerHTML=`<h6 class="font-weight-bolder">${title}</h6><div>${articleText}</div>`;
    $(articleTemplate).click(function(){
      document.location.href="/article/#"+article.id;
    });
    return articleTemplate;
}

//MENU - zmiana ikony przycisku menu
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

//COOKIE--------
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
//--->

//OKNA MODALNE-----------
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
                    '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
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
                                        '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
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

// FIREBASE
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

//FUNKCJE DO WALIDACJI FORMULARZY
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

function checkFieldEmpty(){
  if($(this).val()==''){
      $(this).addClass('is-invalid');
    }
  else{
      $(this).removeClass('is-invalid');
      $(this).addClass('is-valid');
  }
}
function checkFieldEmptyById(controlId){
  if(controlId){
      if($(controlId).val()==''){
          $(controlId).addClass('is-invalid');
        }
      else{
          $(controlId).removeClass('is-invalid');
          $(controlId).addClass('is-valid');
      }
  }
}

function clearFieldInvalidState(){
  if($(this).hasClass('is-invalid')){
    if(this.nodeName=='DIV'){
      if(this.innerText!=''){
        $(this).removeClass('is-invalid');
        $(this).removeClass('is-valid');
      }      
    }
    else {
      if($(this).val()!=''){
        $(this).removeClass('is-invalid');
        $(this).removeClass('is-valid');
      }
    }
  }
}