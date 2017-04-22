var socket = io();

socket.on('connect', function () {
  console.log('student joined')
});
socket.on('disconnect', function () {
    console.log('Disconnected from server');
});
