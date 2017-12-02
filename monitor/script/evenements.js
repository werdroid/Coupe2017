/**
Gestion des données (Positions, Destinations) provenant des robots
Les événements ne sont pas gérés ici (-> evenements.js)
**/

/* RAPPEL :
const PR = 0;
const GR = 1;
*/

/**
Ensemble des positions et destinations de chaque robot, à chaque instant

evenements.e = [
  [
    {
      timer:   temps écoulé (ms) depuis le début du match (valeur robot)
      msg:     message associé à l'événement
      idData:  id de la position (data.d) au moment de l'événement
      svg:     index (dans table.obj) de l'élément dessiné sur la table
    },
    {
      ... Idem pour chaque événement
    }
  ],
  [
    ... Idem pour GR ...
  ]
]

**/

/* TODO : Faire le clair entre t et timer */
/* TODO : appeler evenements.enregistrer() au lieu de table.match.evenement.ajouter() pour créer l'événement */

var evenements = {
	e: [[], []],  // PR et GR

  // Enregistre un jeu de données et retourne son indice
	enregistrer: function(robot, message) {
    var id = evenements.e[robot].push({
      id: evenements.e[robot].length,
      timer: getTimerMatch(robot),
      msg: message,
      idData: donnees.d[robot].length - 1
    }) - 1;
    table.match.evenements.ajouter(robot, id);
    
    log.robot(robot, '<span class="pointRepere' + robot + '">' + id + '</span> ' + message, 'e'+id);
	},
  
  // Retourne le jeu de données à l'indice indiqué
  // si id < 0, retourne à partir de la fin
  get: function(robot, id) {
    if(id >= 0)
      return evenements.e[robot][id];
    else
      return evenements.e[robot][evenements.e[robot].length + id];
  }
}