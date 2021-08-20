var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});

let id = document.getElementById('id');
let song = document.getElementById('song');
let song_t = document.getElementById('song_t');
let inst = document.getElementById('instrument');
let btn1 = document.getElementById('ML_1');
let btn2 = document.getElementById('ML_2');
let btn3 = document.getElementById('ML_3');
let btn4 = document.getElementById('ML_4');
let btn5 = document.getElementById('ML_5');
let btn6 = document.getElementById('ML_6');
let btn7 = document.getElementById('ML_7');
let btn8 = document.getElementById('ML_8');
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
    socket.emit('button_ML', {btn_ML: 'Model_Linear_64'});
});

btn2.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_RBF_64'});
});

btn3.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_Linear_128'});
});

btn4.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_RBF_128'});
});

btn5.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_Linear_PSD_64'});
});

btn6.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_RBF_PSD_64'});
});

btn7.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_Linear_PCA_64'});
});

btn8.addEventListener('click', function(){
    socket.emit('button_ML', {btn_ML: 'Model_RBF_PCA_64'});
});