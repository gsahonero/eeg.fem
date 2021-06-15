var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});

let id = document.getElementById('id');
let song = document.getElementById('song');
let song_t = document.getElementById('song_t');
let inst = document.getElementById('instrument');
let btn1 = document.getElementById('ML_1');
let btn2 = document.getElementById('ML_2');
var audio = document.getElementById('audio');
var user_audio = document.getElementById('user_audio');

socket.on('userId', function(data){
    id.innerHTML = 'Bienvenido '+data.user;
    song.innerHTML = 'Canción: '+data.song;
    inst.innerHTML = 'Instrumento: '+data.instrument;
    user_audio.src = 'data/Musical/'+data.song+'.mp3';
    song_t.innerHTML = data.song; 
    audio.load(); //call this to just preload the audio without playing
});

socket.on('connect', function () {        
    socket.on('dev', function(data){
        let connection_information = data[2];
        let total = 0;
        for (let index = 0; index<=13; index=index+1){
            total = total + connection_information[index];
        }
        let avg = (total/14/4*100).toFixed(2);
        console.log(avg);
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

btn1.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_Linear'});
});

btn2.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_RBF'});
});