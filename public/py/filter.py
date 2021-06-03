import scipy.signal as signal
import numpy as np

def param(N, Wn, fs):
    b, a = signal.butter(N, Wn, btype='bandpass', analog=False, output='ba', fs=fs)
    zi_sc = signal.lfilter_zi(b, a)
    return a, b, zi_sc

def filtro(x_1, a_th, b_th, x_th):
    i = x_1.shape[1]-1
    x_xth = b_th[0] * x_1[:, i] + b_th[1] * x_1[:, i - 1] + b_th[2] * \
             x_1[:, i - 2] + b_th[3] * x_1[:, i - 3] + b_th[4] * \
             x_1[:, i - 4] + b_th[5] * x_1[:, i - 5] + b_th[6] * \
             x_1[:, i - 6] + b_th[7] * x_1[:, i - 7] + b_th[8] * \
             x_1[:, i - 8] + b_th[9] * x_1[:, i - 9] + b_th[10] * \
             x_1[:, i - 10] + b_th[11] * x_1[:, i - 11] + b_th[12] * \
             x_1[:, i - 12]
    x_yth = a_th[1] * x_th[:, i] + a_th[2] * x_th[:, i - 1] + a_th[3] * \
             x_th[:, i - 2] + a_th[4] * x_th[:, i - 3] + a_th[5] * \
             x_th[:, i - 4] + a_th[6] * x_th[:, i - 5] + a_th[7] * \
             x_th[:, i - 6] + a_th[8] * x_th[:, i - 7] + a_th[9] * \
             x_th[:, i - 8] + a_th[10] * x_th[:, i - 9] + a_th[11] * \
             x_th[:, i - 10] + a_th[12] * x_th[:, i - 11]

    theta = x_xth - x_yth
    return theta

def filtro_zero(x_1, a_th, b_th, a_al, b_al, a_be, b_be):
    x_th = np.zeros(x_1.shape)
    x_al = np.zeros(x_1.shape)
    x_be = np.zeros(x_1.shape)
    for i in range(x_1.shape[1]):
        x_th[:, i] = signal.filtfilt(b_th, a_th, x_1[:, i])
        x_al[:, i] = signal.filtfilt(b_al, a_al, x_1[:, i])
        x_be[:, i] = signal.filtfilt(b_be, a_be, x_1[:, i])
    return x_th, x_al, x_be
