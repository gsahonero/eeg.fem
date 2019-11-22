# eeg.fem

Repository for the web suite for FEM - a tool that allows to use Emotiv devices in the context of Brain Computer Interfaces' development.
## Setup

### Prerequisites
- Windows 10
- Emotiv Pro with license
- nodejs

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
Open your explorer, and type localhost:3000, this is the default client port, but it can be changed in the file: put name of file here
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
##### Reasearcher
This screen allows you to set the experiment. You can customize it via commands, and run.

#### Subject screen for EEG recording
