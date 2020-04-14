$(document).ready(function(){ 
    //sprawdzenie czy user jest zalogowany i wypełniamy formularz
    firebase.auth().onAuthStateChanged(function(user) {
        let articleid = window.location.hash;
        if(articleid){
            articleid = articleid.substring(1); //odrzucamy pierwszy znak #
        }
        if (user) {
            currUser = user;   
            getArticleFromDB(articleid);
        } else {
            //brak logowanie do bazy
            const fetchPromises = [];
            fetchPromises.push(firebaseLogInAnonymous());   //logowanie anonimowe
            Promise.all(fetchPromises)
            .then(()=>{ 
                getArticleFromDB(articleid); 
            });  
        }
      });

    $(window).bind('hashchange', function() {
        let articleid = window.location.hash;
        if(articleid){
            articleid = articleid.substring(1); //odrzucamy pierwszy znak #
            getArticleFromDB(articleid);
        }
   });
  });

  function getArticleFromDB(articleid){
      try{
          if(articleid){
            db.collection("Articles").doc(articleid)
            .get()
            .then(function(doc){
                insertArticle(doc);
            })
            .catch(function(error) {
                showError('Błąd odczytywania artykułu o id='+articleid,error);
            });
          }
    }
    catch(err){
        showError('Error',err);
      }
  }

  //wstawiamy artykuł na stronę
  function insertArticle(article){
      let cont = document.getElementById('artContainer');
      $(cont).empty();
      let title = article.data().Title;
      let body = article.data().ArticleText;
      let era = article.data().Era;
      let pubDate = article.data().PublicDate;
      let modDate = article.data().ModifyDate;
      let autor = article.data().UserName;
      let tags = article.data().Tags;

      //składowe artykułu
      let headTemplate = document.createElement('h1');
      headTemplate.setAttribute('class','font-weight-bold py-4');
      headTemplate.innerText = title;

      let bodyTemplate = document.createElement('div');
      bodyTemplate.innerHTML = body;

      let fTemplate = document.createElement('div');
      fTemplate.setAttribute('class','border-top border-dark my-4 pt-1 text-secondary');
      fTemplate.innerHTML=`
        <p class="font-italic">Epoka: ${era}</p>
        <p class="font-italic">Tagi: ${tags}</p>
        <p class="font-italic m-0">Autor: ${autor}</p>
        <p class="font-italic m-0">Data publikacji: ${pubDate}</p>
        <p class="font-italic m-0">Data ostatniej modyfikacji: ${modDate}</p>
      `;
      //dodanie do drzewa dokumenty
      cont.appendChild(headTemplate);
      cont.appendChild(bodyTemplate);
      cont.appendChild(fTemplate);
  }