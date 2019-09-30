const path = require('path');
const express = require('express');
const app = express();

//Varable for current state [ button, x command, y command]
var state = ["","", ""];
//settings
app.set('port',process.env.PORT||3000);

//static files
st_path=path.join(__dirname,'public');
console.log(st_path);
app.use(express.static(st_path))

//start server
const server=app.listen(app.get('port'),() => {
    console.log('server on port', app.get('port'));
});

//websockets
const SocketIO = require('socket.io');
const io=SocketIO(server);

io.on('connection', (socket)=>{
    console.log('new connection',socket.id);
    
    //Raw data
    socket.on('joystick:button',(data)=>{
        state[0]=data;
    });
    socket.on('joystick:axes',(data)=>{
        //console.log(data);
    });

    //Command Data
    socket.on('commands:x',(data)=>{
        state[1]=data;
        console.log(state);
    });
    socket.on('commands:y',(data)=>{
        state[2]=data;
        console.log(state);
    });
    
});

