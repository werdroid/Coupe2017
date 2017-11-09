#include "asserv2017.h"

/***
Initialement, l'idée était de mettre ici les fonctions spécifiques à un match mais pouvant servir aux 2 robots.
Ce fichier a tendance à créer quelques alias pour simplifier la création d'actions, à voir s'il faut les déplacer vers d'autres fichiers.
***/


void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to) {
  if(deg_from > deg_to) {
    for (; deg_from >= deg_to; deg_from--) {
      servo.write(deg_from);
      delay(20);
    }
  }
  else {
    for (; deg_from <= deg_to; deg_from++) {
      servo.write(deg_from);
      delay(20);
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

  if(match_termine()) {
    com_log_print("! Pas le temps de se déplacer (fin du match)");
    return ERROR_FIN_MATCH;
  }


  definir_vitesse_avance(vitesse);

  if(uniquement_avant) {
    asserv_rotation_vers_point(x, y, 2000);
  }

  do {
    error = asserv_go_xy(x, y, timeout, uniquement_avant);
    tentatives++;

    // L'idée, c'est qu'en cas d'échec, le robot recule un peu avant de réessayer. C'est un peu codé à la dernière minute, et ça pourrait être grandement amélioré
    // Il faudrait gérer différemment le cas où on a 5 erreurs TIMEOUT vs 5 erreurs OBSTACLE vs 3 TIMEOUT + 2 OBSTACLE, etc.
    /*if((error == ERROR_OBSTACLE || error == ERROR_TIMEOUT) && tentatives >= 2) {
      if(!match_termine()) {  // Il serait mieux de gérer ça dans asserv_distance() (c'est peut-être déjà le cas ?)
        com_log_println("--- Reculer");
        error2 = asserv_distance(-200, 1000);  // Ca recule, mais pas de la distance voulue...
        if(error2 == OK) { // Mis ici pour ne pas modifier asserv.cpp
          asserv_maintenir_position();
          com_log_println(":)");
        }
        else {
          com_log_println(":(");
        }
      }
    }
  } while((error == ERROR_OBSTACLE || error == ERROR_TIMEOUT) && tentatives < max_tentatives && !match_termine());//*/

    // En cas d'obstacle on fait une pause avant de tenter à nouveau
    if (error == ERROR_OBSTACLE) {
      delay(1000);
    }
  } while(error == ERROR_OBSTACLE && tentatives < max_tentatives && !match_termine());

  if(match_termine()) {
    com_log_print("! Déplacement vers ");
    com_log_print(x);
    com_log_print(";");
    com_log_print(y);
    com_log_println(" abandonné (fin du match)");
  }

  if(error != OK) {
    com_log_print("! Déplacement vers ");
    com_log_print(x);
    com_log_print(";");
    com_log_print(y);
    com_log_print(" abandonné");
    switch(error) {
      case ERROR_TIMEOUT:
        com_log_print(" (timeout ");
        com_log_print(timeout);
        com_log_print(" atteint)");
        break;
      case ERROR_OBSTACLE:
        com_log_print(" (OBSTACLE)");
        break;
      case ERROR_FIN_MATCH:
        com_log_print(" (FIN MATCH)");
        break;
      case ERROR_STRATEGIE:
        com_log_print(" (Stratégie)");
        break;
      case AUTRE:
        com_log_print(" (AUTRE ERREUR)");
        break;
      default:
        com_log_print(" ( ??? )");
    }

    if(tentatives >= max_tentatives) {
      com_log_print(" après ");
      com_log_print(tentatives);
      com_log_print(" tentatives");
    }
    com_log_println();

    if(error == ERROR_FIN_MATCH) {
      match_termine();
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
      com_log_println("Destination P1");
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
      com_log_println("Destination P4");
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
      com_log_println("Destination P7");
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
      com_log_println("Destination P8");
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
      com_log_println("Destination P10");
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
      com_log_println("Destination P14");
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
      com_log_println("Destination P15");
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
      je_suis_perdu = true;
  }

  if(je_suis_perdu) {
    com_log_println("! ######### ERREUR : Point Etape sans stratégie");
    return ERROR_STRATEGIE;
  }
  else {
    point = getPoint(idPoint);
    if(point_accessible) {
      return aller_xy(point.x, point.y, vitesse, uniquement_avant, timeout, max_tentatives);
    }
    else {
      com_log_println("On va faire un petit détour...");
      error = aller_pt_etape(point_de_passage, vitesse, uniquement_avant, timeout, max_tentatives);
      if(error) return error;
      return aller_pt_etape(idPoint, vitesse, uniquement_avant, timeout, max_tentatives);
    }
  }

}


void definir_vitesse_avance(uint32_t v) { // v entre 0 et 100
  quadramp_set_1st_order_vars(&robot.ramp_distance, v, v);
}

void definir_vitesse_rotation(uint32_t v) { // v entre 0 et 100
  quadramp_set_1st_order_vars(&robot.ramp_rotation, v, v);
}



uint16_t localiser_zone() {
  // Ajout de zone à faire aussi dans getZone() et asserv2017.h
  if(robot_dans_zone(ZONE_F)) {
    com_log_println("Localisé zone F");
    return ZONE_F;
  }
  else if(robot_dans_zone(ZONE_E)) {
    com_log_println("Localisé zone E");
    return ZONE_E;
  }
  else if(robot_dans_zone(ZONE_B)) {
    com_log_println("Localisé zone B");
    return ZONE_B;
  }
  else if(robot_dans_zone(ZONE_A)) {
    com_log_println("Localisé zone A");
    return ZONE_A;
  }
  else if(robot_dans_zone(ZONE_H)) {
    com_log_println("Localisé zone H");
    return ZONE_H;
  }
  else if(robot_dans_zone(ZONE_G)) {
    com_log_println("Localisé zone G");
    return ZONE_G;
  }
  else if(robot_dans_zone(ZONE_J)) {
    com_log_println("Localisé zone J");
    return ZONE_J;
  }
  else if(robot_dans_zone(ZONE_I)) {
    com_log_println("Localisé zone I");
    return ZONE_I;
  }
  else if(robot_dans_zone(ZONE_C)) {
    com_log_println("Localisé zone C");
    return ZONE_C;
  }
  else if(robot_dans_zone(ZONE_D)) {
    com_log_println("Localisé zone D");
    return ZONE_D;
  }

  com_log_println("##### Zone inconnue");
  return ZONE_INCONNUE;
}

/*
Fonction finalement mise directement dans robot_dans_zone()
Zone getZone(uint16_t idZone) {
  // Ajout de zone à faire aussi dans localiser_zone() et asserv2017.h
  switch(idZone) {
    case ZONE_A: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_B: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_C: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_D: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_E: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_F: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_G: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_H: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_I: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    case ZONE_J: return {x1: 0, y1: 0, x2: 500, y2: 500}; break;
    default:
      com_log_print("########## ERREUR: idZone '");
      com_log_print(idZone);
      com_log_println("' incorrect dans getZone");
      return {x1: 0, y1: 0, x2: 3000, y2: 2000};
  }
}
//*/


// Pourrait être mis directement dans aller_pt_etape() ...
Point getPoint(uint8_t idPoint) {
  // Ajout de point à faire aussi dans asserv2017.h
  switch(idPoint) {
    case PT_ETAPE_1: return {x: 900, y: 200}; break;
    case PT_ETAPE_4: return {x: 1000, y: 700}; break;
    case PT_ETAPE_7: return {x: 336, y: 693}; break;
    case PT_ETAPE_8: return {x: 500, y: 1100}; break;
    case PT_ETAPE_10: return {x: 400, y: 1350}; break;
    case PT_ETAPE_14: return {x: 750, y: 1700}; break;
    case PT_ETAPE_15: return {x: 1400, y: 800}; break;
    default:
      com_log_print("! ########## ERREUR: idPoint '");
      com_log_print(idPoint);
      com_log_println("' incorrect dans getZone");
      return {x: 500, y: 1100}; // P8
  }
}

uint8_t retour(uint8_t valeur) {
  com_log_print("== Valeur de retour : ");
  com_log_println(valeur);
  return valeur;
}

// Utiliser elapsedMillis à la place...
bool temps_ecoule(uint32_t t0, uint32_t duree) {
  return !(millis() - t0 < duree);
}

bool match_minuteur_90s() {
  return (millis() - robot.match_debut) > 89500;
}

void match_demarrer_minuteur() {
  robot.match_debut = millis();
  com_log_println("DebutDuMatch\n");
}

bool match_termine() {
  if(match_minuteur_90s()) {
    asserv_consigne_stop();
    com_log_println("Fin du match !");
    delay(1000);
    funny_action();
    return true;
  }
  else {
    return false;
  }
}