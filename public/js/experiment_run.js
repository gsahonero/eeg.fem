document.addEventListener('DOMContentLoaded', function () {
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
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
            $("#quality").text("ELECTRODES | "+avg);
        });  

        socket.on('exp', (exp) => {
            $("#nro_exp").text("EXPERIMENTO "+exp);
            document.body.style.backgroundColor = col[exp-1];
        })
        
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
            $("#instrucciones").html("");
            $("#iys").html("");
            $("#run").addClass('disabled');
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
            console.log('Sending 1');
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
                console.log(sentences[execution_line]);
                let commands = sentences[execution_line].split('(');
                console.log(commands);
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
                        $("#trigger_button").removeClass('disabled');
                        waiting_for_trigger = true;
                        $("#trigger_button").off('click');
                        $("#trigger_button").click(function(e){
                            e.preventDefault();
                            console.log('Sending 2');
                            socket.emit('command',{
                                "command": 'wait'
                            });
                            $("#trigger_button").addClass('disabled');
                            waiting_for_trigger = false;
                        });
                    }
                }else if (func === "finish"){
                    console.log('finished');
                    $("#run_experiment").removeClass("disabled");
                    $("#trigger_button").addClass('disabled');
                    console.log('Sending 3');
                    socket.emit('command',{
                        "command":'finish'
                    });
                    execution_line = 0;
                }
                if(!waiting_for_trigger){
                    console.log('Sending 4');
                    socket.emit('command', data);
                }
            }else{
                console.log('Either user has no right role or an error has occured while receiving command from server');
            }
        });
    });
}, false);