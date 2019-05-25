
var componentToHex = function(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
var rgbToHex = function(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/*var seuilForceMax = 250;*/

var vision = {
  svg: SVG('vision').size(960, 710),
  elem: document.getElementById('vision'),
  conteneur: {
    elem: document.getElementById('blocVision'),
    // Redéfinis à l'init
    posX: 0,
    posY: 0,
    majPosition: function() {
      vision.conteneur.posX = vision.conteneur.elem.getBoundingClientRect().left;
      vision.conteneur.posY = vision.conteneur.elem.getBoundingClientRect().top;
    }
  },
  general: {
    scale: 0.25,
    width: 3000,
    height: 2000,
    bordure: 22,
    // Redéfinis à l'init
    scWidth: 0,
    scHeight: 0/*,
    posX: 0,
    posY: 0*/
  },
  param: {
    elem: {
      afficherCoordonnees: document.getElementById('ptAfficherCoordonnees')
    },
    seuilForceMax: 220,
    seuilForceMin: 50,
    zoneObstacle: [90, 600], // 90 = Limite min, 600 = Pour PR
    afficherCoordonnees: function() { return vision.param.elem.afficherCoordonnees.checked; }
  },
  util: {
    deg2rad: function(deg) {
      return deg * Math.PI / 180;
    },
    pol2cart: function(r, a) {
                                                  // Un peu foireux ici a ou -a ?
      return [r * Math.cos(a) + robot.mmX, r * Math.sin(a) + robot.mmY];
    },
    index2deg: function(index) {
      return 135 - index;
    },
    index2rad: function(index) {
      return vision.util.deg2rad(vision.util.index2deg(index));
    }
  },
  objets: {
    ptsVus: [],
    zoneObstacle: []
    //robot: null,
  },
  init: function() {
    this.general.scWidth = vision.general.scale * vision.general.width;
    this.general.scHeight = vision.general.scale * vision.general.height;
    vision.conteneur.majPosition();
    /*this.general.posX = vision.elem.getBoundingClientRect().left + 5;
    this.general.posY = vision.elem.getBoundingClientRect().top + 5;*/
      
    // On se décale de 100, 100
    vision.svg.viewbox(-100, -100, this.general.scWidth + 200, this.general.scHeight + 200);
    
    // La table
    vision.objets.table = vision.svg
      .rect(vision.general.scWidth, vision.general.scHeight)
      .fill('none')//vision.svg.image('img/imageTable_rognee.png', '100%', '100%'))
      .stroke({width: 1, color: 'black'});
    /*vision.svg
      .image('img/imageTable_rognee.png')
      .width(vision.general.scWidth)
      .height(vision.general.scHeight);//*/
    vision.creer.quadrillageHorizontal(500);
    vision.creer.quadrillageVertical(750);
    
    
    vision.objets.robot = vision.creer.point(robot.mmX, robot.mmY, 10, 'orange');
    //vision.creer.grille();
    
    // Supports balises
    // Equipe 1
    vision.creer.supportBalise(-(80 + 22), -(80+22), 'orange'); // Haut gauche
    vision.creer.supportBalise(3000 + 22, 1000 - 80/2, 'orange'); // Milieu droite
    vision.creer.supportBalise(-(80 + 22), 2000 + 22, 'orange'); // Bas gauche
    
    // Equipe 2
    vision.creer.supportBalise(3000 + 22, -(80+22), 'purple'); // Haut droite
    vision.creer.supportBalise(-(80 + 22), 1000 - 80/2, 'purple'); // Milieu gauche
    vision.creer.supportBalise(3000 + 22, 2000 + 22, 'purple'); // Bas droite
    
    // Création des lignes de vision
    for(var i = 0; i < 270; i++) {
      if(i == 90)
        vision.objets.ptsVus[i] = vision.creer.pointVu(i, 100, 10);
      else
        vision.objets.ptsVus[i] = vision.creer.pointVu(i, 0, 10);
    }
    
    // Zone de détection d'obstacles
    var i = 0;
    for(var a = -39; a < 40; a++) {
      vision.objets.zoneObstacle[i] = vision.creer.zoneObstacle(a, vision.param.zoneObstacle[0]);
      i++;
      vision.objets.zoneObstacle[i] = vision.creer.zoneObstacle(a, vision.param.zoneObstacle[1]);
      i++;
    }
    
    vision.objets.robot.front();
  },
  creer: {
    rectScale: function(w, h) {
      return vision.svg.rect(w * vision.general.scale, h * vision.general.scale);
    },
    point: function(x, y, diametre, couleur) {
      return vision.svg
        //.rect(diametre, diametre)
        .circle(diametre)
        .center(x * vision.general.scale, y * vision.general.scale)
        .fill(couleur)
        .stroke('none');
    },
    pointVu: function(index, distance, force) {
      var pt = vision.util.pol2cart(distance, robot.aRad + vision.util.index2rad(index));
      return vision.creer.ligne(robot.mmX, robot.mmY, pt[0], pt[1], 1, 'blue', true).data('index', index);
    },
    pointRepere: function(x, y, numero, couleur) {
      vision.creer.point(x - 4, y - 4, 8, couleur);
      //vision.creer.texte(numero, x + 3, y - 5, couleur, '11px Calibri');
    },
    ligne: function(x1, y1, x2, y2, epaisseur, couleur, scale) {
      if(scale) {
        x1 = x1 * vision.general.scale;
        x2 = x2 * vision.general.scale;
        y1 = y1 * vision.general.scale;
        y2 = y2 * vision.general.scale;
      }
      return vision.svg.line(x1, y1, x2, y2).stroke({width: epaisseur, color: couleur});
    },
    croix: function(x, y, diametre, epaisseur, couleur) {
      x = x * vision.general.scale;
      y = y * vision.general.scale;
      var l1 = vision.creer.ligne(x - diametre/2, y - diametre/2, x + diametre/2, y + diametre/2, epaisseur, couleur);
      var l2 = vision.creer.ligne(x - diametre/2, y + diametre/2, x + diametre/2, y - diametre/2, epaisseur, couleur);
      var group = vision.svg.group();
      group.add(l1);
      group.add(l2);
      return group;
    },
    texte: function(txt, x, y, couleur, police) {
      console.log("Va falloir attendre un peu (pas longtemps) pour afficher du texte sur la table :)");
      /*vision.ctx.fillStyle = couleur;
      vision.ctx.font = police;
      vision.ctx.fillText(txt, x * vision.general.scale, y * vision.general.scale);*/
    },
    grille: function() {
      for(var a = -135; a <= 135; a+=5) {
        var pt = vision.util.pol2cart(1000, vision.util.deg2rad(a));
        vision.creer.ligne(robot.mmX, robot.mmY, pt[0], pt[1], 1, '#eeeeee', true);
      }
    },
    quadrillageHorizontal: function(delta) {
      delta = delta * vision.general.scale;
      var group = vision.svg.group();
      for(var y = delta; y < vision.general.scHeight; y += delta) {
        group.add(vision.creer.ligne(0, y, vision.general.scWidth, y, 1, '#dddddd', false));
      }
      return group;
    },
    quadrillageVertical: function(delta) {
      delta = delta * vision.general.scale;
      var group = vision.svg.group();
      for(var x = delta; x < vision.general.scWidth; x += delta) {
        group.add(vision.creer.ligne(x , 0, x, vision.general.scHeight, 1, '#dddddd', false));
      }
      return group;
    },
    supportBalise: function(x, y, couleur) {
      return vision.creer.rectScale(80, 80).fill(couleur).x(x * vision.general.scale).y(y * vision.general.scale);
    },
    zoneObstacle: function(angle, distance) {
      var pt = vision.util.pol2cart(distance, robot.aRad + vision.util.deg2rad(angle));
      return vision.creer.point(pt[0], pt[1], 2, 'purple');
    }
  },
  modifier: {
    tousLesPoints: function() {
      for(var i = 0; i < points.length; i++) {
        vision.modifier.pointVu(i, points[i]['dist'], parseInt(points[i]['rssi']));
        //vision.objets.ptsVus[i].stroke(pair ? 'blue' : 'cyan');
      }
      //pair = !pair;
    },
    pointVu: function(id, distance, force) {
      var pt = vision.util.pol2cart(distance, robot.aRad + vision.util.index2rad(id));
      var cMax, cFort, cFaible;
      if(force >= vision.param.seuilForceMax) {
        cFort = cFaible = 0;
        cMax = force;
      }
      else if(force <= vision.param.seuilForceMin) {
        cFort = cFaible = cMax = 0;
      }
      else {
        cFort = force;
        cFaible = 255 - force;
        cMax = 0;
      }
      vision.objets.ptsVus[id].plot(robot.mmX * vision.general.scale, robot.mmY * vision.general.scale, pt[0] * vision.general.scale, pt[1] * vision.general.scale).stroke({color: rgbToHex(cMax, cFort, cFaible)});
    },
    positionRobot: function(x, y) {
      vision.objets.robot.cx(x * vision.general.scale).cy(y * vision.general.scale);
    },
    zoneObstacle: function() {
      var i = 0;
      for(var a = -39; a < 40; a++) {
        var pt = vision.util.pol2cart(vision.param.zoneObstacle[0], robot.aRad + vision.util.deg2rad(a));
        vision.objets.zoneObstacle[i].cx(pt[0] * vision.general.scale).cy(pt[1] * vision.general.scale);
        i++;
        pt = vision.util.pol2cart(vision.param.zoneObstacle[1], robot.aRad + vision.util.deg2rad(a));
        vision.objets.zoneObstacle[i].cx(pt[0] * vision.general.scale).cy(pt[1] * vision.general.scale);
        i++;
      }
    }
  },
  match: {
    positions: {
      // Ajouter un point sur la table et enregistre sa référence dans donnees.d[r][#][svg][pt]
      ajouter: function(robot, id) {
        // Création du point et événements associés
        var infos = donnees.d[robot][id];
        infos.svg.pt = vision.creer.point(infos.position.mmX, infos.position.mmY, 4, (robot == PR ? 'blue' : 'orange'))
          .data({
            robot: robot,
            type: 'position',
            id: id
          })
          .addClass('svg-pt' + robot)
          .mouseover(function(e) {
            var forme = SVG.get(e.target.id);
            var infos = donnees.getParIdSvg(e.target.id);
            vision.majInfobulle(e.clientX, e.clientY, 'Position<br>t = ' + infos.t + 'ms<br>' + infos.position.mmX + ' x ' + infos.position.mmY);
            infos.svg.destination.show();
            var ligne = vision.creer.ligne(forme.cx(), forme.cy(), infos.svg.destination.first().cx(), infos.svg.destination.first().cy(), 1, 'grey');
            forme.data('ligneDestination', ligne.attr('id'));
          })
          .mouseout(function(e) {
            var forme = SVG.get(e.target.id);
            infobulle.masquer();
            if(!$('#opt_svg-destination' + forme.data('robot')).hasClass('on'))
              infos.svg.destination.hide();
            SVG.get(forme.data('ligneDestination')).remove();
          });
          
        // Création de la ligne pour relier
        if(id > 0) {
          var infosPrecedentes = donnees.d[robot][id-1];
          vision.creer.ligne(infos.svg.pt.cx(), infos.svg.pt.cy(), infosPrecedentes.svg.pt.cx(), infosPrecedentes.svg.pt.cy(), 1, (robot == PR ? 'blue' : 'orange'))
            .addClass('svg-reliure-pt' + robot)
            .hide();
        }
      }
    },
    
    // N'affiche que les points compris dans [indiceMin, indiceMax] (indices de donnees.d[robot])
    filtrerIndices: function(robot, indiceMin, indiceMax) {
      for(var i = 0; i < donnees.d[robot].length; i++) {
        if(i >= indiceMin && i <= indiceMax)
          donnees.d[robot][i].svg.pt.show();
        else
          donnees.d[robot][i].svg.pt.hide();
      }
    },
    
    
    /* (Non testé car finalement non utilisé)
    // N'afficher que les points répondant au critère filtre
    // filtre(info) est une fonction qui retourne true pour les infos répondant au critère à afficher
    filtrer: function(robot, filtre) {
      for(var i = 0; i < donnees.d[robot].length; i++) {
        var infos = donnees.get(robot, i);
        if(filtre(infos))
          infos.svg.pt.show();
        else
          infos.svg.pt.hide();
      }
    }*/
  },
  majInfobulle: function(clientX, clientY, infos) {
    infobulle.html(infos);
    infobulle.positionner(clientX - vision.conteneur.posX + 10, clientY - vision.conteneur.posY + 10);
    infobulle.afficher();
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