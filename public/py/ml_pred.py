import socketio
import numpy as np
import joblib as jb

x = np.zeros((1, 672))
jump = 0

mod = jb.load('D:/Github/eeg.fem/public/data/Musical/6080072/SVM model/6080072_1')

sio = socketio.Client(logger=True, engineio_logger=True)


@sio.event
def connect():
    print('connection established')


@sio.on('filter')
def pred(data):
    global x, jump, mod
    if np.mean(x[0, x.shape[1] - 1]):
        for j in range(x.shape[1] - 1):
            x[0, j] = x[0, j + 1]
        x[0, 629:643] = data[theta]
        x[0, 643:657] = data[alpha]
        x[0, 657:] = data[beta]
        jump += 1
        if jump == 8:
            y = mod.predict(x)
            print('--------------------------------------')
            print(y)
            sio.emit('pred', {'pred': y})
            jump = 0


@sio.event
def disconnect():
    print('disconnected from server')
    sio.disconnect()


sio.connect('http://localhost:3000', socketio_path='/connection/eeg')
sio.wait()
