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
            //animacja na czas wysyłania wiadomości
            $('#btnSubmit').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Wysyłanie...');
            $('#btnSubmit').removeClass('btn-outline-dark');
            $('#btnSubmit').addClass('btn-dark');
            if(!currUser){
                fetchPromises.push(firebaseLogInAnonymous());
            }
            Promise.all(fetchPromises).then(()=>{
                fetchPromises.push(saveContactMsg());
                Promise.all(fetchPromises).then(()=>{
                    if(documentRef){
                        $("#m-title").html("Wiadomość przesłana");
                        $("#m-body").html("Dziękujemy za przesłanie wiadomości.</br>Twoja wiadomość została zapisana z identyfikatorem: "+documentRef.id);
                        $("#m-OK").on('click',function(){e.target.submit();});
                        $("#modal-info").modal('show');
                        $('#btnSubmit').html('Wyślij');
                        $('#btnSubmit').addClass('btn-outline-dark');
                        $('#btnSubmit').removeClass('btn-dark');
                        return true;
                    }
                    else{
                        $("#m-title").html("Błąd");
                        $("#m-body").html("Wysłanie wiadomści nie powiodło się. Spróbuj ponownie później");
                        $("#modal-info").modal('show');
                        $('#btnSubmit').html('Wyślij');
                        $('#btnSubmit').addClass('btn-outline-dark');
                        $('#btnSubmit').removeClass('btn-dark');
                        return false;
                    }
                });
            });
        }
        catch(err){
            $('#btnSubmit').html('Wyślij');
            $('#btnSubmit').addClass('btn-outline-dark');
            $('#btnSubmit').removeClass('btn-dark');
            showError('Contact msg error: ',err);
            return false;
        } 
    }
}