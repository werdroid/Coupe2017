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
var numMsg = [0, 0];

var match = {
  enCours: [false, false],
  termine: [false, false],
  debut: [0, 0],
  timer: [0, 0]   // Contient le timer de match du robot (màj à chaque réception de trame)
};



var log = {
  monitor: function(msg) {
    elem.log.monitor.innerHTML = msg + '<br>' + elem.log.monitor.innerHTML;
  },
  robot: function(r, msg) {
    var t = '';
    if(match.enCours[r]) {
      t = '<span class="infoTimer">' + Math.trunc(((new Date().getTime()) - match.debut[r])/1000) + '</span>';
    }
    elem.log.robot[r].innerHTML = t + msg + '<br>' + elem.log.robot[r].innerHTML;
  }
}

/*
var gabarit = {
  elem: document.getElementById('gabarit'),
  init: function() {
    var ctx = gabarit.elem.getContext('2d');
    ctx.lineWidth = 1;
    ctx.translate(50, 50);
    ctx.fillStyle = 'green';
    ctx.fillRect(-1, -1, 3, 3);
    // GR
    ctx.strokeStyle = 'orange';
    ctx.beginPath();
    ctx.arc(0, 0, 195 * table.general.scale, 0, Math.PI * 2);
    ctx.fillRect(-1, -1, 3, 3);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeRect(-150 * table.general.scale, -150 * table.general.scale, 300 * table.general.scale, 300 * table.general.scale);
    // PR
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc(0, 0, 110 * table.general.scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeRect(-100 * table.general.scale, -80 * table.general.scale, 200 * table.general.scale, 160 * table.general.scale);
    ctx.strokeRect(-80 * table.general.scale, -100 * table.general.scale, 160 * table.general.scale, 200 * table.general.scale);
  },
  afficher: function() {
    this.elem.style.opacity = 1;
  },
  masquer: function() {
    this.elem.style.opacity = 0;
  },
  positionner: function(x, y) {
    this.elem.style.left = (x - 50) + 'px';
    this.elem.style.top = (y - 50) + 'px';
  }
  
}
*/
table.init();
//gabarit.init();
//table.draw.point(500, 600, 3, 'blue');


document.getElementById('bEffacerTout').addEventListener('click', function() {
  //elem.log.monitor.innerHTML = '';
  elem.log.robot[0].innerHTML = '';
  elem.log.robot[1].innerHTML = '';
  table.reinitialiser();
  table.init();
});
document.getElementById('bEffacerSection').addEventListener('click', function() {
  var posHr = 0;
  for(var r = 0; r <= 1; r++) {
    posHr = elem.log.robot[r].innerHTML.lastIndexOf('<hr>');
    if(posHr > -1)
      elem.log.robot[r].innerHTML = elem.log.robot[r].innerHTML.substring(0,posHr);
  }
});

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
    var id = donnees.enregistrer(robot, msg);
    
    // Ajout d'événements aléatoires
    if(alea.unSur(250)) {
      table.match.evenements.ajouter(robot, 'Evénement ! ' + i);
      //nouvelleDirection(robot, alea.aleaX(), alea.aleaY(), alea.nb(10) + 2);
      destX[robot] = alea.aleaX();
      destY[robot] = alea.aleaY();
      //pas[robot] = alea.nb(10);//*/
    }
    
    table.match.positions.ajouter(robot, id);
    table.match.destinations.ajouter(robot, id);
   
  }
}

//genererJeuAleatoire();