#include "asserv2017.h"

Servo servo_canne;
Servo servo_volets;

/**
Les actions sont décrites sous forme de tâches.
L'avancement d'une tâche est indiqué par un nombre entre 0 et 100.
**/

uint8_t aller_vers_couloir_pr(uint8_t zone) {
  uint8_t error = OK;

  Serial.println("Positionnement dans le couloir principal...");
  switch(zone) {
    case ZONE_PECHE:
      // aller devant le bac à gauche
      error = aller_xy(500, 1700, 100, 1, 5000, 3);
      break;
    case ZONE_CONSTRUCTION:
      // aller en face de la zone de départ
      error = aller_xy(500, 1100, 100, 1, 5000, 3);
      break;
    case ZONE_DUNE:
      // Faire un point de passage pour éviter le tasseau
      error = aller_xy(950, 500, 100, 1, 5000, 3);
      // Puis aller au même endroit que pour les cabines
      error = aller_xy(500, 500, 100, 1, 5000, 3);
      break;
    case ZONE_CABINES:
      // aller vers les cabines
      error = aller_xy(500, 550, 100, 1, 5000, 3);
      break;
    default:
      Serial.println("########### Erreur : aller_vers_couloir_pr, zone incorrecte");
  }

  return error;
}

uint8_t tache_tour(uint8_t depart) {
  uint8_t error;

  Serial.print("=== Début de la tâche Tour (");
  Serial.print(depart);
  Serial.println(")");

  switch(depart) {
    case 0:
      Serial.println("(Tour 0) Positionnement préliminaire");
      switch(localiser_zone()) {
        case ZONE_DUNE:
          error = aller_vers_couloir_pr(ZONE_DUNE);
          break;
        case ZONE_CABINES:
          error = aller_vers_couloir_pr(ZONE_CABINES);
          break;
        case ZONE_PECHE:
          error = aller_vers_couloir_pr(ZONE_PECHE);
          break;
        case ZONE_CONSTRUCTION:
          if(robot_dans_zone(500, 750, 1500, 1500)) {
            error = aller_xy(800, 1300, 100, 1, 5000, 3);
          }
          error = aller_vers_couloir_pr(ZONE_CONSTRUCTION);
          break;
        default:
          error = aller_vers_couloir_pr(ZONE_CONSTRUCTION);
      }
      if(error) return retour(0);

    case 10:
      Serial.println("(Tour 10)");
      // devant tour
      error = aller_xy(500, 880, 100, 1, 7000, 3);
      if (error) return retour(0);

      // tour poussée dans la zone
      error = asserv_goa_point(1250, 1050, 2000);
      //volets_ouvrir();
      error = aller_xy(1250, 1050, 80, 1, 5000, 3);
      //volets_fermer();
      if (error) return retour(0);

    case 95:
      Serial.println("(Tour 95)");
      // dégagement de la tour
      error = aller_xy(800, 1000, 100, 0, 5000, 3);
      if (error) return retour(95);


      break;

    case 100:
      Serial.println("Tâche tour déjà à 100");
      return retour(100);
      break;
    default:
      Serial.print("##### Erreur : départ indéfini");
      return retour(0);
  }

  Serial.println("=== Tâche Tour terminée");
  return retour(100);
}

