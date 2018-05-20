const PR = 0;
const GR = 1;

var elem = {
  log: {
    monitor: document.getElementById('logMonitor'),
    robot: [document.getElementById('logRobot0'), document.getElementById('logRobot1')]
  },
  infoTable: document.getElementById('infoTable'),
  table: document.getElementById('table'), // utiliser table.elem pour celui-là
  cpu: [document.getElementById('cpu0'), document.getElementById('cpu1')],
  led: [document.getElementById('led0'), document.getElementById('led1')],
  obstacle: [document.getElementById('obstacle0'), document.getElementById('obstacle1')],
  curseur: [document.getElementById('curseurTMatch0'), document.getElementById('curseurTMatch1')],
  valeurCurseur: [document.getElementById('valeurTMatch0'), document.getElementById('valeurTMatch1')]
}

var etatLed = [true, true];
//var finMatch = [false, false];
var dernierePosition = [[0, 0], [0, 0]];
//var tRobots = [0, 0];   // Contient le timer de match du robot (màj à chaque réception de trame). Nécessaire pour dater les événements

var match = {
  enCours: [false, false],
  termine: [false, false],
  debut: [0, 0],  // Début du match (valeur Monitor)
  
  demarrer: function(r) {
    log.robot(r, '<span class="infoTimer">== Début du match ==</span><hr>');
    if(match.enCours[r] || match.termine[r])
      log.robot(r, '<span class="infoTimer">(Remplace le précédent)</span>');

    match.debut[r] = new Date().getTime();
    match.enCours[r] = true;
    match.termine[r] = false;
    curseur.definirMin(r, donnees.d[r].length - 1);

    if((r == 0 && match.enCours[1]) || (r == 1 && match.enCours[0]))
      log.robot(r, '<span class="infoTimer">Retard de ' + Math.abs(match.debut[1] - match.debut[0]) + 'ms par rapport à l\'autre robot</span>');

  },

  terminer: function(r) {
    if(!match.termine[r]) {
      match.termine[r] = true;
      log.robot(r, '<span class="infoTimer">== Fin du match ==</span>');
    }
  },

  getTimer: function(r) {
    if(match.termine[r] || match.enCours[r])
      return Math.trunc(((new Date().getTime()) - match.debut[r])/1000);
    else
      return -1;
  }
};

