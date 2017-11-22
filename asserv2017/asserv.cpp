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

  quadramp_init(&robot.ramp_distance);
  asserv_vitesse_distance(100);
  quadramp_set_2nd_order_vars(&robot.ramp_distance, 1, 1);

  quadramp_init(&robot.ramp_rotation);
  asserv_vitesse_rotation(100);
  quadramp_set_2nd_order_vars(&robot.ramp_rotation, 1, 1);
}

/*******************************************************************************
  Haut niveau
 *******************************************************************************/

/**
 * A partir des coordonnées X et Y en mm, calcule et spécifie à
 * l'asservissement les nouvelles consignes polaires.
 * Retourne immédiatement sans code d'erreur.
 */

uint8_t asserv_consigne_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t uniquement_avant) {
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

/**
 * Fonction blocante pour aller en X,Y, unité en mm, par le chemin le plus court à vol d'oiseau.
 * Peut s'arrête pour ces raisons:
 * - OK arrivé à destination
 * - ERROR_OBSTACLE un obstacle est sur le chemin
 * - ERROR_FIN_MATCH on a atteint la fin du match
 * - ERROR_TIMEOUT le temps consacré à la fonction est dépassé
 */

uint8_t asserv_go_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t timeout, uint16_t uniquement_avant) {
  elapsedMillis timer;
  uint8_t result;


  consigne_x_mm = symetrie_x(consigne_x_mm);
  consigne_y_mm = consigne_y_mm;

  robot.consigneXmm = consigne_x_mm;
  robot.consigneYmm = consigne_y_mm;

  while (1) {
    synchronisation();
    result = asserv_consigne_xy(consigne_x_mm, consigne_y_mm, uniquement_avant);

    if (result == OK) {
      minuteur_attendre(200); // stabilisation de l'inertie
      asserv_maintenir_position();
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_maintenir_position();
      return ERROR_TIMEOUT;
    }

    if (robot.sickObstacle) {
      com_printfln("------------ OBSTACLE");
      asserv_maintenir_position();
      tone_play_alert();
      return ERROR_OBSTACLE;
    }
  }
}

/**
 * Va tout droit en avant ou arrière sans se retourner, bloquant,
 * conseillé sur de petites distance car le point de destination
 * peut être n'importe où, par exemple à l'extérieur de la table...
 * Retour bloquant et s'arrête pour ces raisons:
 * - OK arrivé à destination
 * - ERROR_OBSTACLE un obstacle est sur le chemin
 * - ERROR_FIN_MATCH on a atteint la fin du match
 * - ERROR_TIMEOUT le temps consacré à la fonction est dépassé
 */

uint8_t asserv_go_toutdroit(int32_t consigne_mm, uint16_t timeout) {
  int32_t consigne_x_mm = robot.xMm + consigne_mm * cos(robot.a);
  int32_t consigne_y_mm = robot.yMm + consigne_mm * sin(robot.a);

  if (consigne_mm < 0) {
    // utilisation de symetrie_x pour compenser la symetrie_x faite à l'intérieur de asserv_go_xy();
    return asserv_go_xy(symetrie_x(consigne_x_mm), consigne_y_mm, timeout, 0); // Pas uniquement en avant si on veut reculer
  } else {
    return asserv_go_xy(symetrie_x(consigne_x_mm), consigne_y_mm, timeout, 1);
  }
}

/**
 * Regarde vers le point indiqué X,Y en mm.
 * Retour bloquant jusqu'à:
 * - OK
 * - ERROR_TIMEOUT
 * - ERROR_FIN_MATCH
 */

uint8_t asserv_rotation_vers_point(int32_t x_mm, int32_t y_mm, uint16_t timeout) {
  int32_t x = mm2tick(symetrie_x(x_mm));
  int32_t y = mm2tick(y_mm);

  // le vecteur à faire
  int32_t vx = x - robot.x;
  int32_t vy = y - robot.y;

  float angleVersPoint = atan2(vy, vx); // [-pi, +pi] radians

  robot.sans_symetrie = 1; // on fait déjà une symétrie sur x au dessus.
  uint8_t ret = asserv_rotation_relative(angleVersPoint, timeout);
  robot.sans_symetrie = 0;
  return ret;
}

/**
 * Fait une distance de X mm sans se préoccuper de la rotation,
 * pratique pour se caler contre une bordure :)
 * Retour bloquant jusqu'à:
 * - OK on a fait la distance
 * - ERROR_TIMEOUT
 * - ERROR_FIN_MATCH
 */

