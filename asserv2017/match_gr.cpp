#include "asserv2017.h"

Servo servo_parasol;


/**************************
**                       **
**    HYPER IMPORTANT    **
**                       */
//bool rouleaux_actifs = true;
/**                      **
**                       **
**                       **
**                       **
**************************/

// Le côté de la grosse dune
void grosse_dune_1() {
  Serial.println("Attaque du côté de la grosse dune");

  // Se positionne
  aller_xy(1150, 300, 100, 1, 5000, 5);

  gr_rouleaux_avaler();

  // Avale la dune
  aller_xy(1300, 180, 30, 1, 3000, 5);
  delay(800);

  // S'éloigne de la dune
  aller_xy(1200, 350, 50, 0, 5000, 5);

  liberer_cubes();
}


// Le milieu de la grosse dune
void grosse_dune_2() {
  Serial.println("Attaque de la grosse dune par le milieu");

  // Se positionne
  aller_xy(1250, 300, 50, 0, 5000, 5);

  gr_rouleaux_avaler();
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
  Serial.println("Attaque de la petite dune");
  // Positionnement
  aller_xy(1100, 400, 50, 0, 2000, 5);

  gr_rouleaux_avaler();
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

  Serial.println("Libération des cubes");

  // On se positionne
  aller_xy(1200, 500, 50, 0, 3000, 8);

  // On regarde bien en avant
  asserv_goa_point(1200, 2000, 2000);

  // On se rapproche
  aller_xy(1200, 610, 50, 1, 5000, 2);


  // On libère 3 secondes
  gr_rouleaux_liberer();
  t0 = millis();
  while(!temps_ecoule(t0, 3000) && !match_termine());

  // Un petit à-coup
  gr_rouleaux_stop();
  t0 = millis();
  while(!temps_ecoule(t0, 200) && !match_termine());

  gr_rouleaux_avaler();
  t0 = millis();
  while(!temps_ecoule(t0, 500) && !match_termine());

  // Libération 2.5s
  gr_rouleaux_liberer();
  t0 = millis();
  while(!temps_ecoule(t0, 2500) && !match_termine());

  // Un petit à-coup
  gr_rouleaux_stop();
  t0 = millis();
  while(!temps_ecoule(t0, 200) && !match_termine());

  gr_rouleaux_avaler();
  t0 = millis();
  while(!temps_ecoule(t0, 500) && !match_termine());

  // Libération 2s
  gr_rouleaux_liberer();
  t0 = millis();
  while(!temps_ecoule(t0, 2000) && !match_termine());

  gr_rouleaux_stop();
}

void debug_gr() {
  ecran_console_log("2 sec\n\n");

  localisation_set({x: 1500, y: 750, a: 0});
  delay(2000);

  ecran_console_log("DebutDuMatch\n");

  tout_droit(-5000, 5000);
  tone_play_end();
  tout_droit(2000, 2000);
  tone_play_end();
  tout_droit(-5000, 5000);


  tone_play_end();
}

