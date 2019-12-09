document.addEventListener('DOMContentLoaded', function () {

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
     * Maneja las conexiones de los controles. Conecta un gamepad
     *
     * @param {*} e Lista de gamepads
     */
    function connecthandler(e) {
        // we have to take this as a previous step to everything
        console.log('connecting');
        console.log(typeof(e));
        addgamepad(e.gamepad);
    }
    /**
     * Añade un control a la lista de gamepads
     *
     * @param {*} gamepad Tiene como parametro el control que será añadido
     */
    function addgamepad(gamepad) {
        controllers[gamepad.index] = gamepad;
        console.log('myindex',gamepad.index);
        rAF(updateStatus);
    }

    /**
     * Remueve el control de la lista de gamepads
     *
     * @param {*} e Tiene como parametro el control que será retirado
     */
    function disconnecthandler(e) {
        removegamepad(e.gamepad);
    }
    /**
     *  Remueve el control gamepad de la lista
     * 
     * @param {*} gamepad Control que será retirado
     */
    function removegamepad(gamepad) {
        delete controllers[gamepad.index];
    }
    /**
     * Escanea para revisar si existen gamepads conectados a la computadora, 
     * en caso de que existiesen utiliza la función addgamepad()
     * 
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
    * Convierte la entrada análoga de uno de los ejes a un valor de -1,0,1
    * @param {float} raw_axe valor de un eje de joystick en formato float de -1 a 1
    * @returns {integer} Valor de eje discreto, puede ser (-1,0,1)
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
     * Monitorea si es que se conectó un nuevo gamepad y el estado de los botones
     * digitales y analógicos del control
     *
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
     *
     * Busca todas las instancias de una palabra y las reemplaza
     * @param {String} search       word that will be searched
     * @param {String} replacement  Word that will be the replacement
     * @returns Changes the document to a new version with the words replaced
     */
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    /**
     * Descarga el script escrito en el editor de la pantalla de Researcher en formato de archivo txt
     *
     * @param {String} filename Nombre con el cual se desea guardar el script
     * @param {String} text Texto que será almacenado dentro del documento txt
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
     * Revisa si existe alguna instancia de play(parameter) escrita en el script. Los nombres de los archivos
     * encontrados como parametros son guardados en un Objeto 
     * 
     * @returns {Object} audiolist Retorna un objeto que contiene los nombres de los archivos que
     *                     deben ser cargados   
     */
    function findAudio() {
        let audio_list=[]
        code = editor.getValue();
        // we should go until sentences.length-1 EYE WITH THIS
        sentences = code.replaceAll('\n','').split(';');
        for(var i=0; i<sentences.length-1;i++){
            var parameters=readLine(sentences[i]);
            if(parameters.command == "play"){
                audio_list.push(parameters.args)
            }
            if(parameters.command == "experiment"){
                experiment=parameters.args
                console.log("file",parameters.args);
            }    
        }
        return audio_list
    }
    /**
     * Extrae información de una linea de comando 
     *
     * @param {String} line linea de código que posee el formato de   command(argument) 
     * @returns {Object} data Objeto que contiene el nombre del comando y sus argumentos
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
     *  Importa los archivos de música con el no
     *
     * @param {Object} names Nombres de archivos de audio a ser importados
     * @returns {Object} Contiene una lista de objetos con el
     *                   archivo de audio y un string como identificador
     */
    function importMusic(names){        
        let my_audio;
        let my_tag;
        let my_object=[];
        /**
         *  Crea un objeto que contiene un identificador y el archivo de audio cargado
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
     *  Carga la pagina del sujeto de prueba
     * 
     */
    $("#load-subject").click(function(){
        $("#welcome-screen").attr('class','d-none');
        $("#joystick-screen").attr('class','container');
    
        var myVar = setInterval(refreshJoystick, 1000/60); 
        /**
         * Setea la página del sujeto de experimentacion.
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
         * Setea la página del sujeto de experimentacion.
         *
         */
        $("#skip-button").click(function(e){
            setExperiment();
        });
        
        /**
         * En caso de existir un joystick conectado llama a la función setExperiment()
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
     * Setea la página del sujeto de experimentacion.
     *
     */
    $("#load-researcher").click(function(){
        $("#welcome-screen").attr('class','d-none');
        $("#title").attr('class','container');
        $("#content").attr('class','container');
        role = 0;
    })
     /*
     * Carga el texto de un experimento existente
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
     * Guarda el experimento escrito en el editor en un documento de texto.
     *
     */
    $("#save_experiment").click(function(e){
        download('script.txt', editor.getValue());
    });

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/custom");

    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
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
    //beep_sound.loop = true;
    /**
    * Setea la página del sujeto de experimentacion.
    *
    */
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
        * Al presionar el boton de import audio se envía la lista de música escrita en el script a la ppestaña
        * del sujeto
        */
        $("#import_audio").click(function(e){
            let myAudio=findAudio();
            console.log(myAudio);
            console.log(experiment);
            socket.emit('folder',experiment);
            socket.emit('audio_files',myAudio);
        });
        $("#run_experiment").off('click');
        execution_line = 0;
        /**
        * Inicia el experimento. Realiza todas las funciones escritas en el script linea a linea, y
        * envía las instrucciones al sujeto de experimentacion
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
        /**
        * Inicia el experimento. Realiza todas las funciones escritas en el script linea a linea, y
        * envía las instrucciones al sujeto de experimentacion
        *
        */
        socket.on('audio_files', function(data){
            if(role){
                console.log(data);
                music_list= importMusic(data);   
                console.log(music_list);
                
            }  
        });
        /**
         *  Al recibir la instrucción folder guarda el experimento en una variable llamada experiment
         */
        socket.on('folder', function(data){
            experiment=data;  
        });
        /**
         *  Al recibir la instrucción "beep" genera un beep mediante la función del mismo nombre
         */
        socket.on('beep', function(data){
            if (role)
            // browsers limit the number of concurrent audio contexts, so you better re-use'em
            beep(100, 250, data)
        });
        /**
         *  Al recibir la instrucción "present" muestra una imagen
         */
        socket.on('present',function(data){
            let image = "<img src='"+data+"' style='max-height:50%, width: auto;'>";
            $("#subject-container").removeClass('d-none');
            if (role)
            $("#subject-container").html(image);
        });
        /**
         *  Al recibir la instrucción "play" reproduce un archivo de música
         */
        socket.on('play',function(data){
            console.log("Mydata: ",data);
            if (role){
                music_list.forEach(function(element) {
                    console.log("TAG:",element.tag, "DESIRED:",data);
                    if(element.tag == data){
                        console.log(element);
                        setTimeout(function(){
                            element.music.loop = false;
                            element.music.play();
                        }, 10);
                    }
                    
                });
            }
            
        });
        /**
         *  Al recibir la instrucción "finish" finaliza con el experimento
         */
        socket.on('finish', function(){
            if (role){
                $("#subject-container").html("<h3>Waiting... Please, be patient</h3>");
                setTimeout(function(){
                    $("#subject-container").html("");
                }, 2000);
            }
        });
        /**
         *  Al recibir la instrucción "error" muestra un mensaje en forma de alert
         */
        socket.on('error',function(){
            alert('An error in server has occurred.');
        });
        /**
         *  Al recibir la instrucción "ball" muestra una bola, la cual tiene distinta animación de acuerdo a 
         * sus parametros
         */
        socket.on('ball',function(data){
            if (role){
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
                     *  Detiene la ejecución de la función realizada por intervalos 
                     *
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
}
});
/**
 *  Al recibir la instrucción "clear" borra lo presente en pantalla
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
 *  Al recibir la instrucción "command" se confirma que la página del sujeto termino de realizar el comando
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