uint8_t tache_cabine_pr(uint8_t depart) {
  uint8_t error;

  Serial.print("=== Début de la tâche cabine (");
  Serial.print(depart);
  Serial.println(")");


  switch(depart) {
    case 0:
      Serial.println("-------- On va devant la cabine 2");
      asserv_goa_point(650, 300, 4000);
      error = aller_xy(650, 300, 100, 1, 5000, 3);
      if(error) return retour(0);

      Serial.println("-------- On ferme la cabine 2");
      Serial.println("goa point");
      asserv_goa_point(650, 0);
      Serial.println("goxy");
      // definir_vitesse_avance(50);
      error = aller_xy(650, 0, 100, 1, 1000, 5);
      // definir_vitesse_avance(100);

      Serial.println("-------- On recule de la cabine 2");
      aller_xy(650, 300, 100, 0, 2000, 3);


    case 50:
      Serial.println("-------- On va devant la cabine 1");
      asserv_goa_point(350, 300);
      error = aller_xy(350, 300, 100, 1, 0, 5);
      if(error) return retour(50);

      Serial.println("-------- On ferme la cabine 1");
      asserv_goa_point(350, 0);
      error = aller_xy(350, 0, 50, 1, 1000, 5);

      Serial.println("-------- On recule de la cabine 1");
      aller_xy(350, 300, 100, 0, 0, 3);



      Serial.println("-------- On se recale en X apres cabine 1");
      asserv_goa_point(0, 300);
      aller_xy(0, 300, 50, 0, 1000, 2);
      robot.x = mm2tick(symetrie_x(80));
      aller_xy(470, 300, 100, 0, 0, 2);

      break;

    case 100:
      Serial.println("Tâche cabine déjà à 100");
      return retour(100);
      break;
    default:
      Serial.print("##### Erreur : depart indéfini");
      return retour(0);
  }

  Serial.println("=== Tâche cabine terminée");
  return 100;
}

