const PR = 0;
const GR = 1;

var elem = {
  log: {
    monitor: document.getElementById('logMonitor'),
    robot: [document.getElementById('logRobot0'), document.getElementById('logRobot1')]
  },
  infoTable: document.getElementById('infoTable'),
  table: document.getElementById('table'), // utiliser table.elem pour celui-là
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
      return '-1';
  }
};

var log = {
  monitor: function(msg) {
    elem.log.monitor.innerHTML = msg + '<br>' + elem.log.monitor.innerHTML;
  },
  robot: function(r, msg, listeClass) {
    // Ajoute une ligne de log pour le robot r sous la forme d'un div
    // listeClass (str ou Array) permet d'ajouter des class à ce div
    
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

  // Met en surbrillance les lignes de log souhaitées
  // La sélection se fait par le class du log (par exemple : t1 pour les logs t = 1, e2 pour l'événement 2)
  highlight: {
    addAll: function(className) {
      log.highlight.addRobot(0, className);
      log.highlight.addRobot(1, className);
    },
    addRobot: function(r, className) {
      var ensemble = elem.log.robot[r].getElementsByClassName(className);
      for(var i = 0; i < ensemble.length; i++) {
        ensemble[i].classList.add('highlight');
      };
      ensemble[parseInt((ensemble.length - 1)/2)].scrollIntoViewIfNeeded();
    },
    removeAll: function() {
      log.highlight.removeRobot(0);
      log.highlight.removeRobot(1);
    },
    removeRobot: function(r) {
      var ensemble = elem.log.robot[r].getElementsByClassName('highlight');
      // Quand on retire un highlight, il n'apparaît plus dans ensemble. On les retire donc en partant de la fin.
      for(var i = ensemble.length - 1; i >= 0; i--) {
        ensemble[i].classList.remove('highlight');
      }
    }
  }
}

var curseur = {
  definirMin: function(r, min) {
    $('#curseurTMatch' + r).slider('option', 'min', min);
  },
  definirMax: function(r, max) {
    $('#curseurTMatch' + r).slider('option', 'max', max);
  }
}


var demarrerSimu = function(robot) {
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

table.init();
//gabarit.init();
//table.draw.point(500, 600, 3, 'blue');

document.querySelector('#startSimuPR').addEventListener('click', e => {
  demarrerSimu(PR);
});

document.querySelector('#startSimuGR').addEventListener('click', e => {
  demarrerSimu(GR);
});

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
	genererJeuAleatoire()
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
        mmY: y[robot]
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

//genererJeuAleatoire();
setTimeout(demarrerSimu, 2000, GR);