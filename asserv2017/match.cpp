#include "asserv2017.h"

/***
Initialement, l'idée était de mettre ici les fonctions spécifiques à un match mais pouvant servir aux 2 robots.
Ce fichier a tendance à créer quelques alias pour simplifier la création d'actions, à voir s'il faut les déplacer vers d'autres fichiers.
***/


void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to) {
  if(deg_from > deg_to) {
    for (; deg_from >= deg_to; deg_from--) {
      servo.write(deg_from);
      minuteur_attendre(20);
    }
  }
  else {
    for (; deg_from <= deg_to; deg_from++) {
      servo.write(deg_from);
      minuteur_attendre(20);
    }
  }
}

// Attention, inversion de uniquement_avant et timeout par rapport à asserv_go_xy
// (La logique est : on définit les paramètres de notre consigne avant de définir les conditions d'échec)
// aller_xy = "Va là intelligement"
// asserv_go_xy = "Va là, stupide"
// Tous les paramètres sont obligatoires
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {
  uint8_t error;
  uint8_t error2;
  uint8_t tentatives = 0;

  asserv_vitesse_distance(vitesse);

  if (uniquement_avant) {
    asserv_rotation_vers_point(x, y, 2000);
  }

  do {
    error = asserv_go_xy(x, y, timeout, uniquement_avant);
    tentatives++;

    // En cas d'obstacle on fait une pause avant de tenter à nouveau
    if (error == ERROR_OBSTACLE) {
      minuteur_attendre(1000);
    }
  } while (error == ERROR_OBSTACLE && tentatives < max_tentatives);

  if (error != OK) {
    com_printfln("! Déplacement vers %f, %f abandonné", x, y);
    switch(error) {
      case ERROR_TIMEOUT:
        com_printfln("! Déplacement vers %f, %f abandonné (timeout %d atteint)", x, y, timeout);
        break;
      case ERROR_OBSTACLE:
        com_printfln("! Déplacement vers %f, %f abandonné (OBSTACLE)", x, y);
        break;
      case ERROR_FIN_MATCH:
        com_printfln("! Déplacement vers %f, %f abandonné (FIN MATCH)", x, y);
        break;
      case ERROR_STRATEGIE:
        com_printfln("! Déplacement vers %f, %f abandonné (Stratégie)", x, y);
        break;
      case AUTRE:
        // TODO: ça n'a pas de sens, à préciser ce que c'est 'AUTRE'
        com_printfln("! Déplacement vers %f, %f abandonné (AUTRE ERREUR)", x, y);
        break;
      default:
        com_printfln("! Déplacement vers %f, %f abandonné ( erreur inconnue a corriger )", x, y);
    }

    if (tentatives >= max_tentatives) {
      com_printfln("! Après %d tentatives (max)", tentatives);
    }
  }

  return error;
}

uint8_t aller_pt_etape(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {
  // A RELIRE !

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

    case PT_ETAPE_4:
      com_printfln("Destination P4");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C | ZONE_G)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_H | ZONE_I)) {
          if(robot_proche_point(PT_ETAPE_8)) { // PT8 est dans ZONE_F
            point_accessible = true;
          }
          else {
            point_de_passage = PT_ETAPE_8;
          }
        }
        else if(robot_dans_zone(ZONE_J))
          point_de_passage = PT_ETAPE_15;
        else
          je_suis_perdu = true;
      }
      break;

    case PT_ETAPE_7:
      com_printfln("Destination P7");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_H)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_B | ZONE_G | ZONE_I))
          point_de_passage = PT_ETAPE_8;
        else if(robot_dans_zone(ZONE_A | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_J))
          point_de_passage = PT_ETAPE_15;
        else
          je_suis_perdu = true;
      }
      break;

    case PT_ETAPE_8:
      com_printfln("Destination P8");
      if(robot_dans_zone(ZONE_B | ZONE_E | ZONE_F | ZONE_G | ZONE_H | ZONE_I)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_J))
          point_de_passage = PT_ETAPE_15;
        else
          je_suis_perdu = true;
      }
      break;

    case PT_ETAPE_10:
      com_printfln("Destination P10");
      if(robot_dans_zone(ZONE_B | ZONE_E | ZONE_F | ZONE_G | ZONE_H | ZONE_I)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_J))
          point_de_passage = PT_ETAPE_15;
        else
          je_suis_perdu = true;
      }
      break;

    case PT_ETAPE_14:
      com_printfln("Destination P14");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_H)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_B | ZONE_G | ZONE_I))
          point_de_passage = PT_ETAPE_8;
        else if(robot_dans_zone(ZONE_A | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_J))
          point_de_passage = PT_ETAPE_15;
        else
          je_suis_perdu = true;
      }
      break;

    case PT_ETAPE_15:
      com_printfln("Destination P15");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_I | ZONE_J)) {
         point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_G | ZONE_H)) {
          if(robot_proche_point(PT_ETAPE_8)) { // PT8 est dans ZONE_F
            point_accessible = true;
          }
          else {
            point_de_passage = PT_ETAPE_8;
          }
        }
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else
          je_suis_perdu = true;
      }
      break;

    default:
      com_printfln("Point inconnu");
      je_suis_perdu = true;
  }

  if (je_suis_perdu) {
    com_printfln("! ######### ERREUR : Point '%d' sans stratégie", idPoint);
    return ERROR_STRATEGIE;
  }
  else {
    point = getPoint(idPoint);
    if(point_accessible) {
      return aller_xy(point.x, point.y, vitesse, uniquement_avant, timeout, max_tentatives);
    }
    else {
      com_printfln("On va faire un petit détour...");
      error = aller_pt_etape(point_de_passage, vitesse, uniquement_avant, timeout, max_tentatives);
      if(error) return error;
      return aller_pt_etape(idPoint, vitesse, uniquement_avant, timeout, max_tentatives);
    }
  }

}

