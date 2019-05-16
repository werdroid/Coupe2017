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

  onReceive(buf) {
    // Sur node.js, buffer est un Buffer. Sur Chrome, c'était un ArrayBuffer.

    // console.log('Buffer :', buf instanceof Buffer);
    // console.log('ArrayBuffer :',  buf instanceof ArrayBuffer);
    
    if(buf instanceof Buffer) {
      // "Vrai" Port Serial, reçu avec node.js
      // Explication de cette ligne : https://stackoverflow.com/a/31394257
      var buffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    else {
      // Simulateur ou Connexion Série Chrome
      var buffer = buf;
    }
    
    var bufView = new Uint8Array(buffer);

    /**
      Todo :
        A l'état actuel, le script identifie les trames binaires quand elles commencent et se terminent par @@@@
        Problème : si un message suit de trop près une trame, la trame n'est pas correctement interprétée
        Essayer de se concentrer sur les 4 premiers @ puis de découper le buffer en autant de trames qu'on en a reçu
        
        Une tentative a été faite pour TrameSick (%%%%) mais abandonné car TrameSick balance beaucoup trop de trames.
        Le mélange de %%%% et de @@@@ devient alors inutilisable.
    **/
    
    // Table ASCII : http://www.asciitable.com/
    const enumTypeTrame = { NONE: 0, MONITOR: 10, SICK: 11 }; // Sorte d'enum https://stackoverflow.com/a/5040502
    var trameEnCours = enumTypeTrame.NONE;
    var debut = 0;
    var curseur = 0;

    while( curseur < bufView.byteLength ) {
      //    STX STX STX DC1
      // ou STX STX STX DC2
      if(bufView[curseur] == 2
      && bufView[curseur + 1] == 2
      && bufView[curseur + 2] == 2
      && (bufView[curseur + 3] == 17 || bufView[curseur + 3] == 18)) {
        
        if(trameEnCours != enumTypeTrame.NONE) {
          // trame interrompue : prévenir, jeter le buffer en cours de lecture (ou le compléter par des 0 ??)
          this.emit('readline', '[Trame {' + trameEnCours + '} interrompue]'); // slice(debut, fin) : début (inclus), fin (exclu)
          debut = curseur;
        }
        else if(debut != curseur) {      
          // Message interrompu (ou sans \n)
          try {
            this.emit('readline', ab2str(buffer.slice(debut, curseur)) + ' [Message interrompu]\n'); // slice(debut, fin) : début (inclus), fin (exclu)
          }
          catch(err) {
            // C'est probablement une trame qui était en cours de transmission au moment de la connexion du Serial Port
            this.emit('readline', '[Message interrompu non interprétable]');
            console.log('Message interrompu non interprétable');
            console.log(bufView);
            console.log(debut, curseur);
          }
          debut = curseur;
        }
        
        if(bufView[curseur + 3] == 17) { // DC1
          trameEnCours = enumTypeTrame.MONITOR;                
        }
        else if(bufView[curseur + 3] == 18) { // DC2
          trameEnCours = enumTypeTrame.SICK;
        }
        
        curseur += 4;
      }
      
      // ETX ETX ETX ETX
      else if(bufView[curseur] == 3
          && bufView[curseur + 1] == 3
          && bufView[curseur + 2] == 3
          && bufView[curseur + 3] == 3
          && trameEnCours != enumTypeTrame.NONE) {
        
        // Finir et interpréter la trame
        if(trameEnCours == enumTypeTrame.MONITOR) {
          traiterTrameMonitor((this.name == 'PR' ? PR : GR), buffer.slice(debut, curseur + 4)); // slice(debut, fin) : debut (inclus), fin (exclu)
        }
        else if(trameEnCours == enumTypeTrame.SICK) {
          traiterTrameSick(buffer.slice(debut, curseur + 4));
        }

        curseur += 4;
        debut = curseur;
        trameEnCours = enumTypeTrame.NONE;
      }
      
      // NewLine
      else if(bufView[curseur] == 10
          && trameEnCours == enumTypeTrame.NONE) {

          this.emit('readline', ab2str(buffer.slice(debut, curseur + 1))); // slice(debut, fin) : début (inclus), fin (exclu)
          
          curseur++;
          debut = curseur;
      }
      
      // Autre
      else {

        // On se contente d'avancer
        curseur++;
      }
      
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
