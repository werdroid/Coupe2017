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
  debut: [0, 0]
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

table.init();
gabarit.init();
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
/*
Affichage du gabarit
==> Sera mis à jour + tard


table.conteneur.elem.addEventListener('mousemove', function(e) {
  if(!table.param.afficherCoordonnees())
    return;
  
  var x = (e.clientX - table.general.posX) / table.general.scale;
  var y = (e.clientY - table.general.posY) / table.general.scale;
  var x50 = Math.round(x / 50) * 50;
  var y50 = Math.round(y / 50) * 50;
  var posX = x50 * table.general.scale + 10;
  var posY = y50 * table.general.scale + 10;
  
  
  //elem.curseur.style.opacity = 1;
  //elem.curseur.style.left = (posX - 1) + 'px';
  //elem.curseur.style.top = (posY - 1) + 'px';
  
  infobulle.html('<span style="color: green;">' + x50 + 'x' + y50 + '</span>'); //<br><span style="color: #cccccc;">' + x + 'x' + y + '</span>');
  infobulle.positionner(posX + 10, posY + 10);
  
  gabarit.afficher();
  gabarit.positionner(posX, posY);
  //infobulle.positionner(e.clientX + 10, e.clientY + 10);
  //console.table(e);
});
table.conteneur.elem.addEventListener('mouseout', function() {
  //elem.infoTable.innerText = '-';
  infobulle.masquer();
  gabarit.masquer();
  //elem.curseur.style.opacity = 0;
});
*/
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

var x = [alea.aleaX(), alea.aleaX()];
var y = [alea.aleaY(), alea.aleaY()];
for(var i = 0; i < 1500; i++ ) {
  var robot = (i % 2 == 0 ? PR : GR); //(alea.unSur(2) ? PR : GR);
  if(alea.unSur(250)) {
    table.match.evenements.ajouter(robot, 'Evénement ! ' + i);
  }
  else {
    x[robot] += alea.nb(100) * (alea.unSur(2) ? -1 : 1);
    y[robot] += alea.nb(80) * (alea.unSur(2) ? -1 : 1);
  }
  table.match.positions.ajouter(robot,
    donnees.enregistrer(robot, {
      t: i*10,
      mmX: x[robot],
      mmY: y[robot]
    })
  );
  //table.match.positions.ajouter(GR, donnees.enregistrer(GR, '@|Position|"mmX":' + alea.aleaX() + ',"mmY":' + alea.aleaY()));
}

