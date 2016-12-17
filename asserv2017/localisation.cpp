#include "asserv2017.h"

static int32_t distance_precedente = 0; // tick
static float rotation_precedente = 0; // tick
static float rotation_initiale = 0; // rad

void localisation_set(Position position) { // mm en entrée
  localisation_loop(); // N-1

  robot.x = mm_vers_ticks(symmetrie_x(position.x));
  robot.y = mm_vers_ticks(position.y);
  rotation_initiale = symmetrie_a(position.a) - robot.a; // On fait un tare en donnant l'angle

  localisation_loop(); // N, delta est à 0 car on a pas bougé
}

void localisation_loop() {
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

  robot.xMm = ticks_vers_mm(robot.x);
  robot.yMm = ticks_vers_mm(robot.y);

  // Sauve pour la prochaine fois
  distance_precedente = robot.distance;
  rotation_precedente = robot.rotation;
}


bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
  if(x1 > x2 || y1 > y2) {
    tone_play_error();
    Serial.println("############### Erreur : paramètres de robot_dans_zone mal définis.");
  }

  if(!robot.symmetrie)
    return (robot.xMm >= x1 && robot.xMm <= x2) && (robot.yMm >= y1 && robot.yMm <= y2);
  else
    return (robot.xMm <= symmetrie_x(x1) && robot.xMm >= symmetrie_x(x2) && (robot.yMm >= y1 && robot.yMm <= y2));

  // Ne peut-on pas se contenter d'un
  // return (symmetrie_x(robot.xMm) >= x1 && symmetrie_x(robot.xMm) <= x2) && (robot.yMm >= y1 && robot.yMm <= y2));
  // ? (trop tard pour tester maintenant)

}