var elem = {
	log: {
		monitor: document.getElementById('logMonitor'),
		robot: [document.getElementById('logRobot0'), document.getElementById('logRobot1')]
	},
	infoTable: document.getElementById('infoTable'),
	table: document.getElementById('table'), // utiliser table.elem pour celui-là
	led: [document.getElementById('led0'), document.getElementById('led1')],
	obstacle: [document.getElementById('obstacle0'), document.getElementById('obstacle1')],
	curseur: document.getElementById('curseur')
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

var traiterMessage = function(r, msg) { // r = robot émetteur (0 ou 1)
	if(msg[0] == '@') {
		var action = msg.split('|');
		var param = JSON.parse('{' + action[2] + '}');
		switch(action[1]) {
			case 'Codeurs':
				break;
			case 'Position':
				table.draw.point(param.mmX, param.mmY, 2, (r == 0 ? 'blue' : 'orange'));
				dernierePosition[r][0] = param.mmX;
				dernierePosition[r][1] = param.mmY;
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


// Rappels sur canvas : https://openclassrooms.com/courses/la-balise-canvas-avec-javascript
var table = {
	elem: document.getElementById('table'),
	conteneur: {
		elem: document.getElementById('blocTable'),
		// Redéfinis à l'init
		posX: 0,
		posY: 0
	},
	general: {
		scale: 0.25,
		width: 3000,
		height: 2000,
		// Redéfinis à l'init
		scWidth: 0,
		scHeight: 0,
		posX: 0,
		posY: 0
	},
	param: {
		elem: {
			afficherCoordonnees: document.getElementById('ptAfficherCoordonnees')
		},
		afficherCoordonnees: function() { return table.param.elem.afficherCoordonnees.checked; }
	},
	init: function() {
		this.general.scWidth = table.general.scale * table.general.width;
		this.general.scHeight = table.general.scale * table.general.height;
		table.conteneur.posX = table.conteneur.elem.getBoundingClientRect().left;
		table.conteneur.posY = table.conteneur.elem.getBoundingClientRect().top;
		this.general.posX = table.elem.getBoundingClientRect().left + 10;
		this.general.posY = table.elem.getBoundingClientRect().top + 10;
		
		this.ctx = this.elem.getContext('2d');
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = 'black';
		this.ctx.font = 'Calibri';
		//this.ctx.clearRect(0, 0, this.general.width, this.general.height);
		this.ctx.translate(10, 10);
			
		// Image de la table
		var imageTable = new Image();
		imageTable.src = 'img/imageTable_rognee.png';
		imageTable.onload = function() {
			table.ctx.drawImage(imageTable, 0, 0, table.general.width*table.general.scale,table.general.height*table.general.scale);
		
			// Bordure
			table.ctx.strokeRect(0, 0, table.general.width * table.general.scale, table.general.height * table.general.scale);
			
			// Grille
			table.draw.quadrillageHorizontal(100);
			table.draw.quadrillageVertical(100);
			
			// Cubes
			// Grosse dune
			table.draw.cube(1500 - 58/2, 0);
			table.draw.cube(1500 - 58/2 - 58, 0);
			table.draw.cube(1500 - 58/2 - 58*2, 0);
			table.draw.cube(1500 - 58/2 - 58*3, 0);
			table.draw.cube(1500 - 58/2 - 58*4, 0);
			table.draw.cube(1500 + 58/2, 0);
			table.draw.cube(1500 + 58/2 + 58, 0);
			table.draw.cube(1500 + 58/2 + 58*2, 0);
			table.draw.cube(1500 + 58/2 + 58*3, 0);
			table.draw.cube(1500 - 58/2, 58);
			table.draw.cube(1500 - 58/2 - 58, 58);
			table.draw.cube(1500 + 58/2, 58);
			table.draw.cube(1500 - 58/2, 58*2);
			
			// Petite dune
			table.draw.cube(810, 0);
			table.draw.cube(810 + 58, 0);
			table.draw.cube(810, 58);
			table.draw.cube(810 + 58, 58);
		};
		
		
	},
	reinitialiser: function() {
		table.ctx.translate(-10, -10);
		table.ctx.clearRect(0, 0, elem.table.width, elem.table.height);
	},
	draw: {
		point: function(x, y, epaisseur, couleur) {
			table.ctx.fillStyle = couleur;
			table.ctx.fillRect(x * table.general.scale, y * table.general.scale, epaisseur, epaisseur);
		},
		pointRepere: function(x, y, numero, couleur) {
			table.draw.point(x - 4, y - 4, 8, couleur);
			table.draw.texte(numero, x + 3, y - 5, couleur, '11px Calibri');
		},
		cube: function(x, y) {
			table.ctx.strokeStyle = "yellow";
			table.ctx.strokeRect(x * table.general.scale, y * table.general.scale, 58 * table.general.scale, 58 * table.general.scale);
		},
		ligne: function(x1, y1, x2, y2, epaisseur, couleur) {
			table.ctx.strokeStyle = couleur;
			table.ctx.lineWidth = epaisseur;
			table.ctx.beginPath();
			table.ctx.moveTo(x1,y1);
			table.ctx.lineTo(x2,y2);
			table.ctx.stroke();
		},
		quadrillageHorizontal: function(delta) {
			//elem.infoTable.innerText = 'y: ' + delta + ' - ' + elem.infoTable.innerText;
			delta = delta * table.general.scale;
			for(var y = delta; y < table.general.scHeight; y += delta) {
				table.draw.ligne(0, y, table.general.scWidth, y, 1, '#dddddd');
			}
		},
		quadrillageVertical: function(delta) {
			//elem.infoTable.innerText = 'x: ' + delta + ' - ' + elem.infoTable.innerText;
			delta = delta * table.general.scale;
			for(var x = delta; x < table.general.scWidth; x += delta) {
				table.draw.ligne(x , 0, x, table.general.scHeight, 1, '#dddddd');
			}
		},
		texte: function(txt, x, y, couleur, police) {
			table.ctx.fillStyle = couleur;
			table.ctx.font = police;
			table.ctx.fillText(txt, x * table.general.scale, y * table.general.scale);
		}
	}
}

var infobulle = {
	elem: document.getElementById('infobulle'),
	afficher: function() {
		this.elem.style.opacity = 1;
	},
	masquer: function() {
		this.elem.style.opacity = 0;
	},
	html: function(txt) {
		this.elem.innerHTML = txt;
		if(this.elem.style.opacity == 0)
			this.afficher();
	},
	positionner: function(x, y) {
		this.elem.style.top = y + 'px';
		this.elem.style.left = x + 'px';
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
document.getElementById('bReconnecter').addEventListener('click', function() {
	if(document.getElementById('serialSelect0').value != 'disconnect') {
		connection0.disconnect();
		setTimeout(function() {
			connection0.connect(document.getElementById('serialSelect0').value);
		}, 1000);
	}
	if(document.getElementById('serialSelect1').value != 'disconnect') {
		connection1.disconnect();
		setTimeout(function() {
			connection1.connect(document.getElementById('serialSelect1').value);
		}, 1000);
	}
});


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




connection0.connect('COM10');
setTimeout(function() {
	connection1.connect('COM7');
}, 1000);