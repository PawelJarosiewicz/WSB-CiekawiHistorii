$(document).ready(function(){ 
    //sprawdzenie czy user jest zalogowany i wypełniamy formularz
    firebase.auth().onAuthStateChanged(function(user) {
        let era = window.location.hash;
        if(era){
            era = era.substring(1); //odrzucamy pierwszy znak #
        }
        if (user) {
            currUser = user;   
            getArticlesFromDB(era);
        } else {
            //brak logowanie do bazy
            const fetchPromises = [];
            fetchPromises.push(firebaseLogInAnonymous());   //logowanie anonimowe
            Promise.all(fetchPromises)
            .then(()=>{ 
                getArticlesFromDB(era);
            });  
        }
      });

    $(window).bind('hashchange', function() {
        let era = window.location.hash;
        if(era){
            era = era.substring(1); //odrzucamy pierwszy znak #
            getArticlesFromDB(era);
        }
   });
  });

  function getArticlesFromDB(era){
      try{
          let eraTxt;
          switch (era){
              case 'antiquity': { eraTxt='Starożytność'; } break;
              case 'medieval': { eraTxt='Średniowiecze'; } break;
              case 'modern': { eraTxt='Nowożytność'; }break;
              case 'present-day': { eraTxt='Czasy współczesne'; }break;
              default: { eraTxt='Starożytność'; }break;
          }
          $('#artContainer h1').text(eraTxt);
          $('#cardArticles').empty();
          let c=0;  //licznik artykułów
          let articles = db.collection("Articles"); //odnośnik do listy artykułów
          let artFiltr= articles.where("Public","==",true).where("Era","==",eraTxt);  //filtr 
          //let artFiltr= articles.where("Era","==",eraTxt);  //filtr testowy
          artFiltr.get()  //pobieramy
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc){  //pętla po wynikach
              createCardArticle(doc);
              c++;
            });
            $('#artCount').html("Liczba artykułów: <b>"+c+"</b>");
          })
          .catch(function(error){
            showError('Błąd pobierania listy artykułów.',error);
          });
      }
      catch(err){
        showError('Error',err);
      }
  }
  
  function createCardArticle(article){
    try{
      //article -> obiekt otrzymany z bazy firebase
      //article.id -> id obiektu (dokumentu) zapisanego w bazie
      //article.data() -> treść właściwego artykułu (dokumentu)
      let articleText = article.data().ArticleText;    
      if(articleText.length>500){ //skracamy tekst do 500 znaków
        articleText = articleText.substring(0,500)+'...';
      }
      let title = article.data().Title;
      let footer = 'Ostatnia modyfikacja '+article.data().ModifyDate;
      if(article.data().Public){
        footer=footer+', Opublikowano: '+article.data().PublicDate;
      }
      let autor = "Autor: "+article.data().UserName;
      let articleTemplate= document.createElement('div');
      articleTemplate.setAttribute('class', 'col mb-4 myArticle');
  
      let cardTemplate = document.createElement('div');
      cardTemplate.setAttribute('class', 'card h-100 border-secondary myArticleBody');
  
      let cardBodyTemplate = document.createElement('div');
      cardBodyTemplate.setAttribute('class','card-body');
      cardBodyTemplate.innerHTML = '<h5 class="card-title">'+title+'</h5> <p class="card-text">'+articleText+'</p>';
  
      let cardFooterTemplate = document.createElement('div');
      cardFooterTemplate.setAttribute('class','card-footer bg-muted border-secondary');
      cardFooterTemplate.innerHTML=`<div class="row"> <small class="text-muted">${autor}</small></div><div class="row"> <small class="text-muted">${footer}</small></div>`;
  
      //dodajemy do struktury strony
      cardTemplate.appendChild(cardBodyTemplate);
      cardTemplate.appendChild(cardFooterTemplate);
      articleTemplate.appendChild(cardTemplate);
      document.getElementById('cardArticles').appendChild(articleTemplate);

      $(articleTemplate).click(function(){
        document.location.href="/article/#"+article.id;
      });
    }
    catch(err){
      showError('Error (create card article): ',err);
    }
  }
