var caretPos;

$(document).ready(function(){ 
    //sprawdzenie czy user jest zalogowany i wypełniamy formularz
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currUser = user;
            if(currUser.isAnonymous){ //logowanie anonimowe
            //   document.location.href='/user/login';
            }
            else{
            }
                    
        } else {
            currUser=null;
            // document.location.href='/user/login';
        }
      });
    
      //obsługa formularza 
      $('#artEra').on('change',showSelectedEraInfo);
      //obsługa edytora
      $('#editor').bind('input keyup click',setStateBtn);
      $('#eCut').click(function(){document.execCommand('cut',false,null)});
      $('#eCopy').click(function(){document.execCommand('copy',false,null)});
      $('#ePaste').click(editorPaste);
      $('#eClear').click(editorClearFormat)
      $('#eOList').click(function(){document.execCommand('insertOrderedList',false,null);});
      $('#eUList').click(function(){document.execCommand('insertUnorderedList',false,null);});
      $("#eLink").click(function(){ 
        if(isSelectionInsideElementById('editor')){
          caretPos = window.getSelection().getRangeAt(0);
        }
        else{
          caretPos=null;
        }
        $('#modalLink').modal('show'); 
      });
      $('#urlLink').on('input',checkFieldEmpty);
      $('#eTxtSize').on('change',editorHeading);
      $('#eBold').click(function(){document.execCommand('bold',false,null)});
      $('#eItalic').click(function(){document.execCommand('italic',false,null)});
      $('#eUnderline').click(function(){document.execCommand('underline',false,null)});
      $('#eStrike').click(function(){document.execCommand('strikeThrough',false,null)});
      $('#eAlignLeft').click(function(){document.execCommand('justifyLeft',false,null)});
      $('#eAlignCenter').click(function(){document.execCommand('justifyCenter',false,null)});
      $('#eAlignRight').click(function(){document.execCommand('justifyRight',false,null)});
      $('#eJustify').click(function(){document.execCommand('justifyFull',false,null)});

      $('#artFrmCheck').click(changeSubmitBtnInfo);
      $('#artPublic').change(changeSubmitBtnInfo);
  });

  function changeSubmitBtnInfo(){
    try{
      let btn = document.getElementById('artSave');
      document.getElementById('artPublic').checked=!document.getElementById('artPublic').checked; 
      if(document.getElementById('artPublic').checked)
      {
        $(btn).text("Opublikuj i zapisz");
        $(btn).removeClass('btn-outline-primary');
        $(btn).addClass('btn-outline-success');
      }
      else
      {
        $(btn).text("Zapisz");
        $(btn).removeClass('btn-outline-success');
        $(btn).addClass('btn-outline-primary');
      }
    }
    catch(err){
      showError('Error',err);
    }
  }

  function showSelectedEraInfo(){
      try{
          let era = $(this).val();
          let info=$('#eraInfo');
          switch(era){
              case 'Starożytność': $(info).text('Zaczęła się około XXX w. p.n.e., pojawiło się wtedy pismo. Zakończyła się pod koniec V w. n.e., wydarzeniem umownym jest rok 476, kiedy barbarzyńcy podbili Cesarstwo Rzymskie.'); break;
              case 'Średniowiecze': $(info).text('Rozpoczęło się w drugiej połowie V w. n.e., (podbicie Cesarstwa Rzymskiego przez barbarzyńców). Epoka ta zakończyła się w 2 połowie XV w. (zdobycie Cesarstwa Bizantyjskiego przez Turków w 1453r.).'); break;
              case 'Nowożytność': $(info).text('Nowożytność rozpoczęła się w 2 połowie XV w. Epoka ta kończy się w 1914r. (wybuch I wojny światowej).');break;
              case 'Czasy współczesne': $(info).text('Czasy współczesne rozpoczęły się w 1918r. (zakończenie I wojny światowej) i trwa po dzień dzisiejszy.'); break;
              default: $(info).text('Wskaż okres, którego dotyczy artykuł.');
          }
      }
      catch(err){
        showError('Era info error',err);
      }
  }

  /////MENU EDYTORA
  //obsługa dodawania linku
  function editorInsertLink(){
    try{
        if($('#urlLink').val()==''){
          event.preventDefault();
          event.stopPropagation();
          $('#urlLink').addClass('is-invalid');
        }
        else{
          $('#urlLink').removeClass('is-invalid');
          if(caretPos){ //punkt odniesienia jest określony
            let element = document.createElement('a');  //element typu link
            //określamy atrybuty i tekst linku
            $(element).attr('href',$('#urlLink').val());
            $(element).attr('target','_blank');
            $(element).attr('title',$('#urlPrompt').val());
            $(element).text($('#urlText').val());
            caretPos.insertNode(element);  //wstawiamy element
        }
      }
    }
    catch(err){
      showError('Editor (insert link) error',err);
    }
  }
  //funkcja pomocnicza do sprawdzenia czy kursor był w edytorze
  function isSelectionInsideElementById(elementID) {    
    let sel, containerNode;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount > 0) {
            containerNode = sel.getRangeAt(0).commonAncestorContainer;
        }
    }
    //pętla w góre czy jesteśmy w edytorze
    while (containerNode) {
        if (containerNode.id == elementID) {
            return true;
        }
        containerNode = containerNode.parentNode;
    }
    return false;
}

  //obsługa aktywności przycisków
  function setStateBtn(){
    try{
      //dezaktywujemy przycisk czyszczenia stylu
      let btn = document.getElementById('eClear');
      btn.disabled = 'disabled';

      //przywracamy domyślne klasy
      $('#eToolbar').children('.btn-group').each(function(){
        $(this).children('button').each(function(index){
          if($(this).hasClass('btn-dark')){
            $(this).removeClass('btn-dark');
            $(this).addClass('btn-outline-dark');
          }
        });
      });
      
      //zmiana stanu przycisków menu
      let nd = window.getSelection().getRangeAt(0).startContainer;  //węzeł wokół tekstu z kursorem
      editorSwitchBtns(nd);

      //aktywujemy przycisk czyszczenia stylu
      $('#eToolbar').children('.btn-group').each(function(){
        $(this).children('button').each(function(index){
          if($(this).hasClass('btn-dark')){ //przycisk ze inną klasą -> wykryto styl
            $(btn).removeAttr('disabled');
          }
        });
      });
    }
    catch(err){
      showError('Editor error',err);
    }
  }
  //funkcja do włączania przycisków po węzałch w górę do dvi.id='editor'
  function editorSwitchBtns(sNode){
    if(sNode){
    while (sNode) {
      if(sNode.nodeType==1){  //jest elementem drzewa dokumentu
        let nodeName = sNode.tagName.toLowerCase();
        let btn = document.getElementById('eClear');
        console.log(nodeName+' '+sNode.id);
        
        switch(nodeName){
          case 'li':{ 
            if(sNode.parentNode.tagName.toLowerCase()=='ol'){
              $('#eOList').addClass('btn-dark');
              $('#eOList').removeClass('btn-outline-dark');
            }
            if(sNode.parentNode.tagName.toLowerCase()=='ul'){
              $('#eUList').addClass('btn-dark');
              $('#eUList').removeClass('btn-outline-dark');
            }
          } break;
          case 'ol':{ 
            $('#eOList').addClass('btn-dark');
            $('#eOList').removeClass('btn-outline-dark');
          } break;
          case 'ul':{ 
            $('#eUList').addClass('btn-dark');
            $('#eUList').removeClass('btn-outline-dark');
          } break;
          case 'h1':{ $(btn).removeAttr('disabled');} break;
          case 'h2':{ $(btn).removeAttr('disabled');} break;
          case 'h3':{ $(btn).removeAttr('disabled');} break;
          case 'h4':{ $(btn).removeAttr('disabled');} break;
          case 'h5':{ $(btn).removeAttr('disabled');} break;
          case 'h6':{ $(btn).removeAttr('disabled');} break;
          case 'b':{ 
            $(btn).removeAttr('disabled');
            $('#eBold').addClass('btn-dark');
            $('#eBold').removeClass('btn-outline-dark');
          } break;
          case 'i':{ 
            $(btn).removeAttr('disabled');
            $('#eItalic').addClass('btn-dark');
            $('#eItalic').removeClass('btn-outline-dark');
          } break;
          case 'u':{ 
            $(btn).removeAttr('disabled');
            $('#eUnderline').addClass('btn-dark');
            $('#eUnderline').removeClass('btn-outline-dark');
          } break;
          case 'strike':{ 
            $(btn).removeAttr('disabled');
            $('#eStrike').addClass('btn-dark');
            $('#eStrike').removeClass('btn-outline-dark');
          } break;
          default: break;
        }
      }
      //przerwanie iteracji
      if (sNode.id == 'editor') {
          return;
      }
      sNode = sNode.parentNode;
  }
    }
}
  //funckja do czyszczenia formatowania
  function editorClearFormat(){
    try{
      $(this).tooltip('hide');
      let elPNode = window.getSelection().getRangeAt(0).startContainer.parentNode;
      let nodeName = elPNode.tagName.toLowerCase();
      if(elPNode.id!='editor'){
        switch(nodeName){
          case 'li':{ //dla list wywołanie właściwej polecenia wstawiania odwraca efekt
            if(elPNode.parentNode.tagName.toLowerCase()=='ol'){
              document.execCommand('insertOrderedList',false,null);
            }
            else if(elPNode.parentNode.tagName.toLowerCase()=='ol'){
              document.execCommand('insertUnorderedList',false,null);
            }
            break;
          }
          case 'ol':{document.execCommand('insertOrderedList',false,null);} break;
          case 'ul':{document.execCommand('insertUnorderedList',false,null);} break;
          case 'h1':{removeTag(elPNode);} break;
          case 'h2':{removeTag(elPNode);} break;
          case 'h3':{removeTag(elPNode);} break;
          case 'h4':{removeTag(elPNode);} break;
          case 'h5':{removeTag(elPNode);} break;
          case 'h6':{removeTag(elPNode);} break;
          case 'b':{document.execCommand('removeFormat',false,null)} break;
          case 'i':{document.execCommand('removeFormat',false,null)} break;
          case 'u':{document.execCommand('removeFormat',false,null)} break;
          case 'strike':{document.execCommand('removeFormat',false,null)} break;
        }
      }
    }
    catch(err){
      showError('Editor (clear format) error',err);
    }
  }
  function removeTag(sNode){
    let txt = sNode.innerText;
    sNode.remove();
    document.execCommand('insertText', false, txt);
  }

  //schowek jest domyślnie blokowany przez przeglądarki (np. chrome) i bez Ctrl+V nie ma dostępu
  //użycie navigator.clipboard.readText() wyzwala pytanie o dostęp, co pozwala na podpięcie zdarzenia na przycisk
  function editorPaste(){
      try{
        navigator.clipboard.readText()
        .then(text=>{
            if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, text);
              } else {
                document.execCommand('paste', false, text);
              }
        })
      }
      catch(err){
        showError('Editor (paste) error',err);
      }
  }
  function editorHeading(){
      try{
          let h = $(this).val();
          let sel = window.getSelection();
          for(var i = sel.rangeCount;i--;){
              let range = sel.getRangeAt(i);
              let element = document.createElement(h);
              element.appendChild(range.extractContents());
              range.insertNode(element);
          }
      }
      catch(err){
        showError('Editor (heading) error',err);
      }
  }