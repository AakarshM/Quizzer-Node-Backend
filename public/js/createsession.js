var socket = io();

socket.on('connect', function () {
  console.log('Teacher joined')
});

socket.on('student', function(){
  console.log('Student joined session')
})

socket.on('studentAnswer', function (data) {
  console.log(data);
})

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});
