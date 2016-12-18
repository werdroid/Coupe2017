
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