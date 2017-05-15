#include "asserv2017.h"

static int32_t distance_precedente = 0; // tick
static float rotation_precedente = 0; // tick
static float rotation_initiale = 0; // rad

void localisation_set(Position position) { // mm en entrée
  localisation_loop(); // N-1

  robot.x = mm2tick(symetrie_x(position.x));
  robot.y = mm2tick(position.y);
  rotation_initiale = symetrie_a(position.a) - robot.a; // On fait un tare en donnant l'angle

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

  robot.xMm = tick2mm(robot.x);
  robot.yMm = tick2mm(robot.y);

  // Sauve pour la prochaine fois
  distance_precedente = robot.distance;
  rotation_precedente = robot.rotation;
}


bool robot_dans_zone(uint16_t idZone) {
  // En mode bit mask, donc idZone peut tester plusieurs zones d'un coup
  
  // Ordre du + probable au - probable (grossièrement)
  
  if((idZone & ZONE_F) == ZONE_F)
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_E) == ZONE_E)
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_B) == ZONE_B)
    return robot_dans_zone(0, 0, 500, 500);

  if((idZone & ZONE_H) == ZONE_H)  
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_A) == ZONE_A)
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_J) == ZONE_J)
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_G) == ZONE_G)
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_I) == ZONE_I)
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_C) == ZONE_C)
    return robot_dans_zone(0, 0, 500, 500);
  
  if((idZone & ZONE_D) == ZONE_D)
    return robot_dans_zone(0, 0, 500, 500);

  
  com_log_print("########## ERREUR: idZone '");
  com_log_print(idZone);
  com_log_println("' incorrect dans getZone");
  return false;
}

bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
  if(x1 > x2 || y1 > y2) {
    tone_play_alert();
    com_log_println("############### Erreur : paramètres de robot_dans_zone mal définis.");
  }

  if(!robot.symetrie)
    return (robot.xMm >= x1 && robot.xMm <= x2) && (robot.yMm >= y1 && robot.yMm <= y2);
  else
    return (robot.xMm <= symetrie_x(x1) && robot.xMm >= symetrie_x(x2) && (robot.yMm >= y1 && robot.yMm <= y2));

  // Ne peut-on pas se contenter d'un
  // return (symetrie_x(robot.xMm) >= x1 && symetrie_x(robot.xMm) <= x2) && (robot.yMm >= y1 && robot.yMm <= y2));
  // ? (trop tard pour tester maintenant)

}