void match_gr() {
  ecran_console_reset();
  ecran_console_log("Match GR\n\n");

  if(robot.symetrie) {
    ecran_console_log("Couleur : VERT\n\n");
  }
  else {
    ecran_console_log("Couleur : VIOLET\n\n");
  }

  if(!robot.rouleaux_actifs) {
    ecran_console_log("\n!! ROULEAUX\n");
    ecran_console_log("!! DESACTIVES\n\n");
  }
  else {
    ecran_console_log("\nRouleaux Actifs\n\n");
  }

  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  wait_start_button_down();

  ecran_console_log("Pret\n");
  localisation_set({x: 150, y: 750, a: 0});
  asserv_raz_consignes();

  wait_start_button_up();
  ecran_console_log("DebutDuMatch\n");
  robot.match_debut = millis();

  uint8_t error;

  // error = asserv_goxy(300, 750, 5000, 1);
  // if (error) goto fin_match;

  // asserv_goa_point(300, 0);
  // error = asserv_goxy(300, 300, 10000, 1);
  // if (error) goto fin_match;

  // robot.sans_symetrie = 1;
  // asserv_goa(MATH_PI2);
  // robot.sans_symetrie = 0;

  // asserv_goxy(300, 0, 2000);

  delay(9000);
  //delay(40000);


  Serial.println("Sort de la zone de départ");
  error = aller_xy(350, 750, 100, 1, 5000, 5);

  Serial.println("Direction : les cabines");
  error = aller_xy(450, 300, 100, 1, 5000, 5);

  asserv_goa_point(450, 2000, 1000);

  Serial.println("Fermeture des portes");
  error = aller_xy(450, 0, 120, 0, 1000, 3);

  error = aller_xy(450, 400, 50, 1, 3000, 3);
  Serial.println("Et de deux");
  error = aller_xy(600, 0, 120, 0, 1000, 3);





  Serial.println("Direction : les dunes");
  aller_xy(450, 480, 100, 1, 5000, 8);
  aller_xy(800, 480, 100, 1, 5000, 8);

  /**********
  Grosse dune
  ***********/
  grosse_dune_1();

  if(match_termine()) goto fin_match;

  grosse_dune_2();

  if(match_termine()) goto fin_match;

  /**********
  Petite dune
  ***********/
  petite_dune1();

  if(match_termine()) goto fin_match;

  /*************
  Re-Grosse dune
  **************/
  if(millis() - robot.match_debut < 70000) {
    do {
      grosse_dune_2();
      if(millis() - robot.match_debut < 75000)
        petite_dune1();
    } while(millis() - robot.match_debut < 70000);
  }
  else {
    while(millis() - robot.match_debut < 70000) {
      petite_dune1();
    }
  }


  /*************************
  Attente de la fin du match
  **************************/
  /*while (millis() - robot.match_debut < 75000);
  gr_rouleaux_stop();*/

fin_match:
  while (!match_termine());
  funny_action();
  tone_play_end();
}

void funny_action() {
  gr_rouleaux_stop();
  Serial.println("Fin de match, funny action !");
  gr_parasol_init();
  gr_parasol_ouvrir();
  delay(800);
  gr_parasol_fermer();
  delay(800);
  gr_parasol_ouvrir();
  delay(900);
  gr_parasol_fermer();
  delay(900);
  gr_parasol_ouvrir();
}

void gr_parasol_init() {
  servo_parasol.attach(4);
  pinMode(33, OUTPUT);
}

void gr_parasol_fermer() {
  servo_parasol.write(90);
  digitalWrite(33, HIGH);
}

void gr_parasol_ouvrir() {
  servo_parasol.write(0);
  digitalWrite(33, LOW);
}


void gr_rouleaux_liberer() {
  Serial.println("Rouleaux : libérer");
  pinMode(29, OUTPUT);
  pinMode(30, OUTPUT);
  pinMode(31, OUTPUT);
  pinMode(32, OUTPUT);
  if(robot.rouleaux_actifs) {
    digitalWrite(29, HIGH);
    digitalWrite(30, LOW);
    digitalWrite(31, HIGH);
    digitalWrite(32, LOW);
  }
}
void gr_rouleaux_avaler() {
  Serial.println("Rouleaux : Avaler");
  pinMode(29, OUTPUT);
  pinMode(30, OUTPUT);
  pinMode(31, OUTPUT);
  pinMode(32, OUTPUT);
  if(robot.rouleaux_actifs) {
    digitalWrite(29, LOW);
    digitalWrite(30, HIGH);
    digitalWrite(31, LOW);
    digitalWrite(32, HIGH);
  }
}
void gr_rouleaux_stop() {
  Serial.println("Rouleaux : Stop");
  pinMode(29, OUTPUT);
  pinMode(30, OUTPUT);
  pinMode(31, OUTPUT);
  pinMode(32, OUTPUT);
  if(robot.rouleaux_actifs) {
    digitalWrite(29, HIGH);
    digitalWrite(30, HIGH);
    digitalWrite(31, HIGH);
    digitalWrite(32, HIGH);
  }
}
