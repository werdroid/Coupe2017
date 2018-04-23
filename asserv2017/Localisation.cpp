#include "asserv2017.h"

/*
// Type Point
typedef struct {
int32_t x;
int32_t y;
} Point; // 8 octets

// Variables globales
robot.xMm
robot.yMm
robot.a   Angle x->y en rad

sick.distances_values[i]
sick.rssi_values[i]

--> utils.cpp
deg2rad
rad2deg
*/


/*------------------------------------------------------------------------------
 * Paramètres de localisation
 *--------------------------------------------------------------------------- */

// Repérage balises
const uint16_t OBJECT_CHANGE_FORCE = 10; //[RSSI Force]
const uint16_t BALISE_FORCE_TARGET = 239; //[RSSI Force]
const uint16_t BALISE_FORCE_TOLERANCE = 5; //[RSSI Force]
const uint16_t FORCE_CHOICE_COEFF = 2;
const uint16_t BALISE_DIAMETER = 80; //[mm]
const uint16_t SIZE_CHOICE_COEFF = 1;
const uint16_t NB_BALISES = 3;
const uint16_t TOL_VALIDATION = 5;  //[%]
const uint16_t RESOLUTION_PRECISION = 0.5; //[°]
const uint16_t TABLE_MARGE_BORDURE_BALISES = -250; // mm //les balises 2018 sont entre 44 mm et 144 mm des bords de table

// Positions balises terrain 2018
Point Balise_A = { .x = 0,    .y = 0    };
Point Balise_B = { .x = 0,	  .y = 2000 };
Point Balise_C = { .x = 3000, .y = 1000 };

// Repérage robots
const uint16_t MAT_ROBOT_DIAMETER_MIN = 80; //[mm]
const uint16_t MAT_ROBOT_DIAMETER_MAX = 100; //[mm]
const uint16_t MAT_ROBOT_DIAMETER_TYP = 100; //[mm]
//const uint16_t NB_MAX_AUTRES_ROBOTS = 3;
const uint16_t TABLE_MARGE_BORDURE_ELTS_JEU = 200; // mm //le récupérateur 2018 avance de 100 mm

//Variables communes réparage balises/robots
bool variation[SICK_VALUES_LENGTH]; 
const uint16_t OBJECT_CHANGE_DISTANCE = 50; //[mm]
int maxindexsizeatdistance = 0;
int objectsize[SICK_VALUES_LENGTH];
int objectindexes = 0;
int objecttotalangle[SICK_VALUES_LENGTH];
int objecttotaldistances[SICK_VALUES_LENGTH];
int objectmeanangle[SICK_VALUES_LENGTH];
int objectmeandistance[SICK_VALUES_LENGTH];
int objectsizeatmeandistance[SICK_VALUES_LENGTH];
int objectminsize[SICK_VALUES_LENGTH];
int objectmaxsize[SICK_VALUES_LENGTH];
int objecttotalforce[SICK_VALUES_LENGTH];
int objectmeanforce[SICK_VALUES_LENGTH];
int forcescore[SICK_VALUES_LENGTH];
int distancescore[SICK_VALUES_LENGTH];
int choicescore[SICK_VALUES_LENGTH];
bool positionValide = true;
int objectcenterdistance[SICK_VALUES_LENGTH];

/*------------------------------------------------------------------------------
 * Localisation autres robots (relative à soi)
 *--------------------------------------------------------------------------- */


// Point à l'intérieur de la table, bord retranché d'une distance pour éviter de détecter objets haut (récupérateurs, fusées, etc.)
inline bool point_interieur_table(const Point point) {
	return point.x > TABLE_MARGE_BORDURE_ELTS_JEU &&
		point.y > TABLE_MARGE_BORDURE_ELTS_JEU &&
		point.x < TABLE_LARGEUR_X - TABLE_MARGE_BORDURE_ELTS_JEU &&
		point.y < TABLE_LARGEUR_Y - TABLE_MARGE_BORDURE_ELTS_JEU;
}

// Point à l'extérieur de la table, marge pour inclure les balises
inline bool point_exterieur_table(const Point point) { // /!\ marges exprimées comme un nombre négatif !
	return point.x > TABLE_MARGE_BORDURE_BALISES &&
		point.y > TABLE_MARGE_BORDURE_BALISES &&
		point.x < TABLE_LARGEUR_X - TABLE_MARGE_BORDURE_BALISES &&
		point.y < TABLE_LARGEUR_Y - TABLE_MARGE_BORDURE_BALISES;
}