uint8_t tache_poissons(uint8_t depart, bool virer_patrick) {
  uint8_t error = OK;

  Serial.print("=== Début de la tâche Poissons (");
  Serial.print(depart);
  Serial.println(")");

  virer_patrick = virer_patrick && (robot.coquillage == 4);


  switch(depart) {
    case 0:
      Serial.println("(Poissons 0) Positionnement préliminaire");
      switch(localiser_zone()) {
        case ZONE_CABINES:
        case ZONE_CONSTRUCTION:
        case ZONE_DUNE:
          error = aller_vers_couloir_pr(localiser_zone());
          break;
        case ZONE_PECHE:
          //Rien : inutile de passer par aller_vers_couloir_pr...
          break;
        default:
          error = aller_vers_couloir_pr(ZONE_PECHE);
      }
      if(error) return retour(0);

    case 5:
      Serial.println("(Poissons 5) -- Recalage en Y");
      asserv_goa_point(470, 2000);
      error = aller_xy(470, 1840, 100, 1, 8000, 2);
      if(error == OK) { // Ici : logique inversée : s'il n'y a PAS d'erreur, on se recale
        error = aller_xy(470, 2000, 50, 1, 600, 2);
        if(error == ERROR_TIMEOUT) {  // Si c'est OK ou qu'il a détecté un obstacle, ne pas se recaler !
          robot.y = mm2tick(1923);
          Serial.println("...Ok");
        }
        aller_xy(470, 1840, 100, 0, 0, 2);
      }
      else {
        Serial.println("...Echec");
      }


    case 10:
      Serial.println("(Poissons 10)");
      if(virer_patrick) {
        Serial.println("-------- Aller devant le bac à gauche");

        definir_vitesse_avance(100);
        error = aller_xy(530, 1850, 100, 0, 5000, 3);
        if(error) return retour(0);


        Serial.println("-------- Virer Patrick");
        error = aller_xy(900, 1600, 100, 0, 5000, 2);
        //if(error) return error;
      }


    case 20:
      Serial.println("(Poissons 20)");
      Serial.println("-------- Aller devant le bac à gauche");
      error = aller_xy(600, 1850, 100, 0, 5000, 2);  // Coupe = 530
      if(error) return retour(20);


      Serial.println("-------- Préparation de la pêche");
      robot.sans_symetrie = 1;
      asserv_goa(0); // alignement avant de déployer la canne
      robot.sans_symetrie = 0;

      canne_baisser();

      Serial.println("-------- Aller devant le bac à droite");
      definir_vitesse_rotation(25);
      error = aller_xy(820, 1865, 10, 0, 10000, 3);
      if(error) {
        canne_monter();
        definir_vitesse_rotation(100);
        return retour(20);
      }

      Serial.println("-------- Reculer au point de contournement");
      error = aller_xy(650, 1850, 10, 0, 5000, 4); // 650 coupe
      if(error) {
        canne_monter();
        definir_vitesse_rotation(100);
        Serial.println("Poissons -> Erreur 20");
        return retour(20);
      }

    case 40:
      Serial.println("(Poissons 40)");
      Serial.println("-------- Préparation avant dépose");
      servo_slowmotion(servo_canne, 85, 45);
      // servo_canne.write(45); // remonter la canne à moitier
      delay(400);

      // aller devant la bordure qui dépasse
      error = aller_xy(928, 1750, 60, 1, 5000, 3); // 1700
      //if(error) return 10; // En cas d'erreur, on va quand même essayer de continuer...

      // devant le filet au plus proche
      error = aller_xy(1120, 1865, 60, 1, 5000, 3);

      robot.sans_symetrie = 1;
      asserv_goa(0); // prêt à larguer les poissons
      robot.sans_symetrie = 0;

      canne_baisser();

      definir_vitesse_rotation(100);
      robot.sans_symetrie = 1;
      if (robot.symetrie)  asserv_goa(1.51); // largage par rotation vers +pi/2
      else                  asserv_goa(-1.51); // largage par rotation vers -pi/2
      robot.sans_symetrie = 0;


      if(error) {
        // Il y a eu une erreur dans l'un des derniers mouvements...
        Serial.println("Poissons -> Erreur 40");
        canne_monter();
        return retour(40);
      }

      canne_monter();
      break;

    case 100:
      Serial.println("Tâche Poissons déjà à 100");
      return retour(100);
      break;
    default:
      Serial.print("##### Erreur : depart indéfini");
      return retour(0);
  }

  Serial.println("====== Tâche Poissons terminée");
  return 100;
}
uint8_t tache_coquillages_A(uint8_t depart) {
  uint8_t error = OK;

  Serial.print("=== Début de la tâche coquillages A (");
  Serial.print(depart);
  Serial.println(")");

  switch(depart) {
    case 0:
      Serial.println("(CoquillagesA 0)");
      switch(localiser_zone()) {
        case ZONE_CABINES:
        case ZONE_CONSTRUCTION:
        case ZONE_DUNE:
          error = aller_vers_couloir_pr(localiser_zone());
          break;
        case ZONE_PECHE:
          //Rien : inutile de passer par aller_vers_couloir_pr...
          break;
        default:
          error = aller_vers_couloir_pr(ZONE_PECHE);
      }
      if(error) return retour(0);

    case 10:
      Serial.println("(CoquillagesA 10)");
      error = aller_xy(310, 1680, 100, 1, 6000, 3);
      if(error) return retour(0);


      // Vers la zone de départ
      asserv_goa_point(230, 900, 2000);
      volets_ouvrir();
      error = aller_xy(230, 900, 80, 1, 5000, 6);
      if(error) {
        volets_fermer();
        return retour(0);
      }

      // Reculer
      error = aller_xy(290, 980, 100, 0, 1000, 2);
      volets_fermer();
      if(error) return retour(0);

      break;

    case 100:
      Serial.println("Tâche Coquillages A déjà à 100");
      return retour(100);
      break;
    default:
      Serial.print("##### Erreur : depart indéfini");
      return retour(0);
  }

  Serial.println("=== Tâche coquillages A terminée");

  return 100;
}

