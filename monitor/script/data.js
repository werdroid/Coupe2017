/**
Gestion des données (data et log) provenant des robots
**/

var donnees = {
	d: [[], []],  // PR et GR
	
  getLast: function(robot) {
    return donnees.d[robot][donnees.d[robot].length - 1];
  },
	enregistrer: function(robot, trame) {
   
		var action = trame.split('|');
		var param = JSON.parse('{' + action[2] + '}');
		switch(action[1]) {
			case 'Codeurs':
				break;
			case 'Position':
        return donnees.d[robot].push({
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