uint8_t asserv_distance(int32_t distance_mm, uint16_t timeout) {
  elapsedMillis timer;
  asserv_consigne_polaire_delta(mm2tick(distance_mm), 0);

  // On active seulement la distance sans la rotation
  // pour pouvoir se plaquer contre la bordure
  // et on réactive tout en sortant de cette fonction via asserv_maintenir_position();
  robot.activeDistance = 1;
  robot.activeRotation = 0;

  while (1) {
    synchronisation();
    int32_t erreur = abs(robot.distance - robot.consigneDistance);
    int32_t marge_distance = mm2tick(20);

    if (erreur <= marge_distance) {
      minuteur_attendre(200);
      asserv_maintenir_position();
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_maintenir_position();
      return ERROR_TIMEOUT;
    }
  }
}

/**
 * Fait une rotation de A radians par rapport à l'angle actuel.
 * Retour bloquant et s'arrête dans ces cas:
 * - OK
 * - ERROR_TIMEOUT
 * - ERROR_FIN_MATCH
 */

uint8_t asserv_rotation_relative(float rotation_rad, uint16_t timeout) {
  elapsedMillis timer;
  asserv_consigne_polaire_delta(0, rotation_rad);
  int32_t marge_erreur_rotation = radian_vers_orientation(0.3);

  while (1) {
    synchronisation();
    int32_t erreur = abs(robot.rotation - robot.consigneRotation);

    if (erreur <= marge_erreur_rotation) {
      minuteur_attendre(200); // stabilisation d'inertie
      asserv_maintenir_position();
      return OK;
    }

    if (timeout && timeout < timer) {
      asserv_maintenir_position();
      return ERROR_TIMEOUT;
    }
  }
}

/**
 * Maintient de la position, malgré l'inertie ou les forces extérieures,
 * le robot restera à cette position coûte que coûte à partir de maintenant.
 */

void asserv_maintenir_position() {
  robot.activeDistance = 1;
  robot.activeRotation = 1;
  robot.consigneDistance = robot.distance;
  robot.consigneRotation = robot.rotation;
}

// Vitesse en tick par delta t
void asserv_vitesse_distance(uint32_t v) { // v entre 0 et 100
  quadramp_set_1st_order_vars(&robot.ramp_distance, v, v);
}

// Vitesse en tick par delta t
void asserv_vitesse_rotation(uint32_t v) { // v entre 0 et 100
  quadramp_set_1st_order_vars(&robot.ramp_rotation, v, v);
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

static int32_t distance_precedente = 0; // tick
static float rotation_precedente = 0; // tick
static float rotation_initiale = 0; // rad

void asserv_set_position(int32_t x, int32_t y, float a) { // mm en entrée
  asserv_maj_position(); // N-1

  robot.x = mm2tick(symetrie_x(x));
  robot.y = mm2tick(y);
  rotation_initiale = symetrie_a_axiale_y(a) - robot.a; // On fait un tare en donnant l'angle

  asserv_maj_position(); // N, delta est à 0 car on a pas bougé
}

void asserv_maj_position() {
  robot.distance = (robot.codeurGauche + robot.codeurDroite) / 2;
  robot.rotation = radian_vers_orientation(rotation_initiale) + robot.codeurGauche - robot.codeurDroite;

  robot.delta_d = robot.distance - distance_precedente;
  robot.delta_r = robot.rotation - rotation_precedente;

  int32_t rotation_moyenne = (robot.rotation + rotation_precedente) / 2;
  float rotation_moyenne_radian = orientation_vers_radian(rotation_moyenne);

  float dx = robot.delta_d * cos(rotation_moyenne_radian);
  float dy = robot.delta_d * sin(rotation_moyenne_radian);

  robot.x += dx;
  robot.y += dy;
  robot.a = normalize_radian(orientation_vers_radian(robot.rotation));

  robot.xMm = tick2mm(robot.x);
  robot.yMm = tick2mm(robot.y);

  // Sauve pour la prochaine fois
  distance_precedente = robot.distance;
  rotation_precedente = robot.rotation;
}

/*******************************************************************************
  Boucle temps réel
 *******************************************************************************/

static int32_t erreur_distance_precedente = 0;
static int32_t erreur_rotation_precedente = 0;


// Contrôle les moteurs en fonction des consignes et du mode actuel

void asserv_loop() {
  // On freine, le robot oppose une résistance au mouvement
  if (robot.asserv_mode == ASSERV_MODE_STOP) {
    moteur_gauche(0);
    moteur_droite(0);
    return;
  }

  // On applique une tension continue
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