void localiser_robots() {

	positionValide = true; //reste à true sauf si une invalidation est détectée

	if(!robot.detection_enabled) {
		// la détection est désactivée, inutile de traiter les données du sick
		// A supprimer si on souhaite localiser les robots sans la fonction de detection d'obstacle
		return;
	}
	
	// Initialisation des valeurs pour l'index 0 (ne seront pas réécrites)
  /*** [RSE] Nota: Toutes ces variables ont-elles besoin d'être conservées pour tous les points ?
       Par exemple, si variation n'est utilisé que dans sa propre itération (ce qui semble être actuellement le cas), on peut déclarer un simple bool variation;
       En revanche, objecttotalangle semble nécessiter un tableau vu qu'on utilise des objecttotalangle[i] et des objecttotalangle[i-1]
  ***/ 
	variation[0] = false;
	objectsize[0] = 0;
	objecttotalangle[0] = 0;
	objecttotaldistances[0] = 0;
	objectmeanangle[0] = 0;
	objectmeandistance[0] = 0;
	objectsizeatmeandistance[0] = 0;
	objectminsize[0] = 0;
	objectmaxsize[0] = 0;
	objecttotalforce[0] = 0;
	objectmeanforce[0] = 0;
	forcescore[0] = 0;
	distancescore[0] = 0;
	choicescore[0] = 0;

	
	for(uint16_t i = 0; i < SICK_VALUES_LENGTH; i++) {

		// Poursuite uniquement si points valides
		// Repérage balises
		/*
		if (point_exterieur_table(sick.points[i]) && distance_valide(sick.distances_values[i])) {
		*/

		// Repérage robots
    sick.rssi_values[0] = 1; // [RSE] A placer en dehors du for
    
		if (point_interieur_table(sick.points[i]) && distance_valide(sick.distances_values[i])) {

			i++; //on saute la première valeur : à index = 0 on ne calcule rien, à index = 1 on compare entre les valeurs des index 1 et 0
      /** [RSE] Il est très vivement déconseillé de modifier la variable d'itération (ici i) dans sa boucle
          Ici, i sera incrémenté 2 fois à chaque itération. i vaudra donc 1 puis 3 puis 5 puis 7.
          Est-ce bien le fonctionnement attendu ?
          Si oui, faire plutôt
            for(i = 1; i < LENGTH; i+=2) { }
          Sinon, faire plutôt
            for(i = 1; i < LENGTH; i++) { }
      **/
          
      
			if (abs(sick.distances_values[i] - sick.distances_values[i - 1]) < OBJECT_CHANGE_DISTANCE) {
				variation[i] = false; //same obj
      }
			else {
				variation[i] = true; //change obj
			}

			maxindexsizeatdistance = 2 * sick.distances_values[i] * tan((index_vers_angle(i - 1) - index_vers_angle(i) / 180.0 * MATH_PI) / 2);
             //                                         [RSE] Ne devrait-il pas y avoir une parenthèse ici...   ^   ... ald ...   ^    ?
             // [RSE] Nota: rad2deg() et deg2rad(); sont disponibles dans utils.cpp pour les conversions d'angle.
      
      
			if(!variation[i]) {
        /*** [RSE] Nota: Si variation[i] ne sert qu'ici, on peut intégrer directement la condition ici : if(!(abs(...) < ...))
            Dans ce cas, préciser en commentaire qu'on cherche à 'détecter une variation' (?)
            Ok pour laisser tel quel si plus lisible actuellement
            ***/
        // [RSE] Nota: quand le script sera au point, des commentaires seront le bienvenu :)
				objectsize[i] = objectsize[i - 1] + maxindexsizeatdistance;
				objectindexes++;
				objecttotalangle[i] = objecttotalangle[i - 1] + index_vers_angle(i);
				//objectmeanangle = objecttotalangle(i] / objectindexes; //non used in current version
				objecttotaldistances[i] = objecttotaldistances[i - 1] + sick.distances_values[i];
				objectmeandistance[i] = objecttotaldistances[i] / objectindexes;
				objectsizeatmeandistance[i] = 2 * objectmeandistance[i] * tan((index_vers_angle(i - 1) - index_vers_angle(i) / 180.0 * MATH_PI) / 2);
				objectminsize[i] = objectsize[i] - objectsizeatmeandistance[i];
				objectminsize[i] = objectsize[i] + 2 * objectsizeatmeandistance[i];
				objecttotalforce[i] = objecttotalforce[i - 1] + sick.rssi_values[i];
				objectmeanforce[i] = objecttotalforce[i] / objectindexes;
      }
			else {
				objectsize[i] = maxindexsizeatdistance;
				objectindexes = 1;
				objecttotalangle[i] = index_vers_angle(i);
				objecttotaldistances[i] = sick.distances_values[i];
				objecttotalforce[i] = sick.rssi_values[i];
				forcescore[i] = INT_MAX; // 9999 * FORCE_CHOICE_COEFF; // [RSE] Je viens de découvrir INT_MAX : https://stackoverflow.com/a/2273953 . A confirmer que cela correspond bien au besoin.
				distancescore[i] = 9999 * SIZE_CHOICE_COEFF; // [RSE] Et si oui, appliquer la même modif ici :)
			}

			// Repérage balises
			/*
			if (objectmeanforce[i] > (BALISE_FORCE_TARGET - BALISE_FORCE_TOLERANCE) && objectmeanforce[i] < (BALISE_FORCE_TARGET + BALISE_FORCE_TOLERANCE) {
			forcescore[i] = abs(objectmeanforce[i] - BALISE_FORCE_TARGET) * FORCE_CHOICE_COEFF;
			else
			forcescore[i] = 9999 * FORCE_CHOICE_COEFF;
			}

			if (objectminsize[i] < BALISE_DIAMETER && BALISE_DIAMETER < objectmaxsize[i]) {
			distancescore[i] = abs(objectsize[i] - BALISE_DIAMETER) * SIZE_CHOICE_COEFF;
			else
			distancescore[i] = 9999 * SIZE_CHOICE_COEFF;
			}
			*/

			// Repérage robots

			forcescore[i] = 0; // [RSE] Cela vient mettre en doute l'intérêt de forcescore[i]. Pour une prochaine évolution ?

			if (MAT_ROBOT_DIAMETER_MIN < objectminsize[i] && objectmaxsize[i] < MAT_ROBOT_DIAMETER_MAX) {
				distancescore[i] = abs(objectsize[i] - MAT_ROBOT_DIAMETER_TYP) * SIZE_CHOICE_COEFF;
      }
			else {
				distancescore[i] = 9999 * SIZE_CHOICE_COEFF; // [RSE] INT_MAX ?
			}

			choicescore[i] = forcescore[i] + distancescore[i];
      
      // [RSE] Exemple d'envoi d'infos vers le Monitor pour test
      com_printfln("@|Localisation|i:%d,score:%d", i, choicescore[i]);

    }
		else {
			positionValide = false;
      com_printfln("! Echec de localisation");
      return; // [RSE] Cela interrompt toute la fonction (pas uniquement l'itération du for). Est-ce bien le comportement voulu ?
			//log : échec localisation
		}
	}

	/*for (uint16_t i = 0; i < SICK_VALUES_LENGTH; i++) {
		while j < NB_MAX_AUTRES_ROBOTS
		if robot_index
			choicescore[i]
	}*/

	/*TEST: voir les choicescore retournés, et récupérer les données associées.
	Si aucun robot, détecter aucun point. Retourner autant de points que de mats de robots identifiés.*/

	//repérage balises
	//objectcenterdistance[i] = objectmeandistance[i] + 0.87 * BALISE_DIAMETER / 2; //0.87 : constante d'estimation du centre
/*********
// [RSE] Ces lignes ne compilent pas car i n'est plus défini ici.
//  Voir s'il faut les intégrer dans le for ou pas... Dans le doute, je les ai commentées pour pouvoir compiler
	//repérage robots
	objectcenterdistance[i] = objectmeandistance[i] + 0.87 * MAT_ROBOT_DIAMETER_TYP / 2; //0.87 : constante d'estimation du centre

	// Convertir les distances/degrés en points absolus sur la table
	sick.points[i].x = robot.xMm + objectcenterdistance[i] * cos(robot.a + index_vers_angle(i) / 180.0 * MATH_PI);
	sick.points[i].y = robot.yMm + objectcenterdistance[i] * sin(robot.a + index_vers_angle(i) / 180.0 * MATH_PI);
**********/
}



