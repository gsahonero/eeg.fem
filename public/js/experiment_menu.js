var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});

var ex = 0;

let id = document.getElementById('id');
let song = document.getElementById('song');
let inst = document.getElementById('instrument');
let btn1 = document.getElementById('ex1');
let btn2 = document.getElementById('ex2');
let btn3 = document.getElementById('ex3');
let btn4 = document.getElementById('ex4');
let btn5 = document.getElementById('ex5');
let btn6 = document.getElementById('ex6');
let btn7 = document.getElementById('ex7');
let btn8 = document.getElementById('ex8');

var audio = document.getElementById('audio');
var user_audio = document.getElementById('user_audio');

function Habilitar(value){
    disabled = document.createAttribute('class');
    if (value == 1){
        disabled.value = 'btn btn-primary';
    }else{
        disabled.value = 'btn btn-primary disabled';
    }
    return disabled;
}

socket.on('userId', function(data){
    id.innerHTML = 'Bienvenido '+data.user;
    song.innerHTML = 'Canción: '+data.song;
    inst.innerHTML = 'Instrumento: '+data.instrument;
    user_audio.src = 'data/Musical/'+data.song+'.mp3';
    audio.load(); //call this to just preload the audio without playing
    //audio.play(); //call this to play the song right away
    experiment = data.experiments;
    btn1.setAttributeNode(Habilitar(experiment[0]));
    btn2.setAttributeNode(Habilitar(experiment[1]));
    btn3.setAttributeNode(Habilitar(experiment[2]));
    btn4.setAttributeNode(Habilitar(experiment[3]));
    btn5.setAttributeNode(Habilitar(experiment[4]));
    btn6.setAttributeNode(Habilitar(experiment[5]));
    btn7.setAttributeNode(Habilitar(experiment[6]));
    btn8.setAttributeNode(Habilitar(experiment[7]));
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
    socket.emit('button_exp', {experiment: 1});
})

btn2.addEventListener('click', function(){
    socket.emit('button_exp', {experiment: 2});
})

btn3.addEventListener('click', function(){
    socket.emit('button_exp', {experiment: 3});
})

btn4.addEventListener('click', function(){
    socket.emit('button_exp', {experiment: 4});
})

btn5.addEventListener('click', function(){
    socket.emit('button_exp', {experiment: 5});
})

btn6.addEventListener('click', function(){
    socket.emit('button_exp', {experiment: 6});
})

btn7.addEventListener('click', function(){
    socket.emit('button_exp', {experiment: 7});
})

btn8.addEventListener('click', function(){
    socket.emit('button_exp', {experiment: 8});
})