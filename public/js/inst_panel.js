document.addEventListener('DOMContentLoaded', function () {
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    var smoothie = new SmoothieChart({  millisPerPixel:16,
                                        interpolation:'step',
                                        grid:{fillStyle:'rgba(255,255,255,0.75)',
                                        strokeStyle:'#ffffff'},
                                        labels:{fillStyle:'#000000'}});
                                        smoothie.streamTo(document.getElementById("mycanvas"), 500);
    smoothie.streamTo(document.getElementById('mycanvas'));
    // Data
    var line1 = new TimeSeries();
    var line2 = new TimeSeries();
    // Add a random value to each line every second
    setInterval(function() {
        line1.append(new Date().getTime(), Math.random());
        line2.append(new Date().getTime(), Math.random());
    }, 500);
    // Add to SmoothieChart
    smoothie.addTimeSeries(line1, {lineWidth:2,strokeStyle:'#00ff00',fillStyle:'rgba(0,0,0,0.32)'});
    smoothie.addTimeSeries(line2, {lineWidth:2,strokeStyle:'#614BF2',fillStyle:'rgba(0,0,0,0.32)'});

    var ctx = document.getElementById("mycanvas2").getContext("2d");
    /* ctx.style.backgroundColor = '#A0D9C9'; */
    var myChart = new Chart(ctx, {
        type:"bar",
        data:{
            labels:['Fail','Aciertos'],
            datasets:[{
                label:'Num Datos',
                data:[65154, 43546],
                backgroundColor: [
                    '#D94E41',
                    '#038C33'
                ],
                borderWidth:1
            }]
        }
    });

}, false);