var socket = io();

var count = 0; //student count

var classObject = JSON.parse(sessionStorage.getItem("classObject"));

var questionPresent = false;

var token = sessionStorage.getItem("authHeader");

var postCourseRoute = "/teachers/archive";

var config = {
  headers: {'x-auth': token}
};

//NON SOCKET

/*
$(document).ready(function(){
    $('#contact').on('submit', function(e){ //question form
        e.preventDefault();
        var formData = $('#contact').serializeArray();
        var question  = "";
        var optionObj = {};
        console.log(formData);
        socket.emit('sendQuestion', {
          question: question,
          options: optionObj,
          room: classObject.id
        });
        questionPresent = true;
    });
});
*/
$(document).ready(function(){
    $('.remove-form').on('submit', function(e){ //question form
        e.preventDefault();
        var optionA = document.getElementById("optionA");
        var optionB = document.getElementById("optionB");
        var optionC = document.getElementById("optionC");
        var optionD = document.getElementById("optionD");
        var question = document.getElementById("question");
        var correctAnsObject = $('.remove-form').serializeArray()[0];
        var correctAns = correctAnsObject.value;
        correctAns = correctAns.toLowerCase();
        if(!(correctAns == 'a' || correctAns == 'b' || correctAns == 'c' || correctAns == 'd')){
          alert('Not a valid correct answer');
        } else{
            if(!questionPresent){
              alert('No question is being asked!');
            } else{
              socket.emit('removeQuestion', {
                room: classObject.id,
                correct_answer: correctAns
              }); //send to students

              var archiveObject = {
                course: classObject.classname.toLowerCase(),
                question: question.value,
                answer: correctAns,
                options: [optionA.value, optionB.value, optionC.value, optionD.value]
              }

              //Now HTTP request to update all values.
              axios.put('/questionasked', {
                course: classObject.classname.toLowerCase()
              }, config).then((response) =>{
                  console.log(response.status);
                  axios.put('/teachers/archive', archiveObject, config).then((response) => {
                      console.log(response.status);
                  })
              });



              questionPresent = false;
              }
            }

        //socket.emit();
    });
});


$(document).ready(function () {
  $('#contact-submit').on('click', function (e) {
      e.preventDefault();
      console.log("Send question");
      var optionA = document.getElementById("optionA");
      var optionB = document.getElementById("optionB");
      var optionC = document.getElementById("optionC");
      var optionD = document.getElementById("optionD");
      var question = document.getElementById("question");
      var formData = $('#contact').serializeArray();
      var question  = "";
      var optionObj = {};
      console.log(formData);
      socket.emit('sendQuestion', {
        question: question,
        options: optionObj,
        room: classObject.id
      });
      questionPresent = true;
  })
})


/*$(document).ready(function(){
    $('.clear-form').on('submit', function(e){ //question form
        e.preventDefault();
        console.log('Clear requested');
        var optionA = document.getElementById("optionA");
        var optionB = document.getElementById("optionB");
        var optionC = document.getElementById("optionC");
        var optionD = document.getElementById("optionD");
        var question = document.getElementById("question");
        optionA.value = "";
        optionB.value = "";
        optionC.value = "";
        optionD.value = "";
        question.value = "";

    });
});
*/

$(document).ready(function(){
    $('#clear-form-button').on('click', function(e){ //question form
        e.preventDefault();
        console.log('Clear requested');
        var optionA = document.getElementById("optionA");
        var optionB = document.getElementById("optionB");
        var optionC = document.getElementById("optionC");
        var optionD = document.getElementById("optionD");
        var question = document.getElementById("question");
        optionA.value = "";
        optionB.value = "";
        optionC.value = "";
        optionD.value = "";
        question.value = "";

    });
});



$(document).ready(function(){
    $('#close-button').on('click', function(e){ //question form
        e.preventDefault();
        console.log("Closing session");
        socket.emit('disconnect');
        window.location.href="/courses.html";

    });
});

//SOCKET
function onCreate(){
  console.log(classObject);
  var roomHeader = document.getElementById("roomHeader");
  var classHeader = document.getElementById("classHeader");
  var studentCount = document.getElementById("studentCount");
  roomHeader.innerText = "Room: " + classObject.id;
  classHeader.innerText = "Course: " + classObject.classname.toUpperCase();
  studentCount.innerText = "Students: " + count;

}

socket.on('connect', function () {
  console.log('Teacher joined')
  socket.emit('createConnection', {
    room: classObject.id,
    classname: classObject.classname
  });
});

socket.on('student', function(){
  ++count;
  console.log('Student joined session');
  var studentCount = document.getElementById("studentCount");
  studentCount.innerText = "Students: " + count;
});

socket.on('studentLeft', function (data) {
  console.log(data.status);
  --count;
  var studentCount = document.getElementById("studentCount");
  studentCount.innerText = "Students: " + count;
})


socket.on('studentAnswer', function (data) {
  console.log(data);
})

socket.on('disconnect', function () {
    console.log('Disconnected from server');
    count = 0;
});
