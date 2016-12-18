#include "asserv2017.h"

// ####################################
// Utils
// ####################################

int32_t mm2tick(int32_t distance) {
  return distance * config.ASSERV_COEFF_TICKS_PAR_MM;
}

int32_t tick2mm(int32_t distance) {
  return distance / config.ASSERV_COEFF_TICKS_PAR_MM;
}

int32_t radian_vers_orientation(float radian) {
  return radian * config.ASSERV_COEFF_TICKS_PAR_RADIAN;
}

float orientation_vers_radian(int32_t orientation) {
  return orientation / config.ASSERV_COEFF_TICKS_PAR_RADIAN;
}

int32_t radian_en_degre(float radian) {
  return radian * 180 / MATH_PI;
}

float degre_en_radian(int32_t degre) {
  return degre * MATH_PI / 180;
}

int32_t symetrie_x(int32_t x) {
  if (robot.sans_symetrie == 0 && robot.symetrie) return TABLE_LARGEUR_X - x;
  return x;
}

float symetrie_a(float a) {
  if (robot.sans_symetrie == 0 && robot.symetrie) return normalize_radian(a + MATH_PI);
  return a;
}

/* Point en unité mm
 * Retourne un point en unité robot avec ou sans symérie
 */

Point point(const Point point_original) {
  Point p;

  if (robot.symetrie) {
    p.x = mm2tick(TABLE_LARGEUR_X - point_original.x);
    p.y = mm2tick(point_original.y);
  } else {
    p.x = mm2tick(point_original.x);
    p.y = mm2tick(point_original.y);
  }
  // Math.PI - this.a pour une position

  return p;
}

int32_t low_pass(int32_t valeur_precedente, int32_t valeur, float coeff) {
  return valeur_precedente + coeff * (valeur - valeur_precedente);
}

/* Prend a en radians
 * Retourne a en radians sous ]-pi; pi[
 */

float normalize_radian(float a) {
  while (a < -MATH_PI) a += MATH_2PI;
  while (a >  MATH_PI) a -= MATH_2PI;

  return a;
}
