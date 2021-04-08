document.addEventListener('DOMContentLoaded', function () {
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    var counter = 0;
    socket.on('connect', function () {        
        socket.on('dev', function(data){
            let connection_information = data[2];
            let total = 0;
            for (let index = 0; index<=13; index=index+1){
                total = total + connection_information[index];
            }
            let avg = (total/14/4*100).toFixed(2);
            $("#quality").text('ELECTRODOS | '+avg);
        });
        console.log('Connected to server');        
    });
}, false);