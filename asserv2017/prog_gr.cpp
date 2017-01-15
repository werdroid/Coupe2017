#include "asserv2017.h"

// Programme de GR

// Initialisation des variables de configuration
// Initialisation des actionneurs spécifiques

void gr_init() {
  com_log_println("gr_init()");

  robot.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 3 mai gr
  robot.ASSERV_COEFF_TICKS_PAR_RADIAN = 3404.0f; // 4 mai gr
  robot.ASSERV_DISTANCE_KP = 0.1f;
  robot.ASSERV_DISTANCE_KD = 0.8f;
  robot.ASSERV_ROTATION_KP = 0.1f;
  robot.ASSERV_ROTATION_KD = 1.8f;
}

// Lancement du programme du robot (menu, match, actions)

void gr_main() {
  com_log_println("gr_main()");
}




