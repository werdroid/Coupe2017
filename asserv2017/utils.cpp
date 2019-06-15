#include "asserv2017.h"

// ####################################
// Utils
// ####################################

int32_t mm2tick(int32_t distance) {
  return distance * robot.ASSERV_COEFF_TICKS_PAR_MM;
}

int32_t tick2mm(int32_t distance) {
  return distance / robot.ASSERV_COEFF_TICKS_PAR_MM;
}

int32_t radian_vers_orientation(float radian) {
  return radian * robot.ASSERV_COEFF_TICKS_PAR_RADIAN;
}

float orientation_vers_radian(int32_t orientation) {
  return orientation / robot.ASSERV_COEFF_TICKS_PAR_RADIAN;
}

int32_t rad2deg(float radian) {
  return radian * 180 / MATH_PI;
}

float deg2rad(int32_t degre) {
  return degre * MATH_PI / 180;
}

int32_t symetrie_x(int32_t x) {
  if (robot.sans_symetrie == 0 && robot.symetrie) return TABLE_LARGEUR_X - x;
  return x;
}

int32_t get_robot_xMm_sans_symetrie() {
  if(robot.symetrie)
    return TABLE_LARGEUR_X - robot.xMm;
  else
    return robot.xMm;
}

float symetrie_a_centrale(float a) {
  if (robot.sans_symetrie == 0 && robot.symetrie) return normalize_radian(a + MATH_PI);
  return a;
}

float symetrie_a_axiale_y(float a) {
  if (robot.sans_symetrie == 0 && robot.symetrie) return normalize_radian(-a + MATH_PI);
  return a;
}

int32_t low_pass(int32_t valeur_precedente, int32_t valeur, float coeff) {
  return valeur_precedente + coeff * (valeur - valeur_precedente);
}

// Angle relatif entre le robot aux coordonnées (x,y,a) et le point (xx,yy)
// Relatif veut dire qu'on se met à la place du robot et non de la table
// ex: 0,0,0 et 1,0 => 0 car le point est devant
// ex: 0,0,0 et 0,1 => pi/2 car le point est sur le côté droit
// ex: 1,1,pi et 0,0 => pi/4 car le point est légèrement sur la droite devant
// faire un schéma pour comprendre
float angle_relatif_robot_point(int32_t x, int32_t y , float a, int32_t xx, int32_t yy) {
  return normalize_radian(atan2(yy - y, xx - x) - a);
}

/* Prend a en radians
 * Retourne a en radians sous [-pi; pi]
 */

float normalize_radian(float a) {
  while (a < -MATH_PI) a += MATH_2PI;
  while (a >  MATH_PI) a -= MATH_2PI;

  return a;
}
