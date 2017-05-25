#include "asserv2017.h"

// Programme de GR

// Initialisation des variables de configuration
// Initialisation des actionneurs spécifiques

void gr_init() {
  com_log_println("gr_init()");
  robot.IS_PR = false;

  bool gr2016 = false; // 2017 ou 2016 ? :)

  if(gr2016) {
    robot.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 3 mai gr
    robot.ASSERV_COEFF_TICKS_PAR_RADIAN = 3404.0f; // 4 mai gr
    robot.ASSERV_DISTANCE_KP = 0.1f;
    robot.ASSERV_DISTANCE_KD = 0.8f;
    robot.ASSERV_ROTATION_KP = 0.1f;
    robot.ASSERV_ROTATION_KD = 1.8f;

    // Actionneurs à init
    quadramp_init(&robot.ramp_distance);
    quadramp_set_1st_order_vars(&robot.ramp_distance, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_distance, 1, 10);

    quadramp_init(&robot.ramp_rotation);
    quadramp_set_1st_order_vars(&robot.ramp_rotation, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_rotation, 1, 1);
  }
  else {

    // Constantes à init
    robot.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 1mm -> 12.25 pas
    robot.ASSERV_COEFF_TICKS_PAR_RADIAN = 2207.0f; // 1rad -> 2207pas
    robot.ASSERV_DISTANCE_KP = 0.15f; // 30 avril pr
    robot.ASSERV_DISTANCE_KD = 1.5f; // 30 avril pr
    robot.ASSERV_ROTATION_KP = 0.09f; // 30 avril pr
    robot.ASSERV_ROTATION_KD = 1.1f; // 30 avril pr

    // Actionneurs à init
    quadramp_init(&robot.ramp_distance);
    quadramp_set_1st_order_vars(&robot.ramp_distance, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_distance, 1, 1);

    quadramp_init(&robot.ramp_rotation);
    quadramp_set_1st_order_vars(&robot.ramp_rotation, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_rotation, 1, 1);
  }


  gr_rouleaux_stop();
}

// Lancement du programme du robot (menu, match, actions)

void gr_main() {
  com_log_println("gr_main()");
  gr_init();
  //match_gr();
}




