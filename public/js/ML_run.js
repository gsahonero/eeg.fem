document.addEventListener('DOMContentLoaded', function () {

    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});    
    
    var user_audio = new Audio();
    var au_audio = new Audio('./data/Musical/Aurosal.mp3');
    var beep_sound = new Audio('./data/beepML.mp3');
    var aud = 0;
    var sentences = [];
    var execution_line = 0;
    var waiting_for_trigger = false;
    a = new AudioContext()

    function btn_atras(){
        document.body.style.backgroundColor = "#D94E41";
        $("#instrucciones").removeClass("d-none");
        $("#iys").removeClass("d-none");
        $("#run").removeClass("d-none");
        $("#atras").removeClass("d-none");
        $('#blink').addClass('d-none');
        $("#atras_run").addClass('d-none');
        $("#low-btn").addClass('low_btn');
        $("#low-btn").removeClass('low_btn1');
        socket.emit('start', {'empezar': 0});
        socket.emit('y_predict', {'first': 3}); // Emite para guardar el archivo
        user_audio.src = '';
        au_audio.src = '';
        user_audio.pause();
        au_audio.pause();
        user_audio.currentTime = 0;
        au_audio.currentTime = 0;
    }

    function beep(vol, freq, duration){
        v=a.createOscillator()
        u=a.createGain()
        v.connect(u)
        v.frequency.value=freq
        v.type="square"
        u.connect(a.destination)
        u.gain.value=vol*0.01
        v.start(a.currentTime)
        v.stop(a.currentTime+duration*0.001)
    }
    
    $("#atras_run").click(function(e){
        e.preventDefault();
        document.body.style.backgroundColor = "#D94E41";
        btn_atras();
    });

    $("#finish").click(function(e){
        e.preventDefault();
        user_audio.pause();
        au_audio.pause();
        socket.emit('finish', 'true');
    });

    socket.on('connect', function () {
        execution_line = 0;
        
        $("#run").click(function(e){
            e.preventDefault();
            document.body.style.backgroundColor = "#A0D9C9";
            $("#instrucciones").addClass("d-none");
            $("#iys").addClass("d-none");
            $("#run").addClass('d-none');
            $("#atras").addClass('d-none');
            $('#blink').removeClass('d-none');
            $("#atras_run").removeClass('d-none');
            $("#low-btn").removeClass('low_btn');
            $("#low-btn").addClass('low_btn1');
            user_audio.src = 'data/Musical/'+user_song+'.mp3';
            user_audio.load();
            au_audio.load();
            if (aud == 1){
                user_audio.play();
            }else if(aud == 2){
                au_audio.play();
            }
            let commands = sentences[execution_line].split('(');
            let func = commands[0];
            let args = commands[1].split(')')[0];
            let data = {
                'command': func,
                'args': args
            };
            socket.emit('ML_sec', data);
            /* socket.emit('y_predict', {'y_predict': aud, 'first': 1}); // Emite la estancia de yPred
            socket.emit('start', {'empezar': 1, }); // Emite start el python */
            setTimeout(function(){
                user_audio.pause();
                au_audio.pause();
                user_audio.currentTime = 0;
                au_audio.currentTime = 0;
                socket.emit('y_predict', {'y_predict': aud, 'first': 1}); // Emite la estancia de yPred
                socket.emit('start', {'empezar': 1, }); // Emite start el python
            }, 5000);
        });
        
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
                //socket.emit('start', {'empezar': 0});
                //$('#atras_run').trigger('click');
            }else{
                $('#quality').addClass('disabled');
                $('#quality').css("background-color", "#4F4F58");
                //$('#run').removeClass('disabled');
            }
            $("#quality").text("ELECTRODOS | "+avg);
        });

        socket.on('model_ML', function(mod) {
            $("#nro_ML").text(mod.btn_ML);
            //console.log(mod);
        });

        socket.on('ML_sec', function(data){
            console.log(data);
            if (data === "ready"){
                beep_sound.pause();
                execution_line = execution_line + 1;
                let commands = sentences[execution_line].split('(');
                let func = commands[0];
                let args = commands[1].split(')')[0];
                let data = {
                    'command': func,
                    'args': args
                };
                if (func === "experiment"){
                    console.log('Recognizing Experiment')
                    experiment = args;
                }
                else if (func === "beep"){
                    console.log('Recognizing Beep')
                }else if (func === "wait"){
                    if (args>0 || args.length>0){
                        console.log('waiting server response');
                    }else{
                        console.log('Recognizing Wait')
                        waiting_for_trigger = true;
                    }
                }else if (func === "finish"){
                    console.log('finished');
                    btn_atras();
                    socket.emit('ML_sec',{
                        "command":'finish'
                    });
                    execution_line = 0;
                }
                if(!waiting_for_trigger){
                    socket.emit('ML_sec', data);
                }
            }else{
                console.log('Either user has no right role or an error has occured while receiving command from server');
            }
        });

        socket.on('beep', function(data){
            // browsers limit the number of concurrent audio contexts, so you better re-use'em
            //beep(100, 250, data)
            beep_sound.play();
        });
    });

    socket.on('pred', function(data){
        if(data.pred == 1 || data.pred == 2){
            user_audio.play();
            user_audio.volume = data.pred_vol
            au_audio.pause();
            au_audio.currentTime = 0;
            $("#blink").text("Musical");
        } else if(data.pred == 3 || data.pred == 4){
            au_audio.play();
            au_audio.volume = data.pred_vol
            user_audio.pause();
            user_audio.currentTime = 0;
            $("#blink").text("Aurosal");
        } else if (data.pred == 5){
            $("#blink").text("BLINK");
        }
    });

    socket.on('userId', function(user){
        aud = user.ML_start[0];
        user_song = user.song; 
        $('#run').removeClass('disabled');
    });

    socket.on('exp_ML', function(exp_ML){
        sentences = Object.values(exp_ML);
    });

}, false);