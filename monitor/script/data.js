/**
Gestion des données (Positions, Destinations) provenant des robots
Les événements ne sont pas gérés ici (-> evenements.js)
**/

/* RAPPEL :
const PR = 0;
const GR = 1;
*/

/**
Ensemble des positions et destinations de chaque robot, à chaque instant

~ indique qu'il s'agit d'une variable à usage interne : n'a pas à être renseigné pendant la création de la trame
donnees.d = [
  [
    {
      t:        timestamp de la donnée
      ~tMatch:   temps écoulé depuis le début du match (valeur Monitor en s ; -1 si match non démarré)
      position: {
        mmX:    position du robot sur l'axe x (mm) (provient de la trame)
        mmY:    position du robot sur l'axe y (mm) (provient de la trame)
        a:      angle du robot
        aDeg:   angle du robot (en °)
      },
      destination: {
        mmX:    (provient de la trame)
        mmY:    (provient de la trame)
      },
      ~svg: {    Ensemble des index (dans table.obj) des éléments dessinés sur la table et liés à cette trame
        pt:     pt position,
        reliure:
        destination:  croix destination
      }
    },
    {
      ... Idem pour chaque trame
    }
  ],
  [
    ... Idem pour GR ...
  ]
]



**/


var donnees = {
  d: [[], []],  // PR et GR

  // Retourne le jeu de données à l'indice indiqué
  // si id < 0, retourne à partir de la fin
  get: function(robot, id) {
    if(id >= 0) {
      /*if(id >= donnees.d[robot].length)
        return donnees.d[robot][donnees.d[robot].length - 1];
      else*/
        return donnees.d[robot][id];
    }
    else {
      /*if(id < -donnees.d[robot].length)
        return donnees.d[robot][0];
      else*/
        return donnees.d[robot][donnees.d[robot].length + id];
    }
  },

  // Retourne le jeu de données au timer indiqué
  // (Retourne la valeur trouvée (1 seule), undefined sinon)
  getTempsExact: function(robot, time) {
    return donnees.d[robot].find(function(elem) {
      return elem.t == time;
    });
  },

  // Retourne le dernier jeu de données du robot
  getLast: function(robot) {
    return donnees.get(robot, -1);
  },


  // Enregistre un jeu de données, l'affiche sur le Monitor, et retourne son indice
  // trame ne doit contenir que les éléments provenant du robot
  //    Cf. liste tout en haut de ce fichier
  //    Les variables à usage interne indiquées par un ~ (svg, id, ...) sont ajoutées ici
  enregistrer: function(robot, trame) {
    Object.assign(trame, {
        id: donnees.d[robot].length,
        tMatch: match.getTimer(robot),
        svg: {}
      });

    var id = donnees.d[robot].push(trame) - 1;
    //tRobots[robot] = trame.t;
    table.match.positions.ajouter(robot, id);
    table.match.destinations.ajouter(robot, id);
    curseur.definirMax(robot, id);
  }

}

// La trame monitor contient des infos sur le robot
// en binaire via un buffer, il faut parser cela puis
// envoyer le résultat dans notre structure JS
function traiterTrameMonitor(buffer) {
  console.log('nouvelle trame robot state monitor', buffer);
  var offset = 0;
  var HEAP8 = new Int8Array(buffer);
  var HEAP16 = new Int16Array(buffer);
  var HEAP32 = new Int32Array(buffer);
  var HEAPU8 = new Uint8Array(buffer);
  var HEAPU16 = new Uint16Array(buffer);
  var HEAPU32 = new Uint32Array(buffer);
  var HEAPF32 = new Float32Array(buffer);
  function nextChar() {    return String.fromCharCode(nextUInt8()); }
  function nextUInt8() {   var value = HEAPU8[offset >> 0]; offset += 1; return value; }
  function nextUInt16() {  var value = HEAPU16[offset >> 1]; offset += 2; return value; }
  function nextUInt32() {  var value = HEAPU32[offset >> 2]; offset += 4; return value; }
  function nextInt8() {  var value = HEAP8[offset >> 0]; offset += 1; return value; }
  function nextInt16() {   var value = HEAP16[offset >> 1]; offset += 2; return value; }
  function nextInt32() {   var value = HEAP32[offset >> 2]; offset += 4; return value; }
  function nextFloat() {   var value = HEAPF32[offset >> 2]; offset += 4; return value; }

  var trameMonitor = {};
  if (nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@') {
    throw new Error('Trame monitor ne commence pas par 4 arobases, trash it.');
  }

  // pour la lecture, l'ordre est important
  trameMonitor.millis = nextUInt32();
  trameMonitor.a = nextFloat();
  trameMonitor.time_total = nextUInt32();
  trameMonitor.xMm = nextInt16();
  trameMonitor.yMm = nextInt16();
  trameMonitor.proche_distance = nextUInt16();
  trameMonitor.sickObstacle = nextUInt8();
  trameMonitor.isPR = nextUInt8();

  if (nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@') {
    throw new Error('Trame monitor ne termine pas par 4 arobases, trash it.');
  }

  console.log(trameMonitor);

  // Dans le robot isPR = 1 c'est le petit robot
  // Dans le monitor 0 c'est le petit robot
  var robot = trameMonitor.isPR ? 0 : 1;

  // Enregistrement
  donnees.enregistrer(robot, {
    t: trameMonitor.millis,
    stats: { // signes vitaux du robot (cpu)
      time_total: trameMonitor.time_total
    },
    sick: {
      sickObstacle: trameMonitor.sickObstacle,
      proche_distance: trameMonitor.proche_distance
    },
    position: {
      mmX: trameMonitor.xMm,
      mmY: trameMonitor.yMm,
      a: trameMonitor.a,
      aDeg: parseInt(trameMonitor.a * 180 / Math.PI)
    },
    destination: {  /**** TODO : Réceptionner la destination *****/
      mmX: 0,
      mmY: 0
    }
  });

  // Affichage d'un obstacle
  elem.obstacle[robot].className = (trameMonitor.sickObstacle == 1 ? 'oui' : 'non');

}

