document.addEventListener('DOMContentLoaded', function () {
    /**
     *  Changes the style according to the params
     *
     * @param {*} param Connection quality
     * @returns appearance to be shown
     */
    function defineClass(param){
        if (param === 0){
            verdict = "alert alert-dark";
        }else if (param === 1){
            verdict = "alert alert-danger";
        }else if (param === 2){
            verdict = "alert alert-warning";
        }else if (param === 3){
            verdict = "alert alert-info"
        }else if (param === 4){
            verdict = "alert alert-success"
        }
        else{
            verdict = "alert alert-light";
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
            $("#AF3").attr('class', defineClass(connection_information[0]));
            $("#F7").attr('class', defineClass(connection_information[1]));
            $("#F3").attr('class', defineClass(connection_information[2]));
            $("#FC5").attr('class', defineClass(connection_information[3]));
            $("#T7").attr('class', defineClass(connection_information[4]));
            $("#P7").attr('class', defineClass(connection_information[5]));
            $("#O1").attr('class', defineClass(connection_information[6]));
            $("#O2").attr('class', defineClass(connection_information[7]));
            $("#P8").attr('class', defineClass(connection_information[8]));
            $("#T8").attr('class', defineClass(connection_information[9]));
            $("#FC6").attr('class', defineClass(connection_information[10]));
            $("#F4").attr('class', defineClass(connection_information[11]));
            $("#F8").attr('class', defineClass(connection_information[12]));
            $("#AF4").attr('class', defineClass(connection_information[13]));
        });
    });
}, false);
