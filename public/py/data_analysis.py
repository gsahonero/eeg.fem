import socketio
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from filter import param, filtro_zero

sio = socketio.Client()

N = 6
fs = 256
a_th, b_th, z_th = param(N=N, Wn=[4, 7], fs=fs)
a_al, b_al, z_al = param(N=N, Wn=[8, 12], fs=fs)
a_be, b_be, z_be = param(N=N, Wn=[12, 30], fs=fs)

pca = PCA(n_components=10, svd_solver='randomized', random_state=21)

def data_load(CI, model, files):
    df = np.array(pd.read_csv('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/data_ML_predict/'+str(model)+'/'+str(files), delimiter=',', dtype=None, header=None))
    df = df[(df[:,-1] == df[:,-1])] ## Eliminamos los nan de tipo float
    pred_tot = df.shape[0]
    print(f'pred_tot: {pred_tot}')
    return df, pred_tot

def data_keep(df):
    df_good = df[(df[:, -4] == 'music') | (df[:, -4] == 'aurosal')]
    pred_keep = df_good.shape[0]
    print(f'pred_keep: {pred_keep}')
    return df_good, pred_keep

def total_accuracy(df_good):
    tot_acc = np.empty((1,4))
    df_acc = df_good[((df_good[:, -4] == 'music') & (df_good[:, -5] == 1)) | ((df_good[:, -4] == 'aurosal') & (df_good[:, -5] == 2))]
    tot_acc[0, 0] = (df_acc.shape[0]/df_good.shape[0])*100
    tot_acc[0, 1] = df_acc.shape[0]
    df_blink = df_good[(df_good[:, -5] == 3)]
    tot_acc[0, 2] = df_blink.shape[0]
    tot_acc[0, 3] = df_good.shape[0]
    print(f'tot_acc: {tot_acc}')
    return df_acc, tot_acc

def part_accuracy(df_good, part, part_id):
    part_acc = np.empty((1,3))
    df_part = df_good[df_good[:, -4] ==  part]
    part_acc[0,0] = np.count_nonzero(df_part[:, -5] == part_id)
    part_acc[0,1] = np.count_nonzero(df_part[:, -5] == 3)
    part_acc[0,2] = df_part.shape[0]
    part_acc_tot = (part_acc[0,0]/df_part.shape[0])*100
    print(f'pred_{part}: {part_acc_tot}')
    print(f'pred_{part}_num: {part_acc}')
    return df_part, part_acc_tot, part_acc

def latency(df):
    return np.mean(df[:,-1]), np.max(df[:,-1]), np.min(df[:,-1])

def model_config(df_good, model):
    if model == 'Model_Linear_64' or model == 'Model_RBF_64':
        x = np.zeros((df_good.shape[0], (14*3*64)+1)) ## (14 canales * 3 filtros * 64 datos) + 1 y_prev
        win = 64
        fil_max_min = 0
        pca = 0
    elif model == 'Model_Linear_128' or model == 'Model_RBF_128':
        x = np.zeros((df_good.shape[0], (14*3*128)+1)) ## (14 canales * 3 filtros * 128 datos) + 1 y_prev
        win = 128
        fil_max_min = 0
        pca = 0
    elif model == 'Model_Linear_PSD_64' or model == 'Model_RBF_PSD_64':
        x = np.zeros((df_good.shape[0], (14*3*6)+1)) ## (14 canales * 3 filtros * 6 propiedades) + 1 y_prev
        win = 64
        fil_max_min = 0
        pca = 0
    elif model == 'Model_Linear_PCA_64' or model == 'Model_RBF_PCA_64':
        x = np.zeros((df_good.shape[0],11)) ## ((14 canales * 3 filtros * 64 datos)/ 3 por PCA) + 1 y_prev
        fil_max_min = np.genfromtxt('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/ML_models/fil_max_min.csv',dtype=float,delimiter=',')
        pca.fit(x_scaled)
        win = 64
    return x, win, fil_max_min, pca

