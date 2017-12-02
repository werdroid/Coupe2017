/**
Gestion des données (data et log) provenant des robots
**/

/* RAPPEL :
const PR = 0;
const GR = 1;
*/

/**
donnees.d = [
  [
    {
      t:        temps écoulé (ms) depuis le début du match (valeur robot)
      position: {
        mmX:    position du robot sur l'axe x (mm) (provient de la trame)
        mmY:    position du robot sur l'axe y (mm) (provient de la trame)
      },
      destination: {
        mmX:    (provient de la trame)
        mmY:    (provient de la trame)
      },
      svg: {    Ensemble des index (dans table.obj) des éléments dessinés sur la table et liés à cette trame
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

  // Retourne le jeu de données correspondant à la forme #idsvg
  getParIdSvg: function(idsvg) {
    var forme = SVG.get(idsvg);
    return donnees.d[forme.data('robot')][forme.data('donnee')];
  },
  /*
  // Retournent une liste d'id de points
  filtrerPts: {
    parDestination: function(robot, idDest) {

    }
  },*/

  // Enregistre un jeu de données et retourne son indice
	enregistrer: function(robot, trame) {
    if(trame[1] != '|') {
      match.timer[robot] = trame.t;
      var id = donnees.d[robot].push({
        id: donnees.d[robot].length,
        t: trame.t,
        timer: getTimerMatch(robot),
        position: {
          mmX: trame.position.mmX,
          mmY: trame.position.mmY
        },
        destination: {
          mmX: trame.destination.mmX,
          mmY: trame.destination.mmY
        },
        svg: {},
        logs: []
      }) - 1;
      table.match.positions.ajouter(robot, id);
      table.match.destinations.ajouter(robot, id);
      curseur.definirMax(robot, id);

    }
    else {
      // Compatibilité avec Coupe IdF 2016
      var action = trame.split('|');
      var param = JSON.parse('{' + action[2] + '}');
      switch(action[1]) {
        case 'Codeurs':
          break;
        case 'Position':
          var id = donnees.d[robot].push({
            t: donnees.d[robot].length,
            timer: getTimerMatch(robot),
            position: {
              mmX: param.mmX,
              mmY: param.mmY,
              a: param.angleRad,
              aDeg: param.angleDeg
            },
            destination: {
              mmX: param.consigneXmm,
              mmY: param.consigneYmm
            },
            svg: {},
            logs: []
          }) - 1;
          table.match.positions.ajouter(robot, id);
          table.match.destinations.ajouter(robot, id);
          curseur.definirMax(robot, id);

          /*dernierePosition[r][0] = param.mmX;
          dernierePosition[r][1] = param.mmY;*/
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
	}

}

// La trame monitor contient des infos sur le robot
// en binaire via un buffer, il faut parser cela puis
// envoyer le résultat dans notre structure JS
function traiterTrameMonitor(buffer) {
  console.log('nouvelle trame monitor');
  var offset = 0;
  var HEAP8 = new Int8Array(buffer);
  var HEAP16 = new Int16Array(buffer);
  var HEAP32 = new Int32Array(buffer);
  var HEAPU8 = new Uint8Array(buffer);
  var HEAPU16 = new Uint16Array(buffer);
  var HEAPU32 = new Uint32Array(buffer);
  var HEAPF32 = new Float32Array(buffer);
  var HEAPF64 = new Float64Array(buffer);
  function nextChar() {    return String.fromCharCode(nextUInt8()); }
  function nextUInt8() {   var value = HEAPU8[offset >> 0]; offset += 1; return value; }
  function nextUInt16() {  var value = HEAPU16[offset >> 1]; offset += 2; return value; }
  function nextUInt32() {  var value = HEAPU32[offset >> 2]; offset += 4; return value; }
  function nextInt8() {  var value = HEAP8[offset >> 0]; offset += 1; return value; }
  function nextInt16() {   var value = HEAP16[offset >> 1]; offset += 2; return value; }
  function nextInt32() {   var value = HEAP32[offset >> 2]; offset += 4; return value; }
  function nextFloat() {   var value = HEAPF32[offset >> 2]; offset += 4; return value; }
  function nextDouble() {  var value = HEAPF64[offset >> 3]; offset += 8; return value; }

  var trameMonitor = {};
  if (nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@') {
    throw new Error('Trame monitor ne commence pas par 4 arobases, trash it. Did you forget to sync serializer and deserializer?');
  }
  trameMonitor.millis = nextUInt32();
  trameMonitor.a = nextFloat();
  trameMonitor.xMm = nextInt16();
  trameMonitor.yMm = nextInt16();
  trameMonitor.proche_distance = nextUInt16();
  trameMonitor.sickObstacle = nextUInt8();
  trameMonitor.isPR = nextUInt8();
  if (nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@' ||
      nextChar() !== '@') {
    throw new Error('Trame monitor ne termine pas par 4 arobases, trash it. Did you forget to sync serializer and deserializer?');
  }

  console.log(trameMonitor);

  // Dans le robot isPR = 1 c'est le petit robot
  // Dans le monitor 0 c'est le petit robot
  var robot = trameMonitor.isPR ? 0 : 1;

  var id = donnees.d[robot].push({
    id: donnees.d[robot].length,
    t: +new Date,
    timer: getTimerMatch(robot),
    position: {
      mmX: trameMonitor.xMm,
      mmY: trameMonitor.yMm
    },
    destination: {
      mmX: trameMonitor.xMm,
      mmY: trameMonitor.yMm
    },
    svg: {},
    logs: []
  }) - 1;
  table.match.positions.ajouter(robot, id);
  table.match.destinations.ajouter(robot, id);
  curseur.definirMax(robot, id);
}

var traiterMessage = function(r, msg) { // r = robot émetteur (0 ou 1)
  if (msg[0] == '@') {
    donnees.enregistrer(r, msg);
  }

  // Traitement des messages pendant Coupe IdF 2016
  else if(msg[0] == '!') {
    //table.draw.pointRepere(dernierePosition[r][0], dernierePosition[r][1], ++numMsg[r], (r == 0 ? 'cyan' : 'yellow'));
    //log.robot(r, '<span class="pointRepere' + r + '">' + numMsg[r] + '</span> ' + msg);
    table.match.evenements.ajouter(r, msg);
  }

  else {
    switch(msg) {
      case "DebutDuMatch\n":
        log.robot(r, '<span class="infoTimer">== Début du match ==</span><hr>');
        if(match.enCours[r] || match.termine[r])
          log.robot(r, '<span class="infoTimer">(Remplace le précédent)</span>');

        match.debut[r] = new Date().getTime();
        match.enCours[r] = true;
        match.termine[r] = false;
        curseur.definirMin(r, donnees.getLast(r).t);

        if((r == 0 && match.enCours[1]) || (r == 1 && match.enCours[0]))
          log.robot(r, '<span class="infoTimer">Retard de ' + Math.abs(match.debut[1] - match.debut[0]) + 'ms par rapport à l\'autre robot</span>');

        break;
      case "led change\n":
        etatLed[r] = !etatLed[r];
        elem.led[r].className = (etatLed[r] ? 'on' : 'off');
        break;
      case "\n":
        break;
      case "FinProgramme\n":
        if(!match.termine[r]) {
          log.robot(r, msg);
          match.termine[r] = true;
          log.robot(r, '<span class="infoTimer">== Fin du programme ==</span>');
        }
        break;
      case "------------ OBSTACLE\n":
        //table.draw.pointRepere(dernierePosition[r][0], dernierePosition[r][1], ++numMsg[r], (r == 0 ? 'cyan' : 'yellow'));
        table.match.evenements.ajouter(r, 'Obstacle');
//        log.robot(r, '<span class="pointRepere' + r + '">' + numMsg[r] + '</span> ' + msg);
        break;
      default:
        log.robot(r, msg);
    }
  }
}