uint8_t tache_coquillages_B(uint8_t depart) {
  uint8_t error = OK;

  Serial.print("=== Début de la tâche coquillages B (");
  Serial.print(depart);
  Serial.println(")");

  switch(depart) {
    case 0:
      Serial.println("(CoquillagesB 0)");
      switch(localiser_zone()) {
        case ZONE_CABINES:
        case ZONE_CONSTRUCTION:
        case ZONE_DUNE:
          error = aller_vers_couloir_pr(localiser_zone());
          error = aller_xy(470, 1800, 100, 1, 6000, 3);
          break;
        case ZONE_PECHE:
          //Rien : inutile de passer par aller_vers_couloir_pr...
          break;
        default:
          error = aller_vers_couloir_pr(ZONE_PECHE);
      }
      if(error) return retour(0);

    case 10:
      Serial.println("(CoquillagesB 10)");
      error = aller_xy(950, 1750, 100, 1, 8000, 3);
      if(error) return retour(0);


      asserv_goa_point(950, 0, 2000);
      volets_ouvrir();
      error = aller_xy(950, 1500, 100, 1, 5000, 4);
      if(error) {
        volets_fermer();
        return retour(0);
      }

      // Vers la zone de départ
      error = aller_xy(250, 900, 80, 1, 10000, 4);
      if(error) {
        volets_fermer();
        return retour(0);
      }

      // On recule un peu
      error = aller_xy(350, 1100, 100, 0, 3000, 2);
      volets_fermer();

      break;

    default:
      Serial.print("##### Erreur : depart indéfini");
      return retour(0);
  }

  Serial.println("=== Tâche coquillages B terminée");

  return 100;
}

uint8_t tache_coquillages_C(uint8_t depart) {
  uint8_t error = OK;

  Serial.print("=== Début de la tâche coquillages C (");
  Serial.print(depart);
  Serial.println(")");

  switch(depart) {
    case 0:
      Serial.println("(CoquillagesC 0)");
      switch(localiser_zone()) {
        case ZONE_CABINES:
        case ZONE_CONSTRUCTION:
        case ZONE_DUNE:
          error = aller_vers_couloir_pr(localiser_zone());
          error = aller_xy(470, 1800, 100, 1, 6000, 3);
          break;
        case ZONE_PECHE:
          // Toujours rien
          break;
        default:
          error = aller_vers_couloir_pr(ZONE_PECHE);
          error = aller_xy(500, 1800, 100, 1, 6000, 3);
      }
      if(error) return retour(0);

    case 10:
      Serial.println("(CoquillagesC 10)");

      error = aller_xy(1230, 1830, 100, 1, 6000, 3);
      if(error) return retour(0);

      error = asserv_goa_point(1200, 0, 2000);
      volets_ouvrir();

    case 15:  // Pour Coquillages 3, on arrivera ici après avoir tenté le coquillage de l'autre côté
      Serial.println("(CoquillagesC 15)");
      // Grande ligne droite
      error = aller_xy(300, 1100, 80, 1, 7000, 3);
      if(error) {
        volets_fermer();
        return retour(0);
      }

      // Un petit virage
      error = aller_xy(220, 900, 100, 1, 6000, 6);
      if(error) {
        volets_fermer();
        return retour(0);
      }

      // On recule un peu
      error = aller_xy(300, 1100, 100, 0, 1000, 2);
      volets_fermer();
      break;

    default:
      Serial.print("##### Erreur : depart indéfini");
      return retour(0);
  }

  Serial.println("=== Tâche coquillages C terminée");
  return 100;
}

