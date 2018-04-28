#include "asserv2017.h"


/************************ TEMPORAIRE ****************************
Prototypes des fonctions 2017 gardés le temps de faire le ménage.
************  A SUPPRIMER DES QUE POSSIBLE  ********************/
void grosse_dune_1();
void grosse_dune_2();
void grosse_dune_suite();
void petite_dune1();
void liberer_cubes();
/*******************************************************************/


// Initialisation des variables de configuration
// Initialisation des actionneurs spécifiques

void pr_init() {
  robot.IS_PR = true; // première instruction dès que possible avant menu, match, etc
  com_printfln("pr_init()");

  // Valeurs PR2016 = Alien2017 = Alien2018
  robot.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 1mm -> 12.25 pas
  robot.ASSERV_COEFF_TICKS_PAR_RADIAN = 2207.0f; // 1rad -> 2207pas
  robot.ASSERV_DISTANCE_KP = 0.15f; // 30 avril pr
  robot.ASSERV_DISTANCE_KD = 1.5f; // 30 avril pr
  robot.ASSERV_ROTATION_KP = 0.09f; // 30 avril pr
  robot.ASSERV_ROTATION_KD = 1.1f; // 30 avril pr
}

void match_pr_arret() {
  com_printfln("On stop les moteurs");
  asserv_consigne_stop();

  com_printfln("Funny action !");
  // ...
}

// Le côté de la grosse dune
void grosse_dune_1() {
  com_printfln("Attaque du côté de la grosse dune");

  // Se positionne
  aller_xy(1150, 300, 100, 1, 5000, 5);

  // Avale la dune
  aller_xy(1300, 180, 30, 1, 3000, 5);
  delay(800);

  // S'éloigne de la dune
  aller_xy(1200, 350, 50, 0, 5000, 5);

  liberer_cubes();
}


// Le milieu de la grosse dune
void grosse_dune_2() {
  com_printfln("Attaque de la grosse dune par le milieu");

  // Se positionne
  aller_xy(1250, 300, 50, 0, 5000, 5);

  // Ré-Avale la dune
  aller_xy(1450, 150, 30, 1, 3000, 5);
  delay(900);

  // S'éloigne légèrement de la dune
  aller_xy(1200, 480, 50, 0, 5000, 5);

  liberer_cubes();
}

void grosse_dune_suite() {
  // A faire ?
}

void petite_dune1() {
  com_printfln("Attaque de la petite dune");
  // Positionnement
  aller_xy(1100, 400, 50, 0, 2000, 5);

  // Avale la petite dune
  aller_xy(950, 150, 50, 1, 4000, 5);
  delay(800);

  aller_xy(1100, 300, 50, 1, 4000, 5);
  aller_xy(950, 150, 50, 1, 4000, 5);


  // S'éloigne de la dune
  aller_xy(1200, 450, 50, 0, 3000, 5);

  liberer_cubes();
}

void liberer_cubes() {
  uint32_t t0;

  // Penser à s'éloigner de la dune avant !

  com_printfln("Libération des cubes");

  // On se positionne
  aller_xy(1200, 500, 50, 0, 3000, 8);

  // On regarde bien en avant
  asserv_rotation_vers_point(1200, 2000, 2000);

  // On se rapproche
  aller_xy(1200, 610, 50, 1, 5000, 2);
}

void debug_pr() {
  ecran_console_log("2 sec\n\n");

  asserv_set_position(1500, 750, 0);
  delay(2000);

  ecran_console_log("#DebutDuMatch\n");

  asserv_distance(-5000, 5000);
  tone_play_end();
  asserv_distance(2000, 2000);
  tone_play_end();
  asserv_distance(-5000, 5000);


  tone_play_end();
}

void match_pr() {
  ecran_console_reset();
  ecran_console_log("Match PR\n\n");

  if(robot.symetrie) {
    ecran_console_log("Couleur : VERT\n\n");
  }
  else {
    ecran_console_log("Couleur : VIOLET\n\n");
  }


  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  bouton_start_down();

  ecran_console_log("Pret\n");
  asserv_set_position(150, 750, 0);
  asserv_maintenir_position();

  bouton_wait_start_up();
  ecran_console_log("#DebutDuMatch\n");
  robot.match_debut = millis();

  uint8_t error;

  delay(1000);

  com_printfln("Sort de la zone de départ");
  error = aller_xy(350, 750, 100, 1, 5000, 5);

  com_printfln("Direction : les cabines");
  error = aller_xy(450, 300, 100, 1, 5000, 5);

  asserv_rotation_vers_point(450, 2000, 1000);

  com_printfln("Fermeture des portes");
  error = aller_xy(450, 0, 120, 0, 1000, 3);

  error = aller_xy(450, 400, 50, 1, 3000, 3);
  com_printfln("Et de deux");
  error = aller_xy(600, 0, 120, 0, 1000, 3);





  com_printfln("Direction : les dunes");
  aller_xy(450, 480, 100, 1, 5000, 8);
  aller_xy(800, 480, 100, 1, 5000, 8);

  /**********
  Grosse dune
  ***********/

  grosse_dune_1();
  grosse_dune_2();

  /**********
  Petite dune
  ***********/

  petite_dune1();

  /*************
  Re-Grosse dune
  **************/

  grosse_dune_2();
  petite_dune1();
  petite_dune1();
}


void gr_coucou() {
  // TBC 2018
  /*
  for(int i = 0; i < 500; i++) {
    delay(600);
    servo_bras_gauche.write(45);
    servo_bras_droit.write(135);
    delay(600);
    servo_bras_gauche.write(80);
    servo_bras_droit.write(165);
  }*/
}
