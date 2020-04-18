var listDocsId=[]; //tablica artykułów do nawigowania
var docQuery='';
var limitDoc=9; //liczba artykułów na stronie
var currPageNo=1; //numer aktualnej strony z artykułami
var era='';
var searchStr='';
var searchUrl='';
$(document).ready(function(){ 
    //sprawdzenie czy user jest zalogowany i wypełniamy formularz
    firebase.auth().onAuthStateChanged(function(user) {
        era = window.location.hash;
        searchUrl = window.location.search;
        if(era){
            era = era.substring(1); //odrzucamy pierwszy znak #
        }
        else if(searchUrl){
          let s = searchUrl.split('='); //dzielimy przekazany tekst, który ma postać => ?search=jakiś+tam+tekst
          if(s.length==2){
            searchStr = decodeURIComponent(s[1].replace(/\+/g, '%20'));  //konwertujemy na tekst to wyszukiwania
          }
        }
        else
          era='antiquity';

        if (user) {
            currUser = user;   
            if(era)
              getArticlesFromDB(era);
            else if(searchStr)
              searchArticlesFromDB(searchStr);
        } else {
            //brak logowanie do bazy
            const fetchPromises = [];
            fetchPromises.push(firebaseLogInAnonymous());   //logowanie anonimowe
            Promise.all(fetchPromises)
            .then(()=>{ 
              if(era)
                getArticlesFromDB(era);
              else if(searchStr)
                searchArticlesFromDB(searchStr);
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
     if(era)
      getArticlesOnPage(docQuery,currPageNo);
    else
      getSearchedArticlesOnPage(currPageNo);
   });

   $('#pageP').click(function(){
    currPageNo--;
    if(currPageNo<=1){
      if(era)
        getArticlesFromDB(era); //przy pierwszej stronie generujemy na nowo listę artykułów
      else
      getSearchedArticlesOnPage(1);
    }
    else{
      if(era)
        getArticlesOnPage(docQuery,currPageNo);
      else
        getSearchedArticlesOnPage(currPageNo);
    }
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

        if(currPageNo<=1){
          if(era)
            getArticlesFromDB(era); //przy pierwszej stronie generujemy na nowo listę artykułów
          else
          getSearchedArticlesOnPage(1);
        }
        else{
          if(era)
            getArticlesOnPage(docQuery,currPageNo);
          else
            getSearchedArticlesOnPage(currPageNo);
        }
      });
    }
  });
});

//METODY
//WYSZUKIWANIE ARTYKUŁÓW
function searchArticlesFromDB(searchStr){
  try{
    //przygotowanie strony
    let nag = $('#artContainer h1');
    $(nag).removeClass('h1');
    $(nag).addClass('h3');
    $('#artContainer h1').text('Wyniki wyszukiwania: "'+searchStr+'"');
    listDocsId.length=0;  //kasujemy tablicę
    $('#gSpinners').removeClass('d-none');  //pokazujemy animację
    $('#gSpinners').addClass('d-flex');

    //przygotowanie listy wyszukiwanych słów
    let searchKeys = searchStr.toLowerCase().split(' ');
    if(searchKeys.length>10){
      searchKeys.length=10; //skracamy tablicę do 10 słów - max co oobsługuje firebase
    }

    //budujemy listę artykułów - identyfikatory
    //najpierw szukamy wg tag-ów
    db.collection("Articles").where("Tags_lc","array-contains-any",searchKeys)
    .get()
    .then(function(querySnapshot){
      querySnapshot.forEach(function(doc){  //pętla po wynikach
        listDocsId.push(doc.id);
      });
      //wywołujemy artykuły na pierwszą stronę
      getSearchedArticlesOnPage(1);
    })
    .catch(function(error){
      $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
      $('#gSpinners').addClass('d-none');
      showError('Błąd wyszukiwania.',error);
    });
  }
  catch(err){
    $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
    $('#gSpinners').addClass('d-none');
    showError('Error (search)',err);
  }
}
function getSearchedArticlesOnPage(pageNo){
  try{
    $('#artTotalC').html(listDocsId.length); //liczba znalezionych
    $('#cardArticles').empty(); //czyścimy listę artykułów na stronie
    let query;  //zapytanie do wykonania
    let list_id=[]; //lista ID dok do wyświetlenie na stronie

    if(pageNo<=1){  //pierwsza strona
      if(listDocsId.length<limitDoc){
        list_id=listDocsId;
      }
      else{
        list_id=listDocsId.slice(0,limitDoc);
      }
    }
    else{
      let start = ((pageNo-1)*limitDoc);  //pierwszy artykuł na stronę
      let stop = start+limitDoc;  //ostatni artykuł na stronę
      if(listDocsId.length<stop){ //osiągnęliśmy koniec listy artykułów
        list_id=listDocsId.slice(start);
      }
      else{
        list_id=listDocsId.slice(start,stop);
      }
    }
    //pobieramy artykuły z bazy
    list_id.forEach(function(id){
      db.collection("Articles").doc(id).get()
      .then(function(doc){
        createCardArticle(doc);
      })
      .catch(function(error){
        $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
        $('#gSpinners').addClass('d-none');
        console.error('Error article id='+id,error);
      });
    });
    $('#artPageC').html(list_id.length); //liczba artykułów na stronie
    createPagination(); //nawigacja na stronie
    $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
    $('#gSpinners').addClass('d-none');
  }
  catch(err){
    $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
    $('#gSpinners').addClass('d-none');
    showError('Error (page no '+pageNo+')',err);
  }
}

//PRZEGLĄDANIE ARTYKUŁÓW
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
        $('#gSpinners').removeClass('d-none');  //pokazujemy animację
        $('#gSpinners').addClass('d-flex');
        let articles = db.collection("Articles"); //odnośnik do listy artykułów
        docQuery = articles.where("Public","==",true).where("Era","==",eraTxt).orderBy("PublicDate","desc");  //bazowy filtr 

        docQuery.get()
        .then(function(querySnapshot) {
          $('#artTotalC').html(querySnapshot.docs.length);  //łączna liczba artykułów
          querySnapshot.forEach(function(doc){  //pętla po wynikach
            listDocsId.push(doc.id);
          });
          getArticlesOnPage(docQuery,1);
        })
        .catch(function(error){
          $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
          $('#gSpinners').addClass('d-none');
          showError('Błąd artykuły.',error);
        });
    }
    catch(err){
      $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
      $('#gSpinners').addClass('d-none');
      showError('Error',err);
    }
}

function getArticlesOnPage(query,pageNo){
  try{
    $('#gSpinners').removeClass('d-none');  //pokazujemy animację
    $('#gSpinners').addClass('d-flex');
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
            $('#artPageC').html(querySnapshot.docs.length); //liczba artykułów na stronie
            createPagination(); //nawigacja na stronie
          })
          .catch(function(error){
            $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
            $('#gSpinners').addClass('d-none');
            showError('Błąd pobierania listy artykułów.',error);
          });
        }
      $('#gSpinners').removeClass('d-flex');  //pokazujemy animację
      $('#gSpinners').addClass('d-none');
      });
    }
  }
  catch(err){
    $('#gSpinners').removeClass('d-flex');  //ukrywamy animację
    $('#gSpinners').addClass('d-none');
    showError('Error (page no '+pageNo+')',err);
  }
}

//OBSŁUGA STRONY
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
    setStateBtnPagination();
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
