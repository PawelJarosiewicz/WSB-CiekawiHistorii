var documentRef;    //odnośnik do zapisanego dokumentu

$(document).ready(function(){  
    //kontrola wartości pól formy
    $('#email').on('input',checkEmail); 
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
    let mail = document.getElementById('email').value;
    e.target.classList.add('was-validated');
    //sprawdzamy mail i formę
    if(!validateEmail(mail) || e.target.checkValidity() === false){
        e.preventDefault(); //blokujemy
        e.stopPropagation();
        $('#email').addClass('is-invalid'); //przeglądarka inaczej waliduje mail, nie wymaga ".xx" na końcu adresu
    }
    else{
        try{
            e.target.classList.remove('was-validated');
            $('#email').removeClass('is-valid');
            const fetchPromises = [];   //zmienna do przechowywania operacji w toku
            e.preventDefault(); //zatrzymujemy domyślne działanie formy
            if(!currUser){
                fetchPromises.push(firebaseLogInAnonymous());
            }
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
        }
        catch(err){
            console.log('błąd: ',err);
            return false;
        } 
    }
}