// Traitement d'un message reçu depuis le port Série
// r = robot émetteur (0 ou 1)
var traiterMessage = function(r, msg) {

  // Réception de données sous forme Str.
  // Normalement obsolète pour la Position, conservé pour rester Compatible ou pour la transmission de données particulières
  if (msg[0] == '@') {
    if(msg[1] == '|') {
      traiterData(r, msg);
    }
    else {
      log.robot(r, msg);
    }
  }

  // Réception d'un événement
  else if(msg[0] == '!') {
    evenements.enregistrer(r, msg);
  }

  // Réception d'un mot-clé
  // (# = Nouveauté 2018. Les messages 2017 ne sont plus interprétés => spam du log)
  else if(msg[0] == '#') {
    switch(msg) {
      case "#DebutDuMatch\n":
      case "#DebutDuMatch\n\n":
        match.demarrer(r);
        break;
      case "#LedChange\n":
        etatLed[r] = !etatLed[r];
        elem.led[r].className = (etatLed[r] ? 'on' : 'off');
        break;
      case "#FinProgramme\n":
        log.robot(r, msg);
        match.terminer(r);
        break;
      case "#-----OBSTACLE\n":
        evenements.enregistrer(r, 'Obstacle');
        break;
      default:
        log.robot(r, msg + ' [[Non interprété]]');
    }
  }

  // Tout autre message non vide
  else if(msg != "\n") {
    log.robot(r, msg);
  }
}


// Traitement d'une trame textuelle
var logTransmissionPositionObsolete = [true, true]; // Utilisé pour afficher un log spécifique 1 seule fois
var traiterData = function(robot, trame) {
  /*
    Les trames arrivent sous forme de str
    @|<Type>|<JSONData>
  */
  var action = trame.split('|');
  var param = JSON.parse('{' + action[2] + '}');
  switch(action[1]) {
    case 'Codeurs':
      break;
    case 'Position':
      // OBSOLETE - Conservé pour compatibilité avec anciens codes (Coupe IdF 2016 -> Coupe 2017)
      if(logTransmissionPositionObsolete[robot]) {
        logTransmissionPositionObsolete[robot] = false;
        log.monitor((robot == 0 ? 'PR':'GR') + ' communique sa position avec un style de trames obsolète (@|Position|...)');
      }
      var trame = {
        t: donnees.d[robot].length,
        position: {
          mmX: param.mmX,
          mmY: param.mmY,
          a: param.angleRad,
          aDeg: param.angleDeg
        },
        destination: {
          mmX: param.consigneXmm,
          mmY: param.consigneYmm
        }
      };
      donnees.enregistrer(robot, trame);
      break;
    case 'Moteurs':
      break;
    case 'Asserv':
      break;
    case 'ErreurConsigne':
      break;
    case 'Sick':
      elem.obstacle[robot].className = param.obstacle;
      break;
    default:
      log.monitor(action[1] + ' inconnue (en provenance de ' + r + '.');
  }
}
