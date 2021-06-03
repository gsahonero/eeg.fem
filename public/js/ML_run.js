document.addEventListener('DOMContentLoaded', function () {

    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});    
    
    var audio = document.getElementById('audio');
    var user_audio = document.getElementById('user_audio');
    var au_audio = document.getElementById('aurosal_audio');

    var aud = 0;

    socket.on('userId', function(user){
        user_audio.src = 'data/Musical/'+user.song+'.mp3';
        audio.load();
        $('#song_selec').click(function (){
            aud = 1;
            $("#run").removeClass("disabled");
            socket.emit('y_predict', {'y_predict': 1, 'first': 1}); // Emite la estancia de yPred
        });
        $('#aurosal_selec').click(function (){
            aud = 2;
            $("#run").removeClass("disabled");
            socket.emit('y_predict', {'y_predict': 3, 'first': 1}); // Emite la estancia de yPred
        });
        $("#run").click(function(e){
            e.preventDefault();
            document.body.style.backgroundColor = "#A0D9C9";
            $("#instrucciones").addClass("d-none");
            $("#iys").addClass("d-none");
            $("#run").addClass('d-none');
            $("#atras").addClass('d-none');
            $('#blink').removeClass('d-none');
            $("#atras_run").removeClass('d-none');
            /* $("#finish").removeClass('d-none'); */
            $("#low-btn").removeClass('low_btn');
            $("#low-btn").addClass('low_btn1');
            if (aud == 1){
                audio.play();
            }else if(aud == 2){
                au_audio.play();
            }
            setTimeout(function(){
                audio.pause();
                au_audio.pause();
                audio.currentTime = 0;
                au_audio.currentTime = 0;
                socket.emit('start', {'empezar': 1}); // Emite start el python
            }, 5000);
        });
        $("#atras_run").click(function(e){
            e.preventDefault();
            document.body.style.backgroundColor = "#D94E41";
            $("#instrucciones").removeClass("d-none");
            $("#iys").removeClass("d-none");
            $("#run").removeClass("d-none");
            $("#atras").removeClass("d-none");
            $('#blink').addClass('d-none');
            $("#atras_run").addClass('d-none');
            /* $("#finish").addClass('d-none'); */
            $("#low-btn").addClass('low_btn');
            $("#low-btn").removeClass('low_btn1');
            socket.emit('start', {'empezar': 0});
            audio.pause();
            au_audio.pause();
            audio.currentTime = 0;
            au_audio.currentTime = 0;
        });
        $("#finish").click(function(e){
            e.preventDefault();
            audio.pause();
            au_audio.pause();
            socket.emit('finish', 'true');
        });
        socket.on('pred', function(data){
            if(data.pred == 1 || data.pred == 2){
                audio.play();
                //audio.volume = data.pred_vol
                au_audio.pause();
                au_audio.currentTime = 0;
                $("#blink").text("");
            } else if(data.pred == 3 || data.pred == 4){
                au_audio.play();
                //au_audio.volume = data.pred_vol
                audio.pause();
                audio.currentTime = 0;
                $("#blink").text("");
            } else if (data.pred == 5){
                $("#blink").text("BLINK");
            }
        });
    });

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
                //$('#run').addClass('disabled');
            }else{
                $('#quality').addClass('disabled');
                $('#quality').css("background-color", "#4F4F58");
                //$('#run').removeClass('disabled');
            }
            $("#quality").text("ELECTRODOS | "+avg);
        });
        socket.on('model_ML', (mod) => {
            $("#nro_ML").text(mod.btn_ML);
            console.log(mod);
        });
    });

}, false);