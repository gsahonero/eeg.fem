from pickle import dumps
from numpy.lib.npyio import loads
import socketio
import numpy as np
from sklearn.decomposition import PCA
import joblib as jb
import time
from filter import param, filtro_zero

empezar = False

disc = 0
yPred = 0
first = 0

model = ''

N = 6
fs = 256
a_th, b_th, z_th = param(N=N, Wn=[4, 7], fs=fs)
a_al, b_al, z_al = param(N=N, Wn=[8, 12], fs=fs)
a_be, b_be, z_be = param(N=N, Wn=[12, 30], fs=fs)

jump = 0

lat = 0

prev_tim1 = 0

sio = socketio.Client()
pca = PCA(n_components=10, svd_solver='randomized', random_state=21)

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
    global CI, x_scaled
    if data['CI'] != 0:
        CI = data['CI']
        x_scaled = np.genfromtxt('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/data_for_train/ALL_3C_64_scaled.csv',dtype=float,delimiter=',')
        print('CI: ', CI)

@sio.on('model_ML')
def md_ML(data):
    global model, mod, CI, electrodes, x, pca, fil_max_min, x_scaled
    if data['btn_ML'] != 0:
        model = data['btn_ML']
        mod = jb.load('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/ML_models/'+str(model))
        if model == 'Model_Linear_64' or model == 'Model_RBF_64':
            x = np.zeros((1, (14*3*64)+1)) ## (14 canales * 3 filtros * 64 datos) + 1 y_prev
            electrodes = np.zeros((64, 14))
        elif model == 'Model_Linear_128' or model == 'Model_RBF_128':
            x = np.zeros((1, (14*3*128)+1)) ## (14 canales * 3 filtros * 128 datos) + 1 y_prev
            electrodes = np.zeros((128, 14))
        elif model == 'Model_Linear_PSD_64' or model == 'Model_RBF_PSD_64':
            x = np.zeros((1, (14*3*6)+1)) ## (14 canales * 3 filtros * 6 propiedades) + 1 y_prev
            electrodes = np.zeros((64, 14))
        elif model == 'Model_Linear_PCA_64' or model == 'Model_RBF_PCA_64':
            x = np.zeros((1,11)) ## ((14 canales * 3 filtros * 64 datos)/ 3 por PCA) + 1 y_prev
            electrodes = np.zeros((64, 14))
            fil_max_min = np.genfromtxt('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/ML_models/fil_max_min.csv',dtype=float,delimiter=',')
            pca.fit(x_scaled)
    print(model)

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
    global empezar, electrodes, a_th, b_th, a_al, b_al, a_be, b_be, e_th, e_al, e_be, x, jump, yPred, disc, prev_tim1, model, x, pca, fil_max_min
    prev_tim1 = int(time.time()*1000)
    if empezar == 1 and first == 0:
        if((data is not None) == True):
            for i in range(electrodes.shape[0] - 1):
                electrodes[i, :] = electrodes[i + 1, :]
            electrodes[electrodes.shape[0] - 1, :] = data[2:16]
            if np.mean(electrodes[0, :]) != 0:
                theta, alpha, beta = filtro_zero(x_1=electrodes, a_th=a_th, b_th=b_th,
                                                a_al=a_al, b_al=b_al, a_be=a_be, b_be=b_be)
                x_prev = np.insert(theta, theta.shape[1], alpha.T, axis=1)
                x_prev = np.insert(x_prev, x_prev.shape[1], beta.T, axis=1)
                if model == 'Model_Linear_64' or model == 'Model_RBF_64' or model == 'Model_Linear_128' or model == 'Model_RBF_128':
                    x[0, :-1] = x_prev.flatten()
                elif model == 'Model_Linear_PSD_64' or model == 'Model_RBF_PSD_64':
                    idx = 0
                    for feat in range (x_prev.shape[1]):
                        x[0, idx] = np.amax(x_prev[:, feat])
                        x[0, idx+1] = np.amin(x_prev[:, feat])
                        x[0, idx+2] = np.amax(x_prev[:, feat])-np.amin(x_prev[:, feat])
                        x[0, idx+3] = np.mean(x_prev[:, feat])
                        x[0, idx+4] = np.sum(np.power(x_prev[:, feat], 2)/((64*1000)/256))
                        x[0, idx+5] = np.sum(np.power(x_prev[:, feat], 2))
                        idx += 6
                elif model == 'Model_Linear_PCA_64' or model == 'Model_RBF_PCA_64':
                    x_prev = np.insert(theta, theta.shape[1], alpha.T, axis=1)
                    x_prev = np.insert(x_prev, x_prev.shape[1], beta.T, axis=1)
                    k = 0
                    max_min = 0
                    for i in range(3):
                        for j in range(14):
                            x_prev[:, k] = (x_prev[:, k] - fil_max_min[j, max_min+1])/(fil_max_min[j, max_min] - fil_max_min[j, max_min+1])
                            k += 1
                        max_min += 2
                    x_prev_pca = x_prev.flatten().reshape(1, -1)
                    x[0, :-1] = pca.transform(x_prev_pca)

                x[0, x.shape[1]-1] = yPred
                if jump >= 16:   ## Jump toma en cuenta 16 datos
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