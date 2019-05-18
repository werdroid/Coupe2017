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
    grpPtsEtapeSym: null,
    grpZones: null,
    gabarit: null,
    fond: null,

    positions: [[],[]], // Un objet SVG par position
    reliures: [[],[]],
    destinations: [[],[]],
    evenements: [[],[]],

    repereX: null,
    repereY: null,
    grpRepere: null,

    ptPositionSouris: null // cf init gabarit
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
    affichageX: 3000, // Sert de base au niveau de zoom
    // Redéfinis à l'init
    aspectRatio: 0,
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
  util: {
    recupererCoordonneesSouris: function(e) {
      // Pour récupérer les coordonnées de la souris dans le repère de la table(SVG) :
      // https://stackoverflow.com/a/10298843/9899989
      table.obj.ptPositionSouris.x = e.clientX;
      table.obj.ptPositionSouris.y = e.clientY;
      return table.obj.ptPositionSouris.matrixTransform(table.elem.getScreenCTM().inverse());
    },
    contraindre: function(valeur, min, max) {
      if(valeur < min) return min;
      if(valeur > max) return max;
      return valeur;
    }
  },
  init: function() {
    this.general.scWidth = table.general.scale * table.general.width;
    this.general.scHeight = table.general.scale * table.general.height;
    table.general.aspectRatio = table.general.width / table.general.height;
    table.conteneur.majPosition();
    table.general.posX = table.elem.getBoundingClientRect().left + 40;
    table.general.posY = table.elem.getBoundingClientRect().top + 40;

      
    // On se décale de 10, 10
    //table.svg.viewbox(-40, -40, this.general.width + 80, this.general.height + 80);
    table.recadrer.parDefaut();
    
    // Servira à récupérer les coordonnées de la souris
    table.obj.ptPositionSouris = table.elem.createSVGPoint();

    // La table
    table.svg
      .rect(table.general.width, table.general.height)
      .fill('none')//table.svg.image('img/imageTable_rognee.png', '100%', '100%'))
      .stroke({width: 4, color: 'black'});

    // Fond
    table.obj.fond = table.svg
      .image('img/Table2019.png')
      .width(table.general.width)
      .height(table.general.height);
    
    /*
    // Les cubes 2018
    table.creer.groupeCubes(850, 540);
    table.creer.groupeCubes(300, 1190);
    table.creer.groupeCubes(1100, 1500);
    table.creer.groupeCubes(2150, 540);
    table.creer.groupeCubes(2700, 1190);
    table.creer.groupeCubes(1900, 1500);*/
    
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
        var pos = table.util.recupererCoordonneesSouris(e);

        /*var x = e.clientX - table.general.posX;
        var y = e.clientY - table.general.posY;*/
        var x = pos.x;
        var y = pos.y;
        var x50 = Math.round(x / 50) * 50;
        var y50 = Math.round(y / 50) * 50;
        table.majInfobulle(e.clientX, e.clientY, x50 + ' x ' + y50);
        table.obj.gabarit.center(x50, y50);
        table.obj.gabarit.show();
      }
    });
    
    // Points clés ("Points coordonnées")
    table.obj.grpPtsEtape = table.svg.set();
    table.obj.grpPtsEtapeSym = table.svg.set();
    for(var i = 0; i < ptsEtape.length; i++) {
      var ptAction = (ptsEtape[i][0].substr(-1) == 'A');
      table.obj.grpPtsEtape.add(table.creer.ptEtape(ptsEtape[i][0] + ' (' + ptsEtape[i][1] + ' x ' + ptsEtape[i][2] + ')', ptsEtape[i][1], ptsEtape[i][2], 'orangered', ptAction));
      table.obj.grpPtsEtapeSym.add(table.creer.ptEtape('Adverse ' + ptsEtape[i][0] + ' (' + ptsEtape[i][1] + ' x ' + ptsEtape[i][2] + ')', 3000 - ptsEtape[i][1], ptsEtape[i][2], 'lightgreen', ptAction));
    }
    table.obj.grpPtsEtapeSym.hide();
    
    // Zones
    table.obj.grpZones = table.svg.set();
    for(var i = 0; i < zones.length; i++) {
      var couleur = new SVG.Color({
                          r: parseInt(Math.random()*155+100),
                          g: parseInt(Math.random()*155+100),
                          b :parseInt(Math.random()*155+100)
                    });
      table.obj.grpZones.add(table.creer.zone('Zone ' + zones[i][0], zones[i][1], zones[i][2], zones[i][3], zones[i][4], couleur));
    }
    table.obj.grpZones.hide();
    

    table.obj.grpPtsEtape.front();
    table.obj.grpPositions[0].front();
    table.obj.grpPositions[1].front();


    // Zoom
    table.elem.addEventListener('wheel', function(e) {
      var posSouris = table.util.recupererCoordonneesSouris(e);
      table.recadrer.zoomerSouris(posSouris.x, posSouris.y, e.deltaY);
    });

  },
  recadrer: {
    parDefaut: function() {
      table.svg.viewbox(-40, -40, table.general.width + 80, table.general.height + 80);
    },
    zoomerSouris: function(curseurX, curseurY, delta) {
      // affichageX représente la largeur visible du viewbox

      table.general.affichageX += delta;
      table.general.affichageX = table.util.contraindre(table.general.affichageX, 500, 3000);

      if(table.general.affichageX >= 3000) {
        table.recadrer.parDefaut();
        return;
      }

      // Quand on zoom au centre, on s'attend à zoomer vers le centre
      // Quand on zoom sur le tiers en haut à gauche, on ne s'attend pas à ce que le point de zoom se retrouve au milieu de la page
      // ratioX/Y permettent en gros de zoomer là où on s'attend
      var ratioX = (curseurX - table.svg.viewbox().x) / table.svg.viewbox().width;
      var ratioY = (curseurY - table.svg.viewbox().y) / table.svg.viewbox().height;

      var bordGauche = curseurX - table.general.affichageX * ratioX;
      var bordHaut = curseurY - (table.general.affichageX / table.general.aspectRatio * ratioY);
      
      // On essaye de ne pas aller trop loin en dehors de la table
      bordGauche = table.util.contraindre(bordGauche, -200, table.general.width - table.general.affichageX + 200);
      bordHaut = table.util.contraindre(bordHaut, -10, table.general.height - table.general.affichageX / table.general.aspectRatio + 10);

      table.svg.viewbox(bordGauche, bordHaut, table.general.affichageX, table.general.affichageX / table.general.aspectRatio);
    }
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
        .center(x, y)
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
      var p1_x = x - demiRayon * Math.cos(a);
      var p1_y = y - demiRayon * Math.sin(a);
      var p2_x = x + rayon * Math.cos(a);
      var p2_y = y + rayon * Math.sin(a);
      var ligne = table.creer.ligne(p1_x, p1_y, p2_x, p2_y, 4, 'white');

      var group = table.svg.group();
      group.add(pt);
      group.add(ligne);
      return group;
    },
    pointRepere: function(x, y, numero, couleur) {
      table.creer.point(x - 16, y - 16, 32, couleur);
      //table.creer.texte(numero, x + 3, y - 5, couleur, '11px Calibri');
    },
    cube: function(x, y) {
      //table.ctx.strokeStyle = "yellow";
      table.svg
          .rect(232, 232)
          .stroke({width: 4, color: 'purple'})
          .fill('none')
          .move(x, y);
    },
    groupeCubes: function(cx, cy) { // Crée 5 cubes en croix (2018)
      var tailleCube = 232;
      table.creer.cube(cx - tailleCube/2, cy - tailleCube/2);
      table.creer.cube(cx - tailleCube/2, cy - tailleCube/2 - tailleCube);
      table.creer.cube(cx - tailleCube/2, cy + tailleCube/2);
      table.creer.cube(cx - tailleCube/2 - tailleCube, cy - tailleCube/2);
      table.creer.cube(cx + tailleCube/2, cy - tailleCube/2);
    },
    ligne: function(x1, y1, x2, y2, epaisseur, couleur) {
      return table.svg.line(x1, y1, x2, y2).stroke({width: epaisseur, color: couleur});
    },
    croix: function(x, y, diametre, epaisseur, couleur) {
      x = x;
      y = y;
      var l1 = table.creer.ligne(x - diametre/2, y - diametre/2, x + diametre/2, y + diametre/2, epaisseur, couleur);
      var l2 = table.creer.ligne(x - diametre/2, y + diametre/2, x + diametre/2, y - diametre/2, epaisseur, couleur);
      var group = table.svg.group();
      group.add(l1);
      group.add(l2);
      return group;
    },
    quadrillageHorizontal: function(delta) {
      delta = delta;
      var group = table.svg.group();
      for(var y = delta; y < table.general.height; y += delta) {
        group.add(table.creer.ligne(0, y, table.general.width, y, 4, '#eeeeee')); // #dddddd avant 2019
      }
      return group;
    },
    quadrillageVertical: function(delta) {
      delta = delta;
      var group = table.svg.group();
      for(var x = delta; x < table.general.width; x += delta) {
        group.add(table.creer.ligne(x , 0, x, table.general.height, 4, '#eeeeee')); // #dddddd avant 2019
      }
      return group;
    },
    gabarit: function() {
      var gab = table.svg.set();
      gab.add(
        table.svg.rect(12, 12)
          .fill('green')
      );
      // GR
      gab.add(
        table.svg.circle(390)
          .stroke({color: 'orange', width: 3})
          .fill('none')
      );
      gab.add(
        table.svg.rect(300, 300)
          .stroke({color: 'orange', width: 3})
          .fill('none')
      );
      return gab;
    },
    ptEtape: function(id, x, y, couleur, ptAction = false) {
      return table.svg
        .rect(ptAction ? 8 : 12, ptAction ? 8 : 12)
        .center(x, y)
        .fill(couleur)
        .stroke('none')
        .mouseover(function(e) {
          table.majInfobulle(e.clientX, e.clientY, id);
        })
        .mouseout(function(e) {
          infobulle.masquer();
        });
    },
    zone: function(id, x1, y1, x2, y2, couleur) {
      return table.svg
        .rect(x2 - x1, y2 - y1)
        .fill(couleur)
        .stroke({color: 'white', opacity: 1, width: 2})
        .move(x1, y1)
        .opacity(0.2)
        .mouseover(function(e) {
          var forme = SVG.get(e.target.id);
          table.majInfobulle(e.clientX, e.clientY, id);
          forme.opacity(0.4);
          forme.stroke({color: 'blue', opacity: 1, width: 4});
        })
        .mouseout(function(e) {
          var forme = SVG.get(e.target.id);
          infobulle.masquer();
          forme.opacity(0.2);
          forme.stroke({color: 'white', opacity: 1, width: 2});
        });
    },
    texte: function(txt, x, y, couleur, police) {
      console.log("Va falloir attendre un peu pour afficher du texte sur la table :)");
      /*table.ctx.fillStyle = couleur;
      table.ctx.font = police;
      table.ctx.fillText(txt, x, y);*/
    }
  },
  
  repere: {
    creer: function() {
      var group = table.svg.group();

      table.obj.repereX = table.creer.ligne(1500, 0, 1500, table.general.height, 8, 'lightgreen');
      table.obj.repereY = table.creer.ligne(0, 1000, table.general.width, 1000, 8, 'lightgreen');
      
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
      table.obj.repereX.plot(x, 0, x, table.general.height);
      table.obj.repereY.plot(0, y, table.general.width, y);
    }
  },

  match: {
    positions: {
      // Ajouter un point sur la table et enregistre sa référence dans donnees.d[r][#][svg][pt]
      ajouter: function(robot, id) {
        // Création du point et événements associés
        var infos = donnees.get(robot, id);

        var pt = table.creer.pointOriente(infos.position.mmX, infos.position.mmY, infos.position.a, 20, (robot == PR ? 'blue' : 'orange'))
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
              var ligne = table.creer.ligne(forme.cx(), forme.cy(), objDestination.first().cx(), objDestination.cy(), 4, 'grey').back();
              grpEphemere.add(ligne);
            }
            else {
              // On doit retracer la ligne
              var croixDestination = table.creer.croix(infos.destination.mmX, infos.destination.mmY, 40, 4, (robot == PR ? 'green' : 'red')).back();
              var ligne = table.creer.ligne(forme.cx(), forme.cy(), croixDestination.first().cx(), croixDestination.cy(), 4, 'grey').back();
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
          var reliure = table.creer.ligne(pt.cx(), pt.cy(), ptPrecedent.cx(), ptPrecedent.cy(), 4, (robot == PR ? 'blue' : 'orange'))
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
          var dest = table.creer.croix(infos.destination.mmX, infos.destination.mmY, 40, 4, (robot == PR ? 'green' : 'red'))
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
        var ptEvenement = table.creer.point(donnees.getLast(robot).position.mmX, donnees.getLast(robot).position.mmY, 40, (robot == PR ? 'cyan' : 'yellow'))
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

  // Affichage des points repère (symétrie)
  $('#cbAfficherPtsEtapeSym').click(function() {
    if($(this).prop('checked'))
      table.obj.grpPtsEtapeSym.show();
    else
      table.obj.grpPtsEtapeSym.hide();
  });

  // Affichage des zones
  $('#cbAfficherZones').click(function() {
    if($(this).prop('checked'))
      table.obj.grpZones.show();
    else
      table.obj.grpZones.hide();
  });

  // Affichage du fond (image table)
  $('#cbAfficherFond').click(function() {
    if($(this).prop('checked'))
      table.obj.fond.show();
    else
      table.obj.fond.hide();
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