uint8_t tache_coquillages_Secours(uint8_t depart) {
  uint8_t error = OK;

  Serial.print("=== Début de la tâche coquillages Secours (");
  Serial.print(depart);
  Serial.println(")");

  switch(depart) {
    case 0:
      Serial.println("(Coquillages Secours 0)");
      switch(localiser_zone()) {
        case ZONE_CABINES:
        case ZONE_CONSTRUCTION:
        case ZONE_DUNE:
          error = aller_vers_couloir_pr(localiser_zone());
          error = aller_xy(500, 1800, 100, 1, 6000, 3);
          break;
        case ZONE_PECHE:
          if(robot_dans_zone(0, 1500, 800, 1700)) {
            error = aller_xy(500, 1800, 100, 1, 6000, 3);
          }
          break;
        default:
          error = aller_vers_couloir_pr(ZONE_PECHE);
          error = aller_xy(500, 1800, 100, 1, 6000, 3);
      }
      if(error) return retour(0);

    case 10:
      Serial.println("(Coquillages Secours 10)");
      error = aller_xy(900, 1800, 100, 1, 6000, 3);
      if(error) return retour(0);


      asserv_goa_point(600, 1100, 2000);
      volets_ouvrir();
      error = aller_xy(600, 1100, 100, 1, 6000, 6);
      if(error) {
        //error = tout_droit(-300, 2000);
        volets_fermer();
        return retour(0);
      }

      //asserv_goa_point(250, 900, 2000);
      error = aller_xy(250, 900, 100, 1, 6000, 6);
      if(error) {
        //error = tout_droit(-300, 2000);
        volets_fermer();
        return retour(0);
      }

      // On recule un peu
      error = aller_xy(400, 1000, 100, 0, 1000, 2);
      volets_fermer();

      break;

    default:
      Serial.print("##### Erreur : depart indéfini");
      return 0;
  }

  Serial.println("=== Tâche coquillages Secours terminée");
  return 100;
}



