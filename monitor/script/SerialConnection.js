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

  var buffer = receiveInfo.data;
  var bufView = new Uint8Array(buffer);
  
  // la trame reçue est une trame "robot state" qui contient du binaire
  // donc on ne transforme pas en string
  // or le format de nos trames binaires commencent et terminent par un @
  if (String.fromCharCode(bufView[0]) === '@' && String.fromCharCode(bufView[bufView.length - 1]) === '@') {
    // on traite la trame binaire par la fonction qui va bien
    traiterTrameMonitor((this.name == 'PR' ? PR : GR), buffer);
    return;
  }

  this.lineBuffer += ab2str(buffer);

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

SerialConnection.prototype.disconnect = function(callback) {
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
      genererSelectSerial(list); // On va quand même le faire puisqu'il faut ajouter la simu
    }
    else {
      logStatutSerial(list.length + ' ports disponibles.');
      genererSelectSerial(list);
    }
  });

};

var select = [document.getElementById('serialSelect0'),
        document.getElementById('serialSelect1')];

var genererSelectSerial = function(ports) {

  select[0].appendChild(creerOption('Non connecté', 'disconnect'));
  select[1].appendChild(creerOption('Non connecté', 'disconnect'));

  select[0].appendChild(creerOption('Simulateur', 'simu'));
  select[1].appendChild(creerOption('Simulateur', 'simu'));

  var texte, value;
  for(var i = 0; i < ports.length; i++) {
    texte = ports[i].path + ' - ' + ports[i].displayName;
    value = ports[i].path;
    select[0].appendChild(creerOption(texte, value));
    select[1].appendChild(creerOption(texte, value));
  }

  select[0].addEventListener('change', function() {
    triggerSerialConnection(0);
  });
  select[1].addEventListener('change', function() {
    triggerSerialConnection(1);
  });
}

var creerOption = function(texte, value) {
  var option = document.createElement('option');
  var txt = document.createTextNode(texte);
  option.value = value;
  option.appendChild(txt);
  return option;
}

var triggerSerialConnection = function(caller) {
  var thisOne = caller;
  var theOther = (thisOne == 0 ? 1 : 0);

  var port = select[thisOne].value;

  if(port == 'disconnect') {
    connection[thisOne].disconnect();
  }
  else if(port == 'simu') {
    simu.demarrer(thisOne);
  }
  else {
    if(select[theOther].value == port) {
      select[theOther].value = 'disconnect';
      connection[theOther].disconnect(function() {
        connection[thisOne].connect(port);
      });
    }
    else {
      connection[thisOne].connect(port);
    }
  }
}

var changeSerialConnection = function(robot, value) {
  select[robot].value = value;
  triggerSerialConnection(robot);
}


/** ====================================
    Traitement spécifique des événements
    ==================================== **/

var connection = [new SerialConnection('PR'), new SerialConnection('GR')];

connection[0].onReadLine.addListener(function(line) {
  traiterMessage(0, line);
});
connection[1].onReadLine.addListener(function(line) {
  traiterMessage(1, line);
});

connection[0].onError.addListener(function(erreur) {
  document.getElementById('serialSelect0').value = 'disconnect';
});
connection[1].onError.addListener(function(erreur) {
  document.getElementById('serialSelect1').value = 'disconnect';
});


var logStatutSerial = function(msg) {
  //document.getElementById('serialStatut').innerText = msg;
  log.monitor(msg);
}


document.getElementById('bReconnecter').addEventListener('click', function() {
  if(document.getElementById('serialSelect0').value != 'disconnect') {
    connection[0].disconnect(function() {
      connection[0].connect(document.getElementById('serialSelect0').value);
    });
  }
  if(document.getElementById('serialSelect1').value != 'disconnect') {
    connection[1].disconnect(function() {
      connection[1].connect(document.getElementById('serialSelect1').value);
    });
  }
});


getDevices();
