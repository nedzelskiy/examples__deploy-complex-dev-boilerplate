const socket = io('http://localhost:8802');
let timeoutId = null;
socket.send({
    'type': 'browser-register'
});
socket.on('message', message => {
    console.log(message);
    if ('undefined' !== message.text) {
        console.log(message.text);
    }
    if (message.type === 'browser-refresh') {
        document.location.reload();
    }
});
socket.on('disconnect', ()=>{
    timeoutId = setInterval(() => {
        socket.connect();
        socket.send({
            'type': 'browser-register'
        });
    },2000);
});
socket.on('connect', ()=>{
    console.log('connected to live reload!');
    if (timeoutId) {
        clearInterval(timeoutId);
        timeoutId = null;
    }
});

