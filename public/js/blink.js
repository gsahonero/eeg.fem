const socket = io();

socket.on('connect', function () {
    socket.on('dev', function(data){
        let connection_information = data[2];
        let total = 0;
        for (let index = 0; index<=13; index=index+1){
            total = total + connection_information[index];
        }
        let avg = total/14/4*100;
        if (avg == 100){
            document.body.style.background = "#038C33";
        } else if ((avg < 100) && (avg >=75)){
            document.body.style.background = "#F2C53D";
        } else if (avg < 75){
            document.body.style.background = "#D94E41";
        }
    });
    console.log('Connected to server');
})