/*------------------------------------------------------------------------------
 * Localisation de soi
 *--------------------------------------------------------------------------- */
/*
se_localiser() {
  
  bool abandonner = false;
  
  // Fonction 1
  for(i = 0; i < 270; i++) {
    
    
    // Param d'entrée ...
    distance_values[i] // Distance de chaque point
    sick.rssi_values[i]  // Force de chaque point
    sick.points[i]; // Points ( sick.points[i].x sick.points[y].y )
  }
  
  
  // Fonction 2
  if(!abandonner) {
    
    
    // C'est le bazar, on abandonne
    abandonner = true;
  }
  
  
  if(!abandonner) {
    
    
    
  }
  
  
  
  ...
  
  if(abandonner) {
    positionValide = !abandonner;
  }
  
  positionValide = 0/1; // 0 = false ; 1 = true
  //if(positionValide) {
    xMmCorrige = ...
    yMmCorrige = ...
    aCorrige = ...    
    aDegCorrige = rad2deg(aCorrige);
  //}
  /*else {
    xMmCorrige = robot.xMm;
    yMmCorrige = ...
    aCorrige = ...    
  }
  
  
  // Résultat
  com_prontfln('@|Localisation|valide:%d,x:%d,y:%d,a:%f,aDeg:%d', positionValide, xMmCorrige, yMmCorrige, aCorrige, aDegCorrige);
  
  
}

*/