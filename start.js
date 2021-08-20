const WebSocket = require('ws');
const path = require('path');

// Requires:

const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');

var dir_path="";
var means_marker = [];
const express = require ('express');
const app = express();
var http = require('http').Server(app);
const port = 3000;
app.use(express.static('public'))
const server = http.listen(port, () => {
  console.log(`Server is running on port ${port}!`)
});

app.get('/socket.io-file-client.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

var io = require('socket.io')(http,{path:'/connection/eeg'});
var fs = require('fs');
const SocketIOFile = require('socket.io-file');
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


var experiment = "";
var id = "";
var on_record = false;
var duration = 0;
var record_name = "";
var on_wait = false;
var ready = false;
var writer;
var to_record_data = [];
var finished = true;
var number_of_step = 0;
var r_lat = false;
var lat = 0;

var state = ["","", ""];

/**
 * This class handle:
 *  - create websocket connection
 *  - handle request for : headset , request access, control headset ...
 *  - handle 2 main flows : sub and train flow
 *  - use async/await and Promise for request need to be run on sync
 */
class Cortex {
    constructor (user, socketUrl) {
        // create socket
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
        this.socket = new WebSocket(socketUrl)

        // read user infor
        this.user = user
    }

    queryHeadsetId(){
        const QUERY_HEADSET_ID = 2
        let socket = this.socket
        let queryHeadsetRequest =  {
            "jsonrpc": "2.0",
            "id": QUERY_HEADSET_ID,
            "method": "queryHeadsets",
            "params": {}
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(queryHeadsetRequest));
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==QUERY_HEADSET_ID){
                        // console.log(data)
                        // console.log(JSON.parse(data)['result'].length)
                        if(JSON.parse(data)['result'].length > 0){
                            let headsetId = JSON.parse(data)['result'][0]['id']
                            resolve(headsetId)
                        }
                        else{
                            console.log('No have any headset, please connect headset with your pc.')
                        }
                    }

                } catch (error) {}
            })
        })
    }

    requestAccess(){
        let socket = this.socket
        let user = this.user
        return new Promise(function(resolve, reject){
            const REQUEST_ACCESS_ID = 1
            let requestAccessRequest = {
                "jsonrpc": "2.0",
                "method": "requestAccess",
                "params": {
                    "clientId": user.clientId,
                    "clientSecret": user.clientSecret
                },
                "id": REQUEST_ACCESS_ID
            }

            // console.log('start send request: ',requestAccessRequest)
            socket.send(JSON.stringify(requestAccessRequest));

            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==REQUEST_ACCESS_ID){
                        resolve(data)
                    }
                } catch (error) {}
            })
        })
    }

    authorize(){
        let socket = this.socket
        let user = this.user
        return new Promise(function(resolve, reject){
            const AUTHORIZE_ID = 4
            let authorizeRequest = {
                "jsonrpc": "2.0", "method": "authorize",
                "params": {
                    "clientId": user.clientId,
                    "clientSecret": user.clientSecret,
                    "license": user.license,
                    "debit": user.debit
                },
                "id": AUTHORIZE_ID
            }
            socket.send(JSON.stringify(authorizeRequest))
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==AUTHORIZE_ID){
                        let cortexToken = JSON.parse(data)['result']['cortexToken']
                        resolve(cortexToken)
                    }
                } catch (error) {}
            })
        })
    }

    controlDevice(headsetId){
        let socket = this.socket
        const CONTROL_DEVICE_ID = 3
        let controlDeviceRequest = {
            "jsonrpc": "2.0",
            "id": CONTROL_DEVICE_ID,
            "method": "controlDevice",
            "params": {
                "command": "connect",
                "headset": headsetId
            }
        }
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(controlDeviceRequest));
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==CONTROL_DEVICE_ID){
                        resolve(data)
                    }
                } catch (error) {}
            })
        })
    }

    createSession(authToken, headsetId){
        let socket = this.socket
        const CREATE_SESSION_ID = 5
        let createSessionRequest = {
            "jsonrpc": "2.0",
            "id": CREATE_SESSION_ID,
            "method": "createSession",
            "params": {
                "cortexToken": authToken,
                "headset": headsetId,
                "status": "active"
            }
        }
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(createSessionRequest));
            socket.on('message', (data)=>{
                // console.log(data)
                try {
                    if(JSON.parse(data)['id']==CREATE_SESSION_ID){
                        let sessionId = JSON.parse(data)['result']['id']
                        resolve(sessionId)
                    }
                } catch (error) {}
            })
        })
    }

    startRecord(authToken, sessionId, recordName){
        let socket = this.socket
        const CREATE_RECORD_REQUEST_ID = 11

        let createRecordRequest = {
            "jsonrpc": "2.0",
            "method": "updateSession",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "status": "startRecord",
                "title": recordName,
                "description":"test_marker",
                "groupName": "QA"
            },
            "id": CREATE_RECORD_REQUEST_ID
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(createRecordRequest));
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==CREATE_RECORD_REQUEST_ID){
                        console.log('CREATE RECORD RESULT --------------------------------')
                        console.log(data)
                        resolve(data)
                    }
                } catch (error) {}
            })
        })
    }

    injectMarkerRequest(authToken, sessionId, label, value, port, time){
        let socket = this.socket
        const INJECT_MARKER_REQUEST_ID = 13
        let injectMarkerRequest = {
            "jsonrpc": "2.0",
            "id": INJECT_MARKER_REQUEST_ID,
            "method": "injectMarker",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "label": label,
                "value": value,
                "port": port,
                "time": time
            }
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(injectMarkerRequest));
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==INJECT_MARKER_REQUEST_ID){
                        console.log('INJECT MARKER RESULT --------------------------------')
                        console.log(data)
                        resolve(data)
                    }
                } catch (error) {}
            })
        })
    }

    stopRecord(authToken, sessionId, recordName){
        let socket = this.socket
        const STOP_RECORD_REQUEST_ID = 12
        let stopRecordRequest = {
            "jsonrpc": "2.0",
            "method": "updateSession",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "status": "stopRecord",
                "title": recordName,
                "description":"test_marker",
                "groupName": "QA"
            },
            "id": STOP_RECORD_REQUEST_ID
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(stopRecordRequest));
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==STOP_RECORD_REQUEST_ID){
                        console.log('STOP RECORD RESULT --------------------------------')
                        console.log(data)
                        resolve(data)
                    }
                } catch (error) {}
            })
        })
    }

    addMarker(){
        this.socket.on('open',async ()=>{
            await this.checkGrantAccessAndQuerySessionInfo()

            let recordName = 'test_marker'
            await this.startRecord(this.authToken, this.sessionId, recordName)


            let thisInjectMarker = this
            let numberOfMarker = 10
            for (let numMarker=0; numMarker<numberOfMarker; numMarker++){
                setTimeout(async function(){
                    // injectMarkerRequest(authToken, sessionId, label, value, port, time)
                    let markerLabel = "marker_number_" + numTrain
                    let markerTime = Date.now()
                    let marker = {
                        label:markerLabel,
                        value:"test",
                        port:"test",
                        time:markerTime
                    }

                    await thisInjectMarker.injectMarkerRequest( thisInjectMarker.authToken,
                                                                thisInjectMarker.sessionId,
                                                                marker.label,
                                                                marker.value,
                                                                marker.port,
                                                                marker.time)
                }, 3000)
            }

            await thisStopRecord.stopRecord(thisStopRecord.authToken, thisStopRecord.sessionId, recordName)
        })
    }

    subRequest(stream, authToken, sessionId){
        let socket = this.socket
        const SUB_REQUEST_ID = 6
        let subRequest = {
            "jsonrpc": "2.0",
            "method": "subscribe",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "streams": stream
            },
            "id": SUB_REQUEST_ID
        }
        console.log('sub eeg request: ', subRequest)
        socket.send(JSON.stringify(subRequest))
        socket.on('message', (data)=>{
            try {
              // to show:
                // if(JSON.parse(data)['id']==SUB_REQUEST_ID){
                    //console.log('SUB REQUEST RESULT --------------------------------')
                    //console.log(data)
                    //console.log('\r\n')
                // }
            } catch (error) {}
        })
    }

    mentalCommandActiveActionRequest(authToken, sessionId, profile, action){
        let socket = this.socket
        const MENTAL_COMMAND_ACTIVE_ACTION_ID = 10
        let mentalCommandActiveActionRequest = {
            "jsonrpc": "2.0",
            "method": "mentalCommandActiveAction",
            "params": {
              "cortexToken": authToken,
              "status": "set",
              "session": sessionId,
              "profile": profile,
              "actions": action
            },
            "id": MENTAL_COMMAND_ACTIVE_ACTION_ID
        }
        // console.log(mentalCommandActiveActionRequest)
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(mentalCommandActiveActionRequest))
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==MENTAL_COMMAND_ACTIVE_ACTION_ID){
                        console.log('MENTAL COMMAND ACTIVE ACTION RESULT --------------------')
                        console.log(data)
                        console.log('\r\n')
                        resolve(data)
                    }
                } catch (error) {
                }
            })
        })
    }

    /**
     * - query headset infor
     * - connect to headset with control device request
     * - authentication and get back auth token
     * - create session and get back session id
     */
    async querySessionInfo(){
        let headsetId=""
        await this.queryHeadsetId().then((headset)=>{headsetId = headset})
        this.headsetId = headsetId

        let ctResult=""
        await this.controlDevice(headsetId).then((result)=>{ctResult=result})
        this.ctResult = ctResult
        console.log(ctResult)

        let authToken=""
        await this.authorize().then((auth)=>{authToken = auth})
        this.authToken = authToken

        let sessionId = ""
        await this.createSession(authToken, headsetId).then((result)=>{sessionId=result})
        this.sessionId = sessionId

        console.log('HEADSET ID -----------------------------------')
        console.log(this.headsetId)
        console.log('\r\n')
        console.log('CONNECT STATUS -------------------------------')
        console.log(this.ctResult)
        console.log('\r\n')
        console.log('AUTH TOKEN -----------------------------------')
        console.log(this.authToken)
        console.log('\r\n')
        console.log('SESSION ID -----------------------------------')
        console.log(this.sessionId)
        console.log('\r\n')
    }

    /**
     * - check if user logined
     * - check if app is granted for access
     * - query session info to prepare for sub and train
     */
    async checkGrantAccessAndQuerySessionInfo(){
        let requestAccessResult = ""
        await this.requestAccess().then((result)=>{requestAccessResult=result})

        let accessGranted = JSON.parse(requestAccessResult)

        // check if user is logged in CortexUI
        if ("error" in accessGranted){
            console.log('You must login on CortexUI before request for grant access then rerun')
            throw new Error('You must login on CortexUI before request for grant access')
        }else{
            console.log(accessGranted['result']['message'])
            // console.log(accessGranted['result'])
            if(accessGranted['result']['accessGranted']){
                await this.querySessionInfo()
            }
            else{
                console.log('You must accept access request from this app on CortexUI then rerun')
                throw new Error('You must accept access request from this app on CortexUI')
            }
        }
    }

    /**
     *
     * - check login and grant access
     * - subcribe for stream
     * - logout data stream to console or file
     */
    sub(streams){
        this.socket.on('open',async ()=>{
            await this.checkGrantAccessAndQuerySessionInfo()
            this.subRequest(streams, this.authToken, this.sessionId)
            this.socket.on('message', (data)=>{
                // log stream data to file or console here
                var json_data=JSON.parse(data);
                io.sockets.emit('data',json_data.eeg);
                if (json_data.eeg !== undefined){
                  if (on_record){
                      json_data.eeg[18] = means_marker + "." + number_of_step;
                      if (r_lat){
                          json_data.eeg[19] = lat;
                        }else{
                          json_data.eeg[19] = number_of_step;
                      }
                      to_record_data[record_index] = json_data.eeg;
                      record_index = record_index + 1;
                  }
                }
                if (json_data.dev!== undefined){
                  io.sockets.emit('dev', json_data.dev);
                }
            })
        })
    }

    setupProfile(authToken, headsetId, profileName, status){
        const SETUP_PROFILE_ID = 7
        let setupProfileRequest = {
            "jsonrpc": "2.0",
            "method": "setupProfile",
            "params": {
              "cortexToken": authToken,
              "headset": headsetId,
              "profile": profileName,
              "status": status
            },
            "id": SETUP_PROFILE_ID
        }
        // console.log(setupProfileRequest)
        let socket = this.socket
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(setupProfileRequest));
            socket.on('message', (data)=>{
                if(status=='create'){
                    resolve(data)
                }

                try {
                    // console.log('inside setup profile', data)
                    if(JSON.parse(data)['id']==SETUP_PROFILE_ID){
                        if(JSON.parse(data)['result']['action']==status){
                            console.log('SETUP PROFILE -------------------------------------')
                            console.log(data)
                            console.log('\r\n')
                            resolve(data)
                        }
                    }

                } catch (error) {

                }

            })
        })
    }

    queryProfileRequest(authToken){
        const QUERY_PROFILE_ID = 9
        let queryProfileRequest = {
            "jsonrpc": "2.0",
            "method": "queryProfile",
            "params": {
              "cortexToken": authToken
            },
            "id": QUERY_PROFILE_ID
        }

        let socket = this.socket
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(queryProfileRequest))
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==QUERY_PROFILE_ID){
                        // console.log(data)
                        resolve(data)
                    }
                } catch (error) {

                }
            })
        })
    }

    /**
     *  - handle send training request
     *  - handle resolve for two difference status : start and accept
     */
    trainRequest(authToken, sessionId, action, status){
        const TRAINING_ID = 8
        const SUB_REQUEST_ID = 6
        let trainingRequest = {
            "jsonrpc": "2.0",
            "method": "training",
            "params": {
              "cortexToken": authToken,
              "detection": "mentalCommand",
              "session": sessionId,
              "action": action,
              "status": status
            },
            "id": TRAINING_ID
        }

        // console.log(trainingRequest)
        // each train take 8 seconds for complete
        console.log('YOU HAVE 8 SECONDS FOR THIS TRAIN')
        console.log('\r\n')

        let socket = this.socket
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(trainingRequest))
            socket.on('message', (data)=>{
                // console.log('inside training ', data)
                try {
                    if (JSON.parse(data)[id]==TRAINING_ID){
                        console.log(data)
                    }
                } catch (error) {}

                // incase status is start training, only resolve until see "MC_Succeeded"
                if (status == 'start'){
                    try {
                        if(JSON.parse(data)['sys'][1]=='MC_Succeeded'){
                            console.log('START TRAINING RESULT --------------------------------------')
                            console.log(data)
                            console.log('\r\n')
                            resolve(data)
                        }
                    } catch (error) {}
                }

                // incase status is accept training, only resolve until see "MC_Completed"
                if (status == 'accept'){
                    try {
                        if(JSON.parse(data)['sys'][1]=='MC_Completed'){
                            console.log('ACCEPT TRAINING RESULT --------------------------------------')
                            console.log(data)
                            console.log('\r\n')
                            resolve(data)
                        }
                    } catch (error) {}
                }
            })
        })
    }

    /**
     * - check login and grant access
     * - create profile if not yet exist
     * - load profile
     * - sub stream 'sys' for training
     * - train for actions, each action in number of time
     *
     */
    train(profileName, trainingActions, numberOfTrain){
        this.socket.on('open',async ()=>{

            console.log("start training flow")

            // check login and grant access
            await this.checkGrantAccessAndQuerySessionInfo()

            // to training need subcribe 'sys' stream
            this.subRequest(['sys'], this.authToken, this.sessionId)

            // create profile
            let status = "create";
            let createProfileResult = ""
            await this.setupProfile(this.authToken,
                                    this.headsetId,
                                    profileName, status).then((result)=>{createProfileResult=result})

            // load profile
            status = "load"
            let loadProfileResult = ""
            await this.setupProfile(this.authToken,
                                    this.headsetId,
                                    profileName, status).then((result)=>{loadProfileResult=result})

            // training all actions
            let self = this

            for (let trainingAction of trainingActions){
                for (let numTrain=0; numTrain<numberOfTrain; numTrain++){
                    // start training for 'neutral' action
                    console.log(`START TRAINING "${trainingAction}" TIME ${numTrain+1} ---------------`)
                    console.log('\r\n')
                    await self.trainRequest(self.authToken,
                                        self.sessionId,
                                        trainingAction,
                                        'start')

                    //
                    // FROM HERE USER HAVE 8 SECONDS TO TRAIN SPECIFIC ACTION
                    //


                    // accept 'neutral' result
                    console.log(`ACCEPT "${trainingAction}" TIME ${numTrain+1} --------------------`)
                    console.log('\r\n')
                    await self.trainRequest(self.authToken,
                                        self.sessionId,
                                        trainingAction,
                                        'accept')
                }

                let status = "save"
                let saveProfileResult = ""

                // save profile after train
                await self.setupProfile(self.authToken,
                                        self.headsetId,
                                        profileName, status)
                                        .then((result)=>{
                                            saveProfileResult=result
                                            console.log(`COMPLETED SAVE ${trainingAction} FOR ${profileName}`)
                                        })
            }
        })
    }

    /**
     *
     * - load profile which trained before
     * - sub 'com' stream (mental command)
     * - user think specific thing which used while training, for example 'push' action
     * - 'push' command should show up on mental command stream
     */
    live(profileName) {
        this.socket.on('open',async ()=>{

            await this.checkGrantAccessAndQuerySessionInfo()

            // load profile
            let loadProfileResult=""
            let status = "load"
            await this.setupProfile(this.authToken,
                                    this.headsetId,
                                    profileName,
                                    status).then((result)=>{loadProfileResult=result})
            console.log(loadProfileResult)

            // // sub 'com' stream and view live mode
            this.subRequest(['com'], this.authToken, this.sessionId)

            this.socket.on('message', (data)=>{
                console.log(data)
            })
        })
    }
}