void test_poissons() {
  localisation_set({x: 530, y: 1850, a: 0});
  asserv_raz_consignes();
  tache_poissons(5, false);
  tache_poissons(5, false);
  tone_play_end();
}

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

  Serial.println("_______ Stratégie de base");

  /** ===========================
  Départ depuis la zone de départ
  =============================== */
  Serial.println("----- Sortir de la zone de départ");

  error = aller_xy(400, 995, 100, 1, 5000, 10);
  if(error) {
    Serial.println("_______ Itinéraire bis, abandon de la tour");
    // S'il n'arrive pas à sortir de la zone de départ, on va contourner et passer par la droite...

    // Idée : abandonner tour et passer aux poissons en passant par la droite
    /*
    *
    *
    *
    *
    *
    *
    */
  }

  /** ======
  Tâche tour
  ========== */
  avancement_tache_tour = tache_tour(10);
  if(avancement_tache_tour == 95) {
    // On n'a pas réussi à sortir de la zone de construction
    Serial.println("_______ Itinéraire bis pour rejoindre les poissons");

    n = 0;
    do {
      error = aller_xy(1200, 1400, 100, 1, 5000, 3);
      if(error) {
        avancement_tache_tour = tache_tour(95);
      }
      else {
        avancement_tache_tour = 99; // C'est quasiment réussi, on fait simplement une petite différence par rapport à une réussite normale.
      }
      n++;
    } while(avancement_tache_tour < 99 && n < 5);

    if(avancement_tache_tour == 99) {
      error = aller_xy(900, 1700, 100, 1, 5000, 10);
      /***
      * Et en cas d'erreur ??
      *
      *
      ***/
      avancement_tache_tour = 100;
    }
  }


  Serial.print("== Bilan Tour : ");
  Serial.println(avancement_tache_tour);

  // L'ensemble est placé dans un do{} while(), si jamais il y a eu trop d'obstacles...
  do {
    /** ==========
    Tâche Poissons
    ============== */
    Serial.println("Direction : les poissons !");
    avancement_tache_poissons = tache_poissons(0, true);


    /*Serial.println("_______ Analyse de la situation des Poissons...");
    if(avancement_tache_poissons == 100) {
      Serial.println("_____ Pas de problème avec les poissons : on retente");
      avancement_tache_poissons = tache_poissons(20, false); // Départ à 20 pour ne pas virer Patrick
      if(avancement_tache_poissons == 100)
        avancement_tache_poissons = 200;
      else
        avancement_tache_poissons = 100;
    }*/


    Serial.print("== Bilan Poissons : ");
    Serial.println(avancement_tache_poissons);

    /** ==============
    Tâches coquillages
    ================== */

    /*
      Lors du 2ème passage :
      Pour coquillagesA, si la tâche a déjà été réussie, tache_coquillages_A(100) ne fera rien.
      Pour B, C et Secours, on peut espérer que certains coquillages aient bougé entre temps, on commencera donc toujours à 0.
    */

    switch(robot.coquillage) {
      case 0:
        // Dans tous les cas, où qu'il soit, on commence par A (2pts potentiels) puis B (1pt)
        avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
        avancement_tache_coquillages_B = tache_coquillages_B(0);
        break;

      case 1:
        if(robot_dans_zone(700, 1500, 3000, 2000)) {
          avancement_tache_coquillages_C = tache_coquillages_C(0);
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
        }
        else {
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
          avancement_tache_coquillages_C = tache_coquillages_C(0);
        }
        if(avancement_tache_coquillages_C == 0)
          avancement_tache_coquillages_Secours = tache_coquillages_Secours(0);
        break;

      case 2:
        if(robot_dans_zone(550, 1500, 3000, 2000)) {
          avancement_tache_coquillages_C = tache_coquillages_C(0);
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
        }
        else {
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
          avancement_tache_coquillages_C = tache_coquillages_C(0);
        }
        if(avancement_tache_coquillages_C == 0)
          avancement_tache_coquillages_Secours = tache_coquillages_Secours(0);
        break;

      case 3:
        Serial.println("Coquillages 'F'");
        if(robot_dans_zone(550, 1500, 3000, 2000)) {
          /*error = aller_xy(1950, 1820, 80, 1, 10000, 3);
          if(error) {
            avancement_tache_coquillages_C = tache_coquillages_C(10); // Squizze les placements préliminaires
          }
          else {
            error = asserv_goa_point(1800, 1650, 2000);
            volets_ouvrir();
            error = aller_xy(1800, 1650, 80, 1, 10000, 3);
            error = aller_xy(1000, 1650, 80, 1, 10000, 3);
            if(error)
              avancement_tache_coquillages_C = tache_coquillages_C(10);
            else
              avancement_tache_coquillages_C = tache_coquillages_C(15);
          }
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
          */
          avancement_tache_coquillages_C = tache_coquillages_C(0);
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);

          if(avancement_tache_coquillages_C == 0)
            avancement_tache_coquillages_Secours = tache_coquillages_Secours(0);
        }
        else {
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
          avancement_tache_coquillages_C = tache_coquillages_C(0);
        }
        if(avancement_tache_coquillages_C == 0)
          avancement_tache_coquillages_Secours = tache_coquillages_Secours(0);
        break;

      case 4:
        if(robot_dans_zone(550, 1500, 3000, 2000)) {
          avancement_tache_coquillages_B = tache_coquillages_B(0);
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
        }
        else {
          avancement_tache_coquillages_A = tache_coquillages_A(avancement_tache_coquillages_A);
          avancement_tache_coquillages_B = tache_coquillages_B(0);
        }

        if(avancement_tache_coquillages_B == 0)
          avancement_tache_coquillages_Secours = tache_coquillages_Secours(0);
        break;
    }

    Serial.print("== Bilan Coquillages : A:");
    Serial.print(avancement_tache_coquillages_A);
    Serial.print(", B:");
    Serial.print(avancement_tache_coquillages_B);
    Serial.print(", C:");
    Serial.print(avancement_tache_coquillages_C);
    Serial.print(", Sec:");
    Serial.println(avancement_tache_coquillages_Secours);


    /** ---------------------------------------
    Nouvelles tentatives Poissons si nécessaire
    ------------------------------------------- */
    if(avancement_tache_poissons < 200) {
      Serial.println("Nouvelle tentative des poissons");
      avancement_tache_poissons = tache_poissons(5, false);
    }
    /*
    if(avancement_tache_poissons == 100) { // Rappel, peut être égal à 200
      avancement_tache_poissons = tache_poissons(0, false);
    }*/

    Serial.println("==== On boucle ? ====");
  } while(!match_termine());
  Serial.println("Pas le temps");

  Serial.println("_______ Terminé");

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