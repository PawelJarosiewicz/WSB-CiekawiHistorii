$(document).ready(function(){
    //kontrola stanu zalogowanego użytkownika
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currUser = user;
            console.log('Logged user id='+currUser.uid);           
        } else {
            currUser=null;
            console.log('User not logged');
        }
      });
});

var documentRef;    //odnośnik do zapisanego dokumentu

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
    if(validateEmail(mail)){
        try{
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
    else{
        $("#m-title").html("Błąd w formularzu");
        $("#m-body").html("Błędny adres e-mail. Wprowadź proszę poprawny adres.");
        $("#modal-info").modal('show');
        return false;
    }
}