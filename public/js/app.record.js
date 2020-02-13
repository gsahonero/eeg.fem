document.addEventListener('DOMContentLoaded', function () {
    
    //Dropzone Initialization
    var dropzone = document.getElementById("drop_zone");
    //dropzone.ondrop = dropHandler(event);
    //dropzone.ondragover = dragOverHandler(event);
    //ondrop="dropHandler(event);" ondragover="dragOverHandler(event);"
    // GamepadEvent Initialization
    
    var haveEvents = 'GamepadEvent' in window;
    var haveWebkitEvents = 'WebKitGamepadEvent' in window;
    var controllers = {};
    var rAF = window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame;

    var joystick_axes=[0,0];
    var dir_command=[0,0];

    // End


    // gamepad events
    if (haveEvents) {
        window.addEventListener("gamepadconnected", connecthandler);
        window.addEventListener("gamepaddisconnected", disconnecthandler);
    } else if (haveWebkitEvents) {
        window.addEventListener("webkitgamepadconnected", connecthandler);
        window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
    } else {
        setInterval(scangamepads, 500);
    }

    /**
     * Handles the connection of the controllers. Connects a gamepad
     *
     * @param {*} e Gamepad List
     */
    function connecthandler(e) {
        // we have to take this as a previous step to everything
        console.log('connecting');
        console.log(typeof(e));
        addgamepad(e.gamepad);
    }
    /**
     * Adds a controller to the gamepad list
     *
     * @param {*} gamepad Controller that will be added
     */
    function addgamepad(gamepad) {
        controllers[gamepad.index] = gamepad;
        console.log('myindex',gamepad.index);
        rAF(updateStatus);
    }

    /**
     * Removes the controller from the gamepad list
     *
     * @param {*} e Controller that will be removed
     */
    function disconnecthandler(e) {
        removegamepad(e.gamepad);
    }
    /**
     *  Removes the controller from the list
     * 
     * @param {*} gamepad Controller that will be removed
     */
    function removegamepad(gamepad) {
        delete controllers[gamepad.index];
    }
    /**
     * Scans to check if there are connected gamepads to the computer, if that's the case,
     * it uses the function addgamepad()
     */
    function scangamepads() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (!(gamepads[i].index in controllers)) {
                    addgamepad(gamepads[i]);
                } else {
                    controllers[gamepads[i].index] = gamepads[i];
                }
            }   
        }
        check_h= document.getElementById("control1");
    }

    /**
    * process_axe 
    * Converts the analog input from the axes to a integer (-1,0,1)
    * @param {float} raw_axe Axe value from joystick axe, in float format from -1 to 1
    * @returns {integer} Discrete axe value (-1,0,1)
    */
    function proccess_axe(raw_axe){
        var commands=0;
        //Joystick commands
        //commands:x
        if(Math.abs(raw_axe)>0.01){
            if(raw_axe<0){
                commands=-1
            }else{
                commands=1
            }
        }
        return commands;
    }
    
    
    /**
     * Monitors if there is a new gamepad connected, and checks the state of the analog and
     * digital inputs.
     */
    function updateStatus() {
        scangamepads();

        var controller = controllers[0];
        for (var i=0; i<controller.buttons.length; i++) {
            var val = controller.buttons[i];
            var pressed = val == 1.0;
            if (typeof(val) == "object") {
                pressed = val.pressed;
                val = val.value;
            }
            var pct = Math.round(val * 100) + "%";
            if (pressed) {
                console.log("Pressed",i);
            }
        }
        for (var i=0; i<controller.axes.length; i++) {
            if (i==0||i==1){
                joystick_axes[i]=controller.axes[i];
                dir_command[i]=proccess_axe(joystick_axes[i]);
                //dir_command[i]=joystick_axes[i];
                console.log(joystick_axes[i],":",dir_command[i]);
            }
        }
        //rAF(updateStatus);
    }
    //end of gamepad events


    
    /**
     * Looks for all the instances of a word, and replaces it
     * @param {String} search       word that will be searched
     * @param {String} replacement  Word that will be the replacement
     * @returns Changes the document to a new version with the words replaced
     */
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    /**
     * Downloads the script written in the researcher screen, in .txt format
     * 
     * @param {String} filename Name of the downloloaded file.
     * @param {String} text Text that will be stored into the .txt document.
     */
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    
    /**
     * Checks if there exist some instance of play(parameter); command written on the script.
     * The names of the files found will be saved on an object
     * 
     * @returns {Object} Object that contains the names of the files that need to be loaded.
     */
    function findMedia() {
        let media_list=[]
        code = editor.getValue();
        // we should go until sentences.length-1 EYE WITH THIS
        sentences = code.replaceAll('\n','').split(';');
        for(var i=0; i<sentences.length-1;i++){
            var parameters=readLine(sentences[i]);
            if(parameters.command == "play"){
                media_list.push({type:"music", name:parameters.args})
            }
            if(parameters.command == "present"){
                media_list.push({type:"image", name:parameters.args})
            }
            if(parameters.command == "experiment"){
                experiment=parameters.args
                console.log("file",parameters.args);
            }    
        }
        return media_list
    }
    /**
     * Extract information from a command line 
     *
     * @param {String} line Command line from the researcher script editor
     * @returns {Object} Object that contains the name of the command and its arguments  command(args)
     */
    function readLine(line){
        let commands = line.split('(');
        let func = commands[0];
        let args = commands[1].split(')')[0];
        let data = {
            'command': func,
            'args': args
        };
        return data;
    }

    /**
     *  Imports the music files from a list
     *
     * @param {Object} names Name of music files to be imported
     * @returns {Object} List of objects that contain the audio file, and a string as an identificator
     */
    function importMusic(names){        
        let my_audio;
        let my_tag;
        let my_object=[];
        /**
         * Creates an object that contains an identifier and audio file stored 
         *
         * @param {String} element Cada elemento dentro de la lista de nombres
         *                        
         */
        names.forEach(function(element) {
            console.log(element);
            console.log("hey",experiment);
            my_audio = new Audio(experiment+'/'+element);
            my_tag = element;
            my_object.push({music: my_audio, tag: my_tag});
            //var beep_sound = new Audio('./data/beep.mp3');
        });
        return my_object
    }

    /**
     *
     *  Loads the subject screen      
     */
    $("#load-subject").click(function(){
        $("#welcome-screen").attr('class','d-none');
        $("#joystick-screen").attr('class','container');
    
        var myVar = setInterval(refreshJoystick, 1000/60); 
        /**
         * Sets the experiment screen
         *
         */
        function setExperiment()
            {
                clearInterval(myVar);
                $("#joystick-screen").attr('class','d-none');
                $("#subject-container").attr('class','container');
                $("#subject-container").html("<h3>Waiting, please be patient ...</h3>");
                
                /**
                 * Vacía la página del sujeto de experimentacion después de 2s.
                 *
                 */
                setTimeout(function(){
                    $("#subject-container").html("");
                }, 2000);
                role = 1;
            }
        /**
         * Sets the page of the experiment if the skip button is pressed
         *
         */
        $("#skip-button").click(function(e){
            setExperiment();
        });
        
        /**
         * 
         * If there exists a joystick connected it calls the function setExperiment()
         *
         */
        function refreshJoystick()
        {
            if(navigator.getGamepads().length > 0){
                setExperiment();
            }
        }
    });
    /*
     * Sets the experiment subject page.
     */
    $("#load-researcher").click(function(){
        $("#welcome-screen").attr('class','d-none');
        $("#title").attr('class','container');
        $("#content").attr('class','container');
        role = 0;
    })
     /*
     * Loads an existing experiment
     *
     */
    $("#load_experiment").click(function(e){
        e.preventDefault();
        $("#file-upload").on('change', function(){
            var file = $(this)[0].files[0];
            if (file){
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    editor.setValue(evt.target.result,-1);
                }
                reader.onerror = function (evt) {
                    document.getElementById("editor").innerHTML = "error reading file";
                }
            }
        }).click();
    });
     /*
     * Saves the experiment written on the editor into a .txt document.
     *
     */
    $("#save_experiment").click(function(e){
        download('script.txt', editor.getValue());
    });

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/custom");

    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    //Initialization for socket-file
    var uploader = new SocketIOFileClient(socket);
    var form = document.getElementById('form');


    var counter = 0;
    var step = 0;
    var code = "";
    var experiment = ":p";
    var sentences = "";
    var execution_line = 0;
    var waiting_for_trigger = false;
    // role = 0: Researcher
    // role = 1: Subject
    var role = 0;
    var audio_sound = new Audio();
    var beep_sound = new Audio('./data/beep.mp3');
    var music_list=[]

    a=new AudioContext()
    
    /**
     *  Plays a customizable beep sound
     *
     * @param {Integer} vol Set the intensity of the sound
     * @param {Integer} freq    Set the frequency of the wave
     * @param {*} duration  Duration of the beep
     */
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
    
    /**
    * Sets the page of the experimentation subject
    */
   uploader.on('ready', function() {
    console.log('SocketIOFile ready to go!');
    
    });
    uploader.on('loadstart', function() {
        console.log('Loading file to browser before sending...');
    });
    uploader.on('progress', function(progress) {
        console.log('Loaded ' + progress.loaded + ' / ' + progress.total);
    });
    uploader.on('start', function(fileInfo) {
        console.log('Start uploading', fileInfo);
    });
    uploader.on('stream', function(fileInfo) {
        console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
    });
    uploader.on('complete', function(fileInfo) {
        console.log('Upload Complete', fileInfo);
    });
    uploader.on('error', function(err) {
        console.log('Error!', err);
    });
    uploader.on('abort', function(fileInfo) {
        console.log('Aborted: ', fileInfo);
    });

    form.onsubmit = function(ev) {
        ev.preventDefault();
        
        // Send File Element to upload
        var fileEl = document.getElementById('file');
        // var uploadIds = uploader.upload(fileEl);

        // Or just pass file objects directly
        var uploadIds = uploader.upload(fileEl.files);
    };
    socket.on('connect', function () {
        socket.on('dev', function(data){
            let connection_information = data[2];
            let total = 0;
            for (let index = 0; index<=13; index=index+1){
                total = total + connection_information[index];
            }
            let avg = total/14/4*100;
            $("#quality").text(avg);
        });
        console.log('Connected to server');


        
        /**
        * If the "Compile" button is pressed , a file is corresponding to the experiment is created and
        *  music list written on the script is sent to the subject tab
        * 
        */
        $("#compile_experiment").click(function(e){
            let myMedia=findMedia();
            console.log("Experiment: ",experiment);
            socket.emit('folder',experiment);
            console.log("Media: ",myMedia);
            socket.emit('media_files',myMedia);
        });
        $("#run_experiment").off('click');
        execution_line = 0;
        /**
        * 
        * Starts the experiment. It sends every instruction written in the researcher script line by line
        * to the subject.
        *
        */
        $("#run_experiment").click(function(e){
            e.preventDefault();
            $("#run_experiment").addClass('disabled');
            code = editor.getValue();
            // we should go until sentences.length-1 EYE WITH THIS
            sentences = code.replaceAll('\n','').split(';');
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
            console.log('Sending initial command')
            socket.emit('command', data);
            
        });
        /*
        *   Rules to be followed by the subject
        */
        if(role)
        {
            /**
            * 
            * When the 'media_files' instruction is received it imports music
            *
            */
            socket.on('media_files', function(data){
                console.log(data);
                //music_list= importMusic(data);   
                //console.log(music_list);
            });

            /**
             * When the 'beep' instruction is received, it generates a beep calling a function with the same name
             */
            socket.on('beep', function(data){
                // browsers limit the number of concurrent audio contexts, so you better re-use'em
                beep(100, 250, data)
            });

            /**
             *  When the 'present' instruction is received, it shows an image.
             */
            socket.on('present',function(data){
                let image = "<img src='"+data+"' style='max-height:50%, width: auto;'>";
                $("#subject-container").removeClass('d-none');
                $("#subject-container").html(image);
            });

            /**
             *  When the 'play' instruction is received, it reproduces a music file.
             */
            socket.on('play',function(data){
                console.log("Mydata: ",data);

                musc_list.forEach(function(element) {
                    console.log("TAG:",element.tag, "DESIRED:",data);
                    if(element.tag == data){
                        console.log(element);
                        setTimeout(function(){
                            element.music.loop = false;
                            element.music.play();
                        }, 10);
                    }

                    });
            });

            /**
             *  When the 'finish' instruction is received, the experiment is finished
             */
            socket.on('finish', function(){
                
                $("#subject-container").html("<h3>Waiting... Please, be patient</h3>");
                setTimeout(function(){
                    $("#subject-container").html("");
                }, 2000);
                
            });
                 /**
                 *  When the 'ball' instruction is received, it shows a ball, that has a different
                 * animation depending on its paramenters
                 */
                socket.on('ball',function(data){
                    
                        $("#subject-container").html("<div class='d-none' id='ball-container'><span class='dot' id='ball'></span></div>");
                        if (data.orientation === 'random'){
                            $("#subject-container").html('<canvas id="canvas" style="position: absolute; top: 0; left: 0;"></canvas>');
                            $("#ball-container").removeClass('d-none');
                            var canvas = document.getElementById('canvas');

                            canvas.width = window.innerWidth;
                            canvas.height = window.innerHeight;

                            var x = canvas.width / 2; //initial position
                            var y = canvas.height / 2;

                            var cxt = canvas.getContext('2d');
                            cxt.fillStyle = '#FF0000'; //color
                            var radius = 10;

                            var dx = 0;
                            var dy = 0;
                            var delta = 5; // range (from 0) of possible dx or dy change
                            var max = 15; // maximum dx or dy values


                            var interval = window.setInterval(random_animate, 1000 / 60);

                            /**
                             *  Controls the animation of the ball, it makes it move randomly
                             *
                             */
                            function random_animate() {
                                var d2x = (Math.random() * delta - delta / 2); //change dx and dy by random value
                                var d2y = (Math.random() * delta - delta / 2);

                                if (Math.abs(d2x + dx) > max) // start slowing down if going too fast
                                d2x *= -1;
                                if (Math.abs(d2y + dy) > max) d2y *= -1;

                                dx += d2x;
                                dy += d2y;

                                if ((x + dx) < 0 || (x + dx) > canvas.width) // bounce off walls
                                dx *= -1;
                                if ((y + dy) < 0 || (y + dy) > canvas.height) dy *= -1;

                                x += dx;
                                y += dy;

                                cxt.beginPath(); //drawing circle
                                cxt.arc(x, y, radius, 0, 2 * Math.PI, false);
                                cxt.clearRect(0, 0, canvas.width, canvas.height); // wiping canvas
                                cxt.fill();
                            }
                            /**
                             *  Stops the execution of the function running on intervals
                             */
                            setTimeout(function(){
                                interval = clearInterval(interval);
                                console.log('Interval was cleared.');
                            },data.duration);

                        }else if(data.orientation ==='controller'){
                            $("#subject-container").html('<canvas id="canvas" style="position: absolute; top: 0; left: 0;"></canvas>');
                            $("#ball-container").removeClass('d-none');
                            var canvas = document.getElementById('canvas');

                            canvas.width = window.innerWidth;
                            canvas.height = window.innerHeight;

                            var x = canvas.width / 2; //initial position
                            var y = canvas.height / 2;

                            var cxt = canvas.getContext('2d');
                            cxt.fillStyle = '#FF0000'; //color
                            var radius = 10;

                            var dx = 0;
                            var dy = 0;
                            var delta = 5; // range (from 0) of possible dx or dy change
                            var max = 15; // maximum dx or dy values

                            var interval = window.setInterval(controller_animate, 1000 / 60);
                            // controller animate
                            /**
                             *  Controls the animation by joystick input
                             *
                             */
                            function controller_animate() {
                                console.log("Hey i'm animating");
                                updateStatus();
                                var d2x = dir_command[0]*delta; //change dx and dy by random value
                                var d2y = dir_command[1]*delta;

                                x += d2x;
                                y += d2y;

                                if(x>canvas.width-radius){x=canvas.width-radius}
                                if(x<0+radius){x=0+radius}
                                if(y>canvas.height-radius){y=canvas.height-radius}
                                if(y<0+radius){y=0+radius}

                                cxt.beginPath(); //drawing circle
                                cxt.arc(x, y, radius, 0, 2 * Math.PI, false);
                                cxt.clearRect(0, 0, canvas.width, canvas.height); // wiping canvas
                                cxt.fill();
                            }
                            // end

                            setTimeout(
                                
                                function(){
                                    interval = clearInterval(interval);
                                    console.log('Interval was cleared.');
                                }
                                , data.duration);

                            }else if (data.orientation ==='bottom'){
                                // ball goes down
                                $("#ball-container").removeClass('d-none');
                                $("#ball").css('top', '1%');
                                $("#ball").css('left','50%');
                                /**
                                *  Makes the ball appear on the bottom
                                */
                                setTimeout(function(){
                                    $("#ball").animate({
                                        top:'97%'
                                    },
                                    600,
                                    function(){

                                    }
                                )
                            },data.duration);
                        }else if (data.orientation === 'top'){
                            // ball goes up
                            $("#ball-container").removeClass('d-none');
                            $("#ball").css('top', '97%');
                            $("#ball").css('left','50%');
                            setTimeout(function(){
                                $("#ball").animate({
                                    top:'0px'
                                },
                                600,
                                function(){

                                }
                            )
                        },data.duration);
                    }else if (data.orientation === 'left'){
                        // ball goes left
                        $("#ball-container").removeClass('d-none');
                        $("#ball").css('top', '50%');
                        $("#ball").css('left','97%');
                        setTimeout(function(){
                            $("#ball").animate({
                                left:'1%'
                            },
                            600,
                            function(){

                            }
                        )
                    },data.duration);
                }else if (data.orientation === 'right'){
                    // ball goes right
                    $("#ball-container").removeClass('d-none');
                    $("#ball").css('top', '50%');
                    $("#ball").css('left','1%');
                    setTimeout(function(){
                        $("#ball").animate({
                            left:'97%'
                        },
                        600,
                        function(){

                        }
                    )
                },data.duration);
            }else{
                console.log('Unrecognized data');
            }
        
        });
        }
        
        socket.on('missing',(missing)=>{
            if(missing.length>0){
                alert("You need to upload the following files:\n"+ missing.join('\n'));
                console.log(missing);
                document.getElementById("run_experiment").disabled=true;
                                
            }else{
                document.getElementById("run_experiment").disabled=false;
            }
        });
        /**
         * When the 'folder' instruction is received, the experiment is saved on a variable called experiment  
         */
        socket.on('folder', function(data){
            experiment=data;  
        });
        
       
        
        
        /**
         *  When the 'error' instruction is received, it shows a message via alert
         */
        socket.on('error',function(){
            alert('An error in server has occurred.');
        });
   
/**
 * When the 'clear' instruction is received, it deletes whatever is present on the screen
 */
socket.on('clear',function(data){
    if (data === "screen"){
        console.log('Recognizing Clear Screen')
        let emptyness = "";
        $("#subject-container").html(emptyness);
    }else if (data === "audio"){
        
        console.log('Recognizing Clear Sound')
        music_list.forEach(function(element) {
            element.music.pause();
            element.music.currentTime=0;
        });
        
        
    }
})
/**
 * When the 'commnad' instruction is received, its confirmed that the subject executed successfully the command.
 */
socket.on('command',function(data){
    console.log(data);
    if (data === "ready" && !role){
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
            console.log('this way');
            socket.emit('command',{
                "command":'finish'
            });
            execution_line = 0;
        }
        if (!waiting_for_trigger){
            socket.emit('command', data);
        }
    }else{
        console.log('Either user has no right role or an error has occured while receiving command from server');
    }
});

socket.on('dev', function(data){

});
socket.on('data',function(data){

});
socket.on('subject-html',function(data){
    $("#subject-container").html(data);
});
});


}, false);
