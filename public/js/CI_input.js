var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});

let btn = document.getElementById('check');
let CI = document.getElementById('CI');
var c = 0;

socket.on('userId', function(data){
    console.log(data.user);
    if(data.user != undefined && c==1){
        window.location.replace("http://localhost:3000/check_connection.html");
    }else if(data.user == undefined && c == 1){
        window.alert("User not foud");
    }
});

btn.addEventListener('click', function(){
    socket.emit('userCI', {
        CI: CI.value
    });
    c = 1;
});

CI.addEventListener('keyup', event =>{
    var num = /[^0-9]/gi;
    CI.value = CI.value.replace(num, "");
});