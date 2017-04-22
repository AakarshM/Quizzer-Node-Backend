var socket = io();

var count = 0; //student count

var classObject = JSON.parse(sessionStorage.getItem("classObject"));

var questionPresent = false;


//NON SOCKET


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

$(document).ready(function(){
    $('.remove-form').on('submit', function(e){ //question form
        e.preventDefault();
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
                correct_ans: correctAns
                });
              questionPresent = false;
              }
            }

        //socket.emit();
    });
});



$(document).ready(function(){
    $('.clear-form').on('submit', function(e){ //question form
        e.preventDefault();
        console.log('Clear requested');
        var optionA = document.getElementById("optionA");
        optionA.value = "";

    });
});


//SOCKET
function onCreate(){
  console.log(classObject);
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
  console.log('Student joined session')
})

socket.on('studentAnswer', function (data) {
  console.log(data);
})

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});
