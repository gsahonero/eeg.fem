import numpy as np
import pandas as pd

def rawData(path, CI, tipo, rep, w):
    df = pd.read_csv(str(path)+'/'+str(CI)+'/'+str(tipo)+' ('+str(rep)+').csv', delimiter=',',dtype =object)
    old_df = df['MARKERS'].str.split('.').str[0] ##Seprara a partir del punto y solo se queda con la primera parte
    etiquetado = old_df.apply({'music1':1,
                'music2':2,
                'music3':3,
                'music4':4,
                'blink1':5,'blink2':5,'blink3':5}.get)
    df = df.assign(MARKERS=etiquetado) #
    df.dropna(subset = ["MARKERS"], inplace=True) #Quita todas las filas que tengan NaN en MARKERS
    new_df = df.drop(['COUNTER', 'INTERPOLATED','RAW_CQ','MARKER_HARDWARE','STEP'], axis=1)
    new_df['MARKERS'] = new_df['MARKERS'].astype(np.int64)

    new_df.to_csv(str(path)+'/'+str(CI)+'/Clean/'+str(tipo)+' ('+str(rep)+')_C.csv',encoding='utf-8', index=False)
    #Guarda el nuevo csv con la lectura de los 14 electrodos quitando las columnas y filas que no nos interasan
    
    idx = 0
    new = 0
    for i in range(0,w.shape[1]):
        mark = new_df.iat[idx,14]
        for j in range(new,new_df.shape[0]):
            if (mark != new_df.iat[j,14])or(j==new_df.shape[0]-1):
                if w[0,i]==1:
                    df_save = new_df.iloc[idx:j-1,:]
                    df_save.to_csv(str(path)+'/'+str(CI)+'/Class/'+str(tipo)+' ('+str(rep)+')_'+str(df_save.iat[0,14])+'_'+str(i+1)+'.csv',encoding='utf-8', index=False)
                idx = j
                new = j
                break

path = 'D:/Github/eeg.fem/public/data/Musical'
CI = 6080072
Type = 'Type_6'
rutine = np.array([[1,1,1,0,0,0,0],
                   [1,1,1,1,1,0,1],
                   [1,1,1,0,1,0,1],
                   [1,0,1,1,0,0,0],
                   [1,1,1,1,0,1,1],
                   [0,0,0,0,0,0,0],
                   [0,0,0,0,0,0,0],
                   [1,1,1,1,1,1,1],
                   [1,0,0,0,0,0,0],
                   [1,1,1,1,1,1,0],
                   [1,1,1,1,1,1,1]
                   ])
w = np.zeros((1,7))
for j in range(rutine.shape[0]):
    rep = j+1
    w[0,:] = rutine[j,:]
    rawData(path=path,CI=CI,tipo=Type,rep=rep,w=w)
print('Done')