// ---------------------------------------------------------
let socketUrl = 'wss://localhost:6868'
data = '';
let license = '',
    client_id = '',
    client_secret = '',
    debit = 10000;


let raw_file_data = fs.readFileSync('login.data');
let license_data = JSON.parse(raw_file_data);

license = license_data['license']
client_id = license_data['clientId'];
client_secret = license_data['clientSecret'];

let user = {
    "license": license,
    "clientId": client_id,
    "clientSecret": client_secret,
    "debit":10000
}

let c = new Cortex(user, socketUrl)


// Cols name:
const header = [
  "COUNTER",
  "INTERPOLATED",
  "AF3","F7","F3","FC5","T7","P7","O1","O2","P8","T8","FC6","F4","F8","AF4",
  "RAW_CQ","MARKER_HARDWARE","MARKERS","STEP"];

// ---------- sub data stream
// have six kind of stream data ['fac', 'pow', 'eeg', 'mot', 'met', 'com']
// user could sub one or many stream at once
let streams = ['eeg','dev']
c.sub(streams)

//read JSON
const userData = require('./public/json/users.json');
const experiments = require('./public/json/experiments.json');
const ML_exp = require('./public/json/ML_sec.json');

//define the directory path
const directoryPath = path.join(__dirname, 'Documents');

