# -*- coding: utf-8 -*-
"""
Created on Thu Sep 12 09:41:43 2019
@author: Anna Isabel Montevilla Shupikova
"""
import xlrd
import numpy as np
import scipy.signal as signal
from PIL import Image
from PIL import ImageDraw
import matplotlib.pyplot as plt
import time
import cv2
import threading

def blue(resultsa,x1):
    r=20
    blue=['#e1e9f4', '#c4d4e9', '#a5bfde', '#86aad3', '#6496c8', '#3b83bd','#307bb5','#2473ac', '#146ca4']
    #Color bars
    valuesb=np.zeros(14)
    for m in range(n):
        for h in range(14):
            valuesb[h]=round(resultsa[m,h]*9/x1)-1
        fb=valuesb.astype(np.int64)
        for l in range(14):
            if fb[l]>8:
                fb[l]=8
        img=Image.new("RGBA", (500,600),'#585858')
        draw = ImageDraw.Draw(img)
        draw.text((0, 0),"Casco",(0,0,0))
        #head
        draw.ellipse((25, 57, 460, 525), fill='white')
        #AF3 AF4
        draw.ellipse((135-r, 108-r, 135+r, 108+r), fill=blue[fb[11]])
        draw.ellipse((343-r, 108-r, 343+r, 108+r), fill=blue[fb[5]])
        #F7 F3 F4 F8
        draw.ellipse((63-r, 182-r, 63+r, 182+r), fill=blue[fb[1]])
        draw.ellipse((186-r, 173-r, 186+r, 173+r), fill=blue[fb[13]])
        draw.ellipse((293-r, 173-r, 293+r, 173+r), fill=blue[fb[9]])
        draw.ellipse((413-r, 182-r, 413+r, 182+r), fill=blue[fb[7]])
        #FC5 FC6
        draw.ellipse((108-r, 228-r, 108+r, 228+r), fill=blue[fb[6]])
        draw.ellipse((366-r, 228-r, 366+r, 228+r), fill=blue[fb[0]])
        #T7 T8
        draw.ellipse((38-r, 292-r, 38+r, 292+r), fill=blue[fb[12]])
        draw.ellipse((437-r, 292-r, 437+r, 292+r), fill=blue[fb[4]])
        #CMS
        draw.ellipse((63-r, 360-r, 63+r, 360+r), fill='#190707')
        #DRL
        draw.ellipse((415-r, 360-r, 415+r, 360+r), fill='#fffb33')
        #P7 P8
        draw.ellipse((109-r, 438-r, 109+r, 438+r), fill=blue[fb[3]])
        draw.ellipse((370-r, 438-r, 370+r, 438+r), fill=blue[fb[8]])
        #O1 O2
        draw.ellipse((177-r, 512-r, 177+r, 512+r), fill=blue[fb[10]])
        draw.ellipse((301-r, 512-r, 301+r, 512+r), fill=blue[fb[2]])
        # Convert RGB to BGR
        open_cv_image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        cv2.imshow('Alpha', open_cv_image)
        cv2.waitKey(1)
