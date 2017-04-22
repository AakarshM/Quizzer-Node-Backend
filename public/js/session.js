var socket = io();

var count = 0; //student count

socket.on('connect', function () {
  console.log('Teacher joined')
  socket.emit('createConnection', {
    room: 'F',
    classname: cs486
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
