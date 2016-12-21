/**
Toutes les fonctions permettant de dessiner la table.


Ménage suite à Transformation de Canvas à Svg en cours.
**/



var table = {
  svg: SVG('table').size(780, 530),
  elem: document.getElementById('table'),
  conteneur: {
    elem: document.getElementById('blocTable'),
    // Redéfinis à l'init
    posX: 0,
    posY: 0,
    majPosition: function() {
      table.conteneur.posX = table.conteneur.elem.getBoundingClientRect().left;
      table.conteneur.posY = table.conteneur.elem.getBoundingClientRect().top;
    }
  },
  general: {
    scale: 0.25,
    width: 3000,
    height: 2000,
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
    afficherCoordonnees: function() { return table.param.elem.afficherCoordonnees.checked; }
  },
  init: function() {
    this.general.scWidth = table.general.scale * table.general.width;
    this.general.scHeight = table.general.scale * table.general.height;
    table.conteneur.majPosition();
    /*this.general.posX = table.elem.getBoundingClientRect().left + 5;
    this.general.posY = table.elem.getBoundingClientRect().top + 5;*/
      
    // On se décale de 10, 10
    table.svg.viewbox(-10, -10, this.general.scWidth + 20, this.general.scHeight + 20);
    
    // La table
    table.svg
      .rect(table.general.scWidth, table.general.scHeight)
      .fill('none')//table.svg.image('img/imageTable_rognee.png', '100%', '100%'))
      .stroke({width: 1, color: 'black'});
    table.svg
      .image('img/imageTable_rognee.png')
      .width(table.general.scWidth)
      .height(table.general.scHeight);//*/
      
    // Grille
    table.creer.quadrillageHorizontal(100);
    table.creer.quadrillageVertical(100);
 
  },
  creer: {
    point: function(x, y, diametre, couleur) {
      return table.svg
        .circle(diametre)
        .center(x * table.general.scale, y * table.general.scale)
        .fill(couleur)
        .stroke('none');
    },
    pointRepere: function(x, y, numero, couleur) {
      table.creer.point(x - 4, y - 4, 8, couleur);
      //table.creer.texte(numero, x + 3, y - 5, couleur, '11px Calibri');
    },
    cube: function(x, y) {
      //table.ctx.strokeStyle = "yellow";
      table.svg
          .rect(58 * table.general.scale, 58 * table.general.scale)
          .stroke({width: 1, color: 'yellow'})
          .fill('none')
          .move(x * table.general.scale, y * table.general.scale);
    },
    ligne: function(x1, y1, x2, y2, epaisseur, couleur) {
      return table.svg.line(x1, y1, x2, y2).stroke({width: epaisseur, color: couleur});
    },
    croix: function(x, y, diametre, epaisseur, couleur) {
      x = x * table.general.scale;
      y = y * table.general.scale;
      var l1 = table.creer.ligne(x - diametre/2, y - diametre/2, x + diametre/2, y + diametre/2, epaisseur, couleur);
      var l2 = table.creer.ligne(x - diametre/2, y + diametre/2, x + diametre/2, y - diametre/2, epaisseur, couleur);
      var group = table.svg.group();
      group.add(l1);
      group.add(l2);
      return group;
    },
    quadrillageHorizontal: function(delta) {
      delta = delta * table.general.scale;
      for(var y = delta; y < table.general.scHeight; y += delta) {
        table.creer.ligne(0, y, table.general.scWidth, y, 1, '#dddddd');
      }
    },
    quadrillageVertical: function(delta) {
      delta = delta * table.general.scale;
      for(var x = delta; x < table.general.scWidth; x += delta) {
        table.creer.ligne(x , 0, x, table.general.scHeight, 1, '#dddddd');
      }
    },
    texte: function(txt, x, y, couleur, police) {
      console.log("Va falloir attendre un peu (pas longtemps) pour afficher du texte sur la table :)");
      /*table.ctx.fillStyle = couleur;
      table.ctx.font = police;
      table.ctx.fillText(txt, x * table.general.scale, y * table.general.scale);*/
    }
  },
  match: {
    positions: {
      // Ajouter un point sur la table et enregistre sa référence dans donnees.d[r][#][svg][pt]
      ajouter: function(robot, id) {
        var infos = donnees.d[robot][id];
        infos.svg.pt = table.creer.point(infos.position.mmX, infos.position.mmY, 4, (robot == PR ? 'blue' : 'orange'))
          .data({
            robot: robot,
            id: id,
            type: 'position'
          })
          .addClass('svg-pt' + robot)
          .mouseover(function(e) {
            var forme = SVG.get(e.target.id);
            var infos = donnees.getParIdSvg(e.target.id);
            table.majInfobulle(e.clientX, e.clientY, 'Position<br>t = ' + infos.t + 'ms<br>' + infos.position.mmX + ' x ' + infos.position.mmY);
            infos.svg.destination.show();
            var ligne = table.creer.ligne(forme.cx(), forme.cy(), infos.svg.destination.first().cx(), infos.svg.destination.first().cy(), 1, 'grey');
            forme.data('ligneDestination', ligne.attr('id'));
          })
          .mouseout(function(e) {
            var forme = SVG.get(e.target.id);
            infobulle.masquer();
            if(!$('#opt_svg-destination' + forme.data('robot')).hasClass('on'))
              infos.svg.destination.hide();
            SVG.get(forme.data('ligneDestination')).remove();
          });
      }
    },
    destinations: {
      ajouter: function(robot, id) {
        var infos = donnees.get(robot, id);
        var precedent = donnees.get(robot, Math.max(id - 1, 0));
        if(id > 0 && infos.destination.mmX == precedent.destination.mmX && infos.destination.mmY == precedent.destination.mmY) {
          // Même point, on ajoute directement la référence de l'objet précédent
          infos.svg.destination = precedent.svg.destination;
        }
        else {
          // Point différent, on crée un nouveau point
          infos.svg.destination = table.creer.croix(infos.destination.mmX, infos.destination.mmY, 10, 1, (robot == PR ? 'green' : 'red'))
            .data({
              robot: robot,
              id: id,
              type: 'destination'
            })
            .addClass('svg-destination' + robot)
            .mouseover(function(e) {
              var infos = donnees.getParIdSvg(e.target.parentNode.id);
              //forme.stroke({width: 2});
              table.majInfobulle(e.clientX, e.clientY, 'Destination<br>t = ' + infos.t + 'ms<br>' + infos.destination.mmX + ' x ' + infos.destination.mmY);              
            })
            .mouseout(function(e) {
              infobulle.masquer();
            })
            .hide();
        }
      }
    },
    evenements: {
      liste: [[], []],
      ajouter: function(robot, msg) {
        var id = table.match.evenements.liste[robot].push(msg);
        id--;
        table.creer.point(donnees.getLast(robot).position.mmX, donnees.getLast(robot).position.mmY, 10, (robot == PR ? 'cyan' : 'yellow'))
          .data({
            robot: robot,
            id: id,
            type: 'evenement'
          })
          .addClass('svg-evenement' + robot)
          .mouseover(function(e) {
            var forme = SVG.get(e.target.id);
            var infos = table.match.evenements.liste[forme.data('robot')][forme.data('id')];
            table.majInfobulle(e.clientX, e.clientY, infos);
          })
          .mouseout(function(e) {
            infobulle.masquer();
          });
        
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
    }
  },
  majInfobulle: function(clientX, clientY, infos) {
    infobulle.html(infos);
    infobulle.positionner(clientX - table.conteneur.posX + 10, clientY - table.conteneur.posY + 10);
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


$( function() {
  /** Slicers d'affichage d'une partie du match **/
  var filtrerAffichage = function(robot, indiceMin, indiceMax) {
    var ui = $('#curseurTMatch' + robot);
    indiceMin = Math.max(indiceMin, 0);
    indiceMin = Math.min(indiceMin, donnees.d[robot].length - 1);
    indiceMax = Math.min(indiceMax, donnees.d[robot].length - 1);
    
    table.match.filtrerIndices(robot, indiceMin, indiceMax);
    $('#valeurTMatch' + robot).text('[ ' + donnees.get(robot, indiceMin).t + ' ; ' + donnees.get(robot, indiceMax).t + ' ]');  
  }

  $('#curseurTMatch0').slider({
    range: true,
    min: -10,
    max: 1000,
    values: [0, 1000],
    slide: function(event, ui) {
      filtrerAffichage(PR, ui.values[0], ui.values[1]);
      if($('#lierCurseursTMatch').prop('checked')) {
        $('#curseurTMatch1').slider('values', [ ui.values[0], ui.values[1] ]);
        filtrerAffichage(GR, ui.values[0], ui.values[1]);
      }
    }
    
  });
  $('#curseurTMatch1').slider({
    range: true,
    min: -10,
    max: 1000,
    values: [0, 1000],
    slide: function(event, ui) {
      filtrerAffichage(GR, ui.values[0], ui.values[1]);
      if($('#lierCurseursTMatch').prop('checked')) {
        $('#curseurTMatch0').slider('values', [ ui.values[0], ui.values[1] ]);
        filtrerAffichage(PR, ui.values[0], ui.values[1]);
      }
    }
  });
  
  /** Options d'affichage **/
  $('.optionAffichageTable').click(function() {
    if( $(this).hasClass('on') ) {
      $(this).removeClass('on');
      SVG.select( '.' + $(this).attr('id').substr(4) ).hide();
    }
    else {
      $(this).addClass('on');
      SVG.select( '.' + $(this).attr('id').substr(4) ).show();
    }
    
  });
});