def red(resultsb,x2):
    r=20
    #Color bars
    red= ['#fddeda', '#f8beb6', '#f09e94', '#e67d72', '#da5b52', '#cb3234', '#c3292e', '#ba1f28', '#b21322']
    valuesr=np.zeros(14)
    for m in range(n):
        for h in range(14):
            valuesr[h]=round(resultsb[m,h]*9/x2)-1
        fb=valuesr.astype(np.int64)
        for l in range(14):
            if fb[l]>8:
                fb[l]=8
        img1=Image.new("RGBA", (500,600),'#555555')
        draw = ImageDraw.Draw(img1)
        draw.text((0, 0),"Casco",(0,0,0))
        #head
        draw.ellipse((25, 57, 460, 525), fill='white')
        #AF3 AF4
        draw.ellipse((135-r, 108-r, 135+r, 108+r), fill=red[fb[11]])
        draw.ellipse((343-r, 108-r, 343+r, 108+r), fill=red[fb[5]])
        #F7 F3 F4 F8
        draw.ellipse((63-r, 182-r, 63+r, 182+r), fill=red[fb[1]])
        draw.ellipse((186-r, 173-r, 186+r, 173+r), fill=red[fb[13]])
        draw.ellipse((293-r, 173-r, 293+r, 173+r), fill=red[fb[9]])
        draw.ellipse((413-r, 182-r, 413+r, 182+r), fill=red[fb[7]])
        #FC5 FC6
        draw.ellipse((108-r, 228-r, 108+r, 228+r), fill=red[fb[6]])
        draw.ellipse((366-r, 228-r, 366+r, 228+r), fill=red[fb[0]])
        #T7 T8
        draw.ellipse((38-r, 292-r, 38+r, 292+r), fill=red[fb[12]])
        draw.ellipse((437-r, 292-r, 437+r, 292+r), fill=red[fb[4]])
        #CMS
        draw.ellipse((63-r, 360-r, 63+r, 360+r), fill='#190707')
        #DRL
        draw.ellipse((415-r, 360-r, 415+r, 360+r), fill='#fffb33')
        #P7 P8
        draw.ellipse((109-r, 438-r, 109+r, 438+r), fill=red[fb[3]])
        draw.ellipse((370-r, 438-r, 370+r, 438+r), fill=red[fb[8]])
        #O1 O2
        draw.ellipse((177-r, 512-r, 177+r, 512+r), fill=red[fb[10]])
        draw.ellipse((301-r, 512-r, 301+r, 512+r), fill=red[fb[2]])
        # Convert RGB to BGR
        open_cv_image1 = cv2.cvtColor(np.array(img1), cv2.COLOR_RGB2BGR)
        cv2.imshow('Beta', open_cv_image1)
        cv2.waitKey(1)
#Import and open excel
loc = ("C:/Users/HP/Downloads/left7.xlsx")
wb = xlrd.open_workbook(loc)
sheet = wb.sheet_by_index(0)

#----------------Creating the filter-----------------
sample_rate=256
nyq_sample=sample_rate/2.0
#filter order +1
n = 2**6
#alpha a filter
fila = signal.firwin(n, cutoff = [8, 12], window = 'blackmanharris', pass_zero = False, nyq=nyq_sample)

#betha b filter
filb = signal.firwin(n, cutoff = [12, 30], window = 'blackmanharris', pass_zero = False, nyq=nyq_sample)
#-----------------------------------------------------
#Initialization
row=0
data=np.zeros((n,15))
#Saves the filtered data (size n)
resultsa=np.zeros((n,14))
resultsb=np.zeros((n,14))
data_array_f=np.zeros(sheet.ncols)
#Rounds to apply the filter
rounds=sheet.nrows//n

#Complete filtered data
processeda=np.zeros((sheet.nrows,14))
processedb=np.zeros((sheet.nrows,14))

# variable to set up lower limit 1

# variable to set up upper limit 1

# for each band of interest

# save data

# variable to establish time window

# power spectrum
# x-axis: frequency
# y-axis: energy, power (dB)

#


start=time.time()
for i in range(rounds):
    #Reads data and creates a matrix out of it
    for j in range(row, n+row):
        data_array=np.array(sheet.row_values(j+1))
        for x in range(data_array.shape[0]-1):
            y=float(data_array[x])
            data_array_f[x]=y
        data[j-row]=data_array_f
    #Applies the filter to each section of data taken before
    for k in range(14):
        vector=data[:,k]
        resulta=np.convolve(vector, fila, mode='same')
        resultsa[:,k]=resulta
        resultb=np.convolve(vector, filb, mode='same')
        resultsb[:,k]=resultb
    #Founds higher value of the vector to escalate
    x1=np.amax(resultsa)
    x2=np.amax(resultsb)
    #Draws alpha frequency
    t = threading.Thread(target=blue, args=(resultsa,x1,))
    t.start()
    #Draws beta frequency
    t2 = threading.Thread(target=red, args=(resultsb,x2,))
    t2.start()
    #Waits a time to let the threads work
    time.sleep(n/(4*256))
    #Saves the filtered data in one matrix per frequency
    for l in range (row, n+row):
        processeda[l]=resultsa[l-row]
        processedb[l]=resultsb[l-row]
    row=row+n
end=time.time()-start
print(end)
