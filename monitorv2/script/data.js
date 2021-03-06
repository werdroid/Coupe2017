/**
Gestion des données (Positions, Destinations) provenant des robots
Les événements ne sont pas gérés ici (-> evenements.js)
**/

/* RAPPEL :
const PR = 0;
const GR = 1;
*/


/** ========================
   Structure et méthodes get
   ========================= **/

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
      stats: { // signes vitaux du robot (cpu)
        time_total:
        cpu_pourcent:
      },
      sick: {
        obstacle:
        angleObstacle:
        distanceObstacle:
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

var fs = require('fs');
const {dialog} = require('electron').remote

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
  
  // Affiche dans le log robot la dernière trame reçue
  displayLast: function(robot) {
    log.robot(robot, JSON.stringify(donnees.getLast(robot)));
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
  },

  genererCSV: function(robot) {
    var param = ['t', 'tMatch', 'position', 'destination', 'stats', 'sick'];
    var EOL = "\r\n";

    // Données d'export
    var file = (robot == PR ? 'PR' : 'GR') + EOL;
    file += getDateStr() + EOL;

    // En-têtes
    file += EOL;
    for(var p = 0; p < param.length; p++) {
    if(typeof donnees.d[robot][0][param[p]] === "object") {
      for(var key in donnees.d[robot][0][param[p]]) {
        file += param[p] + '.' + key + ';';
      }
    }
    else {
      file += param[p] + ';';
    }
    }
    file += EOL;

    // Données
    for(var i = 0; i < donnees.d[robot].length; i++) {
    for(var p = 0; p < param.length; p++) {
      if(typeof donnees.d[robot][i][param[p]] === 'object') {
        for(var key in donnees.d[robot][i][param[p]]) {
          file += donnees.d[robot][i][param[p]][key] + ';';
        }
      }
      else {
        file += donnees.d[robot][i][param[p]] + ';';
      }
    }
    file += EOL;
    }

    return file;
  }
}


/** ==============
   Enregistrements
   =============== **/
function traiterTrameSick(buf) {
  return;
}
   
