#include "asserv2017.h"

// ####################################
// Asserv
// ####################################

void asserv_setup() {
  robot.asserv_mode = ASSERV_MODE_STOP;
  robot.activeDistance = 1;
  robot.activeRotation = 1;
  robot.pwm_max = 80;
  robot.distance = 0;
  robot.rotation = 0;
  robot.consigneDistance = 0;
  robot.consigneRotation = 0;
}

/*******************************************************************************
  Haut niveau
 *******************************************************************************/

uint8_t consignesXY(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t uniquement_avant) {
  // le vecteur à faire
  int32_t vx = consigne_x_mm - robot.xMm; // mm
  int32_t vy = consigne_y_mm - robot.yMm; // mm

  // norme et angle
  int32_t erreurNorme = sqrt(pow(vx, 2) + pow(vy, 2)); // mm
  int32_t erreurDistance; // mm
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

  int D1 = 200; // rayon sans rotation en mm
  int D2 = 30; // rayon marge d'erreur distance en mm
  uint8_t result = AUTRE;

  if (erreurNorme < D2) {
    // fin
    result = OK;
    asserv_consigne_polaire_delta(erreurDistance, 0);
  } else if (D1 < erreurNorme && erreurNorme < D2) {
    // distance seule car on est trop proche du point
    asserv_consigne_polaire_delta(erreurDistance, 0);
  } else if (abs(erreurAngleRad) > 0.5) {// 30/180*pi=0.5rad   10/180*pi=0.17rad
    // rotation seule car on n'est pas dans l'axe
    asserv_consigne_polaire_delta(0, erreurAngleRad);
  } else {
    // déplacement normal
    asserv_consigne_polaire_delta(erreurDistance, erreurAngleRad);
  }

  return result;
}

uint8_t asserv_goxy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t timeout, uint16_t uniquement_avant) {
  elapsedMillis timer;
  uint8_t result;


  consigne_x_mm = symetrie_x(consigne_x_mm);
  consigne_y_mm = consigne_y_mm;

  robot.consigneXmm = consigne_x_mm;
  robot.consigneYmm = consigne_y_mm;

  while (1) {
    synchronisation();
    result = consignesXY(consigne_x_mm, consigne_y_mm, uniquement_avant);

    if (result == OK) {
      delay(200);
      asserv_raz_consignes();
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_raz_consignes();
      return ERROR_TIMEOUT;
    }

    if (match_minuteur_90s()) {
      return ERROR_FIN_MATCH;
    }

    if (robot.sickObstacle) {
      com_log_println("------------ OBSTACLE");
      asserv_raz_consignes();
      tone_play_alert();
      delay(1000); // Ce délai est fortement utilisé dans match_gr() et match_pr(). Avant de supprimer cette ligne, penser à le remettre en dehors des appels à asserv_goxy()
      return ERROR_OBSTACLE;
    }
  }
}

// va tout droit en avant ou arrière sans se retourner
// conseillé sur de petites distance car le point de destination
// peut être n'importe où, par exemple à l'extérieur de la table...
uint8_t asserv_go_toutdroit(int32_t consigne_mm, uint16_t timeout) {
  int32_t consigne_x_mm = robot.xMm + consigne_mm * cos(robot.a);
  int32_t consigne_y_mm = robot.yMm + consigne_mm * sin(robot.a);

  if(consigne_mm < 0) {
    // utilisation de symetrie_x pour compenser la symetrie_x faite à l'intérieur de asserv_goxy();
    return asserv_goxy(symetrie_x(consigne_x_mm), consigne_y_mm, timeout, 0); // Pas uniquement en avant si on veut reculer
  }
  else {
    return asserv_goxy(symetrie_x(consigne_x_mm), consigne_y_mm, timeout, 1);
  }
}

// Regarder vers le point indiqué
uint8_t asserv_goa_point(int32_t consigneX, int32_t consigneY, uint16_t timeout) {
  consigneX = mm2tick(symetrie_x(consigneX));
  consigneY = mm2tick(consigneY);

  // le vecteur à faire
  int32_t vx = consigneX - robot.x;
  int32_t vy = consigneY - robot.y;

  float angleVersPoint = atan2(vy, vx); // [-pi, +pi] radians

  robot.sans_symetrie = 1; // on fait déjà une symétrie sur x au dessus.
  uint8_t ret = asserv_goa(angleVersPoint, timeout);
  robot.sans_symetrie = 0;
  return ret;
}

uint8_t asserv_goa(float orientation, uint16_t timeout, uint8_t sans_symetrie) {
  return faire_rotation(normalize_radian(symetrie_a_axiale_y(orientation) - robot.a), timeout);
}

