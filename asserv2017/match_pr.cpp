#include "asserv2017.h"

Servo servo_canne;
Servo servo_volets;


void debug_pr() {
  ecran_console_log("2 sec\n\n");

  /*localisation_set({x: 77, y: 995, a: 0});
  asserv_raz_consignes();
  servo_canne.attach(5);
  servo_canne.write(0); // rentré
  servo_volets.attach(4);
  volets_fermer();
*/
  localisation_set({x: 1500, y: 1000, a: 0});

  delay(2000);


  ecran_console_log("DebutDuMatch\n");
  robot.match_debut = millis();


  aller_xy(3000, 1000, 100, 1, 3000, 50);
  /*tache_coquillages_A(0);
  tone_play_end();
  tache_coquillages_B(0);
  tone_play_end();
  robot.match_debut = millis();
  tache_coquillages_C(0);
  tone_play_end();
  robot.match_debut = millis();
  tache_coquillages_Secours(0);*/
  tone_play_end();
}

void match_pr() {
  int start;

  uint8_t error;
  uint8_t avancement_tache_poissons = 0;
  uint8_t avancement_tache_cabine = 0;
  uint8_t avancement_tache_tour = 0;
  uint8_t avancement_tache_coquillages_A = 0;
  uint8_t avancement_tache_coquillages_B = 0;
  uint8_t avancement_tache_coquillages_C = 0;
  uint8_t avancement_tache_coquillages_Secours = 0;
  uint8_t n = 0;

  ecran_console_reset();
  ecran_console_log("Match PR\n\n");

  if(robot.symetrie) {
    ecran_console_log("Couleur : VERT\n");
  }
  else {
    ecran_console_log("Couleur : VIOLET\n");
  }
  ecran_console_log("Coquillages : ");
  switch(robot.coquillage) {  // Ok, j'avoue, j'ai du mal avec les conversions de typage...
    case 0: ecran_console_log("0"); break;
    case 1: ecran_console_log("1"); break;
    case 2: ecran_console_log("2"); break;
    case 3: ecran_console_log("3"); break;
    case 4: ecran_console_log("4"); break;
  }
  ecran_console_log("\n\n");

  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  wait_start_button_down();
  ecran_console_log("Pret\n");

  localisation_set({x: 77, y: 995, a: 0});
  asserv_raz_consignes();
  servo_canne.attach(5);
  //servo_canne.write(0); // rentré
  canne_monter();
  servo_volets.attach(4);
  volets_fermer();

  wait_start_button_up();
  ecran_console_log("DebutDuMatch\n");
  robot.match_debut = millis();

  com_log_println("_______ Stratégie de base");

  

    com_log_println("==== On boucle ? ====");

  com_log_println("Pas le temps");

  com_log_println("_______ Terminé");

  tone_play_end();
}

void volets_fermer() {
  if(!match_termine()) {
    servo_volets.write(150);
    delay(600);
  }
}
void volets_ouvrir() {
  if(!match_termine()) {
    servo_canne.write(0); // Les 2 ne peuvent pas être ouverts en même temps...
                          // Pas d'utilisation de canne_monter() pour éviter de cumuler les delay()
    servo_volets.write(10);
    delay(600);
  }
}

void canne_baisser() {
  servo_canne.write(100);
  delay(400);
}

void canne_monter() {
  servo_canne.write(5);
  delay(400);
}