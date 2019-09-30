/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */
//SocketIO initialization, requires the script /socket.io/socket.io.js on index.html
const socket = io.connect('http://localhost:3000', {path: '/connection/eeg',reconnect: true});
//GamepadEvents initialization
var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controllers = {};
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame;

var send_axes = [0,0];
//var c_ind=0;

function connecthandler(e) {
  addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  //Create a div element for a controller with a radio button for selecting the gamepad
  var d = document.createElement("div");
  d.setAttribute("id", "controller" + gamepad.index);
  var t = document.createElement("input");
  t.setAttribute("type","radio");
  t.setAttribute("name","control");
  t.setAttribute("id","control"+gamepad.index);
  t.setAttribute("value",gamepad.index);
  d.appendChild(t);
  //Label for radio button
  var label = document.createElement('label');
  label.setAttribute('for', "control"+gamepad.index);
  label.innerHTML = "Gamepad "+gamepad.index+": " + gamepad.id;
  d.appendChild(label);

  //Create a div for displaying the buttons of the gamepad
  var b = document.createElement("div");
  b.className = "buttons";
  for (var i=0; i<gamepad.buttons.length; i++) {
    var e = document.createElement("span");
    e.className = "button";
    //e.id = "b" + i;
    e.innerHTML = i;
    b.appendChild(e);
  }
  d.appendChild(b);

  //Create a div that displays the gamepad axes
  var a = document.createElement("div");
  a.className = "axes";
  for (i=0; i<gamepad.axes.length; i++) {
    e = document.createElement("meter");
    e.className = "axis";
    //e.id = "a" + i;
    e.setAttribute("min", "-1");
    e.setAttribute("max", "1");
    e.setAttribute("value", "0");
    e.innerHTML = i;
    a.appendChild(e);
  }
  d.appendChild(a);
  document.getElementById("start").style.display = "none";
  document.body.appendChild(d);
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function proccess_axes(send_axes){
  //Joystick raw
  socket.emit('joystick:axes',{
    x:send_axes[0],
    y:send_axes[1]
  });
  //Joystick comandos
  //commands:x
  if(Math.abs(send_axes[0])>0.01){
    if(send_axes[0]<0){
      socket.emit('commands:x','left');
    }else{
      socket.emit('commands:x','right');
    }
  }
  else{
    socket.emit('commands:x','stop');
  }
  //commands:y
  if(Math.abs(send_axes[1])>0.01){
    if(send_axes[1]<0){
      socket.emit('commands:y','up');
    }else{
      socket.emit('commands:y','down');
    }
  }

  else{
    socket.emit('commands:y','stop');
  }
}

function updateStatus() {
  scangamepads();
  c_ind=$('input[name=control]:checked').val();

  for (j in controllers) {
    var controller = controllers[j];
    var d = document.getElementById("controller" + j  );
    var buttons = d.getElementsByClassName("button");
    for (var i=0; i<controller.buttons.length; i++) {
      var b = buttons[i];
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
      var pct = Math.round(val * 100) + "%";
      b.style.backgroundSize = pct + " " + pct;
      if (pressed) {
        if(j==c_ind){
          socket.emit('joystick:button', i);
        }

        b.className = "button pressed";
      } else {
        b.className = "button";
      }

    }

    var axes = d.getElementsByClassName("axis");
    for (var i=0; i<controller.axes.length; i++) {
      var a = axes[i];
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      a.setAttribute("value", controller.axes[i]);

      if (j==c_ind && (i==1||i==0)){
        send_axes[i]=controller.axes[i];
        //console.log(send_axes);
        proccess_axes(send_axes)

      }

    }
  }
  rAF(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (!(gamepads[i].index in controllers)) {
        addgamepad(gamepads[i]);
      } else {
        controllers[gamepads[i].index] = gamepads[i];
      }
    }
  }
  check_h= document.getElementById("control1");
}

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connecthandler);
  window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
} else {
  setInterval(scangamepads, 500);


}
