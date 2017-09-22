const WebSocketServer = new require('ws');
const webSocketServer = new WebSocketServer.Server({ port: 6622 });

let clients = {};

webSocketServer.on('connection', function(socket) {
    clients[Math.random()] = socket;
	console.log('connected!');
	socket.on('message', function() {
        for (var key in clients) {
            clients[key].send('reload browser!');
        }
	});
});
console.log('Web socket server reload was started!');

