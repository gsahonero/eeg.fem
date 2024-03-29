document.addEventListener('DOMContentLoaded', function () {
    /**
     *  Changes the style according to the params
     *
     * @param {*} param Connection quality
     * @returns appearance to be shown
     */
    function defineColor(param){
        if (param === 0){
            verdict = "#C0C0C0";
        }else if (param === 1){
            verdict = "#FF0000";
        }else if (param === 2){
            verdict = "#FFFF00";
        }else if (param === 3){
            verdict = "#9ACD32"
        }else if (param === 4){
            verdict = "#00FF00"
        }
        else{
            verdict = "#f7f7f6";
        }
        return verdict;
    }
    var socket = new io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
    var counter = 0;
    socket.on('connect', function () {
        /*
        * Refresh the connection information everytime 'dev' instruction is received
        */
        socket.on('dev', function(data){
            let connection_information = data[2];
            $('#AF3').css('background-color', defineColor(connection_information[0]));
            $("#F7").css('background-color', defineColor(connection_information[1]));
            $("#F3").css('background-color', defineColor(connection_information[2]));
            $("#FC5").css('background-color', defineColor(connection_information[3]));
            $("#T7").css('background-color', defineColor(connection_information[4]));
            $("#P7").css('background-color', defineColor(connection_information[5]));
            $("#O1").css('background-color', defineColor(connection_information[6]));
            $("#O2").css('background-color', defineColor(connection_information[7]));
            $("#P8").css('background-color', defineColor(connection_information[8]));
            $("#T8").css('background-color', defineColor(connection_information[9]));
            $("#FC6").css('background-color', defineColor(connection_information[10]));
            $("#F4").css('background-color', defineColor(connection_information[11]));
            $("#F8").css('background-color', defineColor(connection_information[12]));
            $("#AF4").css('background-color', defineColor(connection_information[13]));
        });
    });
}, false);
