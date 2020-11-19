import socketio
import numpy as np

blink_OC = 'blink_OC'
sio = socketio.Client()
eeg_prom = np.zeros((1,14))
p_eeg = 0

@sio.event
def connect():
    print('connection established')

@sio.on('data')
def action(data):
    if type(data) is list:
        eeg = data[2:16]
        eeg_p = np.mean(eeg)
        j = 0
        p = eeg_prom.shape[0]-1
        while j <= eeg_prom.shape[1]-1:
            if p == 0:
                eeg_prom[0,p]=eeg_p
            else:
                eeg_prom[0,p]=eeg_prom[0,p-1]
            j += 1
            p -= 1
        p_eeg = np.mean(eeg_prom)
        print('prom: ', p_eeg)
        sio.emit('blink', {blink_OC: p_eeg})

@sio.event
def disconnect():
    print('disconnected from server')

sio.connect('http://localhost:3000', socketio_path='/connection/eeg')
sio.wait()