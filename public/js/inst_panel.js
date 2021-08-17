document.addEventListener('DOMContentLoaded', function () {
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
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
    //Para añadir el tiempo a latencia
    var smoothie = new SmoothieChart({  millisPerPixel:16,
                                        interpolation:'step',
                                        grid:{fillStyle:'rgba(255,255,255,0.75)',
                                        strokeStyle:'#ffffff'},
                                        labels:{fillStyle:'#000000'}});
                                        smoothie.streamTo(document.getElementById("mycanvas"), 500);
    smoothie.streamTo(document.getElementById('mycanvas'));
    var latency = new TimeSeries();
    smoothie.addTimeSeries(latency, {lineWidth:2,strokeStyle:'#614BF2',fillStyle:'rgba(0,0,0,0.32)'});
    //**************************************//
    //
    var y_real = '';
    var right = 0;
    var fail = 0;
    var total = 0;
    var pres_y = 0;
    //Para la precision fallos y ciertos//
    var ctx = document.getElementById("mycanvas2").getContext("2d");
    /* ctx.style.backgroundColor = '#A0D9C9'; */
    var myChart = new Chart(ctx, {
        type:"bar",
        data:{
            labels:['Fail','Aciertos'],
            datasets:[{
                label:'Num Datos',
                data:[0, 0],
                backgroundColor: [
                    '#D94E41',
                    '#038C33'
                ],
                borderWidth:1
            }]
        }
    });
    function update_values(right, fail){
        myChart.data.datasets[0].data = [fail, right];
        myChart.update();
    }
    //Listen user id //Listen secuencia
    socket.on('userId', function(data){
        $("#user_ci").text(data.CI);
        $("#user_song").text(data.song);
        $('#img_2').attr('src', line(data.ML_start[0])[0]);
        $('#img_3').attr('src', line(data.ML_start[0])[1]);
        $('#img_5').attr('src', line(data.ML_start[0])[2]);
        $('#img_6').attr('src', line(data.ML_start[0])[3]);
    });
    //Listen ML model
    socket.on('model_ML', function(mod){
        $("#nro_ML").text(mod.btn_ML);
    });
    //Listen quality
    socket.on('connect', function () {        
        socket.on('dev', function(data){
            let connection_information = data[2];
            let total = 0;
            for (let index = 0; index<=13; index=index+1){
                total = total + connection_information[index];
            }
            let avg = (total/14/4*100).toFixed(2);
            if(avg < 100){
                $("#quality").text(avg);
                $('#quality').css("background-color", "red");
            }else{
                $("#quality").text('100');
                $('#quality').css('background-color', '#0FA67B');
            }
        });
        console.log('Connected to server');        
    });
    //
    socket.on('number_of', function(yr){
        y_real = yr.number_of;
        if(y_real == 'start'){
            total = 0;
            right = 0;
            fail = 0;
            pres_y = 0;
            update_values(right, fail);
            $('#pres_y').text(pres_y);
        }
    });
    //Listen pred
    socket.on('pred', function(data){
        /* console.log('marker: ',data.marker); */
        setTimeout(function(){
            latency.append(new Date().getTime(), data.lat);
        }, 5);
        if(y_real == 'music' || y_real == 'aurosal' || y_real == 'blink'){
            total +=1;
            if((data.marker == y_real) || (data.marker == 'blink')){
                right += 1;
            }else{
                fail +=1;
            }
            pres_y = ((right/total)*100).toFixed(2);
        }
        update_values(right, fail);
        $('#pres_y').text(pres_y);
    });
    //Listen sec step
    socket.on('beep_next', function(beep){
        if(beep.step == 'beep1'){
            $('#img_1').css('background-color', '#4F4F59');
            $('#img_2').css('background-color', '#0FA67B');
            $('#img_3').css('background-color', '#0FA67B');
            $('#img_4').css('background-color', '#0FA67B');
            $('#img_5').css('background-color', '#0FA67B');
            $('#img_6').css('background-color', '#0FA67B');
            $('#img_7').css('background-color', '#0FA67B');
        }else if(beep.step == 'beep2'){
            $('#img_1').css('background-color', '#0FA67B');
            $('#img_2').css('background-color', '#4F4F59');
            $('#img_3').css('background-color', '#0FA67B');
            $('#img_4').css('background-color', '#0FA67B');
            $('#img_5').css('background-color', '#0FA67B');
            $('#img_6').css('background-color', '#0FA67B');
            $('#img_7').css('background-color', '#0FA67B');
        }else if(beep.step == 'beep3'){
            $('#img_1').css('background-color', '#0FA67B');
            $('#img_2').css('background-color', '#0FA67B');
            $('#img_3').css('background-color', '#4F4F59');
            $('#img_4').css('background-color', '#0FA67B');
            $('#img_5').css('background-color', '#0FA67B');
            $('#img_6').css('background-color', '#0FA67B');
            $('#img_7').css('background-color', '#0FA67B');
        }else if(beep.step == 'beep4'){
            $('#img_1').css('background-color', '#0FA67B');
            $('#img_2').css('background-color', '#0FA67B');
            $('#img_3').css('background-color', '#0FA67B');
            $('#img_4').css('background-color', '#4F4F59');
            $('#img_5').css('background-color', '#0FA67B');
            $('#img_6').css('background-color', '#0FA67B');
            $('#img_7').css('background-color', '#0FA67B');
        }else if(beep.step == 'beep5'){
            $('#img_1').css('background-color', '#0FA67B');
            $('#img_2').css('background-color', '#0FA67B');
            $('#img_3').css('background-color', '#0FA67B');
            $('#img_4').css('background-color', '#0FA67B');
            $('#img_5').css('background-color', '#4F4F59');
            $('#img_6').css('background-color', '#0FA67B');
            $('#img_7').css('background-color', '#0FA67B');
        }else if(beep.step == 'beep6'){
            $('#img_1').css('background-color', '#0FA67B');
            $('#img_2').css('background-color', '#0FA67B');
            $('#img_3').css('background-color', '#0FA67B');
            $('#img_4').css('background-color', '#0FA67B');
            $('#img_5').css('background-color', '#0FA67B');
            $('#img_6').css('background-color', '#4F4F59');
            $('#img_7').css('background-color', '#0FA67B');
        }else if(beep.step == 'beep7'){
            $('#img_1').css('background-color', '#0FA67B');
            $('#img_2').css('background-color', '#0FA67B');
            $('#img_3').css('background-color', '#0FA67B');
            $('#img_4').css('background-color', '#0FA67B');
            $('#img_5').css('background-color', '#0FA67B');
            $('#img_6').css('background-color', '#0FA67B');
            $('#img_7').css('background-color', '#4F4F59');
        }else if(beep.step == 'beep8'){
            $('#img_1').css('background-color', '#0FA67B');
            $('#img_2').css('background-color', '#0FA67B');
            $('#img_3').css('background-color', '#0FA67B');
            $('#img_4').css('background-color', '#0FA67B');
            $('#img_5').css('background-color', '#0FA67B');
            $('#img_6').css('background-color', '#0FA67B');
            $('#img_7').css('background-color', '#0FA67B');
        }
    });
}, false);