var log = {
  // Ajoute une ligne de log dans la zone en bas à gauche (messages généraux du Monitor)
  monitor: function(msg) {
    elem.log.monitor.innerHTML = msg + '<br>' + elem.log.monitor.innerHTML;
  },

  // Ajoute une ligne de log pour le robot r sous la forme d'un div
  //   listeClass (str ou Array) ajoute des class à ce div
  //   dataset (objet) ajoute des data-* supplémentaires
  robot: function(r, msg, listeClass, dataset) {
      
    var div = document.createElement('div');
    div.classList.add('logMsg');
    div.classList.add('r' + r);
    div.innerHTML = msg;
    
    // Ajout des classes personnalisées
    if(Array.isArray(listeClass)) {
      listeClass.forEach(function(cl) {
        div.classList.add(cl);
      });
    }
    else if(listeClass !== undefined) {
        div.classList.add(listeClass);
    }

    // Ajout des data-* personnalisées
    for(var keys in dataset) {
      div.dataset[keys] = dataset[keys];
    }

    // Ajout du timer
    if(match.enCours[r]) {
      t = match.getTimer(r);
      div.classList.add('t' + t);
      //if(donnees.d[r].length > 0)
      div.dataset.t = donnees.getLast(r).t;
      div.innerHTML = '<span class="infoTimer">' + t + '</span>' + div.innerHTML;
    }
    
    // Insertion dans les logs
    elem.log.robot[r].insertBefore(div, elem.log.robot[r].firstChild);
  },
  
  // Modifie l'opacité des logs non compris entre indiceMin et indiceMax
  filtrer: function(r, indiceMin, indiceMax) {
    var tmin = donnees.get(r, indiceMin).t;
    var tmax = donnees.get(r, indiceMax).t;
    var $logMsg = $('.logMsg.r' + r)
    var $logMsgDansFiltre = $logMsg.filter(function() { 
                              return $(this).data("t") >= tmin && $(this).data("t") <= tmax;
                            });
    if($logMsgDansFiltre.length > 0) {
      $logMsgDansFiltre.first().get()[0].scrollIntoViewIfNeeded();                
      // Mieux sur le papier, mais moins agréable à l'oeil (avis perso)
      // $logMsgDansFiltre.eq( parseInt($logMsgDansFiltre.length / 2) ).get()[0].scrollIntoView( {block: 'center', inline: 'center'});
    }
    $logMsgDansFiltre.css('opacity','1');
    $logMsg.filter(function() { 
      return $(this).data("t") < tmin || $(this).data("t") > tmax;
    }).css('opacity','0.2');
  },

  
  // Gestion de la surbrillance des lignes de log souhaitées.
  // Utilisé pour repérer un log à partir d'un élément dessiné sur la table
  highlight: {

    // Surligner les logs répondant à une class donnée (par exemple : t1 pour les logs à tMatch = 1, e2 pour l'événement 2)
    addByClass: function(r, className) {
      var listeLogs = elem.log.robot[r].getElementsByClassName(className);
      log.highlight.addList(listeLogs);
    },

    // Surligner les logs ayant un data- spécifié ou répondant à un data- particulier
    addByData: function(r, cle, valeur) {
      if(valeur === undefined)
        var recherche = '[data-' + cle + ']';
      else
        var recherche = '[data-' + cle + '=\'' + valeur + '\']';
        
      var listeLogs = elem.log.robot[r].querySelectorAll(recherche);
      log.highlight.addList(listeLogs);
    },

    // (Application du highlight)
    addList: function(listeLogs) {
      if(listeLogs.length == 0) return;
      
      for(var i = 0; i < listeLogs.length; i++) {
        listeLogs[i].classList.add('highlight');
      };
      listeLogs[parseInt((listeLogs.length - 1)/2)].scrollIntoViewIfNeeded();
    },

    // Enlever toutes les surbrillances
    removeAll: function() {
      log.highlight.removeRobot(0);
      log.highlight.removeRobot(1);
    },
    removeRobot: function(r) {
      var listeLogs = elem.log.robot[r].getElementsByClassName('highlight');
      // Quand on retire un highlight, il n'apparaît plus dans listeLogs. On les retire donc en partant de la fin.
      for(var i = listeLogs.length - 1; i >= 0; i--) {
        listeLogs[i].classList.remove('highlight');
      }
    }
  },

  // Positionner les repères à partir du survol d'un log
  reperer: function(e) {
    // Récupération du robot survolé
    var robot;
    if(e.target.classList.contains('r0'))
      robot = 0;
    else if(e.target.classList.contains('r1'))
      robot = 1;

    // Survol d'un événement ?
    if(e.target.dataset.evenement !== undefined) {
      var infosEvenement = evenements.get(robot, e.target.dataset.evenement);
      var infos = donnees.get(robot, infosEvenement.idData);
      table.repere.positionner(infos.position.mmX, infos.position.mmY);
      table.repere.afficher(true);
    }
    else {
      table.repere.afficher(false);
    }
  }
  
}

elem.log.robot[0].addEventListener('mouseover', log.reperer);
elem.log.robot[1].addEventListener('mouseover', log.reperer);


var curseur = {
  definirMin: function(r, min) {
    $('#curseurTMatch' + r).slider('option', 'min', min);
  },
  definirMax: function(r, max) {
    $('#curseurTMatch' + r).slider('option', 'max', max);
  }
}

var simu = {
  inhiber: [false, false],

  demarrer: function(robot) {
    if(simu.inhiber[robot]) {
      log.monitor('Redémarrer le Monitor pour relancer une simulation sur ' + (robot == PR ? 'PR' : 'GR'));
      return;
    }
    simu.inhiber[robot] = true;

    // Force la reliure des points
    document.getElementById('cbRelierPoints').checked = true;
    table.match.positions.afficherReliures(true);

    // Démarrage de la simu
    if(robot == PR) {
      Module._pr_init();
      Module._match_pr();
    }
    else {
      Module._gr_init();
      Module._match_gr();
    }
  }
}

table.init();
//gabarit.init();
//table.draw.point(500, 600, 3, 'blue');

/*document.querySelector('#startSimuPR').addEventListener('click', e => {
  simu.demarrer(PR);
});

document.querySelector('#startSimuGR').addEventListener('click', e => {
  simu.demarrer(GR);
});*/

document.getElementById('bEffacerTout').addEventListener('click', function() {
  log.monitor('RaZ');
  for(var r = 0; r <= 1; r++) {
    elem.log.robot[r].innerHTML = '';
    evenements.e[r] = [];
  }
  table.effacerTout();
});
document.getElementById('bEffacerSection').addEventListener('click', function() {
  var posHr = 0;
  for(var r = 0; r <= 1; r++) {
    posHr = elem.log.robot[r].innerHTML.lastIndexOf('<hr>');
    if(posHr > -1)
      elem.log.robot[r].innerHTML = elem.log.robot[r].innerHTML.substring(0,posHr);
  }
});
document.getElementById('bGenererJeuAleatoire').addEventListener('click', function() {
	genererJeuAleatoire();
});
document.getElementById('bExtrairePR').addEventListener('click', function() {
  donnees.extraireVersCSV(PR);
});
document.getElementById('bExtraireGR').addEventListener('click', function() {
  donnees.extraireVersCSV(GR);
});

