#include "asserv2017.h"

// ####################################
// Asserv
// ####################################

void asserv_setup() {
  robot.activeDistance = 1;
  robot.activeRotation = 1;
  robot.pwm_max = 80;
  robot.distance = 0;
  robot.rotation = 0;
  robot.consigneDistance = 0;
  robot.consigneRotation = 0;
}

#define sign(x) ((x)>=0?1:-1)

/*******************************************************************************
  Haut niveau
 *******************************************************************************/

void consignesOrbite(int32_t totemX, int32_t totemY) {
  // le vecteur perpendiculaire au totem
  int32_t vx = totemX - robot.x;
  int32_t vy = totemY - robot.y;
  float erreurAngleRad = atan2(vy, vx) - robot.a; // [-pi, +pi] radians
  erreurAngleRad = normalize_radian(erreurAngleRad);

  if (erreurAngleRad > 0) {
    erreurAngleRad -= MATH_PI2;
  } else {
    erreurAngleRad += MATH_PI2;
  }

  robot.erreurRotation = erreurAngleRad * config.ASSERV_COEFF_TICKS_PAR_RADIAN;
  robot.erreurDistance = 2000;
}

uint8_t consignesXY(int32_t consigneX, int32_t consigneY, uint16_t uniquement_avant) {
  // le vecteur à faire
  int32_t vx = consigneX - robot.x;
  int32_t vy = consigneY - robot.y;

  // norme et angle
  int32_t erreurNorme = sqrt(pow(vx, 2) + pow(vy, 2));
  int32_t erreurDistance;
  float erreurAngleRad = atan2(vy, vx) - robot.a; // [-pi, +pi] radians

  // on garde les angles dans le cercle trigo de -pi à +pi
  erreurAngleRad = normalize_radian(erreurAngleRad);

  if (!uniquement_avant && erreurAngleRad > HALF_PI) {
    // le point est derrière à droite, marche arrière
    erreurDistance = -erreurNorme;
    erreurAngleRad = erreurAngleRad - PI;
  } else if (!uniquement_avant && erreurAngleRad < -HALF_PI) {
    // le point est derrière à gauche, marche arrière
    erreurDistance = -erreurNorme;
    erreurAngleRad = erreurAngleRad + PI;
  } else {
    // le point est quelque part devant
    erreurDistance = erreurNorme;
    erreurAngleRad = erreurAngleRad;
  }

  /* départ --(distance/rotation)-- D1 --(distance)-- D2 --(gagné)-- 0
   * rotation seule tant que a > A et
   * rotation et distance tant que d > D1
   * distance seule tant que D1 > d > D2
   */

  int D1 = mm_vers_ticks(200); // rayon sans rotation
  int D2 = mm_vers_ticks(30); // rayon marge d'erreur distance
  uint8_t result = AUTRE;

  if (erreurNorme < D2) {
    // fin
    result = OK;
    controlPos(erreurDistance, 0);
  } else if (D1 < erreurNorme && erreurNorme < D2) {
    // distance seule car on est trop proche du point
    controlPos(erreurDistance, 0);
  } else if (abs(erreurAngleRad) > 0.5) {// 30/180*pi=0.5rad   10/180*pi=0.17rad
    // rotation seule car on n'est pas dans l'axe
    controlPos(0, erreurAngleRad);
  } else {
    // déplacement normal
    controlPos(erreurDistance, erreurAngleRad);
  }

  return result;
}

uint8_t asserv_goxy(int32_t consigneX, int32_t consigneY, uint16_t timeout, uint16_t uniquement_avant) {
  elapsedMillis timer;
  uint8_t result;

  consigneX = mm_vers_ticks(symmetrie_x(consigneX));
  consigneY = mm_vers_ticks(consigneY);

  while (1) {
    synchronisation();
    result = consignesXY(consigneX, consigneY, uniquement_avant);

    if (result == OK) {
      delay(200);
      asserv_raz_consignes();
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_raz_consignes();
      return ERROR_TIMEOUT;
    }

    if (robot.sickObstacle) {
      Serial.println("------------ OBSTACLE");
      asserv_raz_consignes();
      tone_play_alert();
      delay(1000); // Ce délai est fortement utilisé dans match_gr() et match_pr(). Avant de supprimer cette ligne, penser à le remettre en dehors des appels à asserv_goxy()
      return ERROR_OBSTACLE;
    }
  }
}