uint8_t tout_droit(int32_t distance, uint16_t timeout) {
  elapsedMillis timer;
  asserv_consigne_polaire_delta(distance, 0);

  while (1) {
    synchronisation();
    int32_t erreur = abs(robot.distance - robot.consigneDistance);
    int32_t marge_distance = mm2tick(20);

    if (erreur <= marge_distance) {
      delay(200);
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_raz_consignes();
      return ERROR_TIMEOUT;
    }

    if (match_minuteur_90s()) {
      return ERROR_FIN_MATCH;
    }
  }
}

uint8_t faire_rotation(float rotation_rad, uint16_t timeout) {
  elapsedMillis timer;
  asserv_consigne_polaire_delta(0, rotation_rad);
  int32_t marge_erreur_rotation = radian_vers_orientation(0.3);

  while (1) {
    synchronisation();
    int32_t erreur = abs(robot.rotation - robot.consigneRotation);

    if (erreur <= marge_erreur_rotation) {
      delay(200); // Modifié pour essayer d'accélerer. Si plantage, remettre à 500.
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_raz_consignes();
      return ERROR_TIMEOUT;
    }

    if (match_minuteur_90s()) {
      return ERROR_FIN_MATCH;
    }
  }
}

void asserv_raz_consignes() {
  robot.consigneDistance = robot.distance;
  robot.consigneRotation = robot.rotation;
}

/*******************************************************************************
  Fixe les consignes brutes de la boucle
 *******************************************************************************/

void asserv_consigne_stop() {
  robot.asserv_mode = ASSERV_MODE_STOP;
}

void asserv_consigne_pwm(uint16_t pwm_gauche, uint16_t pwm_droite) {
  robot.asserv_mode = ASSERV_MODE_PWM;

  robot.consigne_pwm_gauche = pwm_gauche;
  robot.consigne_pwm_droite = pwm_droite;
}

void asserv_consigne_polaire(int32_t distance_tick, int32_t rotation_tick) {
  robot.asserv_mode = ASSERV_MODE_POLAIRE;

  robot.consigneDistance = distance_tick;
  robot.consigneRotation = rotation_tick;
}

void asserv_consigne_polaire_delta(int32_t distance_mm_delta, float rotation_rad_delta) {
  robot.asserv_mode = ASSERV_MODE_POLAIRE;

  robot.consigneDistance = robot.distance + mm2tick(distance_mm_delta);
  robot.consigneRotation = robot.rotation + radian_vers_orientation(rotation_rad_delta);
}

/*******************************************************************************
  Boucle temps réel
 *******************************************************************************/

static int32_t erreur_distance_precedente = 0;
static int32_t erreur_rotation_precedente = 0;


// Contrôle les moteurs en fonction des consignes et du mode actuel

void asserv_loop() {
  if (match_minuteur_90s()) { // fin match, on coupe tout !
    asserv_consigne_stop();
  }

  if (robot.asserv_mode == ASSERV_MODE_STOP) {
    moteur_gauche(0);
    moteur_droite(0);
    return;
  }

  if (robot.asserv_mode == ASSERV_MODE_PWM) {
    moteur_gauche(robot.consigne_pwm_gauche);
    moteur_droite(robot.consigne_pwm_droite);
    return;
  }

  // robot.asserv_mode == ASSERV_MODE_POLAIRE

  // l'erreur correspond aussi au patinage, plus il augmente plus l'accélération devrait être baissée
  robot.erreurDistance = quadramp_do_filter(&robot.ramp_distance, robot.consigneDistance) - robot.distance;
  // robot.erreurDistance = robot.consigneDistance - robot.distance;
  robot.erreurRotation = quadramp_do_filter(&robot.ramp_rotation, robot.consigneRotation) - robot.rotation;

  int32_t pwmDistance = 0;
  int32_t pwmRotation = 0;

  if (robot.activeDistance) {
    pwmDistance = robot.erreurDistance * robot.ASSERV_DISTANCE_KP + (robot.erreurDistance - erreur_distance_precedente) * robot.ASSERV_DISTANCE_KD;
  }
  if (robot.activeRotation) {
    pwmRotation = robot.erreurRotation * robot.ASSERV_ROTATION_KP + (robot.erreurRotation - erreur_rotation_precedente) * robot.ASSERV_ROTATION_KD;
  }

  pwmDistance = constrain(pwmDistance, -127, 127);
  pwmRotation = constrain(pwmRotation, -50, 50);

  // polaire
  robot.moteurGauche = pwmDistance + pwmRotation;
  robot.moteurDroite = pwmDistance - pwmRotation;

  moteur_gauche(robot.moteurGauche);
  moteur_droite(robot.moteurDroite);

  erreur_distance_precedente = robot.erreurDistance;
  erreur_rotation_precedente = robot.erreurRotation;
}
