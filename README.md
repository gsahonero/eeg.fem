# eeg.fem

Repository for the web suite for FEM - a tool that allows to use Emotiv devices in the context of Brain Computer Interfaces' development.
## Setup

### Prerequisites
- Windows 10
- Emotiv Pro with license
- nodejs
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
To run the program you just need to type:
```bash
node start
```
Open your explorer, and type http://localhost:3000/, this is the default client port, but it can be changed in the file: put name of file here
If the process is done correctly there should appear this page:
Image.jpg
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
Semicolon usage is mandatory

## How to use
1. Connect the headset to your PC
1. Start the program. Open the file where you have cloned the repository and then type in the terminal:
  ```bash
  cd eeg.fem
  node start
  ```
If the process started correctly you should receive the following message: *Server is running on port 3000!*.
1. Open your favorite browser, then enter to the localhost. For default the program is running on port 3000, so you'll have to enter to: http://localhost:3000/
1. Put on your Epoc+ headset.
1. When you are in the menu click on *Check electrodes quality* button to check if the electrodes are receiving signal correctly. You'll be taken to a page that looks like this:
   
   Where you can see the quality of signal from each electrode. If the quality of the modules is poor, try humidifying the feltpads and make sure that ground electrodes are placed correctly.
1. After checking the quality, go back to the menu, and click the *Watch Raw EEG Data* to see the data retrieved from the headset in real time. You can try blinking to see some artifacts, this could be seen as peaks in the signal.
1. Go back to the menu. Then click on the *record EEG* button.
1. Click on the *Subject* button to access to the subject page. This should become a blank page
1. Open another tab, and enter to http://localhost:3000/, then click the *Record EEG*
1. Click on the *Researcher* button, to access to the experiment customization page. You can change the experiment instructions on the script using the commands shown on the List of Commands section.
1. If you have some media files, you have to click on the *Import Audio resources* button before starting the experiment.
1. To start the experiment just click on the *Start experiment* button. After doing this the experiment should start. In the *Subject* page the experiment will be running, and all the data will be stored in ...
1. 