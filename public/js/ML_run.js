document.addEventListener('DOMContentLoaded', function () {
    //We connecto to the server
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    //Define all the bk colors
    var bk_col = ['#A0D9C9', '#F2C53D', '#038C33', '#D94E41', '#614BF2', '#D95F76', '#9B45BF', '#6796CD', '#F27649']
    var bk_color = '';
    //Set the data windowing
    var window = 0;
    //Set the words we are looking at the sequence
    var words = ["play(###)"];
    //Set the words to be change in the sequence
    var new_words = ['play()']
    //Define the img in html to make changes
    let img_1 = document.getElementById("line_1"); 
    let img_2 = document.getElementById("line_2"); 
    let img_3 = document.getElementById("line_3");
    let img_4 = document.getElementById("line_4");
    //Define the sentences, to make the sequence
    var sentences = [];
    //Define the execution line
    var execution_line = 0;
    var waiting_for_trigger = false;
    //Define if the experiment starts
    var start = false;
    //Define the sections to ML model to predict
    var predict = false;
    //Define the jump
    var jump = 0;
    //Define the list to make the data windowing
    var data_w = [];
    //Define if the music souds or not
    var sound = false;
    //Define the song or aurosal volume
    var au_volume = 0;
    var user_volume = 0;
    //We use this in the beep function
    a = new AudioContext();
    //Load the audio
    var user_audio = new Audio();
    var au_audio = new Audio();
    var audio_sound = new Audio();
    //Define the order of the sequence, 1 for musical and 2 for aurosal
    var prev = [];
    //Id number setting
    var id_num = 0;

    //This function loads the source images to make the sequence for each user
    function line(exp){
        var line = [];
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
    //Search all the idices that have exp1, this function is call by replace function only
    function indexes(exp1, exp_command){
        var i = -1;
        var indexes = [];
        while((i = exp1.indexOf(exp_command, i + 1)) !== -1) {
            indexes.push(i);
        }
        return indexes;
    }
    //Dependiendo a idx cambia a las nuevas funciones
    function replace(sentences, words, new_words){
        for(j=0; j<=words.length-1;j++){
            idx = indexes(sentences, words[j]);
            for(i=0; i<=idx.length-1; i++){
                sentences.splice(idx[i], 1, new_words[j]);
            }
        }
        return sentences;
    }
    //Handle the beep soud
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

    socket.on('connect', function () {
        //We handle the background color, title and asign the data_windowing length
        socket.on('model_ML', function(mod){
            $('#nro_ML').text(mod.btn_ML);
            if(mod.btn_ML == 'Model_Linear_64'){
                bk_color = bk_col[1];
                window = 64;
            }else if(mod.btn_ML == 'Model_RBF_64'){
                bk_color = bk_col[2];
                window = 64;
            }else if(mod.btn_ML == 'Model_Linear_128'){
                bk_color = bk_col[3];
                window = 128;
            }else if(mod.btn_ML == 'Model_RBF_128'){
                bk_color = bk_col[4];
                window = 128;
            }else if(mod.btn_ML == 'Model_Linear_PSD_64'){
                bk_color = bk_col[5];
                window = 64;
            }else if(mod.btn_ML == 'Model_RBF_PSD_64'){
                bk_color = bk_col[6];
                window = 64;
            }else if(mod.btn_ML == 'Model_Linear_PCA_64'){
                bk_color = bk_col[7];
                window = 64;
            }else if(mod.btn_ML == 'Model_RBF_PCA_64'){
                bk_color = bk_col[8];
                window = 64;
            }
            document.body.style.backgroundColor = bk_color;
        });
        //We recive the user id to make the changes
        socket.on('userId', function(result) {
            new_words[0] = 'play('+result.song+'_5S.mp3';
            //We set the correspondient sequence to do
            if (result.ML_start[0] == 1){
                prev = [1, 2];
            }else if(result.ML_start[0] == 2){
                prev = [2, 1];
            }
            img_1.src = line(result.ML_start[0])[0];
            img_2.src = line(result.ML_start[0])[1];
            img_3.src = line(result.ML_start[0])[2];
            img_4.src = line(result.ML_start[0])[3];
            user_audio.src = './data/Musical/'+result.song+'.mp3';
            au_audio.src = './data/Musical/Aurosal.mp3';
            user_audio.load();
            au_audio.load();
        });
        //We recive the electrodes quality
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
        //We replace the sequence according the user info
        socket.on('exp_ML', function(exp_ML){
            sentences = Object.values(exp_ML);
            sentences = replace(sentences, words, new_words);
        });
        // We change the page to run the experiment
        $("#run").click(function(e){
            e.preventDefault();
            document.body.style.backgroundColor = bk_col[0];
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
            start = true;
            jump = 15;
            au_volume = 0;
            user_volume = 0;
            id_num = 0;
        });
        //Once we start the experiment we recive all the eeg data and cach according the windowing
        socket.on('data', function(data){
            if((start) && (predict)){
                if(data !== null){
                    let data_w_in = []
                    for(let k = 0; 14 > k; k++){
                        data_w_in[k] = data[k+2]
                    }
                    if(data_w.length >= window){
                        for (let q = 0; data_w.length > q; q++){
                            data_w[q] = data_w[q+1]
                        }
                        data_w[data_w.length - 1] = data_w_in //We cach only the electrodes
                        jump += 1
                        if(jump == 16){
                            id_num += 1;
                            socket.emit('data_w', {'data_w': data_w, 'lat': Date.now(), 'id_num': id_num})
                            jump = 0
                        }
                    }else{
                        data_w.push( data_w_in)
                    }
                }
            }
        });
        //We run all the sequence
        socket.on('ML_sec', function(data){
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
                    if(second_arg == 'beep1' || second_arg == 'beep4' ||second_arg == 'beep7'){ //Beep for Blink state
                        console.log('predict: True; sound: False')
                        predict = true;
                        jump = 15;
                        data_w = [];
                        sound = false;
                    }else if (second_arg == 'beep3'){
                        predict = true;
                        jump = 15;
                        data_w = [];
                        sound = true;
                        socket.emit('y_init', {'y_init': prev[0]}); // Emite la estancia de yPred
                    }else if (second_arg == 'beep6'){
                        predict = true;
                        jump = 15;
                        data_w = [];
                        sound= true;
                        socket.emit('y_init', {'y_init': prev[1]}); // Emite la estancia de yPred
                    }else if (second_arg == 'beep2' || second_arg == 'beep5'){
                        predict = false;
                        jump = 17;
                        data_w = [];
                        sound = false;
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
                    //Run the functions to back normal
                    au_audio.pause();
                    user_audio.pause();
                    au_volume = 0;
                    user_volume = 0;
                    au_audio.volume = au_volume;
                    user_audio.volume = user_volume;
                    au_audio.currentTime = 0;
                    user_audio.currentTime = 0;
                    document.body.style.backgroundColor = bk_color;
                    $("#instrucciones").removeClass("d-none");
                    $("#iys").removeClass("d-none");
                    $("#run").removeClass("d-none");
                    $("#atras").removeClass("d-none");
                    $('#blink').addClass('d-none');
                    $("#atras_run").addClass('d-none');
                    $("#low-btn").addClass('low_btn');
                    $("#low-btn").removeClass('low_btn1');
                    socket.emit('ML_sec',{
                        "command":'finish'
                    });
                    execution_line = 0;
                    start = false;
                    predict = false;
                    sound = false;
                    jump = 0;
                }
                if(!waiting_for_trigger){
                    socket.emit('ML_sec', data);
                }
            }else{
                console.log('Either user has no right role or an error has occured while receiving command from server');
            }
        });
        //We recive the beep
        socket.on('beep', function(data){
            // browsers limit the number of concurrent audio contexts, so you better re-use'em
            beep(100, 250, data)
        });
        //We recive the play
        socket.on('play',function(data){
            audio_sound.src=data;
            setTimeout(function(){
                audio_sound.loop = false;
                audio_sound.play();
            }, 10);
        });
        //We recive the prediction and make an action according to this
        socket.on('y_predict', function(data){
            if(sound){
                if(data.y == 1){
                    user_audio.play();
                    au_volume -= 0.05;
                    user_volume += 0.1;
                    user_audio.volume = user_volume;
                    au_audio.pause();
                    au_audio.volume = 0;
                } else if(data.y == 2){
                    au_audio.play();
                    au_volume += 0.15;
                    user_volume -= 0.1;
                    au_audio.volume = au_volume;
                    user_audio.pause();
                    user_audio.volume = 0;
                } else if (data.y == 3){
                    /* $("#blink").text("BLINK"); */
                };
                //Regulate the volume if goes under 0 or above 1
                if(au_volume < 0 || user_volume < 0){
                    au_volume = 0;
                    user_volume = 0;
                }else if(au_volume > 1 || user_volume > 1){
                    au_volume = 1;
                    user_volume = 1;
                }
            }else{
                au_audio.pause();
                user_audio.pause();
                au_volume = 0;
                user_volume = 0;
                au_audio.volume = au_volume;
                user_audio.volume = user_volume;
                au_audio.currentTime = 0;
                user_audio.currentTime = 0;
            }
        });
    });
}, false);