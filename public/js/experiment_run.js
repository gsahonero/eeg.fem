document.addEventListener('DOMContentLoaded', function () {
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});

    let img_1 = document.getElementById("line_1"); 
    let img_2 = document.getElementById("line_2"); 
    let img_3 = document.getElementById("line_3");
    let img_4 = document.getElementById("line_4");

    var counter = 0;
    var execution_line = 0;
    var col = ['#D94E41','#F2C53D','#1A1B26','#6796CD','#0442BF','#F27649','#038C33','#9B45BF'];
    var sentences = [];
    var idx = [];
    var words = ["id(###)","play(###)"];
    var new_words = ["id()","play()"];
    var audio_sound = new Audio();
    var beep_sound = new Audio('./data/beep.mp3');
    var experiment = "";
    a=new AudioContext()
    var waiting_for_trigger = false;


    function line(exp){
        var line = [5,5,5,5];
        if (exp == 1){
            line[0] = './img/1.png';
            line[1] = './img/1.png';
            line[2] = './img/2.png';
            line[3] = './img/1.png';
        }else if(exp == 2){
            line[0] = './img/2.png';
            line[1] = './img/2.png';
            line[2] = './img/1.png';
            line[3] = './img/2.png';
        }else if(exp == 3){
            line[0] = './img/3.png';
            line[1] = './img/3.png';
            line[2] = './img/4.png';
            line[3] = './img/3.png';
        }else if(exp == 4){
            line[0] = './img/4.png';
            line[1] = './img/4.png';
            line[2] = './img/3.png';
            line[3] = './img/4.png';
        }else if(exp == 5){
            line[0] = './img/1.png';
            line[1] = './img/2.png';
            line[2] = './img/3.png';
            line[3] = './img/4.png';
        }else if(exp == 6){
            line[0] = './img/3.png';
            line[1] = './img/4.png';
            line[2] = './img/1.png';
            line[3] = './img/2.png';
        }else if(exp == 7){
            line[0] = './img/4.png';
            line[1] = './img/2.png';
            line[2] = './img/4.png';
            line[3] = './img/2.png';
        }else if(exp == 8){
            line[0] = './img/2.png';
            line[1] = './img/4.png';
            line[2] = './img/2.png';
            line[3] = './img/4.png';
        }
        return line;
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

    function indexes(exp1, exp_command){
        var i = -1;
        var indexes = [];
        while((i = exp1.indexOf(exp_command, i + 1)) !== -1) {
            indexes.push(i);
        }
        return indexes;
    }
    
    function replace(sentences){
        for(j=0; j<=words.length-1;j++){
            idx = indexes(sentences, words[j]);
            for(i=0; i<=idx.length-1; i++){
                sentences.splice(idx[i], 1, new_words[j]);
            }
        }
        return sentences;
    }

    socket.on('connect', function () {
        
        execution_line = 0;
        
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
                $('#run').addClass('disabled');
            }else{
                $('#quality').addClass('disabled');
                $('#quality').css("background-color", "#4F4F58");
                $('#run').removeClass('disabled');
            }
            $("#quality").text("ELECTRODOS | "+avg);
        });  

        socket.on('exp', (exp) => {
            $("#nro_exp").text("EXPERIMENTO "+exp);
            document.body.style.backgroundColor = col[exp-1];
            img_1.src = line(exp)[0];
            img_2.src = line(exp)[1];
            img_3.src = line(exp)[2];
            img_4.src = line(exp)[3];
        });
        
        socket.on('userId', function(result){
            new_words[0] = 'id('+result.CI+')';
            new_words[1] = 'play('+result.song+'.mp3)';
        })

        socket.on('experiment', function(exp_){
            sentences=Object.values(exp_);
            sentences = replace(sentences);
        });

        $("#run").click(function(e){
            e.preventDefault();
            document.body.style.backgroundColor = "#A0D9C9";
            $("#instrucciones").addClass("d-none");
            $("#iys").addClass("d-none");
            $("#run").addClass('d-none');
            $("#atras").addClass('d-none');
            $("#low-btn").removeClass('low_btn');
            $("#low-btn").addClass('low_btn1');
            let commands = sentences[execution_line].split('(');
            let func = commands[0];
            let args = commands[1].split(')')[0];
            let data = {
                'command': func,
                'args': args
            };
            if (func === "experiment"){
                experiment = args;
            }
            socket.emit('command', data);
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

        socket.on('finish', function(){
            /*  if (role){
                $("#subject-container").html("<h3>Waiting... Please, be patient</h3>");
                setTimeout(function(){
                    $("#subject-container").html("");
                }, 2000);
            } */
        });

        socket.on('error',function(){
            alert('An error in server has occurred.');
        });

        socket.on('clear',function(data){
            if (data === "screen"){
                console.log('Recognizing Clear Screen')
                let emptyness = "";
                $("#subject-container").html(emptyness);
            }else if (data === "audio"){
                console.log('Recognizing Clear Sound')
                audio_sound.pause();
                audio_sound.currentTime=0;
            }
        });

        socket.on('command',function(data){
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
                }else if (func === "present"){
                    console.log('Recognizing Presentation')

                }else if (func === "play"){
                    console.log('Recognizing Play')

                }else if (func === "clear"){
                    console.log('Recognizing Clear');
                }else if (func === "ball"){
                    console.log("Recognizing ball");
                }else if (func === "wait"){
                    if (args>0 || args.length>0){
                        console.log('waiting server response');
                    }else{
                        console.log('Recognizing Wait')
                        waiting_for_trigger = true;
                    }
                }else if (func === "finish"){
                    console.log('finished');
                    $("#iys").removeClass('d-none');
                    $("#instrucciones").removeClass("d-none");
                    $("#run").removeClass('d-none');
                    $("#atras").removeClass('d-none');
                    $("#low-btn").removeClass('low_btn1');
                    $("#low-btn").addClass('low_btn');
                    socket.emit('command',{
                        "command":'finish'
                    });
                    execution_line = 0;
                }
                if(!waiting_for_trigger){
                    socket.emit('command', data);
                }
            }else{
                console.log('Either user has no right role or an error has occured while receiving command from server');
            }
        });
    });
}, false);