// Regarder vers le point indiqué
uint8_t asserv_goa_point(int32_t consigneX, int32_t consigneY, uint16_t timeout) {
  consigneX = mm_vers_ticks(symmetrie_x(consigneX));
  consigneY = mm_vers_ticks(consigneY);

  // le vecteur à faire
  int32_t vx = consigneX - robot.x;
  int32_t vy = consigneY - robot.y;

  float angleVersPoint = atan2(vy, vx); // [-pi, +pi] radians

  robot.sans_symmetrie = 1;
  uint8_t ret = asserv_goa(angleVersPoint, timeout);
  robot.sans_symmetrie = 0;
  return ret;
}

uint8_t asserv_goa(float orientation, uint16_t timeout, uint8_t sans_symmetrie) {
  return faire_rotation(normalize_radian(symmetrie_a(orientation) - robot.a), timeout);
}

uint8_t tout_droit(int32_t distance, uint16_t timeout) {
  elapsedMillis timer;
  robot.consigneDistance = robot.distance + distance;

  while (1) {
    synchronisation();
    int32_t erreur = abs(robot.distance - robot.consigneDistance);
    int32_t marge_distance = 20 * config.ASSERV_COEFF_TICKS_PAR_MM;

    if (erreur <= marge_distance) {
      delay(200);
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_raz_consignes();
      return ERROR_TIMEOUT;
    }
  }
}

uint8_t faire_rotation(float rotation_rad, uint16_t timeout) {
  elapsedMillis timer;
  robot.consigneRotation = robot.rotation + rotation_rad * config.ASSERV_COEFF_TICKS_PAR_RADIAN;
  int32_t marge_erreur_rotation = 0.3 * config.ASSERV_COEFF_TICKS_PAR_RADIAN;

  while (1) {
    synchronisation();
    int32_t erreur = abs(robot.rotation - robot.consigneRotation);

    if (erreur <= marge_erreur_rotation) {
      delay(500);
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_raz_consignes();
      return ERROR_TIMEOUT;
    }
  }
}

void controlPos(float erreurDistance, float erreurRotationRadian) {
  robot.consigneDistance = robot.distance + erreurDistance;
  robot.consigneRotation = robot.rotation + erreurRotationRadian * config.ASSERV_COEFF_TICKS_PAR_RADIAN;
}

void controle_distance(int32_t erreurDistance) {
  robot.consigneDistance = robot.distance + erreurDistance;
}

void controle_rotation(float erreurRotationRadian) {
  robot.consigneRotation = robot.rotation + erreurRotationRadian * config.ASSERV_COEFF_TICKS_PAR_RADIAN;
}

void asserv_raz_consignes() {
  robot.consigneDistance = robot.distance;
  robot.consigneRotation = robot.rotation;
}

/*******************************************************************************
  Bas niveau
 *******************************************************************************/

static int32_t erreur_distance_precedente = 0;
static int32_t erreur_rotation_precedente = 0;

void asservissement_polaire() {
  robot.erreurDistance = quadramp_do_filter(&robot.ramp_distance, robot.consigneDistance) - robot.distance;
  // robot.erreurDistance = robot.consigneDistance - robot.distance;
  robot.erreurRotation = quadramp_do_filter(&robot.ramp_rotation, robot.consigneRotation) - robot.rotation;

  int32_t pwmDistance = 0;
  int32_t pwmRotation = 0;

  if (robot.activeDistance) {
    pwmDistance = robot.erreurDistance * config.ASSERV_DISTANCE_KP + (robot.erreurDistance - erreur_distance_precedente) * config.ASSERV_DISTANCE_KD;
  }
  if (robot.activeRotation) {
    pwmRotation = robot.erreurRotation * config.ASSERV_ROTATION_KP + (robot.erreurRotation - erreur_rotation_precedente) * config.ASSERV_ROTATION_KD;
  }

  pwmDistance = constrain(pwmDistance, -127, 127);
  pwmRotation = constrain(pwmRotation, -50, 50);

  // polaire
  robot.moteurGauche = pwmDistance + pwmRotation;
  robot.moteurDroite = pwmDistance - pwmRotation;

  if (robot.pwm) { // force la pwm des moteurs à la place de l'asservissement
    robot.moteurGauche = robot.pwm;
    robot.moteurDroite = robot.pwm;
  }

  if (robot.match_debut && millis() - robot.match_debut > 81000) {
    Serial.println("fin match");
    robot.moteurGauche = 0;
    robot.moteurDroite = 0;
  }

  moteur_gauche(robot.moteurGauche);
  moteur_droite(robot.moteurDroite);

  erreur_distance_precedente = robot.erreurDistance;
  erreur_rotation_precedente = robot.erreurRotation;
}
