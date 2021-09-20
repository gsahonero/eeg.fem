@echo off    
call C:
call cd\Program Files (x86)\Google\Chrome\Application
call chrome.exe --start-fullscreen --app=http://localhost:3000/inst_panel.html
call exit