// La trame monitor contient des infos sur le robot
// en binaire via un buffer, il faut parser cela puis
// envoyer le résultat dans notre structure JS
var logVerificationBranchementPRGR = [true, true]; // Utilisé pour afficher un log spécifique 1 seule fois
function traiterTrameMonitor(robot, buf) {
  //console.log('nouvelle trame robot state monitor', buffer);  

  trameMonitor = decoderTrameMonitor(buf);

  //console.log(trameMonitor);

  // On vérifie que PR est bien branché sur PR.
  // Si ce n'est pas le cas, simple information
  if(logVerificationBranchementPRGR[robot]) {
    logVerificationBranchementPRGR[robot] = false; // Cette vérification n'est à faire qu'une seule fois
    
    // Dans le robot isPR = 1 c'est le petit robot
    // Dans le monitor 0 c'est le petit robot
    var robotLu = trameMonitor.isPR ? 0 : 1;
    if(robot != robotLu) {
      log.monitor('Sans vouloir vous offenser, le robot connecté en tant que ' + (robot == PR ? 'PR':'GR') + ' est en fait ' + (robotLu == PR ? 'PR' : 'GR') + ' (c\'est pas grave, on fait tous des erreurs...)');
    }
  }
  
  // === Calculs ===
  // % CPU (l'affichage se fera plus tard)
  var cpuPourcent = trameMonitor.time_total / 100; // On divise par (1/100)*1000000 *100 [= DT_US * 100 pour affichage en %]
  if(cpuPourcent > 75) {
    elem.cpu[robot].style.backgroundColor = 'red'; // restera rouge jusqu'au redémarrage
    evenements.enregistrer(robot, 'CPU ' + cpuPourcent + '%');
  }
  
  // === Enregistrement ===
  donnees.enregistrer(robot, {
    t: trameMonitor.millis,
    stats: { // signes vitaux du robot (cpu)
      time_total: trameMonitor.time_total,
      cpu_pourcent:  cpuPourcent
    },
    sick: {
      obstacle: trameMonitor.sickObstacle,
      angleObstacle: trameMonitor.sickAngleObstacle,
      distanceObstacle: trameMonitor.sickDistanceObstacle
    },
    position: {
      mmX: trameMonitor.xMm,
      mmY: trameMonitor.yMm,
      a: trameMonitor.a,
      aDeg: parseInt(trameMonitor.a * 180 / Math.PI)
    },
    destination: {
      mmX: trameMonitor.consigneXmm,
      mmY: trameMonitor.consigneYmm
    }
  });

  // === Affichages ===
  if(trameMonitor.sickObstacle == 1) {
	elem.obstacle[robot].className = 'oui';
	elem.angleObstacle[robot].innerText = trameMonitor.sickAngleObstacle;
	elem.distanceObstacle[robot].innerText = trameMonitor.sickDistanceObstacle;
  }
  else {
	elem.obstacle[robot].className = 'non';
	// On laisse volontairement les valeurs du dernier obstacle détecté
  }
  elem.cpu[robot].style.height = cpuPourcent + '%'; 
  elem.led[robot].className = (trameMonitor.led_state ? 'on' : 'off');
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
      case "#LedChange\n": // Ne devrait plus être utilisé
        etatLed[r] = !etatLed[r];
        elem.led[r].className = (etatLed[r] ? 'on' : 'off');
        break;
      case "#FinProgramme\n":
        log.robot(r, msg);
        match.terminer(r);
        break;
      case "#-----OBSTACLE\n":
        evenements.enregistrerObstacle(r);
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


/** =====
   Export
   ====== **/

//document.getElementById('bExporterPoints').addEventListener('click', function() {
var getDateStr = function() {
  var twoDigits = function(nb) {
    return (nb < 10 ? '0' + nb : nb);
  }

  var date = new Date();
  return date.getFullYear() + '-' + twoDigits(date.getMonth()+1) + '-' + twoDigits(date.getDate()) + '_' + twoDigits(date.getHours()) + twoDigits(date.getMinutes()) + twoDigits(date.getSeconds());
}

// Fonction plus générique, conservée "au cas où"
var exporterFichier = function(prefixe, fonctionEcriture) {
  // https://ourcodeworld.com/articles/read/106/how-to-choose-read-save-delete-or-create-a-file-with-electron-framework

  dialog.showSaveDialog({
      defaultPath: prefixe + getDateStr() + '.csv',
      filters: [{ name: 'Fichier csv (*.csv)',
          extensions: ['csv']}]
    }, (fileName) => {
          if (fileName === undefined){
              log.monitor("Export abandonné");
              return;
          }

          content = fonctionEcriture();

          // fileName is a string that contains the path and filename created in the save file dialog.  
          fs.writeFile(fileName, content, (err) => {
              if(err){
                  log.monitor("Erreur pendant la création du fichier : "+ err.message)
              }

              log.monitor("Données exportées vers " + fileName);
          });
      }
    );
}

var exporterDonnees = function(robot) {
  if(donnees.d[robot].length == 0) {
    log.monitor("Rien à exporter pour ce robot");
    return;
  }

  var fileName1 = dialog.showSaveDialog({
    defaultPath: "Monitor_" + (robot == PR ? 'PR' : 'GR') + "_" + getDateStr() + '.csv',
    filters: [{ name: 'Fichier csv (*.csv)',
        extensions: ['csv']}]
  });

  if(fileName1 === undefined){
      log.monitor("Export abandonné");
      return;
  }

  // Données des trames
  var content = donnees.genererCSV(robot);
  fs.writeFile(fileName1, content, (err) => {
      if(err){
          log.monitor("Erreur pendant l'export des données csv : "+ err.message)
      }
      log.monitor("Données exportées vers " + fileName1);
  });

  // Logs
  var logs = document.getElementById('logRobot' + robot).innerHTML; // C'est moche mais simple
  var fileName2 = fileName1.replace('.csv', '.html');
  fs.writeFile(fileName2, logs, (err) => {
    if(err){
        log.monitor("Erreur pendant l'export des logs : "+ err.message)
    }
    log.monitor("Logs exportés vers " + fileName2);
  });
}