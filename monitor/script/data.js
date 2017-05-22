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
        t: getTimerMatch(robot),
        //t: trame.t,
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
              mmY: param.mmY
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



var traiterMessage = function(r, msg) { // r = robot émetteur (0 ou 1)
  if(msg[0] == '@') {
    donnees.enregistrer(r, msg);
    // var id = donnees.enregistrer(r, msg);
    // table.match.positions.ajouter(r, id);
    // table.match.destinations.ajouter(r, id);
  }
  /*else if(msg[0] == '$') {
    // Message spécial
    switch(msg) {
      case "$DebutDuMatch\n":
        
    }
  }*/
  
  
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
      case "led change\r\n":
        etatLed[r] = !etatLed[r];
        elem.led[r].className = (etatLed[r] ? 'on' : 'off');
        break;
      case "\r\n":
        break;
      case "fin match\r\n":
        if(!match.termine[r]) {
          log.robot(r, msg);
          match.termine[r] = true;
          log.robot(r, '<span class="infoTimer">== Fin du match ==</span>');
        }
        break;
      case "------------ OBSTACLE\r\n":
        //table.draw.pointRepere(dernierePosition[r][0], dernierePosition[r][1], ++numMsg[r], (r == 0 ? 'cyan' : 'yellow'));
        table.match.evenements.ajouter(r, 'Obstacle');
//        log.robot(r, '<span class="pointRepere' + r + '">' + numMsg[r] + '</span> ' + msg);
        break;
      default:
        log.robot(r, msg);
    }
  }
}

