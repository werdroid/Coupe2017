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

    repereX: null,
    repereY: null,
    grpRepere: null
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
    afficherReliures: false,
    afficherGabarit: false,
    afficherPositions: [true, true],
    afficherDestinations: [false, false],
    afficherEvenements: [true, true]
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
 
    // Repère
    table.obj.grpRepere = table.repere.creer();
    table.repere.afficher(false);

    // Création des groupes (permettront de masquer / afficher facilement un ensemble d'éléments)
    // Masquage des groupes selon les paramètres
    for(r = 0; r <= 1; r++) {
      table.obj.grpPositions[r] = table.svg.group();
      table.obj.grpReliures[r] = table.svg.group();
      table.obj.grpDestinations[r] = table.svg.group();
      table.obj.grpEvenements[r] = table.svg.group();

      if(!table.param.afficherPositions[r]) {
        table.obj.grpPositions[r].hide();
        document.getElementById('opt_svg-Positions' + r).classList.remove('on');
      }
      if(!table.param.afficherDestinations[r]) {
        table.obj.grpDestinations[r].hide();
        document.getElementById('opt_svg-Destinations' + r).classList.remove('on');
      }
      if(!table.param.afficherEvenements[r]) {
        table.obj.grpEvenements[r].hide();
        document.getElementById('opt_svg-Evenements' + r).classList.remove('on');
      }
      
      if(!table.param.afficherReliures) { // 2 grpReliures, mais 1 seul paramètre
        table.obj.grpReliures[r].hide();
      }
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

    table.obj.grpPositions[0].front();
    table.obj.grpPositions[1].front();

  },
  effacerTout: function() {
    for(var r = 0; r <= 1; r++) {
      table.obj.positions[r].forEach(function(elem) { elem.remove() });
      table.obj.reliures[r].forEach(function(elem) { elem.remove() });
      table.obj.destinations[r].forEach(function(elem) { elem.remove() });
      table.obj.evenements[r].forEach(function(elem) { elem.remove() });
      donnees.d[r] = [];
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
    pointOriente: function(x, y, a, diametre, couleur) {        
      // Point de base
      var pt = table.creer.point(x, y, diametre, couleur);
      
      // Ligne traversante
      // Ligne ajoutée dans le point pour garder le centre du groupe ptOriente au centre du point de base
      // Sinon, ça complique la gestion des reliures entre les points...
      var rayon = parseInt(diametre / 2);
      var demiRayon = parseInt(diametre / 4);
      var p1_x = x * table.general.scale - demiRayon * Math.cos(a);
      var p1_y = y * table.general.scale - demiRayon * Math.sin(a);
      var p2_x = x * table.general.scale + rayon * Math.cos(a);
      var p2_y = y * table.general.scale + rayon * Math.sin(a);
      var ligne = table.creer.ligne(p1_x, p1_y, p2_x, p2_y, 1, 'white');

      var group = table.svg.group();
      group.add(pt);
      group.add(ligne);
      return group;
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
  
  repere: {
    creer: function() {
      var group = table.svg.group();

      table.obj.repereX = table.creer.ligne(1500 * table.general.scale, 0, 1500 * table.general.scale, table.general.scHeight, 2, 'lightgreen');
      table.obj.repereY = table.creer.ligne(0, 1000 * table.general.scale, table.general.scWidth, 1000 * table.general.scale, 2, 'lightgreen');
      
      group.add(table.obj.repereX);
      group.add(table.obj.repereY);

      return group;
    },
    afficher: function(aff) {
      if(aff)
        table.obj.grpRepere.show();
      else
        table.obj.grpRepere.hide();
    },
    positionner: function(x, y) {
      x *= table.general.scale;
      y *= table.general.scale;
      table.obj.repereX.plot(x, 0, x, table.general.scHeight);
      table.obj.repereY.plot(0, y, table.general.scWidth, y);
    }
  },

  match: {
    positions: {
      // Ajouter un point sur la table et enregistre sa référence dans donnees.d[r][#][svg][pt]
      ajouter: function(robot, id) {
        // Création du point et événements associés
        var infos = donnees.get(robot, id);

        var pt = table.creer.pointOriente(infos.position.mmX, infos.position.mmY, infos.position.a, 5, (robot == PR ? 'blue' : 'orange'))
          .data({
            robot: robot,
            type: 'position',
            id: id,
            t: infos.t,
            tMatch: infos.tMatch
          })
          .addClass('svg-pt' + robot)
          .mouseover(function(e) {
            // Infos sur la position
            var forme = SVG.get(e.target.parentNode.id);
            var infos = donnees.get(robot, id);
            table.majInfobulle(e.clientX, e.clientY, 'Position<br>t = ' + infos.t + '<br>tMatch = ' + infos.tMatch + ' s<br>' + infos.position.mmX + ' x ' + infos.position.mmY + ' @ ' + infos.position.aDeg + '°');
            
            // Infos sur la destination
            var grpEphemere = table.svg.group();
            if(table.param.afficherDestinations[forme.data('robot')]) {
              // La croix est visible, on se contente de tracer une ligne
              var objDestination = table.obj.destinations[robot][infos.svg.destination];
              var ligne = table.creer.ligne(forme.cx(), forme.cy(), objDestination.first().cx(), objDestination.cy(), 1, 'grey').back();
              grpEphemere.add(ligne);
            }
            else {
              // On doit retracer la ligne
              var croixDestination = table.creer.croix(infos.destination.mmX, infos.destination.mmY, 10, 1, (robot == PR ? 'green' : 'red')).back();
              var ligne = table.creer.ligne(forme.cx(), forme.cy(), croixDestination.first().cx(), croixDestination.cy(), 1, 'grey').back();
              grpEphemere.add(croixDestination).add(ligne);
            }
            forme.data('grpDestinationEphemere', grpEphemere.attr('id')); // Permettra d'effacer la ligne sur mouseout
            
            // Highlight log
            log.highlight.addByClass(robot, 't'+infos.tMatch);
          })
          .mouseout(function(e) {
            var forme = SVG.get(e.target.parentNode.id);
            infobulle.masquer();
            /*if(!$('#opt_svg-destination' + forme.data('robot')).hasClass('on'))
              table.obj.destinations[robot][infos.svg.destination].hide();*/
            SVG.get(forme.data('grpDestinationEphemere')).remove();
            log.highlight.removeAll();
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
              id: id,
              t: infos.t
            })
            .addClass('svg-reliure-pt' + robot);
          table.obj.grpReliures[robot].add(reliure);
          infos.svg.reliure = table.obj.reliures[robot].push(reliure) - 1;
        }

      },
      afficherReliures: function(activer) {
        table.param.afficherReliures = activer;
        if(activer) {
          table.obj.grpReliures[0].show();
          table.obj.grpReliures[1].show();
        }
        else {
          table.obj.grpReliures[0].hide();
          table.obj.grpReliures[1].hide();
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
              id: id,
              t: infos.t,
              tMatch: infos.tMatch
            })
            .addClass('svg-destination' + robot)
            .mouseover(function(e) {
              var forme = SVG.get(e.target.parentNode.id);
              //var infos = donnees.getParIdSvg(e.target.parentNode.id);
              var infos = donnees.get(robot, id);
              //forme.stroke({width: 2});
              table.majInfobulle(e.clientX, e.clientY, 'Destination<br>t = ' + infos.t + ' ms<br>' + infos.destination.mmX + ' x ' + infos.destination.mmY);              
            })
            .mouseout(function(e) {
              infobulle.masquer();
            });
          table.obj.grpDestinations[robot].add(dest);
          infos.svg.destination = table.obj.destinations[robot].push(dest) - 1;
        }
      }
    },
    evenements: {
      ajouter: function(robot, id) {
        var infos = evenements.get(robot, id);
        var ptEvenement = table.creer.point(donnees.getLast(robot).position.mmX, donnees.getLast(robot).position.mmY, 10, (robot == PR ? 'cyan' : 'yellow'))
          .data({
            robot: robot,
            id: id,
            type: 'evenement',
            t: infos.t,
            tMatch: infos.tMatch
          })
          .addClass('svg-evenement' + robot)
          .mouseover(function(e) {
            var forme = SVG.get(e.target.id);
            var infos = evenements.get(robot, id);
            table.majInfobulle(e.clientX, e.clientY, infos.id + '.' + infos.msg);
            log.highlight.addByData(forme.data('robot'), 'evenement', infos.id);
          })
          .mouseout(function(e) {
            infobulle.masquer();
            log.highlight.removeAll();
          });
        table.obj.grpEvenements[robot].add(ptEvenement);
        infos.svg = table.obj.evenements[robot].push(ptEvenement) - 1;
      }
    },
    
    // N'affiche que les points compris dans [indiceMin, indiceMax] (indices de donnees.d[robot])
    filtrerIndices: function(robot, indiceMin, indiceMax) {
      // Positions, Destinations, Reliures
      // On ne gère pas le point i=0 car aucune reliure ne lui est associée (et flemme de traiter ce cas)
      for(var i = 1; i < donnees.d[robot].length; i++) {
        if(i >= indiceMin && i <= indiceMax) {
          table.obj.positions[robot][donnees.d[robot][i].svg.pt].show();
          table.obj.reliures[robot][donnees.d[robot][i].svg.reliure].show();
          table.obj.destinations[robot][donnees.d[robot][i].svg.destination].show();
        }
        else {
          table.obj.positions[robot][donnees.d[robot][i].svg.pt].hide();
          table.obj.reliures[robot][donnees.d[robot][i].svg.reliure].hide();
          table.obj.destinations[robot][donnees.d[robot][i].svg.destination].hide();
        }
      }

      // Les objets destination sont communs tant que la destination ne change pas
      // On force donc l'affichage de la dernière destination qui a pu être masquée inopinément
      table.obj.destinations[robot][donnees.d[robot][indiceMax].svg.destination].show();

      // Pour les événements, on doit regarder le t
      // Si on utilise 2 "Jeu aléatoire" à la suite, on a 2 échelles de temps => Possible erreur d'affichage
      var tmin = donnees.get(robot, indiceMin).t;
      var tmax = donnees.get(robot, indiceMax).t;
      for(var i = 0; i < evenements.e[robot].length; i++) {
        if(evenements.e[robot][i].t >= tmin && evenements.e[robot][i].t <= tmax) { // Ce serait + logique de raisonner aussi en t plutôt qu'en id pour les Positions, Destinations, Reliures. Mais j'ai la flemme, il se fait tard, et j'ai faim :)
          table.obj.evenements[robot][evenements.e[robot][i].svg].show();
        }
        else {
          table.obj.evenements[robot][evenements.e[robot][i].svg].hide();
        }
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
    log.filtrer(robot, indiceMin, indiceMax);
    $('#valeurT' + robot).text('[ ' + donnees.get(robot, indiceMin).t + ' ; ' + donnees.get(robot, indiceMax).t + ' ] ms');  
    $('#valeurTMatch' + robot).text('[ ' + donnees.get(robot, indiceMin).tMatch + ' ; ' + donnees.get(robot, indiceMax).tMatch + ' ] s');
  }

  var gererSlideEvent = function(robot, ui) {
    // Bouge l'autre curseur si Curseur Progressif est sélectionné
    if(document.getElementById('curseurProgressif').checked) {
      if(ui.handleIndex == 0) {
       $('#curseurTMatch' + robot).slider('values', [ ui.values[0], Math.min(ui.values[0] + 6, donnees.d[robot].length - 1) ]);
      }
      else {
        $('#curseurTMatch' + robot).slider('values', [ Math.max(ui.values[1] - 6, 0) ]);
      }
    }

    filtrerAffichage(robot, ui.values[0], ui.values[1]);

    // Bouge l'autre slider si les curseurs sont liés
    if(document.getElementById('lierCurseursTMatch').checked) {
      var lautre = (robot == PR ? GR : PR);
      $('#curseurTMatch' + lautre).slider('values', [ ui.values[0], ui.values[1] ]);
      filtrerAffichage(lautre, ui.values[0], ui.values[1]);
    }
  }

  $('#curseurTMatch0').slider({
    range: true,
    min: -10,
    max: 1000,
    values: [0, 1000],
    slide: function(event, ui) {
      gererSlideEvent(PR, ui);
    }
    
  });
  $('#curseurTMatch1').slider({
    range: true,
    min: -10,
    max: 1000,
    values: [0, 1000],
    slide: function(event, ui) {
      gererSlideEvent(GR, ui);
    }
  });
  
  
  /** Options d'affichage **/

  // Affichage des Positions, Destinations et Evénéments
  $('.optionAffichageTable').click(function() {
    var id = $(this).attr('id'); // 'opt_svg-Positions0'
    var type = id.substring(8, id.length - 1); // 'Positions'
    var robot = id.substr(-1); // '0'
    
    if(table.param['afficher' + type][robot]) {
      table.obj['grp' + type][robot].hide();
      table.param['afficher' + type][robot] = false;
      document.getElementById(id).classList.remove('on');

      if(type == 'Positions')
        table.obj.grpReliures[robot].hide();
    }
    else {
      table.obj['grp' + type][robot].show();
      table.param['afficher' + type][robot] = true;
      document.getElementById(id).classList.add('on');

      if(type == 'Positions')
        table.obj.grpReliures[robot].show();
    }
    
    /*if( $(this).hasClass('on') ) {
      //SVG.select( '.' + $(this).attr('id').substr(4) ).show();
    }*/
    
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
    table.match.positions.afficherReliures( $(this).prop('checked') );
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
