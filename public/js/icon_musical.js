document.addEventListener('DOMContentLoaded', function () {
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    socket.on('connect', function () {        
        socket.on('dev', function(data){
            let connection_information = data[2];
            let total = 0;
            for (let index = 0; index<=13; index=index+1){
                total = total + connection_information[index];
            }
            let avg = (total/14/4*100).toFixed(2);
            if(avg < 100){
                $('#quality').removeClass('disabled');
                $('#quality').css("background-color", "red");
                $("#quality").text('Electrodos | '+avg);
            }else{
                $('#quality').addClass('disabled');
                $('#quality').css("background-color", "#4F4F58");
                $("#quality").text('Electrodos | 100');
            }
        });
        console.log('Connected to server');        
    });
}, false);