/***
Inspiré de https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/serial/ledtoggle
***/

const serial = chrome.serial;

/** ===================
    Fonctions générales
    =================== **/

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

/** =====================
    Gestion du port Série
    ===================== **/

// Doc: https://developer.chrome.com/apps/serial#event-onReceive

var SerialConnection = function(name) {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.onConnect = new chrome.Event();
  this.onReadLine = new chrome.Event();
  this.onError = new chrome.Event();

  this.onDisconnect = new chrome.Event();
  this.onWarning = new chrome.Event();
  this.isConnected = false;
  this.name = name;
};

SerialConnection.prototype.onConnectComplete = function(connectionInfo) {
  if (!connectionInfo) {
    logStatutSerial('Echec de connexion à ' + nomPort);
    return;
  }

  this.connectionId = connectionInfo.connectionId;
  chrome.serial.onReceive.addListener(this.boundOnReceive);
  chrome.serial.onReceiveError.addListener(this.boundOnReceiveError);

  this.isConnected = true;
  logStatutSerial(this.name + ' connecté');

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
    switch(errorInfo.error) {
      case 'overrun':
      case 'buffer_overflow':
      case 'parity_error':
        console.warn('Erreur reçue sur ' + this.name + ' : ' + errorInfo.error);
        changerIconeConnexion(this.name, 'Jaune');
        this.onWarning.dispatch(errorInfo.error);
        break;
      case 'disconnected':
      case 'timeout':
      case 'device_lost':
      case 'break':
      case 'frame_error':
      case 'system_error':
      default:
        this.isConnected = false;
        console.error('Erreur reçue sur ' + this.name + ' : ' + errorInfo.error);
        changerIconeConnexion(this.name, 'Rouge');
        this.onError.dispatch(errorInfo.error);
        break;
    }
    logStatutSerial('Erreur détectée sur ' + this.name + ' : ' + errorInfo.error);
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
  var that = this;
  // On retire les Listener ajoutés dans onConnectComplete,
  // sinon, à la prochaine connexion, les messages reçus seront retransmis 2 fois.
  // (pas si sûr, mais dans le doute...)
  this.isConnected = false;
  chrome.serial.onReceive.removeListener(this.boundOnReceive);
  chrome.serial.onReceiveError.removeListener(this.boundOnReceiveError);

  serial.disconnect(this.connectionId, function() {
    logStatutSerial(that.name + ' déconnecté');
    that.onDisconnect.dispatch();

    if(typeof(callback) === 'function')
      callback();

  });
};

/** ========================
    UI Choix de la connexion
    ======================== **/

var getDevices = function() {
  serial.getDevices(function(list) {
    if(list.length == 0) {
      logStatutSerial('Aucun port disponible');
    }
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
    var port = this.value;
    if(port == 'disconnect') {
      connection0.disconnect();
    }
    else {
      if(select[1].value == port) {
        select[1].value = 'disconnect';
        connection1.disconnect(function() {
          connection0.connect(port);
        });
      }
      else {
        connection0.connect(port);
      }
    }
  });
  select[1].addEventListener('change', function() {
    var port = this.value;
    if(port == 'disconnect')
      connection1.disconnect();
    else {
      if(select[0].value == port) {
        select[0].value = 'disconnect';
        connection0.disconnect(function() {
          connection1.connect(port);
        });
      }
      else {
        connection1.connect(port);
      }
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


/** ====================================
    Traitement spécifique des événements
    ==================================== **/

var connection0 = new SerialConnection('PR');
var connection1 = new SerialConnection('GR');

connection0.onReadLine.addListener(function(line) {
  traiterMessage(0, line);
});
connection1.onReadLine.addListener(function(line) {
  traiterMessage(1, line);
});

connection0.onError.addListener(function(erreur) {
  document.getElementById('serialSelect0').value = 'disconnect';
});
connection1.onError.addListener(function(erreur) {
  document.getElementById('serialSelect1').value = 'disconnect';
});


var logStatutSerial = function(msg) {
  //document.getElementById('serialStatut').innerText = msg;
  log.monitor(msg);
}


document.getElementById('bReconnecter').addEventListener('click', function() {
  if(document.getElementById('serialSelect0').value != 'disconnect') {
    connection0.disconnect(function() {
      connection0.connect(document.getElementById('serialSelect0').value);
    });
  }
  if(document.getElementById('serialSelect1').value != 'disconnect') {
    connection1.disconnect(function() {
      connection1.connect(document.getElementById('serialSelect1').value);
    });
  }
});


getDevices();
connection1.connect('COM5');
setTimeout(function() {
  connection0.connect('COM4');
  document.getElementById('serialSelect0').value = 'COM4';
  document.getElementById('serialSelect1').value = 'COM5';
  // connection1.connect('COM7');
}, 1000);
