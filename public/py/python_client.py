from pickle import dumps
from numpy.lib.npyio import loads
import socketio
import numpy as np
import joblib as jb
from filter import param, filtro_zero

empezar = False
disc = 0
yPred = 0

electrodes = np.zeros((40, 14))
e_th = np.zeros((14, 1))
e_al = np.ones((14, 1))
e_be = np.ones((14, 1))

N = 6
fs = 256
a_th, b_th, z_th = param(N=N, Wn=[4, 7], fs=fs)
a_al, b_al, z_al = param(N=N, Wn=[8, 12], fs=fs)
a_be, b_be, z_be = param(N=N, Wn=[12, 30], fs=fs)

x = np.zeros((1, 2689))
jump = 16

sio = socketio.Client()
#reconnection=True, reconnection_attempts=2, reconnection_delay=0, reconnection_delay_max=0,
#                        randomization_factor=0.1, logger=True
#logger=True, engineio_logger=True, ssl_verify=False

@sio.event
def connect():
    print('connection established')

@sio.on('py_server')
def server_py(data):
    global disc
    disc = data['py_server']
    print('disc: ',disc)
    if disc == 1:
        disconnect()

@sio.on('userId')
def user_id(data):
    global CI
    if data['CI'] != 0:
        CI = data['CI']
        print('CI: ', CI)

@sio.on('model_ML')
def md_ML(data):
    global model, mod, CI
    if data['btn_ML'] != 0:
        model = data['btn_ML']
        mod = jb.load('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/ML model/'+str(model))
        print('model: ', model)

@sio.on('start')
def run_ML(data):
    global empezar
    empezar = data['empezar']
    print('empezar: ',empezar)

@sio.on('pred')
def yprediction(data):
    global yPred
    yPred = data['pred']
    #print('yPred: ',yPred)

@sio.on('data')
def action(data):
    global empezar, electrodes, a_th, b_th, a_al, b_al, a_be, b_be, e_th, e_al, e_be, x, jump, yPred, disc
    if disc == 1:
        disconnect()
    if empezar == 1:
        if((data is not None) == True):
            for i in range(electrodes.shape[0] - 1):
                electrodes[i, :] = electrodes[i + 1, :]
            electrodes[electrodes.shape[0] - 1, :] = data[2:16]
            if np.mean(electrodes[0, :]) != 0:
                theta, alpha, beta = filtro_zero(x_1=electrodes, a_th=a_th, b_th=b_th,
                                                a_al=a_al, b_al=b_al, a_be=a_be, b_be=b_be)
                e_th[:, 0] = theta[theta.shape[1] - 1, :]
                e_al[:, 0] = alpha[alpha.shape[1] - 1, :]
                e_be[:, 0] = beta[beta.shape[1] - 1, :]
            ##    sio.emit('filter', {'theta': e_th.tolist(), 'alpha': e_al.tolist(), 'beta': e_be.tolist()})
            for j in range(x.shape[1]-42):
                x[:, j] = x[:, j+42]
                
            x[0, 2674:2688] = e_be[:, 0]
            x[0, 2660:2674] = e_al[:, 0]
            x[0, 2646:2660] = e_th[:, 0]

            if x[0, 0] != 0:
                x[0, x.shape[1]-1] = yPred
                y = mod.predict(x)
                #print('y: ',y)
                sio.emit('y_predict', {'y_predict': y.tolist(), 'first': 0})

@sio.event
def disconnect():
    global disc
    if disc == 1:
        print('disconnected from server')
        sio.disconnect()

sio.connect('http://localhost:3000', transports='websocket', socketio_path='/connection/eeg')
sio.wait()