def data_prep(x, df_good, win, a_th, a_al, a_be, b_th, b_al, b_be, model, fil_max_min, pca):
    x_raw = df_good[:,0:-6]
    for q in range(df_good.shape[0]):
        x_line = np.empty((win,14))
        for k in range(int(x_raw.shape[1]/14)):
            x_line[k,:] = x_raw[0,(k*14):(k*14)+14]
        theta, alpha, beta = filtro_zero(x_1=x_line, a_th=a_th, b_th=b_th,
                                        a_al=a_al, b_al=b_al, a_be=a_be, b_be=b_be)
        x_prev = np.insert(theta, theta.shape[1], alpha.T, axis=1)
        x_prev = np.insert(x_prev, x_prev.shape[1], beta.T, axis=1)
        if model == 'Model_Linear_64' or model == 'Model_RBF_64' or model == 'Model_Linear_128' or model == 'Model_RBF_128':
            x[q, :-1] = x_prev.flatten()
        elif model == 'Model_Linear_PSD_64' or model == 'Model_RBF_PSD_64':
            idx = 0
            for feat in range (x_prev.shape[1]):
                x[q, idx] = np.amax(x_prev[:, feat])
                x[q, idx+1] = np.amin(x_prev[:, feat])
                x[q, idx+2] = np.amax(x_prev[:, feat])-np.amin(x_prev[:, feat])
                x[q, idx+3] = np.mean(x_prev[:, feat])
                x[q, idx+4] = np.sum(np.power(x_prev[:, feat], 2)/((64*1000)/256))
                x[q, idx+5] = np.sum(np.power(x_prev[:, feat], 2))
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
            x[q, :-1] = pca.transform(x_prev_pca)
    x[:, x.shape[1]-1] = df_good[:, -6]
    return x

def data_acc_offline(df_good, model, a_th, a_al, a_be, b_th, b_al, b_be, mod):
    x, win, fil_max_min, pca = model_config(df_good, model)
    x_off = data_prep(x, df_good, win, a_th, a_al, a_be, b_th, b_al, b_be, model, fil_max_min, pca)
    df_good_off = df_good
    df_good_off[:, -5] = mod.predict(x_off)
    return df_good_off

def data_analy(CI, model, files, x_scaled, all):
    if all is False:
        df, pred_tot = data_load(CI, model, files)
        df_good, pred_keep = data_keep(df)    
        df_acc, tot_acc = total_accuracy(df_good)
        df_music, music_acc, music_num = part_accuracy(df_good, 'music', 1)
        df_aurosal, aurosal_acc, aurosal_num = part_accuracy(df_good, 'aurosal', 2)
        lat_avg, lat_max, lat_min = latency(df)
        print(f'lat_avg: {lat_avg}, lat_max: {lat_max}, lat_min: {lat_min}')
        sio.emit('data_after_show', {'pred_tot': pred_tot, 'pred_keep': pred_keep, 'tot_acc': tot_acc.tolist(), 'pred_music_num': music_num.tolist(), 'pred_aurosal_num': aurosal_num.tolist(), 
        'lat_avg': lat_avg, 'lat_max': lat_max, 'lat_min': lat_min})
        return ('Data done')
    elif all is True:
        files = np.array((files))
        for i in range(files.shape[0]):
            df, pred_tot = data_load(CI, model, files[i])
            df_good, pred_keep = data_keep(df)
            df_acc, tot_acc = total_accuracy(df_good)
            df_music, music_acc, music_num = part_accuracy(df_good, 'music', 1)
            df_aurosal, aurosal_acc, aurosal_num = part_accuracy(df_good, 'aurosal', 2)
            lat_avg, lat_max, lat_min = latency(df)
            print(f'lat_avg: {lat_avg}, lat_max: {lat_max}, lat_min: {lat_min}')
            sio.emit('data_after_show', {'pred_tot': pred_tot, 'pred_keep': pred_keep, 'tot_acc': tot_acc.tolist(), 'pred_music_num': music_num.tolist(), 'pred_aurosal_num': aurosal_num.tolist(), 
            'lat_avg': lat_avg, 'lat_max': lat_max, 'lat_min': lat_min})

@sio.event
def connect():
    print('connection established')

@sio.on('data_analysis')
def user_id(data):
    global CI, model, files
    if (data is not None):
        CI = data['CI']
        model = data['model']
        files = data['file']
        all_data = data['all']
        x_scaled = np.genfromtxt('D:/Github/eeg.fem/public/data/Musical/'+str(CI)+'/data_for_train/ALL_3C_64_scaled.csv',dtype=float,delimiter=',')
        data_analy(CI, model, files, x_scaled, all_data)

@sio.event
def disconnect():
    print('disconnected from server')
    sio.disconnect()

sio.connect('http://localhost:3000', transports='websocket', socketio_path='/connection/eeg')
sio.wait()