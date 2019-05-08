/***
Inspiré de https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/serial/ledtoggle
***/


/*
Note migration de Chrome extension à Electron:
chrome.Event() -> EventEmitter de node
chrome.serial -> classe SerialPort
Event#dispatch() -> EventEmitter#emit()
https://nodejs.org/api/events.html#events_class_eventemitter
*/

const EventEmitter = require('events');
var SerialPort = require('serialport');

/** ===================
    Fonctions générales
    =================== **/

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(escape(encodedString));
};

// La fonction ci-dessus peut poser un problème quand une trame @@@@ s'enchaîne directement avec une ligne \n
// On tente une autre méthode en cas d'échec.
var ab2str_secondeChance = function(buf, robot) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  var debut, fin;
  // console.log(encodedString);
  if((debut = encodedString.indexOf('@@@@')) >= 0) {
    if((fin = encodedString.indexOf('@@@@', debut + 1)) >= 0) {
      // console.log(debut, fin)
      //traiterTrameMonitor(robot, str2ab(encodedString.substring(debut, fin + 4)));
      if(debut == 0) {
        return '[Trame interceptée...]\n' + encodedString.substr(fin + 4);
      }
      else if(fin == encodedString.length - 1) {
        return encodedString.substr(0, debut) + '[...Trame interceptée]\n';
      }
      else {
        return '[Trop de trames] ' + encodedString;
      }
    }
    else {
      return '[Non interprété] ' + encodedString;  
    }
  }
  else {
    return '[Non interprété] ' + encodedString;
  }
}

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

class SerialConnection extends EventEmitter {
  constructor(name) {
    super();
    this.lineBuffer = "";
    this.boundOnReceive = this.onReceive.bind(this);
    this.boundOnReceiveError = this.onReceiveError.bind(this);
    this.isConnected = false;
    this.connection = null; // type SerialPort
    this.name = name;
  }

  onConnectComplete(connectionInfo) {
    this.connection.on('data', this.boundOnReceive);
    this.connection.on('error', this.boundOnReceive);

    this.isConnected = true;
    logStatutSerial(this.name + ' connecté');

    this.emit('connect');
  }

  onReceive(buffer) {
    // Sur node.js, c'est un Buffer. Sur Chrome, c'était un ArrayBuffer.
    // Cela provoque une différence de traitement dans traiterTrameMonitor
    var bufView = new Uint8Array(buffer);

    /**
      Todo :
        A l'état actuel, le script identifie les trames binaires quand elles commencent et se terminent par @@@@
        Problème : si un message suit de trop près une trame, la trame n'est pas correctement interprétée
        Essayer de se concentrer sur les 4 premiers @ puis de découper le buffer en autant de trames qu'on en a reçu
        
        Une tentative a été faite pour TrameSick (%%%%) mais abandonné car TrameSick balance beaucoup trop de trames.
        Le mélange de %%%% et de @@@@ devient alors inutilisable.
    **/
    
    // la trame reçue est une trame "robot state" qui contient du binaire
    // donc on ne transforme pas en string
    // or le format de nos trames binaires commencent et terminent par un @
    if (String.fromCharCode(bufView[0]) === '@' && String.fromCharCode(bufView[bufView.length - 1]) === '@') {
      // on traite la trame binaire par la fonction qui va bien
      traiterTrameMonitor((this.name == 'PR' ? PR : GR), buffer);
      // Attention, traiterTrameMonitor est définie dans data.js (pour Monitor classique) et sick\script.js (pour Monitor Sick)
      return;
    }
    
    /*
    var offset = 0;
    // Trame Sick
    while (offset < bufView.length
      && String.fromCharCode(bufView[offset + 0]) === '%'
      && String.fromCharCode(bufView[offset + 1]) === '%'
      && String.fromCharCode(bufView[offset + 2]) === '%'
      && String.fromCharCode(bufView[offset + 3]) === '%') {
      // on traite la trame binaire par la fonction qui va bien
      traiterTrameSick(buffer, offset);
      // Attention, traiterTrameSick est définie dans data.js (pour Monitor classique) et sick\script.js (pour Monitor Sick)
      offset += 16;
      //return;
    }
    if(offset >= bufView.length) return;*/

    
    try {
      this.lineBuffer += ab2str(buffer);
    }
    catch(err) {
      this.lineBuffer += ab2str_secondeChance(buffer, (this.name == 'PR' ? PR : GR));
    }

    var index;
    while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
      var line = this.lineBuffer.substr(0, index + 1);
      this.emit('readline', line);
      this.lineBuffer = this.lineBuffer.substr(index + 1);
    }
  }

  onReceiveError(error) {
    logStatutSerial('Erreur détectée sur ' + this.name + ' : ' + error);
  }

  connect(path) {
    logStatutSerial('Tentative de connexion à ' + path);
    const options = {};
    this.connection = new SerialPort(path, options, this.onConnectComplete.bind(this));
  }

  send(msg) {
    if (!this.connection) {
      throw new Error(`Envoi d'un message alors que la connexion n'est pas faite`);
    }
    //this.connection.write(str2ab(msg)); //, 'binary');
    this.connection.write(msg);
  }

  disconnect(callback) {
    if (!this.connection) {
      throw new Error(`Deconnexion alors que la connexion n'est pas faite`);
    }

    this.isConnected = false;
    this.connection.close(() => {
      logStatutSerial(this.name + ' déconnecté');
      this.emit('disconnect');
      this.connection = null;
    });
  }
}

/** ========================
    UI Choix de la connexion
    ======================== **/

var getDevices = function() {

  SerialPort.list()
    .then((ports) => {
      if (!ports.length) {
        logStatutSerial('Aucun port disponible');
        genererSelectSerial(ports); // On va quand même le faire puisqu'il faut ajouter la simu
      }
      else {
        logStatutSerial(ports.length + ' ports disponibles.');
        genererSelectSerial(ports);
      }
    })
    .catch((error) => {
      logStatutSerial(`Impossible de lister les ports: ${error}`);
    });
};

var select = [
  document.getElementById('serialSelect0'),
  document.getElementById('serialSelect1')
];

var genererSelectSerial = function(ports) {

  select[0].appendChild(creerOption('Non connecté', 'disconnect'));
  select[1].appendChild(creerOption('Non connecté', 'disconnect'));

  select[0].appendChild(creerOption('Simulateur', 'simu'));
  select[1].appendChild(creerOption('Simulateur', 'simu'));

  var texte, value;
  for(var i = 0; i < ports.length; i++) {
    texte = ports[i].comName + ' - ' + (ports[i].manufacturer || ports[i].pnpId || ports[i].serialNumber || 'no detail');
    value = ports[i].comName;
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

connection[0].addListener('readline', function(line) {
  traiterMessage(0, line);
});
connection[1].addListener('readline', function(line) {
  traiterMessage(1, line);
});

connection[0].addListener('error', function(erreur) {
  document.getElementById('serialSelect0').value = 'disconnect';
});
connection[1].addListener('error', function(erreur) {
  document.getElementById('serialSelect1').value = 'disconnect';
});


var logStatutSerial = function(msg) {
  //document.getElementById('serialStatut').innerText = msg;
  log.monitor(msg);
}

/*
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
});//*/


getDevices();
