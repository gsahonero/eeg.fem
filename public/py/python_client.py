import socketio
import numpy as np
from sklearn.decomposition import PCA
import joblib as jb
from filter import param, filtro_zero

sio = socketio.Client()

N = 6
fs = 256
a_th, b_th, z_th = param(N=N, Wn=[4, 7], fs=fs)
a_al, b_al, z_al = param(N=N, Wn=[8, 12], fs=fs)
a_be, b_be, z_be = param(N=N, Wn=[12, 30], fs=fs)

pca = PCA(n_components=10, svd_solver='randomized', random_state=21)

@sio.event
def connect():
    print('connection established')

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
        elif model == 'Model_Linear_128' or model == 'Model_RBF_128':
            x = np.zeros((1, (14*3*128)+1)) ## (14 canales * 3 filtros * 128 datos) + 1 y_prev
        elif model == 'Model_Linear_PSD_64' or model == 'Model_RBF_PSD_64':
            x = np.zeros((1, (14*3*6)+1)) ## (14 canales * 3 filtros * 6 propiedades) + 1 y_prev
        elif model == 'Model_Linear_PCA_64' or model == 'Model_RBF_PCA_64':
            x = np.zeros((1,11)) ## ((14 canales * 3 filtros * 64 datos)/ 3 por PCA) + 1 y_prev
            fil_max_min = np.genfromtxt('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/ML_models/fil_max_min.csv',dtype=float,delimiter=',')
            pca.fit(x_scaled)
    print(model)

@sio.on('y_init')
def y_init(data):
    global y_array, id_prev, yPred
    y_array = np.ones((1, 3))*data['y_init']
    id_prev = -1
    yPred = data['y_init']
    print(data['y_init'])
    
@sio.on('data_w')
def action(data):
    global a_th, a_al, a_be, b_th, b_al, b_be, y_array, x, mod, model, pca, fil_max_min, x_scaled, yPred, id_prev
    if(data is not None):
        electrodes = np.array(data['data_w']).astype(float)
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
        y_pred = mod.predict(x)
        if(y_pred == 1 or y_pred == 2):
            for i in range (y_array.shape[1]-1):
                y_array[:,i] = y_array[:,i+1]
            y_array[:,y_array.shape[1]-1] = y_pred
            occur_1 = np.count_nonzero(y_array == 1)
            occur_2 = np.count_nonzero(y_array == 2)
            if occur_1 > occur_2:
                y = 1
            elif occur_2 > occur_1:
                y = 2
        elif y_pred == 3:
            y = 3
        sio.emit('y_predict', {'data': electrodes.flatten().tolist(), 'y_prev': yPred, 'y': y, 'id_num': data['id_num'], 'id_prev': id_prev, 'lat': data['lat']})
        yPred = y
        id_prev = data['id_num']

@sio.event
def disconnect():
    print('disconnected from server')
    sio.disconnect()

sio.connect('http://localhost:3000', transports='websocket', socketio_path='/connection/eeg')
sio.wait()