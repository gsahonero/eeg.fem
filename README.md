# eeg.fem
Repository for the web suite for FEM - a tool that allows to use Emotiv devices in the context of Brain Computer Interfaces' development.
## Setup

### Prerequisites
- Windows 10
- Emotiv Pro with license
- nodejs
- Anaconda or Miniconda
- Emotiv Epoc+ headset

### Getting Started
- Clone the repository
  ```bash
  git clone https://github.com/CIDIMEC/eeg.fem.git
  cd eeg.fem
  ```
- Download the modules

  ```bash
  npm install
  ```

- Create the python enviroment with all the packages

  ```bash
  conda env create -f environment.yaml
  pip install "python-socketio[client]==4.6.1"
  ```
- Copy files:
  - Copy the file **login.data** in **eeg.fem** folder.

  - Copy the file **users.json** in **eeg.fem/public/json** folder.

At this point you can run the program via command line, to use the BAT files we have to make some changes in BAT files.

### **Setting up the BAT files**

  We have 3 main BAT files:
  
- **BCI_data**
  
  For this BAT file we have to change 2 files:
  - **BCI_data.bat**
    
    In this file we have to change the first line:
    ```bash
    call D:\Programas\miniconda3\Scripts\activate.bat D:\Programas\miniconda3\envs\BCIMusical
    ``` 
    by the path where the python environment was installed.

  - **chrome_data.bat**

    This file is located in ```public/```, in this file change the location were the Google Chrome navigator is installed.
    ```bash
    call cd\Program Files (x86)\Google\Chrome\Application
    ```

- **BCI_app**
  
  We have to change 4 files:
  - **BCI_app.bat**
  
    In this file we have to change the first line:
      ```bash
      call D:\Programas\miniconda3\Scripts\activate.bat D:\Programas\miniconda3\envs\BCIMusical
      ``` 
      by the path where the python environment was installed.

  -  **PyBat.bat**

      This file are in ```public/``` we have to change the path where the python environment was installed in the second line.

  - **chrome_app.bat** and **chrome_inst.bat**

     These files are located in ```public/```, change the location were Google Chrome navigator is installed.
      ```bash
      call cd\Program Files (x86)\Google\Chrome\Application
      ```
- **BCI_analisis**
  
  We have to change 3 files:
  - **BCI_analisis.bat**

     In this file we have to change the first line:
      ```bash
      call D:\Programas\miniconda3\Scripts\activate.bat D:\Programas\miniconda3\envs\BCIMusical
      ``` 
      by the path where the python environment was installed.

  - **Pydata.bat**

      This file are in ```public/``` we have to change the path where the python environment was installed in the second line.
  - **chrome_analisis.bat**

      This file is located in ```public/```, in this file change the location were the Google Chrome navigator is installed.
      ```bash
      call cd\Program Files (x86)\Google\Chrome\Application
      ```

## RUN

### Command line
We have two options:
-  Run normal mode: 
  
    This mode start the server, but you have to resart the server for any change, you just need to type:
    
      ```bash
      node start
      ```
- Run developer mode:
  
  This mode restart the server automatically if you make a change, you just need to type:
  ```bash
  npm run dev
  ```

Once run the command open your explorer, and type http://localhost:3000/, this is the default client port, but it can be changed in the file: **start.js**.
If the process is done correctly there should appear this page:

Image.jpg

### Executable
To execute the BAT files, they should have been configured correctly as seen in the previous point, you can make shortcuts to access them from the desktop or any other location. The files are:
- BCI_data.bat
- BCI_app.bat
- BCI_analisis.bat

## How to use
### It is a guide if it was started via the command line and record the data.
1. Connect the headset to your PC with the EmotivPRO program.
1. Start the program either the normal mode or developer  mode.
1. If the process started correctly you should receive the following message: *Server is running on port 3000!*.
1. Open your favorite browser, then enter to the localhost. For default the program is running on port 3000, so you'll have to enter to: http://localhost:3000/.
1. Put on your Epoc+ headset.
1. When you are in the menu click on *Check electrodes quality* button to check if the electrodes are receiving signal correctly. You'll be taken to a page that looks like this:
   
   Where you can see the quality of signal from each electrode. If the quality of the modules is poor, try humidifying the feltpads and make sure that ground electrodes are placed correctly.
1. After checking the quality, go back to the menu, and click the *Watch Raw EEG Data* to see the data retrieved from the headset in real time. You can try blinking to see some artifacts, this could be seen as peaks in the signal.
1. Go back to the menu. Then click on the *record EEG* button.
1. Click on the *Subject* button to access to the subject page. This should become a blank page
1. Open another tab, and enter to http://localhost:3000/, then click the *Record EEG*
1. Click on the *Researcher* button, to access to the experiment customization page. You can change the experiment instructions on the script using the commands shown on the *List of Commands* section bellow.
1. If you have some media files, you have to click on the *Import Audio resources* button before starting the experiment.
1. To start the experiment just click on the *Start experiment* button. After doing this the experiment should start. In the *Subject* page the experiment will be running, and all the data will be stored in ```public/data/``` and name of the experiment.

## List of Commands
The program has the following options:
#### Watch Raw EEG Data
This option allows you to watch the EEG Data if the headset is connected.
#### Check electrodes quality
You can check if your Emotiv Epoc+ headset is properly placed, and taking data correctly.
#### Record EEG
This option allows you to perform experiments. There are two roles in experiment:
##### Subject
This screen corresponds to the experiment subject, and it's activated via websockets by the researcher
##### Researcher
This screen allows you to set the experiment. You can customize it via commands, and run.
#### List of Commands
The list of commands is the following:
- **experiment(arg)** - selects a main folder (arg) from images and audios are retrieved. These files should be in server.
- **id(arg)** - selects a local folder (arg) where the data will be saved. This local folder is inside a main folder which name was declared by the experiment function. Data is saved by default in Desktop.
- **beep(arg)** - produces a beep sound for arg milliseconds.
- **present(arg)** - presents on screen the image which file name is arg.
- **play(arg)** - plays the sound which file name is arg.
- **ball(arg)** - displays a ball that moves accordingly to arg. The possible values for arg are:
  - **random** - the ball moves randomly.
  - **controller** - the ball can be moved using a joystick.
- **clear(arg)** - clear arg channel. If arg is 'screen' then clear the presented image. If arg is 'sound', stops the ongoing sound or music. This does not apply to the beep function.
- **wait(arg)** - enables trigger button as interruption switch. If argument is a number, waits for that amount of time in milliseconds. If argument is a number and a text separated by comma, the text is the marker description and the number is the amount of time in milliseconds.
- **finish()** - marks the end of script.
Semicolon usage is mandatory.