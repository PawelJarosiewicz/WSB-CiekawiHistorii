var listDocsId=[]; //tablica artykułów do nawigowania
var docQuery;
var limitDoc=9; //liczba artykułów na stronie
var currPageNo=1; //numer aktualnej strony z artykułami
var era;
$(document).ready(function(){ 
    //sprawdzenie czy user jest zalogowany i wypełniamy formularz
    firebase.auth().onAuthStateChanged(function(user) {
        era = window.location.hash;
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
        era = window.location.hash;
        if(era){
            era = era.substring(1); //odrzucamy pierwszy znak #
            getArticlesFromDB(era);
        }
   });

   //nawigacja strony
   $('#pageN').click(function(){
     currPageNo++;
     getArticlesOnPage(docQuery,currPageNo);
     createPagination();
     setStateBtnPagination();
   });

   $('#pageP').click(function(){
    currPageNo--;
    getArticlesOnPage(docQuery,currPageNo);
    createPagination();
    setStateBtnPagination();
  });

  //przypisanie zdarzeń na przyciski
  $('#pageNav ul').children('li').each(function(){
    if(!$(this).children('button').attr('id')){
      $(this).children('button').click(function(){
        let n = $(this).text(); //numer wybranej strony
        if(n>1){
          currPageNo=n; //ustawiamy bierzącą stronę 
        }
        else{
          //kliknięty przycisk pierwszej strony
          currPageNo=1;
        }
        getArticlesOnPage(docQuery,currPageNo);
        createPagination();
        setStateBtnPagination();
      });
    }
  });

  });

  function createPagination(){
    try{
      let pn=1; //zmienna pomocnicza
      if(currPageNo>1){
        pn=currPageNo-1;
      }
      $('#pageNav ul').children('li').each(function(){
        if(!$(this).children('button').attr('id')){
          //aktualizujemy numer
          $(this).children('button').html('<span>'+pn+'</span>');  

          //aktualizujemy status aktywności przycisku
          if(pn!=currPageNo)
            $(this).removeClass('active');
          else if(pn==currPageNo)
            $(this).addClass('active');
          
          //ukrywamy lub przywracamy przycisk przy dotarciu do końca listy artykułów
          if(Math.ceil(listDocsId.length/limitDoc)>=pn){
            this.style.display = '';
          }
          else{
            this.style.display = 'none';  
          }

          //licznik kolejnego numeru na przycisku
          pn++;
        }
      });
    }
    catch(err){
      showError('Error (pagination) ',err);
    }
  }
  //dezaktywujemy/aktywujemy przyciski następnej/poprzedniej strony
  function setStateBtnPagination(){
    if(currPageNo==1){
      let n = document.getElementById('pageP').parentNode;
      $(n).addClass('disabled');
    }
    if((currPageNo*limitDoc)<listDocsId.length){
      let n = document.getElementById('pageN').parentNode;
      $(n).removeClass('disabled');
     }

     if(currPageNo>1){
      let n = document.getElementById('pageP').parentNode;
      $(n).removeClass('disabled');
     }
     if((currPageNo*limitDoc)>=listDocsId.length){
      let n = document.getElementById('pageN').parentNode;
      $(n).addClass('disabled');
     }
  }

  function getArticlesFromDB(era){
      try{
          let eraTxt;
          switch (era){
              case 'antiquity': { eraTxt='Starożytność'; } break;
              case 'medieval': { eraTxt='Średniowiecze'; } break;
              case 'modern': { eraTxt='Nowożytność'; }break;
              case 'present-day': { eraTxt='Czasy współczesne'; }break;
              default: { eraTxt=''; }break;
          }
          $('#artContainer h1').text(eraTxt);
          listDocsId.length=0;  //kasujemy tablicę
          let articles = db.collection("Articles"); //odnośnik do listy artykułów
          docQuery = articles.where("Public","==",true).where("Era","==",eraTxt).orderBy("PublicDate","desc");  //bazowy filtr 
  
          docQuery.get()
          .then(function(querySnapshot) {
            $('#artTotalC').html(querySnapshot.docs.length);  //łączna liczba artykułów
            querySnapshot.forEach(function(doc){  //pętla po wynikach
              listDocsId.push(doc.id);
            });
            getArticlesOnPage(docQuery,1);
            createPagination();
            setStateBtnPagination();
          })
          .catch(function(error){
            showError('Błąd artykuły.',error);
          });
      }
      catch(err){
        showError('Error',err);
      }
  }

  function getArticlesOnPage(query,pageNo){
    try{
      let startDoc;
      let docid;
      $('#cardArticles').empty(); //czyścimy listę artykułów na stronie
      if(pageNo<=1){
        //artykuły na pierwszą stronę
        docid = listDocsId[0];
      }
      else{
        //artykuły dla wskazanej strony
          docid = listDocsId[(pageNo-1)*limitDoc];
      }
      //pierwszy artykuł na stronę jako baza do pobrania listy artykułów
      if(docid){
        startDoc = db.collection("Articles").doc(docid);
        //pobieramy najpierw dokument bazowy
        startDoc.get().then(function(sdoc){
          if(sdoc.exists){
            //polecenie do pobrania dokumentów na stronę
            let queryDoc = query.startAt(sdoc).limit(limitDoc);
            //teraz pobieramy listę artykułów na stronę
            queryDoc.get().then(function(querySnapshot){
              querySnapshot.forEach(function(doc){  //pętla po wynikach
                    createCardArticle(doc);
                  });
              $('#artPageC').html(querySnapshot.docs.length);
            })
            .catch(function(error){
              showError('Błąd pobierania listy artykułów.',error);
            });
          }
        });
      }
    }
    catch(err){
      showError('Error (page no '+pageNo+')',err);
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
      let tags = "Tagi: "+article.data().Tags;
      let articleTemplate= document.createElement('div');
      articleTemplate.setAttribute('class', 'col p-2 mb-4 myArticle');
  
      let cardTemplate = document.createElement('div');
      cardTemplate.setAttribute('class', 'card h-100 border-secondary myArticleBody');
  
      let cardBodyTemplate = document.createElement('div');
      cardBodyTemplate.setAttribute('class','card-body');
      cardBodyTemplate.innerHTML = '<h5 class="card-title">'+title+'</h5> <p class="card-text">'+articleText+'</p>';
  
      let cardFooterTemplate = document.createElement('div');
      cardFooterTemplate.setAttribute('class','card-footer bg-muted border-secondary');
      cardFooterTemplate.innerHTML=`<div class="row"> <small class="text-muted">${autor}</small></div>
        <div class="row"> <small class="text-muted">${tags}</small></div>
        <div class="row"> <small class="text-muted">${footer}</small></div>
        `;
  
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
