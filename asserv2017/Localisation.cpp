#include "asserv2018.h"

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

distances_values[i]
rssi_values[i]

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
bool variation[SICK_VALUES_LENGTH]; // 2160 octets
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

	if (detection_enabled == false) {
		// la détection est désactivée, inutile de traiter les données du sick
		// A supprimer si on souhaite localiser les robots sans la fonction de detection d'obstacle
		return;
	}
	
	// Initialisation des valeurs pour l'index 0 (ne seront pas réécrites)
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

	
	for (uint16_t i = 0; i < SICK_VALUES_LENGTH; i++) {

		// Poursuite uniquement si points valides
		// Repérage balises
		/*
		if (point_exterieur_table(points[i]) && distance_valide(distances_values[i])) {
		*/

		// Repérage robots
		if (point_interieur_table(points[i]) && distance_valide(distances_values[i])) {

			i++; //on saute la première valeur : à index = 0 on ne calcule rien, à index = 1 on compare entre les valeurs des index 1 et 0

			if (abs(distances_values[i] - distances_values[i - 1]) < OBJECT_CHANGE_DISTANCE) {
				variation[i] = false; //same obj
			else
				variation[i] = true; //change obj
			}

			maxindexsizeatdistance = 2 * distance_values[i] * tan((index_vers_angle(i - 1) - index_vers_angle(i) / 180.0 * MATH_PI) / 2);

			if (variation[i] = false) {
				objectsize[i] = objectsize[i - 1] + maxindexsizeatdistance;
				objectindexes++;
				objecttotalangle[i] = objecttotalangle[i - 1] + index_vers_angle(i);
				//objectmeanangle = objecttotalangle(i] / objectindexes; //non used in current version
				objecttotaldistances[i] = objecttotaldistances[i - 1] + distances_values[i];
				objectmeandistance[i] = objecttotaldistances[i] / objectindexes;
				objectsizeatmeandistance[i] = 2 * objectmeandistance[i] * tan((index_vers_angle(i - 1) - index_vers_angle(i) / 180.0 * MATH_PI) / 2);
				objectminsize[i] = objectsize[i] - objectsizeatmeandistance[i];
				objectminsize[i] = objectsize[i] + 2 * objectsizeatmeandistance[i];
				objecttotalforce[i] = objecttotalforce[i - 1] + rssi_values[i];
				objectmeanforce[i] = objecttotalforce[i] / objectindexes;
			else
				objectsize[i] = maxindexsizeatdistance;
				objectindexes = 1;
				objecttotalangle[i] = index_vers_angle(i);
				objecttotaldistances[i] = distances_values[i];
				objecttotalforce[i] = rssi_values[i];
				forcescore[i] = 9999 * FORCE_CHOICE_COEFF;
				distancescore[i] = 9999 * SIZE_CHOICE_COEFF;
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

			forcescore[i] = 0;

			if (MAT_ROBOT_DIAMETER_MIN < objectminsize[i] && objectmaxsize[i] < MAT_ROBOT_DIAMETER_MAX) {
				distancescore[i] = abs(objectsize[i] - MAT_ROBOT_DIAMETER_TYP) * SIZE_CHOICE_COEFF;
			else
				distancescore[i] = 9999 * SIZE_CHOICE_COEFF;
			}

			choicescore[i] = forcescore[i] + distancescore[i];
		
		else
			return
			//log : échec localisation
			positionValide = false;
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

	//repérage robots
	objectcenterdistance[i] = objectmeandistance[i] + 0.87 * MAT_ROBOT_DIAMETER_TYP / 2; //0.87 : constante d'estimation du centre

	// Convertir les distances/degrés en points absolus sur la table
	points[i].x = robot.xMm + objectcenterdistance[i] * cos(robot.a + index_vers_angle(i) / 180.0 * MATH_PI);
	points[i].y = robot.yMm + objectcenterdistance[i] * sin(robot.a + index_vers_angle(i) / 180.0 * MATH_PI);

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
    rssi_values[i]  // Force de chaque point
    points[i]; // Points ( points[i].x points[y].y )
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