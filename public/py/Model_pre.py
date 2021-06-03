import numpy as np
import scipy.signal as signal

def param(N, Wn, fs):
    b, a = signal.butter(N, Wn, btype='bandpass', analog=False, output='ba', fs=fs)
    return a, b

def filt(df, a_th, b_th, a_al, b_al, a_be, b_be, path, CI, tp, num):
    x_th = np.zeros(df.shape)
    x_al = np.zeros(df.shape)
    x_be = np.zeros(df.shape)
    y = df[:,14]
    for i in range(df.shape[1]):
        x_th[:, i] = signal.filtfilt(b_th, a_th, df[:, i])
        x_al[:, i] = signal.filtfilt(b_al, a_al, df[:, i])
        x_be[:, i] = signal.filtfilt(b_be, a_be, df[:, i])
    x_th[:,14] = y
    x_al[:,14] = y
    x_be[:,14] = y
    np.savetxt(str(path)+'/'+str(CI)+'/Class/Filtered/theta/Type_'+str(tp)+'_'+str(num)+'.csv', x_th, delimiter=",")
    np.savetxt(str(path)+'/'+str(CI)+'/Class/Filtered/alpha/Type_'+str(tp)+'_'+str(num)+'.csv', x_al, delimiter=",")
    np.savetxt(str(path)+'/'+str(CI)+'/Class/Filtered/beta/Type_'+str(tp)+'_'+str(num)+'.csv', x_be, delimiter=",")
    return x_th, x_al, x_be

def dat_prep(x_th, x_al, x_be, df, base_l1, base_l2, win, jump, fs, tp, num, path, CI):
    if df[0,14] == 5:
        base = int(base_l2*fs)
    else:
        base = int(base_l1*fs)

    shape = int(df.shape[0]-(base*2))

    X_shape1 = (14*3*win)+2
    X_shape0 = int((shape-win)/jump)+1
    X = np.empty((X_shape0, X_shape1))
    jump_to = 0
    for i in range(X_shape0):
        p = 0 
        for j in range(win):
            to_p = p
            p += 1
            X[i, (14*to_p):(14*p)] = x_th[base+jump_to+j,:14]
            to_p = p
            p += 1
            X[i, (14*to_p):(14*p)] = x_al[base+jump_to+j,:14]
            to_p = p
            p += 1
            X[i, (14*to_p):(14*p)] = x_be[base+jump_to+j,:14]
        X[i, X_shape1-2] = df[base+jump_to,14]
        X[i, X_shape1-1] = df[base+jump_to,14]
        jump_to += jump
    
    np.savetxt(str(path)+'/'+str(CI)+'/All_Data/Type_'+str(num)+'_'+str(tp)+'.csv', X, delimiter=",")
    return print('Type_'+str(num)+'_'+str(tp)+': Done')

win = 64
base_l1 = 5
base_l2 = 2.5
jump = 16
fs = 256
N = 6
path = 'D:/Github/eeg.fem/public/data/Musical'
CI = 5956733

a_th, b_th = param(N=N, Wn=[4, 7], fs=fs)
a_al, b_al = param(N=N, Wn=[8, 12], fs=fs)
a_be, b_be = param(N=N, Wn=[12, 30], fs=fs)

for i in range(1, 9):
    for j in range(1, 8):
        df = np.genfromtxt(str(path)+'/'+str(CI)+'/Class/'+'Type_'+str(i)+'_'+str(j)+'.csv',dtype=float,delimiter=',',skip_header=1)
        x_th, x_al, x_be = filt(df=df, a_th=a_th, b_th=b_th, a_al=a_al, b_al=b_al, a_be=a_be, b_be=b_be, path=path, CI=CI, tp=i, num=j)
        dat_prep(x_th=x_th, x_al=x_al, x_be=x_be, df=df, base_l1=base_l1, base_l2=base_l2, win=win, jump=jump, fs=fs, tp=j, num=i, path=path, CI=CI)
        