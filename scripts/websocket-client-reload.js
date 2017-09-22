var socket = new WebSocket("ws://localhost:6622");

socket.onmessage = function(event) {
  console.log('connected to live reload!');
  
};