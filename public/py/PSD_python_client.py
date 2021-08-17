from pickle import dumps
from numpy.lib.npyio import loads
import socketio
import numpy as np
import joblib as jb
import time
from filter import param, filtro_zero

empezar = False
disc = 0
yPred = 0
first = 0

electrodes = np.zeros((64, 14))
e_th = np.zeros((14, 1))
e_al = np.ones((14, 1))
e_be = np.ones((14, 1))

N = 6
fs = 256
a_th, b_th, z_th = param(N=N, Wn=[4, 7], fs=fs)
a_al, b_al, z_al = param(N=N, Wn=[8, 12], fs=fs)
a_be, b_be, z_be = param(N=N, Wn=[12, 30], fs=fs)

x_prev = np.zeros((14*3, 64)) ##
x = np.zeros((1, (14*3*6)+1)) ## (14 canales * 3 filtros * 6 propiedades de la señal) + 1 y_prev
jump = 0

lat = 0

prev_tim1 = 0

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
        """ mod = jb.load('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/ML model/'+str(model)) """
        print('model: ', model)

@sio.on('start')
def run_ML(data):
    global empezar
    empezar = data['empezar']
    print('empezar: ',empezar)

@sio.on('pred')
def yprediction(data):
    global yPred, first
    yPred = data['pred']
    first = data['first']

@sio.on('data')
def action(data):
    global empezar, electrodes, a_th, b_th, a_al, b_al, a_be, b_be, e_th, e_al, e_be, x, jump, yPred, disc, y_save, prev_tim1, prev_tim2, prev_tim3, prev_tim4, prev_tim5, prev_tim6
    prev_tim1 = int(time.time()*1000)
    if disc == 1:
        disconnect()
    if empezar == 1 and first == 0:
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
                
                for j in range(x_prev.shape[1]-1):  #42 corresponde al numero de electrodos 14 canales *3 filtros 
                    x_prev[:, j] = x_prev[:, j+1]

                x_prev[0:  14, :]   = e_be[:, 0]
                x_prev[14: 28, :]   = e_al[:, 0]
                x_prev[28: , :]   = e_th[:, 0]

                l = 0
                for k in range(14*3):
                    x[0, l] = np.amax   (x_prev[:, k]) #Maximo valor en x
                    x[0, l+1] = np.amin (x_prev[:, k])
                    x[0, l+2] = np.amax (x_prev[:, k])-np.amin(x_prev[:, k])
                    x[0, l+3] = np.mean (x_prev[:, k])
                    x[0, l+4] = np.sum  (np.power(x_prev[:, k], 2))/((64*1000)/256)
                    x[0, l+5] = np.sum  (np.power(x_prev[:, k], 2))
                    l += 6

                if np.mean(x[0, :]) != 0 and jump >= 16:   #Cuando la matriz ya este llena #Jump toma en cuenta 16 datos
                    x[0, x.shape[1]-1] = yPred
                    y = mod.predict(x)              
                    sio.emit('y_predict', {'y_predict': y.tolist(), 'first': 0, 'lat': prev_tim1})
                    jump = 0
                else:
                    jump += 1
    elif first == 3:
        empezar = 0
 
@sio.event
def disconnect():
    global disc
    if disc == 1:
        print('disconnected from server')
        sio.disconnect()

sio.connect('http://localhost:3000', transports='websocket', socketio_path='/connection/eeg')
sio.wait()