//const { SSL_OP_COOKIE_EXCHANGE } = require('constants');

////Find in JSON file
function userIden(userData, data){
    return userData.find(userIden => userIden.CI === data.CI);
}

var result = {'CI': 0};
var exp = {};
var exp_ ={};
var y_array = [0, 0, 0];
var y_class = [0, 0];
var mod = {'btn_ML': 0};
var py_server = 0;
var empezar = {'empezar': 0};
var y = 0;
var exp_ML = {};

/*
*   Instructions to be followed in case of receiving messages from the clients
*/
io.on('connect', function(socket){
    
    /* var uploader = new SocketIOFile(socket, {
		// uploadDir: {			// multiple directories
		// 	music: 'data/music',
		// 	document: 'data/document'
		// },
		uploadDir: 'public/data/'+experiment,							// simple directory
        
        // accepts: ['audio/mpeg', 'audio/mp3'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
		// maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit)
		chunkSize: 10240,							// default is 10240(1KB)
		transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
		overwrite: false, 							// overwrite file if exists, default is true.
		// rename: function(filename) {
		// 	var split = filename.split('.');	// split filename by .(extension)
		// 	var fname = split[0];	// filename without extension
		// 	var ext = split[1];

		// 	return `${fname}_${count++}.${ext}`;
		// }
    });
    console.log(uploader.options.uploadDir); */
    
    io.sockets.emit('py_server', {'py_server': py_server});
    io.sockets.emit('userId', result);          //Envia de antemano a todos los sockets
    io.sockets.emit('model_ML', mod);
    io.sockets.emit('pred', {'pred': y, 'first': 0})
    io.sockets.emit('start', empezar);
    io.sockets.emit('exp', exp);
    io.sockets.emit('experiment', exp_);
    io.sockets.emit('exp_ML', exp_ML);
    /* socket.on('filter', (data) => {
        io.sockets.emit('filter', data);
        console.log(data.theta)
    }); */

    socket.on('start', (data) =>{
        empezar = data;
        console.log(empezar);
        io.sockets.emit('start', empezar);
    });
    //Recibe y_predict de python
    socket.on('y_predict', function(data){
        if (data.first == 1){
            console.log(data.y_predict)
            y_array[0] = data.y_predict
            y_array[1] = data.y_predict
            y_array[2] = data.y_predict
            if (data.y_predict == 1){
                means_marker = "music_1";
            }else if (data.y_predict == 2){
                means_marker = "aurosal_1"
            }
            io.sockets.emit('pred', {'marker': means_marker});        
        }else if(data.first == 0){
            if (data.y_predict[0] != 3){
                y_array[0] = y_array[1];
                y_array[1] = y_array[2];
                y_array[2] = data.y_predict[0];
                y_class = [0, 0];
                for (i=0; i < y_array.length; i++){
                    if (y_array[i] == 1){
                        y_class[0] += 1; 
                    }else if (y_array[i] == 2){
                        y_class[1] += 1;
                    }
                }
                var max = Math.max(...y_class);
                var y = y_class.indexOf(max) + 1;
                if (y == 1){
                    means_marker = "music";
                }else if (y == 2){
                    means_marker = "aurosal"
                }
                lat = Date.now()-data.lat;
                io.sockets.emit('pred', {'pred': y, 'first': 0, 'lat': lat, 'marker': means_marker});
            }else if(data.y_predict == 3){
                y = 3;
                means_marker = "blink"
                lat = Date.now()-data.lat;
                io.sockets.emit('pred', {'pred': y, 'first': 0, 'lat': lat, 'marker': means_marker});
            };
        };
    });
    
    socket.on('userCI', function(data) {
        result = userIden(userData, data);
        console.log(result);
        if(result){                             //Si no hay el usuario en JSON, no envia nada
            io.sockets.emit('userId', result);  //Emite la informacion del usuario.
            exp_ML = ML_exp[result.ML_start[0]-1];
            io.sockets.emit('exp_ML', exp_ML);
            user_CI = result.CI;
        }else{
            result = {};                        //Si el usuario ingresa el CI y no esta envia undefined
            io.sockets.emit('userId', result);  //Emite la informacion del usuario.
        }
    });

    socket.on('button_exp', (data) =>{
        exp = data.experiment;
        io.sockets.emit('exp', exp);
        exp_ = experiments[data.experiment-1];
        io.sockets.emit('experiment', exp_);
    });

    socket.on('button_ML', function(data) {
        mod = data;
        console.log(mod);
        io.sockets.emit('model_ML', mod);
        model_num = mod.btn_ML;
    });

    socket.on('song_ML', (data) =>{
        song_ml = data;
        io.sockets.emit('song_ML', song_ml);
    });

    socket.on('sub_experiment', (data) => {
        console.log(data);
        io.sockets.emit('sub_experiment', data);
    });
    //Command sec
    socket.on('ML_sec', function(code){
        //console.log('Recive: ',code);
        let func = code.command;
        let args = code.args;
        /*
        * If the command read is'experiment', it recognizes the experiment and
        * starts recording data
        */
        if (func === "start"){
                number_of_step = 'start';
                finished = false;
                console.log('Recognized experiment');
                experiment = args;
                io.emit('ML_sec','ready');
                // we record as soon as we have the experiment defined
                on_record = true;
                to_record_data=[];
                console.log('Starting to record');
                record_index = 0;
                r_lat = true
                io.emit('start', {'empezar': 1}); // Emite start el python
        }
        /*
        * If the command read is 'beep', it increases the number of step, sends a confirmation message,
        * and sends  a message of beep with args to generate beep
        */
        else if (func === "beep"){
            number_of_step = 'beep';
            //console.log('Recognized beep '+args)
            // send signal to beep
            let first_arg = args.split(',')[0];
            let second_arg = args.split(',')[1];
            io.emit('beep_next', {'step': second_arg});
            if (second_arg !== undefined){
                number_of_step = second_arg;
            }
            io.emit('beep',parseInt(args,10))
            setTimeout(function(){
                io.emit('ML_sec','ready');
            }, parseInt(args, 10)+20);
        }
        
        else if (func === "play"){
            number_of_step = number_of_step + 1;
            means_marker = "play";
            //console.log('Recognized play '+args)
            io.emit('play','./data/Musical/'+args);
            io.emit('ML_sec','ready');
        }
        /*
        * If the command read is 'wait', it increases the number of step, and after that sends a
        * confirmation message when the time shown in args elapsed.
        */
        else if (func === "wait"){
                number_of_step = 'wait';
                //console.log('Recognized wait '+args)
                if (args!== undefined){
                    let first_arg = args.split(',')[0];
                    let second_arg = args.split(',')[1];
                    if (second_arg !== undefined){
                        number_of_step = second_arg;
                    }
                    //console.log('Waiting more than zero with '+first_arg+" and "+second_arg);
                    setTimeout(function(){
                        io.emit('ML_sec','ready');
                    },first_arg);
                }else{
                    io.emit('ML_sec','ready');
                }
        }
        /*
        * If the command read is 'finish', it restart the number of step, saves a .csv document on
        * the experiment/id folder with the date information on its name.
        */
        else if (func === "finish"){
                number_of_step = 'finish';
                io.emit('start', {'empezar': 0});
                if (finished == false){
                    finished = true;
                    means_marker = "finish";
                    on_record = false;
                    //io.emit('command','ready');
                    console.log(to_record_data.length);
                    let csvData = convertArrayToCSV(to_record_data, {
                      header,
                      separator: ','
                    });
                    var currentDate = new Date();
                    var date = currentDate.getDate();
                    var month = currentDate.getMonth() + 1;
                    var year = currentDate.getFullYear();
                    var hour = currentDate.getHours();
                    var minute = currentDate.getMinutes();
                    var dateString = year + "_" + month + "_" + date + "_" + hour + "_" + minute;
                    fs.writeFile('./public/data/Musical/'+user_CI+'/data_ML_predict/'+model_num+'/'+dateString+'.csv', csvData, {
                        "encoding": 'utf8',
                        "flag": 'a+'
                        }, function (err) {
                          if (err) {
                            console.log('Some error occured - file either not saved or corrupted file saved.');
                            io.emit('error');
                          } else{
                            console.log('Data was saved correctly.');
                          }
                        }
                    );
                    console.log('Finished recording.');
                }else{
                    console.log('Recording was already finished.');
                }
        }else{
            number_of_step = -10;
            console.log('command not recognized.');
        }
        io.sockets.emit('number_of', {'number_of': number_of_step});
    });
    //Terminate the process in NodeJS and Python
    socket.on('finish', (data) => {
        if(data == 'true'){
            io.sockets.emit('py_server', {'py_server': 1});
            process.exit();
        }
    });

    socket.on('file_reader_ci', function(data){
        
    })
	/* uploader.on('start', (fileInfo) => {
		console.log('Start uploading');
		console.log("THIS IS THE UPLOADER",uploader);
	}); */

	/* uploader.on('stream', (fileInfo) => {
		console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
	}); */

	/* uploader.on('complete', (fileInfo) => {
		console.log('Upload Complete.');
        console.log(fileInfo);
        console.log(experiment," / ",id);
	}); */

	/* uploader.on('error', (err) => {
		console.log('Error!', err);
	}); */

	/* uploader.on('abort', (fileInfo) => {
		console.log('Aborted: ', fileInfo);
	}); */ 
    
    /*
    *   When it receives the 'command' instruction, it responds depending on the command read 
    */
    socket.on('command', function(code){
        console.log('Recive: ',code);
        let func = code.command;
        let args = code.args;
        /*
        * If the command read is'experiment', it recognizes the experiment and
        * starts recording data
        */
        if (func === "experiment"){
            number_of_step = number_of_step + 1;
            finished = false;
            console.log('Recognized experiment '+args)
            experiment = args;
            io.emit('command','ready');
            // we record as soon as we have the experiment defined
            on_record = true;
            to_record_data=[];
            console.log('Starting to record');
            record_index = 0;
        }
        /*
        * If the command read is'id', it saves the id of the subject, sends a confirmation message,
        * and creates a folder with the experiment/id
        */
        else if (func === "id"){
            number_of_step = number_of_step + 1;
            console.log('Recognized ID '+id)
            id = args;
            io.emit('command','ready');
            fs.mkdir('./public/data/'+experiment+'/'+id,{recursive: true} ,function(err){
                //if(err){
                console.log('Error while creating folder for id:'+id+'. Error:'+err);   
                //}
            });
        }
        /*
        * If the command read is'record', it doesnt do anything
        */
        else if (func === "record"){
            // deprecated
        }
        /*
        * If the command read is 'beep', it increases the number of step, sends a confirmation message,
        * and sends  a message of beep with args to generate beep
        */
        else if (func === "beep"){
            number_of_step = number_of_step + 1;
            means_marker = "beep";
            console.log('Recognized beep '+args)
            io.emit('beep',parseInt(args,10))
            // send signal to beep
            setTimeout(function(){
                io.emit('command','ready');
            }, parseInt(args, 10)+20);
        }
        /*
        * If the command read is 'present', it increases the number of step, sends a present instruction with 
        * the folder direction of the image to be shown, and after that sends a confirmation message.
        */
        else if (func === "present"){
            number_of_step = number_of_step + 1;
            means_marker = "present";
            console.log('Recognized present '+args)
            console.log(means_marker);
            io.emit('present','./data/'+experiment+'/'+args);
            // send signal to present image
            io.emit('command','ready');
        }
        /*
        * If the command read is 'clear', it increases the number of step, sends a clear instruction,
        * and after that sends a confirmation message.
        */
        else if (func === "clear"){
            number_of_step = number_of_step + 1;
            means_marker = "cleared";
            console.log('Recognized clear '+args)
            io.emit('clear',args);
            io.emit('command','ready');
        /*
        * If the command read is 'play', it increases the number of step, sends a play instruction, and after that sends a confirmation message.
        */
        }
        
        else if (func === "play"){
            number_of_step = number_of_step + 1;
            means_marker = "play";
            console.log('Recognized play '+args)
            io.emit('play','./data/'+experiment+'/'+args);
            io.emit('command','ready');
        }
        /*
        * If the command read is 'wait', it increases the number of step, and after that sends a
        * confirmation message when the time shown in args elapsed.
        */
        else if (func === "wait"){
            number_of_step = number_of_step + 1;
            means_marker = "wait";
            console.log('Recognized wait '+args)
            if (args!== undefined){
                let first_arg = args.split(',')[0];
                let second_arg = args.split(',')[1];
                if (second_arg !== undefined){
                    means_marker = second_arg
                }
                console.log('Waiting more than zero with '+first_arg+" and "+second_arg);
                setTimeout(function(){
                    io.emit('command','ready');
                },first_arg);
            }else{
                io.emit('command','ready');
            }
        }
        /*
        * If the command read is 'ball', it increases the number of step, sends an instruction with 
        * an object that contains the args , and after that sends a confirmation message.
        */
        else if (func === "ball"){
            number_of_step = number_of_step + 1;
            means_marker = "ball";
            console.log('Recognized ball ' + args)
            let arg = {};
            arg.orientation = args.split(',')[0];
            arg.duration = args.split(',')[1];
            io.emit('ball', arg);
            console.log(arg);
            setTimeout(function(){
                io.emit('command','ready');
            }, arg.duration);
        }
        /*
        * If the command read is 'finish', it restart the number of step, saves a .csv document on
        * the experiment/id folder with the date information on its name.
        */
        else if (func === "finish"){
            number_of_step = 0;
            if (finished == false){
                finished = true;
                means_marker = "finish";
                on_record = false;
                //io.emit('command','ready');
                console.log(to_record_data.length);
                let csvData = convertArrayToCSV(to_record_data, {
                  header,
                  separator: ','
                });
                var currentDate = new Date();
                var date = currentDate.getDate();
                var month = currentDate.getMonth() + 1;
                var year = currentDate.getFullYear();
                var hour = currentDate.getHours();
                var minute = currentDate.getMinutes();
                var dateString = year + "_" + month + "_" + date + "_" + hour + "_" + minute;
                fs.writeFile('./public/data/'+experiment+'/'+id+'/'+dateString+'.csv', csvData, {
                    "encoding": 'utf8',
                    "flag": 'a+'
                    }, function (err) {
                      if (err) {
                        console.log('Some error occured - file either not saved or corrupted file saved.');
                        io.emit('error');
                      } else{
                        console.log('Data was saved correctly.');
                        io.emit('finish');
                      }
                    }
                );
                console.log('Finished recording.');
            }else{
                console.log('Recording was already finished.');
            }
        }else{
            number_of_step = -10;
            console.log('command not recognized.');
        }
    });

    /*
    * When the instruction 'audio_files' is received , it broadcasts the info to the clients, or sends a message
    */
    //socket.on('media_files',(data)=>{
        /*
            Reads the list of files in an specified path
        */
        /* let missing=[];
        fs.readdir(dir_path, function(err, items) {
            console.log("Look for this data",data);
            data.forEach(element => {
               console.log(element.name);
               let found= items.find(dir_file => dir_file==element.name)
               if(found == null)
               {
                   missing.push(element.name);
                   console.log("Not Found: ", element.name);
               }else{
                   console.log("Found: ", element.name);
               }
            });
            if (missing.length > 0){
                console.log("List of missing files", missing);
            }else{
                console.log("Everything was found");
                socket.broadcast.emit('media_files',data);
            }
            socket.emit('missing',missing);
            
        });
        
    }) */
    /*
    * When the instruction 'folder' is received , it broadcasts the message to the clients
    */
    /* socket.on('folder',(data)=>{
        socket.broadcast.emit('folder','./data/'+data);
        experiment = data; 
        dir_path='./public/data/'+experiment;

        console.log("The experiment is:", experiment);
        fs.mkdir(dir_path,{recursive: true} ,function(err){
            if(err){
                console.log('Error while creating folder for id:'+id+'. Error:'+err);   
            }
            else{
                console.log('Created folder: '+dir_path);
            }
        });
        uploader.options.uploadDir = dir_path; 
    }) */

    /*
    * Actions of the joystick are saved on state
    */
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