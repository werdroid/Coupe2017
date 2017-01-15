#include "asserv2017.h"

/***
Initialement, l'idée était de mettre ici les fonctions spécifiques à un match mais pouvant servir aux 2 robots.
Ce fichier a tendance à créer quelques alias pour simplifier la création d'actions, à voir s'il faut les déplacer vers d'autres fichiers.
***/


void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to) {
  for (; deg_from >= deg_to; deg_from--) {
    servo.write(deg_from);
    delay(20);
  }
}

// Attention, inversion de uniquement_avant et timeout par rapport à asserv_goxy
// (La logique est : on définit les paramètres de notre consigne avant de définir les conditions d'échec)
// aller_xy = "Va là intelligement"
// asserv_goxy = "Va là, stupide"
// Tous les paramètres sont obligatoires
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {
  uint8_t error;
  uint8_t error2;
  uint8_t tentatives = 0;

  definir_vitesse_avance(vitesse);
  if(uniquement_avant) {
    asserv_goa_point(x, y, 2000);
  }
  do {
    error = asserv_goxy(x, y, timeout, uniquement_avant);
    tentatives++;

    // L'idée, c'est qu'en cas d'échec, le robot recule un peu avant de réessayer. C'est un peu codé à la dernière minute, et ça pourrait être grandement amélioré
    // Il faudrait gérer différemment le cas où on a 5 erreurs TIMEOUT vs 5 erreurs OBSTACLE vs 3 TIMEOUT + 2 OBSTACLE, etc.
    /*if((error == ERROR_OBSTACLE || error == ERROR_TIMEOUT) && tentatives >= 2) {
      if(!match_termine()) {  // Il serait mieux de gérer ça dans tout_droit() (c'est peut-être déjà le cas ?)
        com_log_println("--- Reculer");
        error2 = tout_droit(-200, 1000);  // Ca recule, mais pas de la distance voulue...
        if(error2 == OK) { // Mis ici pour ne pas modifier asserv.cpp
          asserv_raz_consignes();
          com_log_println(":)");
        }
        else {
          com_log_println(":(");
        }
      }
    }
    // En cas d'ERROR_OBSTACLE, le robot attend 1s (delay(1000) défini dans asserv_goxy)
  } while((error == ERROR_OBSTACLE || error == ERROR_TIMEOUT) && tentatives < max_tentatives && !match_termine());//*/
  } while(error == ERROR_OBSTACLE && tentatives < max_tentatives && !match_termine());

  if(match_termine()) {
    com_log_print("! Déplacement vers ");
    com_log_print(x);
    com_log_print(";");
    com_log_print(y);
    com_log_print(" abandonné (fin du match)");
  }

  if(error != OK) {
    com_log_print("! Déplacement vers ");
    com_log_print(x);
    com_log_print(";");
    com_log_print(y);
    com_log_print(" abandonné");
    if(error == ERROR_TIMEOUT) {
      com_log_print(" (timeout ");
      com_log_print(timeout);
      com_log_print(" atteint)");
    }
    else if(error == ERROR_OBSTACLE) {
      com_log_print(" (OBSTACLE)");
    }
    else {
      com_log_print(" (AUTRE ERREUR)");
    }

    if(tentatives >= max_tentatives) {
      com_log_print(" après ");
      com_log_print(tentatives);
      com_log_print(" tentatives");
    }
    com_log_println();
  }

  return error;
}

void definir_vitesse_avance(uint32_t v) { // v entre 0 et 100
  quadramp_set_1st_order_vars(&robot.ramp_distance, v, v);
}

void definir_vitesse_rotation(uint32_t v) { // v entre 0 et 100
  quadramp_set_1st_order_vars(&robot.ramp_rotation, v, v);
}

uint8_t localiser_zone() {
  // Voir schéma de la table pour les correspondances des zones
  // Attention, les termes ne correspondent pas aux termes du règlement

  if(robot_dans_zone(0, 0, 800, 750)) {
    com_log_println("Localisé en zone Cabines");
    return ZONE_CABINES;
  }
  else if(robot_dans_zone(0, 750, 1500, 1500)) {
    com_log_println("Localisé en zone Construction");
    return ZONE_CONSTRUCTION;
  }
  else if(robot_dans_zone(800, 0, 2100, 750)) {
    com_log_println("Localisé en zone Dune");
    return ZONE_DUNE;
  }
  else if(robot_dans_zone(0, 1500, 3000, 2000)) {
    com_log_println("Localisé en zone Pêche");
    return ZONE_PECHE;
  }

  com_log_println("##### Zone inconnue");
  return ZONE_INCONNUE;
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

bool match_termine() {
  return (millis() - robot.match_debut) > 82000;
}