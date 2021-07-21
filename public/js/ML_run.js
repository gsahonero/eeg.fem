document.addEventListener('DOMContentLoaded', function () {

    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});

    let img_1 = document.getElementById("line_1"); 
    let img_2 = document.getElementById("line_2"); 
    let img_3 = document.getElementById("line_3");
    let img_4 = document.getElementById("line_4");

    var sentences = [];
    var audio_sound = new Audio();
    var execution_line = 0;
    var waiting_for_trigger = false;
    a = new AudioContext();
    var user_audio = new Audio();
    var au_audio = new Audio();
    var prev = [0, 0];
    var ltm = 0;
    var words = ["play(###)"]; //Encontrar estas palabras para cambiar.
    var new_words = ["play()"]; //Palabra que se cambiara
    var us_path = '';
    var au_path = '';
    var bk_colors = ['#038C33','#F27649'];
    var back_col = '';
    var exp_run = false;

    //Instrucciones especificas segun a cada sujeto.
    function line(exp){
        var line = [5,5,5,5];
        if (exp == 1){
            line[0] = './img/1.png';
            line[1] = './img/2.png';
            line[2] = './img/3.png';
            line[3] = './img/4.png';
        }else if(exp == 2){
            line[0] = './img/3.png';
            line[1] = './img/4.png';
            line[2] = './img/1.png';
            line[3] = './img/2.png';
        }
        return line;
    }

    //Busca todos los indices en los que tiene exp1
    function indexes(exp1, exp_command){
        var i = -1;
        var indexes = [];
        while((i = exp1.indexOf(exp_command, i + 1)) !== -1) {
            indexes.push(i);
        }
        return indexes;
    }

    //Dependiendo a idx cambia a las nuevas funciones
    function replace(sentences){
        for(j=0; j<=words.length-1;j++){
            idx = indexes(sentences, words[j]);
            for(i=0; i<=idx.length-1; i++){
                sentences.splice(idx[i], 1, new_words[j]);
            }
        }
        return sentences;
    }

    //Reproduce el beep
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
    
    $("#finish").click(function(e){
        e.preventDefault();
        user_audio.pause();
        au_audio.pause();
        socket.emit('finish', 'true');
    });

    function btn_atras(){
        change_back(false, back_col);
        $("#instrucciones").removeClass("d-none");
        $("#iys").removeClass("d-none");
        $("#run").removeClass("d-none");
        $("#atras").removeClass("d-none");
        $('#blink').addClass('d-none');
        $("#atras_run").addClass('d-none');
        $("#low-btn").addClass('low_btn');
        $("#low-btn").removeClass('low_btn1');
    }

    function change_back(bool, back_col){
        if (bool == true){
            document.body.style.backgroundColor = "#A0D9C9";
        }else if(bool == false){
            document.body.style.backgroundColor = back_col;
        }
    }
    socket.on('connect', function () {
        
        socket.on('userId', function(result){
            new_words[0] = 'play('+result.song+'_5S.mp3)';
            us_path = 'data/Musical/'+result.song+'.mp3';
            au_path = 'data/Musical/Aurosal.mp3';
            if (result.ML_start[0] == 1){
                prev = [1, 2];
            }else if(result.ML_start[0] == 2){
                prev = [2, 1];
            }
            img_1.src = line(result.ML_start[0])[0];
            img_2.src = line(result.ML_start[0])[1];
            img_3.src = line(result.ML_start[0])[2];
            img_4.src = line(result.ML_start[0])[3];
        });
        
        socket.on('exp_ML', function(exp_ML){
            sentences = Object.values(exp_ML);
            sentences = replace(sentences);
        });

        $("#run").click(function(e){
            e.preventDefault();
            change_back(true, back_col);
            $("#instrucciones").addClass("d-none");
            $("#iys").addClass("d-none");
            $("#run").addClass('d-none');
            $("#atras").addClass('d-none');
            $('#blink').removeClass('d-none');
            $("#atras_run").removeClass('d-none');
            $("#low-btn").removeClass('low_btn');
            $("#low-btn").addClass('low_btn1');
            let commands = sentences[execution_line].split('(');
            let func = commands[0];
            let args = commands[1].split(')')[0];
            let data = {
                'command': func,
                'args': args
            };
            socket.emit('ML_sec', data);
            socket.emit('start', {'empezar': 1});
        });

        socket.on('beep', function(data){
            // browsers limit the number of concurrent audio contexts, so you better re-use'em
            beep(100, 250, data)
        });
        
        socket.on('play',function(data){
            audio_sound.src=data;
            setTimeout(function(){
                audio_sound.loop = false;
                audio_sound.play();
            }, 10);
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
                $("#quality").text("ELECTRODOS | "+avg);
            }else{
                $('#quality').addClass('disabled');
                $('#quality').css("background-color", "#4F4F58");
                //$('#run').removeClass('disabled');
                $("#quality").text("ELECTRODOS | 100");
            }
            
        });

        socket.on('model_ML', function(mod) {
            $("#nro_ML").text(mod.btn_ML);
            if (exp_run == false){
                if (mod.btn_ML == 'Model_Linear'){
                    back_col = bk_colors[0];
                }else if(mod.btn_ML == 'Model_RBF'){
                    back_col = bk_colors[1];
                }
            }
        });

        socket.on('ML_sec', function(data){
            //console.log(data);
            if (data === "ready"){
                execution_line = execution_line + 1;
                let commands = sentences[execution_line].split('(');
                let func = commands[0];
                let args = commands[1].split(')')[0];
                let data = {
                    'command': func,
                    'args': args
                };
                if (func === "beep"){
                    console.log('Recognizing Beep')
                    let second_arg = args.split(',')[1];
                    if (second_arg == 'beep3'){
                        ltm = 1;
                        user_audio.src = us_path;
                        user_audio.load();
                        au_audio.src = au_path;
                        au_audio.load();
                        socket.emit('y_predict', {'y_predict': prev[0], 'first': 1}); // Emite la estancia de yPred
                    }else if (second_arg == 'beep6'){
                        ltm = 1;
                        user_audio.src = us_path;
                        user_audio.load();
                        au_audio.src = au_path;
                        au_audio.load();
                        socket.emit('y_predict', {'y_predict': prev[1], 'first': 1}); // Emite la estancia de yPred
                    }else if (second_arg == 'beep4' || second_arg == 'beep7'){
                        ltm = 0;
                        user_audio.src = '';
                        user_audio.load();
                        au_audio.src = '';
                        au_audio.load();
                        user_audio.pause();
                        au_audio.pause();
                        user_audio.currentTime = 0;
                        au_audio.currentTime = 0;
                    }
                }else if (func === "wait"){
                    if (args>0 || args.length>0){
                        console.log('waiting server response');
                    }else{
                        console.log('Recognizing Wait')
                        waiting_for_trigger = true;
                    }
                }else if (func === "play"){
                    console.log('Recognizing play')
                }else if (func === "finish"){
                    console.log('finished');
                    btn_atras();
                    socket.emit('ML_sec',{
                        "command":'finish'
                    });
                    execution_line = 0;
                    socket.emit('start', {'empezar': 0});
                    exp_run = false;
                }
                if(!waiting_for_trigger){
                    socket.emit('ML_sec', data);
                }
            }else{
                console.log('Either user has no right role or an error has occured while receiving command from server');
            }
        });

        socket.on('pred', function(data){
            console.log('Sound: ',ltm);
            if(ltm == 1){
                if(data.pred == 1){
                    user_audio.play();
                    user_audio.volume = data.pred_vol
                    au_audio.pause();
                    au_audio.currentTime = 0;
                    au_audio.volume = 0;
                    $("#blink").text("Musical");
                } else if(data.pred == 2){
                    au_audio.play();
                    au_audio.volume = data.pred_vol
                    user_audio.pause();
                    user_audio.currentTime = 0;
                    user_audio.volume = 0;
                    $("#blink").text("Aurosal");
                } else if (data.pred == 3){
                    $("#blink").text("BLINK");
                };
            };
        });
    });

}, false);