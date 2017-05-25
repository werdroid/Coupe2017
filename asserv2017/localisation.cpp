#include "asserv2017.h"

static int32_t distance_precedente = 0; // tick
static float rotation_precedente = 0; // tick
static float rotation_initiale = 0; // rad

void localisation_set(Position position) { // mm en entrée
  localisation_loop(); // N-1

  robot.x = mm2tick(symetrie_x(position.x));
  robot.y = mm2tick(position.y);
  rotation_initiale = symetrie_a_axiale_y(position.a) - robot.a; // On fait un tare en donnant l'angle

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