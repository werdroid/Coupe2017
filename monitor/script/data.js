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
        mmX:    position du robot sur l'axe x (mm)
        mmY:    position du robot sur l'axe y (mm)
      },
      svg: {    Ensemble des éléments dessinés sur la table et liés à cette trame
        pt:     pt position
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
  get: function(robot, id) {
    return donnees.d[robot][id];
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
    return donnees.d[robot][donnees.d[robot].length - 1];
  },
  
  // Enregistre un jeu de données et retourne son indice
	enregistrer: function(robot, trame) {
    if(trame[2] != '|') {
      return donnees.d[robot].push({
        t: trame.t,
        position: {
          mmX: trame.mmX,
          mmY: trame.mmY
        },
        svg: {}
      }) - 1;
      
    }
    else {
      // Compatibilité avec Coupe IdF 2016
      var action = trame.split('|');
      var param = JSON.parse('{' + action[2] + '}');
      switch(action[1]) {
        case 'Codeurs':
          break;
        case 'Position':
          return donnees.d[robot].push({
            t: donnees.d[robot].length,
            position: {
              mmX: param.mmX,
              mmY: param.mmY
            }
          }) - 1;
          
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
          elem.obstacle[r].className = param.obstacle;
          break;
        default:
          log.monitor(action[1] + ' inconnue (en provenance de ' + r + '.');
      }
    }
	}
	
}



// Traitement des messages pendant Coupe IdF 2016
var traiterMessage = function(r, msg) { // r = robot émetteur (0 ou 1)
  if(msg[0] == '@') {
    donnees.enregistrer(r, msg[0]);
  }
  else if(msg[0] == '!') {
    table.draw.pointRepere(dernierePosition[r][0], dernierePosition[r][1], ++numMsg[r], (r == 0 ? 'cyan' : 'yellow'));
    log.robot(r, '<span class="pointRepere' + r + '">' + numMsg[r] + '</span> ' + msg);
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
        table.draw.pointRepere(dernierePosition[r][0], dernierePosition[r][1], ++numMsg[r], (r == 0 ? 'cyan' : 'yellow'));
        log.robot(r, '<span class="pointRepere' + r + '">' + numMsg[r] + '</span> ' + msg);
        break;
      default:
        log.robot(r, msg);
    }
  }
}

