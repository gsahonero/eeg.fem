document.addEventListener('DOMContentLoaded', function () {

    var line1 = new TimeSeries();
    var line2 = new TimeSeries();
    var line3 = new TimeSeries();
    var line4 = new TimeSeries();
    var line5 = new TimeSeries();
    var line6 = new TimeSeries();
    var line7 = new TimeSeries();
    var line8 = new TimeSeries();
    var line9 = new TimeSeries();
    var line10 = new TimeSeries();
    var line11 = new TimeSeries();
    var line12 = new TimeSeries();
    var line13 = new TimeSeries();
    var line14 = new TimeSeries();


      var smoothie = new SmoothieChart({
            grid: {
                fillStyle:'#ffffff',  
                lineWidth: 1,
                millisPerLine: 250,
                verticalSections: 6,
                borderVisible: true
            },
            millisPerPixel: 5,
            tooltip: true
        });

      smoothie.addTimeSeries(line1, { strokeStyle: '#ff0000', lineWidth: 1});
      smoothie.addTimeSeries(line2, { strokeStyle: '#ff8000', lineWidth: 1 });
      smoothie.addTimeSeries(line3, { strokeStyle: '#ffff00', lineWidth: 1 });
      smoothie.addTimeSeries(line4, { strokeStyle: '#40ff00', lineWidth: 1 });
      smoothie.addTimeSeries(line5, { strokeStyle: '#00ffbf', lineWidth: 1 });
      smoothie.addTimeSeries(line6, { strokeStyle: '#0040ff', lineWidth: 1 });
      smoothie.addTimeSeries(line7, { strokeStyle: '#00331a', lineWidth: 1 });
      smoothie.addTimeSeries(line8, { strokeStyle: '#001a33', lineWidth: 1 });
      smoothie.addTimeSeries(line9, { strokeStyle: '#260033', lineWidth: 1 });
      smoothie.addTimeSeries(line10, { strokeStyle: '#33000', lineWidth: 1 });
      smoothie.addTimeSeries(line11, { strokeStyle: '#999090', lineWidth: 1 });
      smoothie.addTimeSeries(line12, { strokeStyle: '#8000ff', lineWidth: 1 });
      smoothie.addTimeSeries(line13, { strokeStyle: '#ff0080', lineWidth: 1 });
      smoothie.addTimeSeries(line14, { strokeStyle: '#ff0040', lineWidth: 1 });

      smoothie.streamTo(document.getElementById("mycanvas"));

    var data = [
        {label: 'AF3', values: []},
        {label: 'F7', values: []},
        {label: 'F3', values: []},
        {label: 'FC5', values: []},
        {label: 'T7', values: []},
        {label: 'P7', values: []},
        {label: 'O1', values: []},
        {label: 'O2', values: []},
        {label: 'P8', values: []},
        {label: 'T8', values: []},
        {label: 'FC6', values: []},
        {label: 'F4', values: []},
        {label: 'F8', values: []},
        {label: 'AF4', values: []}
    ],
    length = 40,
    nextIndex = length,
    scale = 0.1,
    playing = false,
    interval = null;

    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    var counter = 0;
    socket.on('connect', function () {
        socket.on('dev', function(data){
            console.log(data)
        });
        socket.on('data',function(data){

            counter = counter + 1;
            if (counter<100)
                console.log(data)
            setTimeout(function(){
                if ($("#channel1_check").prop('checked')){
                    line1.append(new Date().getTime(), data[2]);
                }
                if ($("#channel2_check").prop('checked')){
                    line2.append(new Date().getTime(), data[3]);
                }
                if ($("#channel3_check").prop('checked')){
                    line3.append(new Date().getTime(), data[4]);
                }
                if ($("#channel4_check").prop('checked')){
                    line4.append(new Date().getTime(), data[5]);
                }
                if ($("#channel5_check").prop('checked')){
                    line5.append(new Date().getTime(), data[6]);
                }
                if ($("#channel6_check").prop('checked')){
                    line6.append(new Date().getTime(), data[7]);
                }
                if ($("#channel7_check").prop('checked')){
                    line7.append(new Date().getTime(), data[8]);
                }
                if ($("#channel8_check").prop('checked')){
                    line8.append(new Date().getTime(), data[9]);
                }
                if ($("#channel9_check").prop('checked')){
                    line9.append(new Date().getTime(), data[10]);
                }
                if ($("#channel10_check").prop('checked')){
                    line10.append(new Date().getTime(), data[11]);
                }
                if ($("#channel11_check").prop('checked')){
                    line11.append(new Date().getTime(), data[12]);
                }
                if ($("#channel12_check").prop('checked')){
                    line12.append(new Date().getTime(), data[13]);
                }
                if ($("#channel13_check").prop('checked')){
                    line13.append(new Date().getTime(), data[14]);
                }
                if ($("#channel14_check").prop('checked')){
                    line14.append(new Date().getTime(), data[15]);
                }
            }, 5);
        });
    });
}, false);
