$(document).ready(function(){ 
  //wylogowanie
  $('#navLogout').click(logOut);
  $('#navAddArticles').click(function(){document.location.href='../edit-article'});

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
            window.location.href='login';
          }
          else{
            $('.mainSection').removeAttr('hidden');
            $('#userNameSpan').text(currUser.displayName);
            $('#profileUserName').val(currUser.displayName);
            $('#profileUserEmail').val(currUser.email);
            $('#profileUserPass').val('######'); 

            //przekierowanie do konkretnej zakładki
            let tab = window.location.hash;
            if(tab=='#navArticles'){
              $(tab).click();
            }
            else if (tab){
              $('#navArticles').click();  //przekazany hash to id artykułu
            }
          }
                  
      } else {
          currUser=null;
          window.location.href='login';
      }
    });
  //odczytanie artykułów usera
  $('#navArticles').click(function (){
    $('#cardArticles').empty(); //kasujemy wszystkie subelementy kontenera do karty artykułów.
    getUserArticles();  //pobieramy artykuły
  }); 
  $('#artEra').change(function(){
    $('#cardArticles').empty(); 
    getUserArticles(); 
  });

  //ukrycie tooltipa po kliknięciu
  $('[data-toggle="pill"]').each(function(){
    $(this).bind('click',function(){ $(this).tooltip('hide'); });
  });
});

//METODY do obsługi strony
//ARTYKUŁY-----------
function getUserArticles(){
  try{ 
    if(currUser){
      if(!currUser.isAnonymous){
        let c=0;
        let articles = db.collection("Articles"); //odnośnik do listy artykułów
        let artFiltr= articles.where("UserId","==",currUser.uid);  //filtr po id usera
        if($('#artEra').val()!=0){
          artFiltr = artFiltr.where("Era","==",$('#artEra').val());
        }
        artFiltr.get()  //pobieramy
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc){  //pętla po wynikach
            createUserCardArticle(doc);
            c++;
          });
          $('#artCount').html("Liczba artykułów: <b>"+c+"</b>");
          //przewijamy stronę do artykułu
          let hashId = document.location.hash;
          if(hashId){
            let docHash = document.getElementById(hashId.substring(1));
            if(docHash){
              let y = $(docHash).offset().top - $('.navbar').outerHeight() - 10;  //wyznaczamy punkt odniesienia
              window.scrollTo({ top: y, behavior: 'smooth' });  //przewijamy
              //delikatnie wyróżniamy kartę artykułu
              let btnE = $(docHash).find('.btn-outline-primary');
              $(btnE).removeClass('btn-outline-primary');
              $(btnE).addClass('btn-primary');
              let btnU = $(docHash).find('.btn-outline-danger');
              $(btnU).removeClass('btn-outline-danger');
              $(btnU).addClass('btn-danger');
            }
          }
        })
        .catch(function(error){
          showError('Błąd pobierania listy artykułów.',error);
        });
      }
    }
  }
  catch(err){
    showError('Error (get user articles): ',err);
  }
}

function createUserCardArticle(article){
  try{
    //article -> obiekt otrzymany z bazy firebase
    //article.id -> id obiektu (dokumentu) zapisanego w bazie
    //article.data() -> treść właściwego artykułu (dokumentu)
    let articleText = article.data().ArticleText;    
    if(articleText.length>500){ //skracamy tekst do 500 znaków
      articleText = articleText.substring(0,500)+'...';
    }
    let title = article.data().Title;
    let footer = 'Ostatnia modyfikacja: '+article.data().ModifyDate;
    if(article.data().Public){
      footer=footer+'</br> Opublikowano: '+article.data().PublicDate;
    }
    let tags = "Tagi: "+article.data().Tags;
    let articleTemplate= document.createElement('div');
    articleTemplate.setAttribute('class', 'col mb-4');
    articleTemplate.setAttribute('id', article.id);

    let cardTemplate = document.createElement('div');
    cardTemplate.setAttribute('class', 'card h-100 border-info');

    let cardBodyTemplate = document.createElement('div');
    cardBodyTemplate.setAttribute('class','card-body');
    cardBodyTemplate.innerHTML = '<h5 class="card-title">'+title+'</h5> <p class="card-text">'+articleText+'</p>';

    let cardFooterTemplate = document.createElement('div');
    cardFooterTemplate.setAttribute('class','card-footer bg-muted border-info');
    cardFooterTemplate.innerHTML=`<div class="row justify-content-between"> <small class="col-6 text-muted">${tags}</small>
        <div class="mr-2">
          <button class="btn btn-outline-primary py-0" onclick="editArticle('${article.id}')">Edytuj</button>
          <button class="btn btn-outline-danger py-0" onclick="deleteArticle('${article.id}','${title}')">Usuń</button>
        </div>
      </div>
      <small class="text-muted ">${footer}</small>`;

    //dodajemy do struktury strony
    cardTemplate.appendChild(cardBodyTemplate);
    cardTemplate.appendChild(cardFooterTemplate);
    articleTemplate.appendChild(cardTemplate);
    document.getElementById('cardArticles').appendChild(articleTemplate);
  }
  catch(err){
    showError('Error (create card article): ',err);
  }
}

function deleteArticle(articleId, title){
  try{
    $('#modalDelArticle p').html('Czy chcesz usunąć artykuł "'+title+'"?');
    $('#delArtYes').click(function(){
      db.collection("Articles").doc(articleId).delete().then(function() {
        $('#cardArticles').empty();
        getUserArticles();
        }).catch(function(error) {
          showError("Błąd podczas usuwania artykułu", error);
        });
    });
    $('#modalDelArticle').modal();
  }
  catch(err){
    showError('Error (delete article): ',err);
  }
}

function editArticle(articleId){
  try{
    document.location.href="../edit-article/#"+articleId;
  }
  catch(err){
    showError('Error (edit article): ',err);
  }
}

//PODPOWIEDZI-----------
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

//PROFIL-----------
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
    //walidacja podczas wpisywania
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