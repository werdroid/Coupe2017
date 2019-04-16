#include "asserv2017.h"
#include "match.h"


/**
  Fonctions commandant un déplacement "intelligent"
  + utilitaires associées
**/


  
/** ====================
  Déplacements sur table
  ====================== **/
  
// Attention, inversion de uniquement_avant et timeout par rapport à asserv_go_xy
// (La logique est : on définit les paramètres de notre consigne avant de définir les conditions d'échec)
// aller_xy = "Va là intelligement"
// asserv_go_xy = "Va là, stupide"
// Tous les paramètres sont obligatoires
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {
  uint8_t error;
  uint8_t error2;
  uint8_t tentatives = 0;
  
  if(!robot.IS_PR) {
    max_tentatives += 5;
  }
  
  
  asserv_vitesse_rampe_distance(vitesse);

  if (uniquement_avant) {
    asserv_rotation_vers_point(x, y, 2000);
  }

  do {
    error = asserv_go_xy(x, y, timeout, uniquement_avant);
    tentatives++;
    
    // En cas d'obstacle on fait une pause avant de tenter à nouveau
    if(error == ERROR_OBSTACLE) {
      ledMatrix_indiquer_obstacle();
      minuteur_attendre(1000);
      /*if(tentatives == 3 || tentatives == 5) {
        asserv_go_toutdroit(-80, 1000);
      }*/
    }
  } while (error == ERROR_OBSTACLE && tentatives < max_tentatives);

  if (error != OK) {
    //com_printfln("! Déplacement vers %d, %d abandonné", x, y);
    switch(error) {
      case ERROR_TIMEOUT:
        com_printfln("! Déplacement vers %d, %d abandonné (timeout %d atteint)", x, y, timeout);
        break;
      case ERROR_OBSTACLE:
        com_printfln("! Déplacement vers %d, %d abandonné (OBSTACLE)", x, y);
        break;
      case ERROR_FIN_MATCH:
        com_printfln("! Déplacement vers %d, %d abandonné (FIN MATCH)", x, y);
        break;
      case ERROR_CAS_NON_GERE:
        com_printfln("! Déplacement vers %d, %d abandonné (CAS NON GERE)", x, y);
        break;
      case AUTRE:
        // TODO: ça n'a pas de sens, à préciser ce que c'est 'AUTRE'
        // --> asserv.cpp
        com_printfln("! Déplacement vers %f, %f abandonné (AUTRE ERREUR)", x, y);
        break;
      default:
        com_printfln("! ### Déplacement vers %d, %d abandonné (Erreur inconnue a corriger)", x, y);
    }

    if (tentatives >= max_tentatives) {
      com_printfln("! Après %d tentatives (max)", tentatives);
    }
  }

  return error;
}

