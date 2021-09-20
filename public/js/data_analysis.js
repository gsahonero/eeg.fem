document.addEventListener('DOMContentLoaded', function () {
    var ctx_music = document.getElementById("mycanvas_music").getContext('2d');
    var ctx_aurosal = document.getElementById("mycanvas_aurosal").getContext('2d');
    var ctx_total = document.getElementById("mycanvas_total").getContext('2d');
    var ctx_all_acc = document.getElementById("mycanvas_all_acc").getContext('2d');

    var myChart_music = new Chart(ctx_music, {
        type: 'pie',
        data: {
            labels:['Music','Aurosal','Blink'],
            datasets:[{
                label:'Num Datos',
                data:[0, 0, 0],
                backgroundColor: [
                    '#C5D957',
                    '#D94E41',
                    '#2B7CD9'
                ],
                borderWidth:0
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Parte musical',
                    color: '#525359'
                }
            }
        }
    });
    function update_values_music(music, aurosal, blink_m){
        myChart_music.data.datasets[0].data = [music, aurosal, blink_m];
        myChart_music.update();
    }

    var myChart_aurosal = new Chart(ctx_aurosal, {
        type: 'pie',
        data: {
            labels:['Aurosal','Music','Blink'],
            datasets:[{
                label:'Num Datos',
                data:[0, 0, 0],
                backgroundColor: [
                    '#C5D957',
                    '#D94E41',
                    '#2B7CD9'
                ],
                borderWidth:0
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Parte aurosal',
                    color: '#525359'
                }
            }
        }
    });
    function update_values_aurosal(aurosal, music, blink_a){
        myChart_aurosal.data.datasets[0].data = [aurosal, music, blink_a];
        myChart_aurosal.update();
    }

    var myChart_total = new Chart(ctx_total, {
        type: 'pie',
        data: {
            labels:['Aciertos','Fail'],
            datasets:[{
                label:'Num Datos',
                data:[0, 0],
                backgroundColor: [
                    '#C5D957',
                    '#D94E41'
                ],
                borderWidth:0
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Total',
                    color: '#525359'
                }
            }
        }
    });
    function update_values_total(right, fail){
        myChart_total.data.datasets[0].data = [right, fail];
        myChart_total.update();
    }

    var myChart_all = new Chart(ctx_all_acc, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "Precisión total",
                borderColor: '#3FF233',
                data: [],
                fill: true
            },{
                label: "Precisión en musical",
                borderColor: '#614BF2',
                data: [],
                fill: true
            },{
                label: "Precisión en aurosal",
                borderColor: '#F29E63',
                data: [],
                fill: true
            }]
        }
    })
    function addValues(tot_acc, music_acc, aurosal_acc, sesion_num){
        console.log(`tot_acc: ${tot_acc}, music_acc: ${music_acc}, aurosal_acc: ${aurosal_acc}`);
        myChart_all.data.datasets[0].data.push(tot_acc);
        myChart_all.data.datasets[1].data.push(music_acc);
        myChart_all.data.datasets[2].data.push(aurosal_acc);
        myChart_all.data.labels.push(`Sesion: ${sesion_num}`);
        myChart_all.update();
    }
    function update_values_all(){
        myChart_all.data.datasets[0].data = [];
        myChart_all.data.datasets[1].data = [];
        myChart_all.data.datasets[2].data = [];
        myChart_all.data.labels = [];
        myChart_all.update();
    }


    var CI_list = document.getElementById('CI_list');
    var model_list = document.getElementById('model_list');
    var file_list = document.getElementById('file_list');
    var data_send = document.getElementById('btn_analize');

    var CI_send = ''
    var model_send = ''
    var file_send = ''
    var all_switch = false;
    var sesion = 0;
    function element_list(list, list_id){
        for (var i = 0; i < list.length; i++){
            var optn = list[i];
            var el = document.createElement('a');
            el.textContent = optn;
            el.classList.add("dropdown-item");
            el.classList.add("list_toggle");
            el.href = "#"
            list_id.appendChild(el);
        }
    }

    //We connect to the server
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    socket.on('connect', function (){
        $("#customSwitch1"). change(function(){
            $('#CI_select').text('Carne de ID ');
            $('#model_select').text('Model ');
            model_list.innerHTML = '';
            $('#file_select').text('Archivo ');
            file_list.innerHTML = '';
            if($(this).is(':checked') == true){
                all_switch = false;
                $("#file_select").removeClass("disabled");
            }else{
                all_switch = true;
                $("#file_select").addClass("disabled");
            }
        });

        socket.on('CI_list', function(data){
            element_list(data.CI_list, CI_list);
            $('#CI_list a').on('click', function(){
                var ci_txt = ($(this).text());
                $('#CI_select').text(ci_txt);
                socket.emit('CI_selected', {'CI_selected': ci_txt});
                $('#model_select').text('Model ');
                model_list.innerHTML = '';
                $('#file_select').text('Archivo ');
                file_list.innerHTML = '';
            });
        });

        socket.on('file_dir_model', function(data){
            element_list(data.model_list, model_list);
            $('#model_list a').on('click', function(){
                var model_txt = ($(this).text());
                $('#model_select').text(model_txt);
                socket.emit('model_selected', {'model_selected': model_txt, 'dir': data.dir, 'CI_selected': data.CI_selected});
                $('#file_select').text('Archivo ');
                file_list.innerHTML = '';
            });
        });

        socket.on('file_dir_file', function(data){
            var ML_pred_list = data.file_list. filter(name => name. includes('_ML'))
            if(all_switch == false){
                element_list(ML_pred_list, file_list);
                $('#file_list a').on('click', function(){
                    var file_txt = ($(this).text());
                    $('#file_select').text(file_txt);
                    CI_send = data.CI_selected;
                    model_send = data.model_selected;
                    file_send = file_txt;
                });    
            }else if(all_switch == true){
                CI_send = data.CI_selected;
                model_send = data.model_selected;
                file_send = ML_pred_list;
            }
        });

        data_send.addEventListener('click', function() {
            socket.emit('data_analysis', {
                'CI' : CI_send,
                'model' : model_send,
                'file': file_send,
                'all': all_switch
            });
            console.log(`CI: ${CI_send}, model: ${model_send}, file: ${file_send}, all: ${all_switch}`)
            $("#CI_select").addClass("disabled");
            $("#model_select").addClass("disabled");
            $("#file_select").addClass("disabled");
            $("#single_file").addClass("d-none");
            $("#all_files").addClass("d-none");
            $("#btn_analize").addClass("d-none");
            update_values_all();
            sesion = 0;
        });

        socket.on('data_after_show', function(data){
            if (all_switch == false){
                $("#CI_select").removeClass("disabled");
                $("#model_select").removeClass("disabled");
                $("#file_select").removeClass("disabled");
                $("#single_file").removeClass("d-none");
                $('#tot_pred').text(data.pred_tot);
                $('#pred_keep').text(data.pred_keep);
                $('#lat_prom').text(data.lat_avg.toFixed(2)+' ms');
                $('#lat_max').text(data.lat_max+' ms');
                $('#lat_min').text(data.lat_min+' ms');
                $('#accu').text(data.tot_acc[0][0].toFixed(2)+' %');
                update_values_music(data.pred_music_num[0][0], data.pred_music_num[0][2]-data.pred_music_num[0][0], data.pred_music_num[0][1]);
                update_values_aurosal(data.pred_aurosal_num[0][0], data.pred_aurosal_num[0][2]-data.pred_aurosal_num[0][0], data.pred_aurosal_num[0][1]);
                update_values_total(data.tot_acc[0][1], (data.tot_acc[0][3]-data.tot_acc[0][1])+data.tot_acc[0][2]);
            }else if(all_switch == true){
                $("#CI_select").removeClass("disabled");
                $("#model_select").removeClass("disabled");
                $("#all_files").removeClass("d-none");
                $('#tot_pred').text(data.pred_tot);
                $('#pred_keep').text(data.pred_keep);
                $('#lat_prom').text(data.lat_avg.toFixed(2)+' ms');
                $('#lat_max').text(data.lat_max+' ms');
                $('#lat_min').text(data.lat_min+' ms');
                $('#accu').text(data.tot_acc[0][0].toFixed(2)+' %');
                sesion += 1
                addValues(data.tot_acc[0][0], (data.pred_music_num[0][0]/data.pred_music_num[0][2])*100, (data.pred_aurosal_num[0][0]/data.pred_aurosal_num[0][2])*100, sesion)
            }
        });
    });
}, false);