/***
Inspiré de https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/serial/ledtoggle
***/

const serial = chrome.serial;
var nomPort = '';

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(escape(encodedString));
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
  var encodedString = unescape(encodeURIComponent(str));
  var bytes = new Uint8Array(encodedString.length);
  for (var i = 0; i < encodedString.length; ++i) {
    bytes[i] = encodedString.charCodeAt(i);
  }
  return bytes.buffer;
};

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

var SerialConnection = function() {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.onConnect = new chrome.Event();
  this.onReadLine = new chrome.Event();
  this.onError = new chrome.Event();
};

SerialConnection.prototype.onConnectComplete = function(connectionInfo) {
  if (!connectionInfo) {
    logStatutSerial('Echec de connexion à ' + nomPort);
    return;
  }
  this.connectionId = connectionInfo.connectionId;
  chrome.serial.onReceive.addListener(this.boundOnReceive);
  chrome.serial.onReceiveError.addListener(this.boundOnReceiveError);
  this.onConnect.dispatch();
};

SerialConnection.prototype.onReceive = function(receiveInfo) {
  if (receiveInfo.connectionId !== this.connectionId) {
    return;
  }

  this.lineBuffer += ab2str(receiveInfo.data);

  var index;
  while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
    var line = this.lineBuffer.substr(0, index + 1);
    this.onReadLine.dispatch(line);
    this.lineBuffer = this.lineBuffer.substr(index + 1);
  }
};

SerialConnection.prototype.onReceiveError = function(errorInfo) {
  if (errorInfo.connectionId === this.connectionId) {
    this.onError.dispatch(errorInfo.error);
  }
};

SerialConnection.prototype.connect = function(path) {
  nomPort = path;
  logStatutSerial('Tentative de connexion à ' + path);
  serial.connect(path, this.onConnectComplete.bind(this))
};

SerialConnection.prototype.send = function(msg) {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.send(this.connectionId, str2ab(msg), function() {});
};

SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.disconnect(this.connectionId, function() {
	  logStatutSerial('Déconnecté');
  });
};

////////////////////////////////////////////////////////

var getDevices = function() {
  serial.getDevices(function(list) {
    if(list.length == 0) {
      logStatutSerial('Aucun port disponible');
    }
    /*else if(list.length <= 2) {
      logStatutSerial('Connexion automatique');
      connection1.connect(list[0].path);
	  if(list.length == 2) {
		  connection2.connect(list[1].path); 
	  }
    }*/
    else {
      logStatutSerial(list.length + ' ports disponibles.');
	  genererSelectSerial(list);
    }
  });
  
};

var genererSelectSerial = function(ports) {
	var select = [document.getElementById('serialSelect0'),
				document.getElementById('serialSelect1')];
	
	select[0].appendChild(creerOption('Non connecté', 'disconnect'));
	select[1].appendChild(creerOption('Non connecté', 'disconnect'));
	
	var texte, value;
	for(var i = 0; i < ports.length; i++) {
		texte = ports[i].path + ' - ' + ports[i].displayName;
		value = ports[i].path;
		select[0].appendChild(creerOption(texte, value));
		select[1].appendChild(creerOption(texte, value));
	}
	
	
	select[0].addEventListener('change', function() {
		if(this.value == 'disconnect')
			connection0.disconnect();
		else {
			if(select[1].value == this.value) {
				select[1].value = 'disconnect';
				connection1.disconnect();
			}
			connection0.connect(this.value);
		}
	});
	select[1].addEventListener('change', function() {
		if(this.value == 'disconnect')
			connection1.disconnect();
		else {
			if(select[0].value == this.value) {
				select[0].value = 'disconnect';
				connection0.disconnect();
			}
			connection1.connect(this.value);
		}
	});
}

var creerOption = function(texte, value) {
	var option = document.createElement('option');
	var txt = document.createTextNode(texte);
	option.value = value;
	option.appendChild(txt);
	return option;
}

var creerButton = function(texte, value, click) {
	var button = document.createElement('button');
	var txt = document.createTextNode(texte);
	button.value = value;
	button.appendChild(txt);
	button.addEventListener('click', click)
	return button;
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

var connection0 = new SerialConnection();
var connection1 = new SerialConnection();

connection0.onConnect.addListener(function() {
  logStatutSerial('Petit Robot connecté à ' + nomPort);
});
connection1.onConnect.addListener(function() {
  logStatutSerial('Grand Robot connecté à ' + nomPort);
});

connection0.onReadLine.addListener(function(line) {
  traiterMessage(0, line);
});
connection1.onReadLine.addListener(function(line) {
  traiterMessage(1, line);
});

function logStatutSerial(msg) {
  //document.getElementById('serialStatut').innerText = msg;
  log.monitor(msg);
}

/*document.getElementById('bPing').addEventListener('click', function() {
  log("PING");
  connection.send('PING');
});//*/

getDevices();