uint8_t aller_pt_etape(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {

  /* Si accessible directement : return aller_xy()
     Sinon :
        aller_pt_etape()
        return aller(point_demandé)
  */
  bool point_accessible = false;
  bool je_suis_perdu = false;
  uint8_t point_de_passage;
  uint8_t error;
  Point point;


  switch(idPoint) {

  /* Je garde un exemple avec "robot_proche_point"
    case PT_ETAPE_1:
      com_printfln("Destination P1");
      if(robot_dans_zone(ZONE_A)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_E | ZONE_H | ZONE_I)) {
          point_de_passage = PT_ETAPE_8;
        }
        else if(robot_dans_zone(ZONE_F)) {
          if(robot_proche_point(PT_ETAPE_8)) { // PT8 est dans ZONE_F
            point_de_passage = PT_ETAPE_4;
          }
          else {
            point_de_passage = PT_ETAPE_8;
          }
        }
        else if(robot_dans_zone(ZONE_B | ZONE_C | ZONE_G)) {
          if(robot_proche_point(PT_ETAPE_4)) { // PT4 est dans ZONE_B
            point_accessible = true;
          }
          else {
            point_de_passage = PT_ETAPE_4;
          }
        }
        else if(robot_dans_zone(ZONE_J))
          point_de_passage = PT_ETAPE_15;
        else
          je_suis_perdu = true;
      }
      break;
    */
    
    /** Ce morceau de code a été généré automatiquement :) **/

    //Antoine 24/03/2018 : TODO_Rémi Code des points étapes à ajouter (j'ai enlevé le code des points 2018)


    /********************************************************/
  }

  if (je_suis_perdu) {
    com_printfln("! ######### ERREUR : Point '%d' sans stratégie", idPoint);
    return ERROR_CAS_NON_GERE;
  }
  else {
    point = getPoint(idPoint);
    if(point_accessible) {
      return aller_xy(point.x, point.y, vitesse, uniquement_avant, timeout, max_tentatives);
    }
    else {
      com_printfln("Détour...");
      error = aller_pt_etape(point_de_passage, vitesse, uniquement_avant, timeout, max_tentatives);
      if(error) return error;
      return aller_pt_etape(idPoint, vitesse, uniquement_avant, timeout, max_tentatives);
    }
  }

}


/** ========================
  Utilitaires de déplacement
  ========================== **/
  
//Antoine 24/03/2018 : TODO_Rémi màj code des zones

uint16_t localiser_zone() {
  // Ajout de zone à faire aussi dans getZone() et asserv2017.h
  // Généré automatiquement

  if(robot_dans_zone(ZONE_B)) {
    com_printfln("Localisé zone B");
    return ZONE_B;
  }
  else if(robot_dans_zone(ZONE_C)) {
    com_printfln("Localisé zone C");
    return ZONE_C;
  }
  else if(robot_dans_zone(ZONE_A)) {
    com_printfln("Localisé zone A");
    return ZONE_A;
  }
  else if(robot_dans_zone(ZONE_D)) {
    com_printfln("Localisé zone D");
    return ZONE_D;
  }
  else if(robot_dans_zone(ZONE_BS)) {
    com_printfln("Localisé zone BS");
    return ZONE_BS;
  }
  else if(robot_dans_zone(ZONE_CS)) {
    com_printfln("Localisé zone CS");
    return ZONE_CS;
  }
  else if(robot_dans_zone(ZONE_AS)) {
    com_printfln("Localisé zone AS");
    return ZONE_AS;
  }
  else if(robot_dans_zone(ZONE_DS)) {
    com_printfln("Localisé zone DS");
    return ZONE_DS;
  }

  com_printfln("##### Zone inconnue");
  return ZONE_INCONNUE;
}


Point getPoint(uint8_t idPoint) {
  // Ajout de point à faire aussi dans asserv2017.h
  
  /* Import depuis Excel : Remplacer par RegExp
    p([0-9]{1,2})\t([0-9]{3,4})\t([0-9]{3,4})
    case PT_ETAPE_$1: return {.x = $2, .y = $3}; break;
  */
  
  switch(idPoint) {
    case PT_ETAPE_1: return {.x = 270, .y = 250}; break;
    case PT_ETAPE_2:
      if(robot.estJaune)
        return {.x = 500, .y = 940};
      else
        return {.x = 500, .y = 740};
      
      break;
    case PT_ETAPE_3: return {.x = 610, .y = 1712}; break;
    case PT_ETAPE_4:
      if(robot.estJaune)
        return {.x = 2500, .y = 940};
      else
        return {.x = 2500, .y = 740};
      break;
    case PT_ETAPE_5: return {.x = 2390, .y = 1712}; break;
    case PT_ETAPE_6: return {.x = 610, .y = 1500}; break;
    case PT_ETAPE_8: return {.x = 230, .y = 1500}; break;
    case PT_ETAPE_9: return {.x = 589, .y = 1080}; break;
    case PT_ETAPE_10: return {.x = 1450, .y = 940}; break;
    case PT_ETAPE_11: return {.x = 1130, .y = 210}; break;
    case PT_ETAPE_12: return {.x = 1130, .y = 940}; break;
    case PT_ETAPE_13: return {.x = 850, .y = 940}; break;
    case PT_ETAPE_14: return {.x = 300, .y = 540}; break;
    case PT_ETAPE_6S: return {.x = 2390, .y = 1580}; break;
    case PT_ETAPE_12S: return {.x = 1870, .y = 1040}; break;
    default:
      com_printfln("! ########## ERREUR: idPoint '%d' incorrect dans getPoint", idPoint);
      return {.x = 500, .y = 1100}; // P8
  }
}


// marge = 50 si non renseigné
bool robot_proche_point(uint8_t idPoint, uint8_t marge) {
  Point point = getPoint(idPoint);
  return robot_dans_zone(point.x - marge, point.y - marge, point.x + marge, point.y + marge);
}


bool robot_dans_zone(uint16_t idZone) {
  // En mode bit mask, donc idZone peut tester plusieurs zones d'un coup
  // [Les zones peuvent donc se  chevaucher ? [TBC]]
  
  bool result = false;

  /* Import depuis Excel : Remplacer par Regexp
    z([A-Z])\t([0-9]{1,4})\t([0-9]{1,4})\t([0-9]{1,4})\t([0-9]{1,4})
    if\(\(idZone & ZONE_$1\) == ZONE_$1\)\n  result |= robot_dans_zone\($2, $3, $4, $5\);\n
  */
  
  if((idZone & ZONE_A) == ZONE_A)
    result |= robot_dans_zone(0, 0, 1000, 840);

  if((idZone & ZONE_B) == ZONE_B)
    result |= robot_dans_zone(1000, 0, 1500, 2000);

  if((idZone & ZONE_C) == ZONE_C)
    result |= robot_dans_zone(0, 840, 1000, 1375);

  if((idZone & ZONE_D) == ZONE_D)
    result |= robot_dans_zone(0, 1375, 1000, 2000);


  if(result) return result; // Bilan à mi-parcours. Inutile de continuer si on est déjà true
  
  
  if((idZone & ZONE_AS) == ZONE_AS)
    result |= robot_dans_zone(2000, 0, 3000, 840);

  if((idZone & ZONE_BS) == ZONE_BS)
    result |= robot_dans_zone(1500, 0, 2000, 2000);

  if((idZone & ZONE_CS) == ZONE_CS)
    result |= robot_dans_zone(2000, 840, 3000, 1375);

  if((idZone & ZONE_DS) == ZONE_DS)
    result |= robot_dans_zone(2000, 1375, 3000, 2000);


  return result;
}

bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
  if(x1 > x2 || y1 > y2) {
    tone_play_alert();
    com_printfln("! ############### Erreur : paramètres de robot_dans_zone mal définis.");
  }

  /*
  if(!robot.symetrie)
    return (robot.xMm >= x1 && robot.xMm <= x2) && (robot.yMm >= y1 && robot.yMm <= y2);
  else
    return (robot.xMm <= symetrie_x(x1) && robot.xMm >= symetrie_x(x2) && (robot.yMm >= y1 && robot.yMm <= y2));
*/

  // Ne peut-on pas se contenter d'un
  return (symetrie_x(robot.xMm) >= x1 && symetrie_x(robot.xMm) <= x2) && (robot.yMm >= y1 && robot.yMm <= y2);
  // ? (trop tard pour tester maintenant)

}

