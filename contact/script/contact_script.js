$(document).ready(function(){
    
});

function validateSendContact(){
    let mail = document.getElementById('email').value;
    if(validateEmail(mail)){
        alert('ok');
        return true;
    }
    else{
        
        $("#m-title").html("Błąd w formularzu");
        $("#m-body").html("Błędny adres e-mail. Wprowadź proszę poprawny adres.");
        $("#modal-info").modal('show');
        return false;
    }    
}