uint16_t localiser_zone() {
  // Ajout de zone à faire aussi dans getZone() et asserv2017.h
  if(robot_dans_zone(ZONE_F)) {
    com_printfln("Localisé zone F");
    return ZONE_F;
  }
  else if(robot_dans_zone(ZONE_E)) {
    com_printfln("Localisé zone E");
    return ZONE_E;
  }
  else if(robot_dans_zone(ZONE_B)) {
    com_printfln("Localisé zone B");
    return ZONE_B;
  }
  else if(robot_dans_zone(ZONE_A)) {
    com_printfln("Localisé zone A");
    return ZONE_A;
  }
  else if(robot_dans_zone(ZONE_H)) {
    com_printfln("Localisé zone H");
    return ZONE_H;
  }
  else if(robot_dans_zone(ZONE_G)) {
    com_printfln("Localisé zone G");
    return ZONE_G;
  }
  else if(robot_dans_zone(ZONE_J)) {
    com_printfln("Localisé zone J");
    return ZONE_J;
  }
  else if(robot_dans_zone(ZONE_I)) {
    com_printfln("Localisé zone I");
    return ZONE_I;
  }
  else if(robot_dans_zone(ZONE_C)) {
    com_printfln("Localisé zone C");
    return ZONE_C;
  }
  else if(robot_dans_zone(ZONE_D)) {
    com_printfln("Localisé zone D");
    return ZONE_D;
  }

  com_printfln("##### Zone inconnue");
  return ZONE_INCONNUE;
}

// Pourrait être mis directement dans aller_pt_etape() ...
Point getPoint(uint8_t idPoint) {
  // Ajout de point à faire aussi dans asserv2017.h
  switch(idPoint) {
    case PT_ETAPE_1: return {.x = 900, .y = 200}; break;
    case PT_ETAPE_4: return {.x = 1000, .y = 700}; break;
    case PT_ETAPE_7: return {.x = 336, .y = 693}; break;
    case PT_ETAPE_8: return {.x = 500, .y = 1100}; break;
    case PT_ETAPE_10: return {.x = 400, .y = 1350}; break;
    case PT_ETAPE_14: return {.x = 750, .y = 1700}; break;
    case PT_ETAPE_15: return {.x = 1400, .y = 800}; break;
    default:
      com_printfln("! ########## ERREUR: idPoint '%d' incorrect dans getZone", idPoint);
      return {.x = 500, .y = 1100}; // P8
  }
}

bool robot_proche_point(uint8_t idPoint) {
  Point point = getPoint(idPoint);
  return robot_dans_zone(point.x - 50, point.y - 50, point.x + 50, point.y + 50);
}


bool robot_dans_zone(uint16_t idZone) {
  // En mode bit mask, donc idZone peut tester plusieurs zones d'un coup

  bool result = false;


  if((idZone & ZONE_A) == ZONE_A)
    result |= robot_dans_zone(700, 0, 1500, 600);

  if((idZone & ZONE_B) == ZONE_B)
    result |= robot_dans_zone(700, 600, 1500, 1000);

  if((idZone & ZONE_C) == ZONE_C)
    result |= robot_dans_zone(1000, 1000, 1500, 1500);

  if((idZone & ZONE_D) == ZONE_D)
    result |= robot_dans_zone(1000, 1500, 1500, 2000);

  if((idZone & ZONE_E) == ZONE_E)
    result |= robot_dans_zone(0, 0, 700, 900);

  if((idZone & ZONE_F) == ZONE_F)
    result |= robot_dans_zone(300, 700, 700, 1500);

  if((idZone & ZONE_G) == ZONE_G)
    result |= robot_dans_zone(700, 1000, 1000, 1500);

  if((idZone & ZONE_H) == ZONE_H)
    result |= robot_dans_zone(300, 1500, 1000, 2000);

  if((idZone & ZONE_I) == ZONE_I)
    result |= robot_dans_zone(0, 900, 300, 2000);

  if((idZone & ZONE_J) == ZONE_J)
    result |= robot_dans_zone(1500, 0, 3000, 2000);

  return result;
}

bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
  if(x1 > x2 || y1 > y2) {
    tone_play_alert();
    com_printfln("############### Erreur : paramètres de robot_dans_zone mal définis.");
  }

  if(!robot.symetrie)
    return (robot.xMm >= x1 && robot.xMm <= x2) && (robot.yMm >= y1 && robot.yMm <= y2);
  else
    return (robot.xMm <= symetrie_x(x1) && robot.xMm >= symetrie_x(x2) && (robot.yMm >= y1 && robot.yMm <= y2));

  // Ne peut-on pas se contenter d'un
  // return (symetrie_x(robot.xMm) >= x1 && symetrie_x(robot.xMm) <= x2) && (robot.yMm >= y1 && robot.yMm <= y2));
  // ? (trop tard pour tester maintenant)

}
