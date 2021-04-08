var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});

let btn = document.getElementById('check');
let CI = document.getElementById('CI');

btn.addEventListener('click', function(){
    socket.emit('userCI', {
        CI: CI.value
    })
    console.log(CI.value);
});