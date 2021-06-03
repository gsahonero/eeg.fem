import os
import numpy as np
import scipy.signal as signal


def param(N, Wn, fs):
    b, a = signal.butter(N, Wn, btype='bandpass', analog=False, output='ba', fs=fs)
    return b, a


def filtro(x, a_th, b_th, a_al, b_al, a_be, b_be, path, CI, file):
    x_1 = x[:, :14]
    y = x[:, 14]
    x_th = np.empty(x.shape)
    x_al = np.empty(x.shape)
    x_be = np.empty(x.shape)

    for i in range(x.shape[1] - 1):
        x_th[:, i] = signal.filtfilt(b_th, a_th, x_1[:, i])
        x_al[:, i] = signal.filtfilt(b_al, a_al, x_1[:, i])
        x_be[:, i] = signal.filtfilt(b_be, a_be, x_1[:, i])

    x_th[:, 14] = y
    x_al[:, 14] = y
    x_be[:, 14] = y

    np.savetxt(str(path) + '/' + str(CI) + '/Class/Filtered/theta/' + str(file), x_th, delimiter=",")
    np.savetxt(str(path) + '/' + str(CI) + '/Class/Filtered/alpha/' + str(file), x_al, delimiter=",")
    np.savetxt(str(path) + '/' + str(CI) + '/Class/Filtered/beta/' + str(file), x_be, delimiter=",")
    return


N = 6
fs = 256
path = 'D:/Github/eeg.fem/public/data/Musical'
CI = 6080072
filesNames = np.array(os.listdir(str(path) + '/' + str(CI) + '/Class'))

a_th, b_th = param(N=N, Wn=[4, 7], fs=fs)
a_al, b_al = param(N=N, Wn=[8, 12], fs=fs)
a_be, b_be = param(N=N, Wn=[12, 30], fs=fs)

for q in range(1, len(filesNames)):
    file = filesNames[q]
    df = np.genfromtxt(str(path) + '/' + str(CI) + '/Class/' + str(file), dtype=float, delimiter=',', skip_header=1)
    filtro(x=df, a_th=a_th, b_th=b_th, a_al=a_al, b_al=b_al, a_be=a_be, b_be=b_be, path=path, CI=CI, file=file)
