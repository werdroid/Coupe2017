/**
Toutes les fonctions permettant de dessiner la table.


Ménage suite à Transformation de Canvas à Svg en cours.
**/



var table = {
  svg: SVG('table').size(780, 530),
  elem: document.getElementById('table'),
  obj: {  // Ensemble des objets créés
    quadrillage: null,
    
    grpPositions: [null, null], // Objet SVG groupe contenant l'ensemble des positions
    grpReliures: [null, null],
    grpDestinations: [null, null],
    grpEvenements: [null, null],
    
    grpPtsEtape: null,
    gabarit: null,
    
    positions: [[],[]], // Un objet SVG par position
    reliures: [[],[]],
    destinations: [[],[]],
    evenements: [[],[]],
  },
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
    afficherGabarit: false
  },
  init: function() {
    this.general.scWidth = table.general.scale * table.general.width;
    this.general.scHeight = table.general.scale * table.general.height;
    table.conteneur.majPosition();
    table.general.posX = table.elem.getBoundingClientRect().left + 10;
    table.general.posY = table.elem.getBoundingClientRect().top + 10;
      
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
    table.obj.quadrillage = table.svg.group();
    table.obj.quadrillage.add(table.creer.quadrillageHorizontal(100));
    table.obj.quadrillage.add(table.creer.quadrillageVertical(100));
 
    // Création des groupes (permettront de masquer / afficher facilement un ensemble d'éléments)
    for(i = 0; i <= 1; i++) {
      table.obj.grpPositions[i] = table.svg.group();
      table.obj.grpReliures[i] = table.svg.group();
      table.obj.grpDestinations[i] = table.svg.group();
      table.obj.grpEvenements[i] = table.svg.group();
    }
    
    // Gabarit
    table.obj.gabarit = table.creer.gabarit();
    table.obj.gabarit.hide();
    
    table.svg.mousemove(function(e) {
      if(table.param.afficherGabarit) {
        var x = (e.clientX - table.general.posX) / table.general.scale;
        var y = (e.clientY - table.general.posY) / table.general.scale;
        var x50 = Math.round(x / 50) * 50;
        var y50 = Math.round(y / 50) * 50;
        table.majInfobulle(e.clientX, e.clientY, x50 + ' x ' + y50);
        table.obj.gabarit.center(x50 * table.general.scale, y50 * table.general.scale);
        table.obj.gabarit.show();
      }
    });
    
    // Points clés ("Points coordonnées")
    table.obj.grpPtsEtape = table.svg.set();
    for(var i = 0; i < ptsEtape.length; i++) {
      table.obj.grpPtsEtape.add(table.creer.ptEtape(ptsEtape[i][0], ptsEtape[i][1], ptsEtape[i][2], 'green'));
      table.obj.grpPtsEtape.add(table.creer.ptEtape(ptsEtape[i][0], 3000 - ptsEtape[i][1], ptsEtape[i][2], 'purple'));
    }
  },
  creer: {
    point: function(x, y, diametre, couleur) {
      return table.svg
        //.rect(diametre, diametre)
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
      var group = table.svg.group();
      for(var y = delta; y < table.general.scHeight; y += delta) {
        group.add(table.creer.ligne(0, y, table.general.scWidth, y, 1, '#dddddd'));
      }
      return group;
    },
    quadrillageVertical: function(delta) {
      delta = delta * table.general.scale;
      var group = table.svg.group();
      for(var x = delta; x < table.general.scWidth; x += delta) {
        group.add(table.creer.ligne(x , 0, x, table.general.scHeight, 1, '#dddddd'));
      }
      return group;
    },
    gabarit: function() {
      var gab = table.svg.set();
      gab.add(
        table.svg.rect(3, 3)
          .fill('green')
      );
      // GR
      gab.add(
        table.svg.circle(390 * table.general.scale)
          .stroke('orange')
          .fill('none')
      );
      gab.add(
        table.svg.rect(300 * table.general.scale, 300 * table.general.scale)
          .stroke('orange')
          .fill('none')
      );
      return gab;
    },
    ptEtape: function(id, x, y, couleur) {
      return table.svg
        .rect(3, 3)
        .center(x * table.general.scale, y * table.general.scale)
        .fill(couleur)
        .stroke('none')
        .mouseover(function(e) {
          table.majInfobulle(e.clientX, e.clientY, id);
        })
        .mouseout(function(e) {
          infobulle.masquer();
        });
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
        // Création du point et événements associés
        var infos = donnees.get(robot, id);
        var pt = table.creer.point(infos.position.mmX, infos.position.mmY, 4, (robot == PR ? 'blue' : 'orange'))
          .data({
            robot: robot,
            type: 'position',
            donnee: id,
            t: match.timer[robot]
          })
          .addClass('svg-pt' + robot)
          .mouseover(function(e) {
            var forme = SVG.get(e.target.id);
            var infos = donnees.getParIdSvg(e.target.id);
            var objDestination = table.obj.destinations[robot][infos.svg.destination];
            table.majInfobulle(e.clientX, e.clientY, 'Position<br>t = ' + infos.t + 'ms<br>' + infos.position.mmX + ' x ' + infos.position.mmY);
            objDestination.show();
            var ligne = table.creer.ligne(forme.cx(), forme.cy(), objDestination.first().cx(), objDestination.cy(), 1, 'grey');
            forme.data('ligneDestination', ligne.attr('id'));
          })
          .mouseout(function(e) {
            var forme = SVG.get(e.target.id);
            infobulle.masquer();
            if(!$('#opt_svg-destination' + forme.data('robot')).hasClass('on'))
              table.obj.destinations[robot][infos.svg.destination].hide();
            SVG.get(forme.data('ligneDestination')).remove();
          });
        table.obj.grpPositions[robot].add(pt);
        infos.svg.pt = table.obj.positions[robot].push(pt) - 1;
          
        // Création de la ligne pour relier
        if(id > 0) {
          var ptPrecedent = table.obj.positions[robot][donnees.get(robot, id-1).svg.pt];
          var reliure = table.creer.ligne(pt.cx(), pt.cy(), ptPrecedent.cx(), ptPrecedent.cy(), 1, (robot == PR ? 'blue' : 'orange'))
            .data({
              robot: robot,
              type: 'reliure',
              donnee: id,
              t: match.timer[robot]
            })
            .addClass('svg-reliure-pt' + robot)
            .hide();
          table.obj.grpReliures[robot].add(reliure);
          infos.svg.reliure = table.obj.reliures[robot].push(reliure) - 1;
        }
      }
    },
    destinations: {
      ajouter: function(robot, id) {
        var infos = donnees.get(robot, id);
        var precedent = donnees.get(robot, Math.max(id - 1, 0));
        if(id > 0 && infos.destination.mmX == precedent.destination.mmX && infos.destination.mmY == precedent.destination.mmY) {
          // Même destination, on ajoute directement le numéro de l'objet précédent
          infos.svg.destination = precedent.svg.destination;
        }
        else {
          // Destination différente, on crée une nouvelle croix destination
          var dest = table.creer.croix(infos.destination.mmX, infos.destination.mmY, 10, 1, (robot == PR ? 'green' : 'red'))
            .data({
              robot: robot,
              type: 'destination',
              donnee: id,
              t: match.timer[robot]
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
          table.obj.grpDestinations[robot].add(dest);
          infos.svg.destination = table.obj.destinations[robot].push(dest) - 1;
        }
      }
    },
    evenements: {
      /**** A revoir ****/
      
      liste: [[], []],  /// Ne devrait pas être mis ici
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
          table.obj.positions[robot][donnees.d[robot][i].svg.pt].show();
        else
          table.obj.positions[robot][donnees.d[robot][i].svg.pt].hide();
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
  // Affichage des Positions, Destinations et Evénéments
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
  
  // Affichage du quadrillage
  $('#cbAfficherQuadrillage').click(function() {
    if($(this).prop('checked'))
      table.obj.quadrillage.show();
    else
      table.obj.quadrillage.hide();
  });
  
  // Affichage des points repère
  $('#cbAfficherPtsEtape').click(function() {
    if($(this).prop('checked'))
      table.obj.grpPtsEtape.show();
    else
      table.obj.grpPtsEtape.hide();
  });
  
  // Affichage de lignes pour relier les points
  $('#cbRelierPoints').click(function() {
    if($(this).prop('checked')) {
      table.svg.select('.svg-reliure-pt0').show();
      table.svg.select('.svg-reliure-pt1').show();
    }
    else {
      table.svg.select('.svg-reliure-pt0').hide();
      table.svg.select('.svg-reliure-pt1').hide();
    }
  });
  
  $('#cbAfficherGabarit').click(function() {
    if($(this).prop('checked'))
      table.param.afficherGabarit = true;
    else {
      table.param.afficherGabarit = false;
      table.obj.gabarit.hide();
    }
  });

});
