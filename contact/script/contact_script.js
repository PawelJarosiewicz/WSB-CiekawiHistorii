var documentRef;    //odnośnik do zapisanego dokumentu

$(document).ready(function(){  
    //kontrola wartości pól formy
    $('#email').on('input',checkEmail); 
    $('#name').on('input',checkFieldEmpty); 
    $('#subject').on('input',checkFieldEmpty); 
    $('#msg').on('input',checkFieldEmpty); 
  });

function saveContactMsg(){
    return db.collection("ContactMsg").add({
          Name: $("#name").val(),
          Email: $("#email").val(),
          Subject: $("#subject").val(),
          MessageContent: $("#msg").val()
          })
          .then(function(docRef) { documentRef = docRef; })
          .catch(function(error) {
            documentRef=null;
            console.error('Error: ',error);
            alert("Error: " + error);
          });
}


function validateSendContact(e){
    //kontrola poprawności danych formy
    checkFieldEmptyById(document.getElementById('name'));
    checkFieldEmptyById(document.getElementById('subject'));
    checkFieldEmptyById(document.getElementById('msg'));
    let mail = document.getElementById('email').value;

    if(!validateEmail(mail) | $('#name').hasClass('is-invalid') | $('#subject').hasClass('is-invalid') | $('#msg').hasClass('is-invalid')){
        e.preventDefault(); //blokujemy
        e.stopPropagation();
        $('#email').addClass('is-invalid'); //przeglądarka inaczej waliduje mail, nie wymaga ".xx" na końcu adresu
    }
    else{
        try{
            const fetchPromises = [];   //zmienna do przechowywania operacji w toku
            e.preventDefault(); //zatrzymujemy domyślne działanie formy
            if(!currUser){
                fetchPromises.push(firebaseLogInAnonymous());
            }
            Promise.all(fetchPromises).then(()=>{
                fetchPromises.push(saveContactMsg());
                Promise.all(fetchPromises).then(()=>{
                    if(documentRef){
                        $("#m-title").html("Wiadomość przesłana");
                        $("#m-body").html("Dziękujemy za przesłanie wiadomości.</br>Twoja wiadomości została zapiasna z identyfikatorem: "+documentRef.id);
                        $("#m-OK").on('click',function(){e.target.submit();});
                        $("#modal-info").modal('show');
                        return true;
                    }
                    else{
                        $("#m-title").html("Błąd");
                        $("#m-body").html("Wysłanie wiadomści nie powiodło się. Spróbuj ponownie później");
                        $("#modal-info").modal('show');
                        return false;
                    }
                });
            });
        }
        catch(err){
            console.log('błąd: ',err);
            return false;
        } 
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