/*
document.getElementById('logRobot1').addEventListener('mouseover', function(e) {
  if(!e.target.classList.contains('logMsg'))
    return;
    
  console.log(e.target.dataset.t);
})*/

window.addEventListener('resize', table.conteneur.majPosition);


/**
Données aléatoires pour tester
**/

var alea = {
  nb: function(max) {
    return parseInt(Math.random() * max);
  },
  aleaX: function() {
    return alea.nb(3000);
  },
  aleaY: function() {
    return alea.nb(2000);
  },
  unSur: function(nb) {
    return alea.nb(nb) == 0;
  }
}

var genererJeuAleatoire = function() {
  var x = [alea.aleaX(), alea.aleaX()];
  var y = [alea.aleaY(), alea.aleaY()];
  /*var destX = [];
  var destY = [];
  var pasX = [];
  var pasY = [];


  var nouvelleDirection = function(_r, _x, _y, pts) {
    destX[_r] = _x;
    destY[_r] = _y;
    pasX[_r] = parseInt((_x - x[_r])/pts) + 1;
    pasY[_r] = parseInt((_y - y[_r])/pts) + 1;
  }
  nouvelleDirection(PR, alea.aleaX(), alea.aleaY(), alea.nb(50) + 2);
  nouvelleDirection(GR, alea.aleaX(), alea.aleaY(), alea.nb(50) + 2);
  //*/

  var destX = [x[0] + alea.nb(1000), x[1] - alea.nb(1000)];
  var destY = [y[0] + alea.nb(400), y[1] - alea.nb(400)];//*/

  for(var i = 0; i < 1500; i++ ) {    
    var robot = (i % 2 == 0 ? PR : GR); //(alea.unSur(2) ? PR : GR);

    if(i == 6 || i == 7) { // Plante si appelé avant la réception du 1er point
      match.demarrer(robot);
    }
    else if(i == 1488 || i == 1489) { // Pas de plantage, juste + proche de la réalité
      match.terminer(robot);
    }

    // Avancer les robots (aléatoirement)
    x[robot] += alea.nb(100) * (alea.unSur(2) ? -1 : 1);
    y[robot] += alea.nb(80) * (alea.unSur(2) ? -1 : 1);

    // Changement de "direction"
    if(alea.unSur(50)) {
      destX[robot] = x[robot] + alea.nb(1000) * (alea.unSur(2) ? -1 : 1);
      destY[robot] = y[robot] + alea.nb(800) * (alea.unSur(2) ? -1 : 1);
    }//*/

    /*
    // Avancer les robots vers la direction
    // (Finalement moins "visuel" pour les tests)
    x[robot] += pasX[robot]; //parseInt((destX[robot] - x[robot])/pas[robot]);
    y[robot] += pasY[robot]; //parseInt((destY[robot] - y[robot])/pas[robot]);

    if(Math.abs(destX[robot] - x[robot]) < 10 && Math.abs(destY[robot] - y[robot] < 10)) {
      nouvelleDirection(robot, alea.aleaX(), alea.aleaY(), alea.nb(50) + 2);
    }//*/


    var msg = {
      t: i*10,
      position: {
        mmX: x[robot],
        mmY: y[robot],
        a: 0
      },
      destination: {
        mmX: destX[robot],
        mmY: destY[robot]
      }
    };
		donnees.enregistrer(robot, msg);

    // Ajout d'événements aléatoires
    if(alea.unSur(250)) {
      evenements.enregistrer(robot, 'Evénement ! ' + i);
      //nouvelleDirection(robot, alea.aleaX(), alea.aleaY(), alea.nb(10) + 2);
      destX[robot] = alea.aleaX();
      destY[robot] = alea.aleaY();
      //pas[robot] = alea.nb(10);//*/
    }


  }
}


// Connexion / lancement automatique au démarrage du Monitor


/* // Robots réels (à revoir depuis ajustements sur connect)
connection1.connect('COM5');
document.getElementById('serialSelect1').value = 'COM5';
setTimeout(function() {
  connection0.connect('COM4');
  document.getElementById('serialSelect0').value = 'COM4';
  // connection1.connect('COM7');
}, 1000);
//*/


setTimeout(function() {

  // Jeu aléatoire (avec événements)
  //genererJeuAleatoire();
  
  // Simulateur
  // changeSerialConnection(GR, 'simu');



}, 500);


