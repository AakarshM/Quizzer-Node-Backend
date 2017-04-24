

var selectedQuestionJSON = JSON.parse(sessionStorage.getItem("selectedQuestionPast"));

//console.log(selectedQuestionJSON.answer);

function onCreate(){
  var q = document.getElementById("questionContent");
  var A = document.getElementById("optionATC");
  var B = document.getElementById("optionBTC");
  var C = document.getElementById("optionCTC");
  var D = document.getElementById("optionDTC");
  var CORRECT = document.getElementById("correctC");
  q.innerText = selectedQuestionJSON.question;
  A.innerText = selectedQuestionJSON.options[0];
  B.innerText = selectedQuestionJSON.options[1];
  C.innerText = selectedQuestionJSON.options[2];
  D.innerText = selectedQuestionJSON.options[3];
  CORRECT.innerText = selectedQuestionJSON.answer.toUpperCase();
}

$(document).ready(function(){
    $('#login_form').on('submit', function(e){
        e.preventDefault();
        console.log(e);
        var uname = $('#login_form').serializeArray()[0].value;
        var pword = $('#login_form').serializeArray()[1].value;
        console.log(uname);
        axios.post("/teachers/", {
          email: uname,
          password: pword
        })
          .then(function(response){
            console.log(response.data); // ex.: { user: 'Your User'}
            console.log(response.status); // ex.: 200
            var headerTokenObject = response.headers;
            var headerToken = headerTokenObject["x-auth"].toString();
            console.log(headerToken);
            sessionStorage.setItem("authHeader", headerToken);
            //console.log(sessionStorage.getItem("authHeader").toString());
            window.location.href="/courses.html";
          }).catch(function (error) {
              alert(error.response.status + ": " + error.response.statusText);
              });

    });
});
