#include "asserv2017.h"

Servo servo_fusee;
Servo servo_bras_gauche;
Servo servo_bras_droit;

// Vitesses par défaut
uint32_t const VITESSE_A_VIDE = 100;
uint32_t const VITESSE_CHARGE = 90; //80;
uint32_t const VITESSE_LENTE = 50; //20;

// Variables globales de stratégie
// Initialisées avec des variables par défaut. Mieux vaut les re-initialiser dans match_gr & co
bool gr_minerais_charges = false; // Etat chargé/à vide
int nb_modules_extraits_fusee_depart = 0;


/* Glossaire
  PCD : Petit Cratère Départ
  PCL : Petit Cratère Lunaire
  GCC : Grand Cratère Coin
  Depot : zone de sa couleur devant la soute de la navette (coin de la table)
  Depart : zone de sa couleur proche du milieu de la table
*/


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

    /**********
    ROBOT ALIEN
    ***********/

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


    servo_bras_gauche.attach(29);
    servo_bras_droit.attach(30);
    servo_fusee.attach(31);

    positionner_deux_bras(POSITION_RECOLTER, false);
    gr_fusee_fermer();
  }


  gr_rouleaux_stop();
}


void demo_allers_retours() {
  ecran_console_reset();
  ecran_console_log("Deplacer Minerais\n\n");
  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n");

  wait_start_button_down();
  ecran_console_log("Pret\n");

  delay(300);
  localisation_set({x: 1000, y: 1000, a: 0});
  asserv_raz_consignes();

  wait_start_button_up();
  match_demarrer_minuteur();

  //uint32_t t0 = millis();
  uint8_t error;

  aller_xy(1500, 1000, 30, 1, 10000, 15);

  bras_position_croisiere();
  com_log_println("En attente");
  while(!robot.sickObstacle) {
    Serial.println("...");
    delay(100);
    robot.match_debut = millis();
  }
  com_log_println("Let's go !");
  gr_fusee_ouvrir();
  delay(600);
  gr_fusee_fermer();
  delay(400);
  gr_fusee_ouvrir();
  delay(400);

  while(1) {
    robot.match_debut = millis();

    aller_xy(2000, 1000, 100, 1, 10000, 20);
    prendre_minerais();
    aller_xy(1800, 1000, 100, 0, 10000, 20);
    aller_xy(1000, 1000, 100, 1, 10000, 20);
    delay(800);
    positionner_deux_bras(POSITION_DEPOSER_BAS, false);
    delay(800);
    aller_xy(1200, 1000, 100, 0, 10000, 20);
    delay(800);
    bras_position_croisiere();
  }
}

void homologation_gr() {
  uint8_t error;
  uint8_t tentatives = 0;


  ecran_console_reset();
  ecran_console_log("Homolog GR\n");
  robot.activer_monitor_sick = false;

  if(robot.symetrie) {
    ecran_console_log("Couleur : JAUNE\n");
  }
  else {
    ecran_console_log("Couleur : BLEU\n");
  }

  ecran_console_log("\n\n");
  ecran_console_log("Les arbitres sont\n");
  ecran_console_log("hyper sympa cette\n");
  ecran_console_log("annee.\n\n");

  ecran_console_log("1. Positionner\n");
  delay(1500);
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  wait_start_button_down();

  ecran_console_log("Pret\n\n");
  delay(200);

  localisation_set({x: 900, y: 200, a: MATH_PI * -0.75});  // TBC
  asserv_raz_consignes();

  wait_start_button_up();

  match_demarrer_minuteur();

  delay(1000);


  bras_position_croisiere();
  asserv_go_toutdroit(-350, 3000);
  aller_xy(1150, 450, 100, 1, 20000, 10);


  aller_xy(1600, 450, 100, 1, 20000, 10);
  /*aller_pt_etape(PT_ETAPE_15, 100, 1, 20000, 10);
  aller_xy(1000, 1000, 100, 1, 20000, 10);
  aller_xy(1000, 250, 100, 1, 20000, 10);

  asserv_go_toutdroit(-400, 3000);*/

  recuperer_module1();

  delay(2000);

  recuperer_module5(false);

  while(!match_termine());

}

void debug_gr() {
  gr_rouleaux_stop();
  robot.activer_monitor_sick = false;

  ecran_console_log("Debug GR\n\n");
  ecran_console_log("2 sec\n\n");

  delay(200);
  //localisation_set({x: 900, y: 200, a: MATH_PI * 0.25});
  localisation_set({x: 737, y: 1578, a: MATH_PI * -0.5});
  asserv_raz_consignes();
  delay(1800);

  match_demarrer_minuteur();

  delay(500);

  //asserv_goa_point(1500, 0, 3000);
  bras_position_croisiere();

  com_log_println("Orientation 1 dans 3 sec");
  delay(3000);

  asserv_goa_point(737, 0, 3000);

  com_log_println("Baisser le bras dans 3 sec");
  delay(3000);
  if(robot.symetrie) {
    positionner_bras_gauche(POSITION_KNOCK_JAUNE, false);
  }
  else {
    positionner_bras_droit(POSITION_KNOCK_BLEU, false);
  }

  com_log_println("Orientation 2 dans 3 sec");
  delay(3000);

  asserv_goa_point(1500, 573, 2000); // Rotation (= "Knocker")

  com_log_println("Croisiere dans 3 sec");
  delay(3000);

  bras_position_croisiere();


/*
  Serial.println("Position croisiere");
  positionner_deux_bras(POSITION_CROISIERE, true);

  delay(7000);
  Serial.println("Position Approche dans 3");
  delay(1000);
  Serial.println("2");
  delay(1000);
  Serial.println("1");
  delay(1000);

  positionner_deux_bras(POSITION_APPROCHE_DEPOT_HAUT, true);

  delay(7000);
  Serial.println("Position Depot Haut dans 3");
  delay(1000);
  Serial.println("2");
  delay(1000);
  Serial.println("1");
  delay(1000);

  positionner_deux_bras(POSITION_DEPOSER_HAUT, false);
*/

  tone_play_end();
}

void match_gr() {
  int start;
  uint8_t error;

  ecran_console_reset();


  // Variables de stratégie
  int action_en_cours; // Numéro de l'action en cours
  int const nombre_actions = 9;
  int const nombre_attributs = 2;
  int etat_actions[nombre_actions][nombre_attributs] = { 0 };

  /*
    etat_actions :

    Dimension 1 :
    n - recuperer_module1
    n - degager_module5 (ou recuperer_module5, à choisir)
    n - recuperer_minerais_pcd7
    n - knocker_module2
    n - recuperer_minerais_pcl
      n - recuperer_minerais_pcd4
      n - recuperer_minerais_gcc10
      n - recuperer_minerais_gcc14
    n - recuperer_Fdep

    Dimension 2 :
      0 - Visite (0 non, 1 oui)
      1 - Erreur  (1 oui)
  */

  // Variables internes
  int nb_iterations;


  /** ==========================
    Préparation & Initialisation
    ============================ **/

  ecran_console_reset();
  robot.activer_monitor_sick = false;
  ecran_console_log("Match GR\n");

  if(robot.symetrie) {
    ecran_console_log("Couleur : JAUNE\n");
  }
  else {
    ecran_console_log("Couleur : BLEU\n");
  }
  ecran_console_log("\n\n");

  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  ecran_console_log("Initialisation...");


  // Initialisation des variables de stratégie
  action_en_cours = 0; ////// ATTENTION, != 0 pour TESTS UNIQUEMENT
  gr_minerais_charges = false; // Etat chargé/à vide
  nb_modules_extraits_fusee_depart = 0;


  delay(500);
  ecran_console_log(" Ok\n");

  wait_start_button_down();

  ecran_console_log("Pret\n\n");
  delay(200);
  localisation_set({x: 886, y: 196, a: MATH_PI * -0.75});
  asserv_raz_consignes();
  wait_start_button_up();


  /** ============
    Début du match
    ============== **/

  match_demarrer_minuteur();

  delay(500);

  bras_position_croisiere();
  asserv_go_toutdroit(-450, 5000);


  /**
  Stratégie de jeu :

    Visiter dans l'ordre :
    PCD 4, Depot, PCL, Depot, GCC 10, Depot
    Si le temps le permet, visiter :
    GCC 14, Depot, PCD 7, Depot

    Gestion des erreurs :
      Si une action de mouvement vers un cratère est obstruée (max_tentatives = 3 atteint),
        aller au cratère suivant et revisiter le cratère manqué à la fin.
      Si une action de mouvement vers le dépôt est obstruée (max_tentatives = 3 atteint),
        et que l'on est à x > 600 et y < 1400, (vers le milieu de la table)
          aller à p1.
        et que l'on est à x < 600 ou y > 1400, (vers le bord de la table)
          aller à p14.
        Puis aller au dépôt.
  **/

  do {

    // [Prévision pour Stratégie Niveau 2]
    //  Une fois les 5 actions de base terminées, on passe à un autre boucle.
    //while(!match_termine() && (etat_actions[0][0] == 0 || etat_actions[1][0] == 0 || etat_actions[2][0] == 0 || etat_actions[3][0] == 0 || etat_actions[4][0] == 0)) {
    // TODO : condition match_termine() à confirmer

      /** =======================
        Récupération des minerais
        ========================= **/
      /*Proposition stratégie v1 Antoine
        0 - recuperer_module1()
        1 - degager_module5()
        2 - recuperer_minerais_pcd7()
        3 - knocker_module2()
        4 - recuperer_minerais_pcl()
        5 - recuperer_minerais_pcd4()
        6 - recuperer_minerais_gcc10()
        7 - recuperer_minerais_gcc14()
        8 - recuperer_fusee_depart()
      */
      switch(action_en_cours) {
        case 0: error = recuperer_module1(); break;
        case 1: error = recuperer_module5(true); break;
        case 2: error = recuperer_minerais_pcd7(); break;
        case 3: error = knocker_module2_de_face(); break;
        case 4: error = recuperer_minerais_pcl(); break;
        case 5: error = recuperer_minerais_pcd7(); break;
        case 6: error = recuperer_minerais_gcc10(); break;
        case 7: error = recuperer_minerais_gcc14(); break;
        case 8: error = recuperer_minerais_gcc10(); break;
        //case 8: error = recuperer_minerais_pcd4(); break;
        //case 8: error = recuperer_fusee_depart(); break;

        default:
          com_log_println("! ######### ERREUR : action_en_cours inconnu");
          error = ERROR_STRATEGIE;
      }

      if(error) {
        etat_actions[action_en_cours][1] = 1; // Enregistrement de l'erreur
        com_log_print(":: Echec sur action ");
        com_log_print(action_en_cours);
        com_log_println(" ::");
      }
      else {
        etat_actions[action_en_cours][0] = 1; // Enregistrement de la visite
        com_log_print(":: Action ");
        com_log_print(action_en_cours);
        com_log_println(" terminée ::");
      }


      /** ===================
        Collecte des minerais
        ===================== **/

      while(gr_minerais_charges && !match_termine()) {

        error = deposer_minerais_zone_depot(false);

        if(error) {
          // Minerais pas déposés : on se déplace à un point de secours pour revenir à la boucle while suivante
          com_log_println("Echec de la dépose. En route vers point de secours.");

          if(robot.xMm > 600 && robot.yMm < 1400) {
            //Pas de sous-gestion de l'erreur : Si erreur on retente d'aller au dépôt à la boucle while suivante
            //Marche arrière autorisée
            error = aller_pt_etape(PT_ETAPE_1, 100, 0, 12000, 5);
          }
          else {
            //Pas de sous-gestion de l'erreur : Si erreur on retente d'aller au dépôt à la boucle while suivante
            //Marche arrière autorisée
            error = aller_pt_etape(PT_ETAPE_14, 100, 0, 12000, 5);
          }

        }
        else {
          gr_minerais_charges = false; // Minerais déposés
          com_log_println("Minerais déposés.");
        }

      }


      /** ========
        Et après ?
        ========== **/
      // Recherche de l'action suivante parmi les points de collecte non visités (etat_actions[id][0] == 0)

      nb_iterations = 0; // Pour éviter la boucle infinie
      do {
        action_en_cours++;
        if(action_en_cours >= nombre_actions) {
          action_en_cours = 0;
        }
        nb_iterations++;
      } while(etat_actions[action_en_cours][0] == 1 && nb_iterations <= nombre_actions);
        // tant qu'on n'a pas trouvé un point de collecte non visité, ET qu'on n'a pas parcouru toutes les actions possibles 1 fois
        // En stratégie Niveau 1, le <= plutôt que < est volontaire :
        //    Si toutes les actions sont visitées (etat_actions[][0] à 1),
        //    la boucle finira avec action_en_cours = action_en_cours + 1
        //    On recommencera donc des actions déjà accomplies (sait-on jamais, on en a peut-être oublié ?)
        // En stratégie Niveau 2, mettre <


    // [Prévision pour stratégie Niveau 2]
    // } // Fin du while() niveau 1


  } while(!match_termine()); // TODO : confirmer condition de fin de match



  com_log_println("_______ Terminé");

  tone_play_end();
}


/* Points étapes et orientations à viser pour initialiser les actions
PCD1  : pt4;  viser x = 650;  y = 540;
PCD2  : pt7;  viser x = 650;  y = 540;
PCL   : pt14; viser x = 1070; y = 1870;
GCC1  : pt10; viser x = 0;    y = 2000;
GCC2  : pt14; viser x = 0;    y = 2000;
Depot : pt7;  viser x = 80;   y = 0;
M2knk : pt14; viser x = 737;  y = 0;
Fdep  : pt15; /
*/

/* Déplacements pour les actions
Déplacement   x    y    theta_start_x  theta_start_y  theta_finish_x  theta_finish_y
Depot_start   245  520    80        0        80        0
Depot_finish 290  665    80        0        80        0
PCD4_s_f   855  642    Centre PCD
PCD7_s_f   428  576    Centre PCD
PCL14_s_f   866  1766  Centre PCL
GCC10_s_f   350  1440  Centre GCC
GCC14_s_f   618  1855  Centre GCC
M2knk_s_f   737  1578  737        0        1500      573
Fdep_start   1452  132    0        132        0        132 /!\ Vérifier interférence possible avec la table TBD
Fdep_finish   1328  132    0        132        0        132 action Fdep: x4 (4 modules à extraire)

*/

uint8_t recuperer_minerais_pcd4() {
  uint8_t error;

  com_log_println("----- Minerais PCD4 -----");

  // Initialisation de l'action
  //com_log_println("En route vers PCD via P4.");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_4, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;
  com_log_println("PCD4 atteint.");


  // Pas de gestion d'erreur : si problème, on essaye quand même de finir l'action
  error = aller_xy(855, 652, VITESSE_A_VIDE, 1, 3000, 2); // Approche
  error = asserv_goa_point(650, 540, 2000); // On s'oriente vers le cratère

  error = prendre_minerais();
  gr_minerais_charges = true;
  com_log_println("Minerais charges");

  // Dégagement
  error = aller_pt_etape(PT_ETAPE_4, VITESSE_CHARGE, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt


  return OK;
}


uint8_t recuperer_minerais_pcd7() {
  uint8_t error;

  com_log_println("----- Minerais PCD7 -----");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_7, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;
  com_log_println("PCD7 atteint.");

  positionner_deux_bras(POSITION_MAX_SOUS_SICK, false);


  // Pas de gestion d'erreur : on est suffisamment proche du cratère pour espérer récupérer des minerais
  // même s'il y a un problème
  error = aller_xy(450, 669, VITESSE_A_VIDE, 1, 2000, 3); // Approche vers le cratère
  error = asserv_goa_point(650, 540, 2000); // Orientation vers le cratère

  error = prendre_minerais();
  gr_minerais_charges = true;
  com_log_println("Minerais charges");


  // Dégagement
  error = aller_pt_etape(PT_ETAPE_7, VITESSE_CHARGE, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés.

  return OK;
}


uint8_t recuperer_minerais_pcl() {
  uint8_t error;

  com_log_println("----- Minerais PCL -----");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_14, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;
  com_log_println("PCL atteint.");


  // Réalisation de l'action
  error = aller_xy(836, 1736, VITESSE_A_VIDE, 1, 3000, 3); // Approche vers le cratère
  error = asserv_goa_point(1070, 1870, 2000); // Orientation vers centre du cratère

  error = prendre_minerais();
  gr_minerais_charges = true;
  com_log_println("Minerais charges");

  // Dégagement
  error = aller_pt_etape(PT_ETAPE_14, VITESSE_CHARGE, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés.


  return OK;
}


uint8_t recuperer_minerais_gcc10() {
  uint8_t error;

  com_log_println("----- Minerais GCC10 -----");

  // Initialisation de l'action

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_10, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;
  com_log_println("GCC10 atteint.");

  // Réalisation de l'action
  error = aller_xy(350, 1440, VITESSE_A_VIDE, 1, 3000, 3); // S'approche du cratère
  error = asserv_goa_point(0, 2000, 2000); // S'oriente correctement

  error = prendre_minerais();
  gr_minerais_charges = true;
  com_log_println("Minerais charges");

  // Dégagement
  error = aller_pt_etape(PT_ETAPE_10, VITESSE_CHARGE, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés.

  return OK;
}


uint8_t recuperer_minerais_gcc14() {
  uint8_t error;

  com_log_println("----- Minerais GCC14 -----");

  // Initialisation de l'action
  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_14, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;
  com_log_println("GCC14 atteint.");

  // Réalisation de l'action
  error = aller_xy(618, 1855, VITESSE_A_VIDE, 1, 3000, 3); // S'approche du cratère
  error = asserv_goa_point(0, 2000, 2000); // S'oriente

  error = prendre_minerais();
  gr_minerais_charges = true;
  com_log_println("Minerais charges");


  // Dégagement
  error = aller_pt_etape(PT_ETAPE_14, VITESSE_CHARGE, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés.

  return OK;
}


uint8_t deposer_minerais_zone_depot(bool avec_robot_secondaire) {
  uint8_t error;

  com_log_println("----- Deposer vers depot -----");


  // En route vers dépôt
  com_log_println("En route vers Depot.");
  error = aller_pt_etape(PT_ETAPE_7, VITESSE_CHARGE, 1, 9000, 3);
  if(error) return error;

  com_log_println("Depot atteint.");



  // Début du dépôt dans la zone de départ
  // Vitesse ralentie (80) pour éviter de cogner partout
  if(avec_robot_secondaire) {
    // Approche
    positionner_deux_bras(POSITION_APPROCHE_DEPOT_HAUT, false);
    error = aller_xy(240, 550, 80, 1, 2000, 2);

    if(error) {
      Serial.println("! Recalage impossible");
    }
    else {
      Serial.println("Recalage");
      aller_xy(240, 0, VITESSE_LENTE, 1, 2000, 3); // Recalage bordure
      localisation_set({x: 240, y: 480, a: MATH_PI * -0.5});
    }

    // On baisse
    positionner_deux_bras(POSITION_DEPOSER_HAUT, false);

    // On dégage
    error = aller_xy(240, 670, 80, 0, 5000, 3); // Pas de sous-gestion de l'erreur. Les minerais sont déchargés.
  }
  else {
    // Approche
    error = aller_xy(210, 520, 80, 1, 3000, 2);
    // if(error) return error; // Robot têtu : même si problème, il continuera son action de dépose. On est assez proche pour espérer qu'il en dépose au moins 1.

    //error = asserv_goa_point(210, 0, 2000);
    error = aller_xy(210, 495, 80, 1, 2500, 2);
    // if(error) return error;

    // On baisse
    positionner_deux_bras(POSITION_DEPOSER_BAS, false);

    // On dégage
    error = aller_xy(260, 670, 80, 0, 5000, 3); // Pas de sous-gestion de l'erreur. Les minerais sont déchargés.
  }



  bras_position_croisiere();


  // Dégagement
  // Rien à faire : la position de fin a une marge autour permettant une rotation vers une nouvelle destination.


  return OK;
}



uint8_t knocker_module2() {
  // Réclamation sur le nom de la fonction --> Antoine
  uint8_t error;

  com_log_println("----- Knocker Module 2 -----");


  // Déplacement vers base lunaire
  com_log_println("En route vers la base lunaire, module 2.");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_14, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;

  com_log_println("Base lunaire, module 2 atteint.");


  if(robot.symetrie) {
    // Approche
    error = aller_xy(737, 1578, VITESSE_A_VIDE, 1, 8000, 3);
    if(error) return error;

    error = asserv_goa_point(737, 0, 3000);
    //if(error) return error;
    positionner_bras_gauche(POSITION_KNOCK_JAUNE, false);

    error = asserv_goa_point(1500, 573, 2000); // Rotation (= "Knocker")
    // Pas de retour d'erreur (sinon nécessite de connaître l'angle du robot lors de l'erreur)
  }
  else {
    error = aller_xy(760, 1556, VITESSE_A_VIDE, 1, 8000, 3);
    if(error) return error;

    error = asserv_goa_point(760, 0, 3000);
    positionner_bras_droit(POSITION_KNOCK_BLEU, false);

    error = asserv_goa_point(1500, 573, 2000); // Rotation (= "Knocker")
  }

  bras_position_croisiere();

  // Dégagement
  // La position de fin a une marge autour permettant une rotation vers une nouvelle destination.

  return OK;
}

uint8_t knocker_module2_de_face() {
  uint8_t error;

  // En jaune, c'est trop ric-rac, on ignore donc cette action
  if(robot.symetrie) {
    return OK;
  }

  com_log_println("----- Knocker Module 2 de face -----");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_8, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return OK;

  positionner_deux_bras(POSITION_KNOCK_FACE, false);

  error = aller_xy(815, 1315, 100, 1, 2000, 3);

  asserv_go_toutdroit(-300, 2000);
  if(error) return OK;

  bras_position_croisiere();

  error = aller_xy(650, 1600, 100, 1, 5000, 3);
  if(error) return OK;


  return OK;
}


uint8_t recuperer_fusee_depart() {
  uint8_t error;

  com_log_println("----- Recuperer Fusee Depart -----");

  // Pas de fusée pour l'instant...
  com_log_println("Ou pas");
  return OK;
  // ...



  // Initialisation de l'action


  if(nb_modules_extraits_fusee_depart >= 4) {
    com_log_println("La fusee est vide !");
    return OK;
  }


  error = aller_pt_etape(PT_ETAPE_15, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return error;


  error = aller_xy(1452, 132, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return error;

  // Réalisation de l'action
  while(nb_modules_extraits_fusee_depart < 4 && !match_termine()) {

    // TBC Position de rotation OK avec tolérance de positionnement du robot ?

    com_log_println("Point d'extraction de la fusée départ atteint.");

    error = asserv_goa_point(0, 132, 3000);
    if(error) return error;

    error = aller_xy(1328, 132, VITESSE_LENTE, 1, 10000, 3);
    if(error) return error;

    // TBD Baisser bras droit ou symétrie gauche ?

    error = aller_xy(1452, 132, VITESSE_A_VIDE, 0, 10000, 3);
    if(error) return error;

    nb_modules_extraits_fusee_depart++;
  }


  // Dégagement
  // La position de fin a une marge autour permettant une rotation vers une nouvelle destination. TBD

  return OK;
}


uint8_t recuperer_module1() {
  // Gestion des erreurs :
  // si l'action échoue et que l'on part sur une autre action, on ne sait pas où sera le module sur la table
  // => Inutile de la refaire.
  // On renvoie donc OK même s'il y a une erreur

  uint8_t error;

  com_log_println("----- Recuperer Module 1 -----");

  // Initialisation de l'action
  com_log_println("Je vais récupérer le module 1. Taiaut !");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_15, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return OK;


  // Réalisation de l'action
  error = aller_xy(1070, 854, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return OK;

  // error = asserv_goa_point(1000, 600, 1000);
  // if(error) return OK;

  error = aller_xy(920, 320, VITESSE_LENTE, 1, 8000, 3);
  if(error) return OK;


  com_log_println("Module 1 dans la zone de départ !");

  // Dégagement
  asserv_go_toutdroit(-400, 2000);

  return OK;
}


// Action à réaliser avant toute extraction de minerais.
// Une visite de P8 (où se trouve aussi Module 5) rendrait inutile cette action.
uint8_t recuperer_module5(bool prendre_minerais_gcc_au_passage) {
  uint8_t error;
  // Retrait de la gestion des erreurs : si l'action échoue et que l'on part sur une autre action, on ne sait pas où sera le module sur la table => Inutile à refaire.

  com_log_println("----- Recuperer Module 5 -----");
  if(prendre_minerais_gcc_au_passage) {
    com_log_println("en prenant qq minerais au passage !");
  }

  // Initialisation de l'action
  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_4, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;

  error = aller_xy(903, 1008, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;


  // Réalisation de l'action
  error = aller_xy(490, 1455, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;

  if(prendre_minerais_gcc_au_passage) {
    // Approche
    error = aller_xy(442, 1507, VITESSE_A_VIDE, 1, 3000, 3);

    prendre_minerais();
    gr_minerais_charges = true;
    com_log_println("Minerais charges");

    error = aller_xy(490, 1455, VITESSE_CHARGE, 0, 3000, 3);
  }

  error = aller_xy(320, 1200, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;

  // error = asserv_goa_point(500, 1100, 3000);
  // if(error) return OK;

  error = aller_xy(920, 856, VITESSE_LENTE, 1, 10000, 3);
  if(error) return OK;

  // error = asserv_goa_point(920, 0, 3000);
  // if(error) return OK;

  // TBD Faire une rotation lente si possible
  error = aller_xy(920, 320, VITESSE_LENTE, 1, 10000, 3);
  if(error) return OK;

  asserv_go_toutdroit(-400, 2000);

  com_log_println("Fin du déplacement pour Module 5 dans la zone de départ.");

  // Dégagement
  // La position de fin a une marge autour permettant une rotation vers une nouvelle destination.

  return OK;
}



/*DELETED Action de préparation du terrain : évacuation des modules lunaires de la piste de déplacement
// Dégagement de Module 1 (1000;600) vers (1200+;1400+) depuis P1 (900;200) puis dégagement par l'arrière vers (1100;1000)
aller_pt_etape(PT_ETAPE_1, VITESSE_A_VIDE, 1, 10000, 3)
aller_xy(1200, 1400, VITESSE_LENTE, 1, 10000, 3) //TBC_RS : arguments fonction aller_xy
aller_xy(1100, 1000, VITESSE_A_VIDE, 0, 10000, 3)
*/


uint8_t degager_module5() { //Action de préparation du terrain : évacuation des modules lunaires de la piste de déplacement
  // A lancer après recuperer_module1(). Une visite de (800;950) avant pousserait le module 1 qui deviendrait irrécupérable.
  uint8_t error;

  com_log_println("----- Degager Module 5 -----");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_4, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;

  // Dégagement de Module 5 (500;1100) vers (300-;1200+) depuis (800;950) puis dégagement par l'arrière vers P8
  error = aller_xy(800, 950, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;

  error = aller_xy(500, 1100, VITESSE_LENTE, 1, 10000, 3);
  if(error) return OK;

  error = aller_xy(300, 1200, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;

  error = aller_pt_etape(PT_ETAPE_8, VITESSE_A_VIDE, 0, 10000, 3);
  if(error) return OK;

  // Pas de gestion des erreurs : Une erreur sur cette séquence suivi d'un mouvement aléatoire invalide toute reprise de l'action.

  return OK;
}


uint8_t prendre_minerais() {
  positionner_bras_gauche(POSITION_RECOLTER, false);
  positionner_bras_droit(POSITION_RECOLTER, false);
  delay(500);
  positionner_bras_droit(POSITION_CROISIERE, true);
  //delay(800);
  positionner_bras_gauche(POSITION_CROISIERE, true);

  return OK;
}

void bras_position_croisiere() {
  positionner_bras_droit(POSITION_CROISIERE, false);
  positionner_bras_gauche(POSITION_CROISIERE, false);
}

void positionner_deux_bras(uint8_t position, bool doucement) {
  positionner_bras_droit(position, doucement);
  positionner_bras_gauche(position, doucement);
}

/**
== Positions bras gauche ==
Max sous sik : 95
Croisière : 80
Prendre minerais : 45
Dépose basse : 45
Dépose haute : 105 puis 90

Angle+ => Vers le haut
**/
void positionner_bras_gauche(uint8_t position, bool doucement) {
  int angle;

  if(!match_termine()) {
    switch(position) {
      case POSITION_CROISIERE: angle = 77; break;
      case POSITION_RECOLTER: angle = 42; break;
      case POSITION_DEPOSER_BAS: angle = 45; break;
      case POSITION_DEPOSER_HAUT: angle = 95; break;
      case POSITION_APPROCHE_DEPOT_HAUT: angle = 115; break;
      case POSITION_MAX_SOUS_SICK: angle = 95; break;
      case POSITION_KNOCK_JAUNE: angle = 70; break;
      case POSITION_KNOCK_BLEU: angle = 80; break; // Croisière
      case POSITION_KNOCK_FACE: angle = 68; break;
      default:
        Serial.println("######### ERREUR : POSITION inconnue dans positionner_bras_gauche");
        angle = 80; // Croisière par défaut
    }

    if(doucement)
      servo_slowmotion(servo_bras_gauche, robot.angle_bras_gauche, angle);
    else
      servo_bras_gauche.write(angle);

    robot.angle_bras_gauche = angle;

    Serial.print("Positionnement bras gauche ");
    Serial.print(angle);
    Serial.println("deg");
  }
}

/**
== Positions bras droit ==
Max sous sick : 115
Croisière : 135
Prendre minerais : 165
Dépose basse : 165
Dépose haute : 110 puis 118

Angle+ => Vers le bas
**/
void positionner_bras_droit(uint8_t position, bool doucement) {
  int angle;

  if(!match_termine()) {
    switch(position) {
      case POSITION_CROISIERE: angle = 135; break;
      case POSITION_RECOLTER: angle = 175; break;
      case POSITION_DEPOSER_BAS: angle = 165; break;
      case POSITION_DEPOSER_HAUT: angle = 113; break;
      case POSITION_APPROCHE_DEPOT_HAUT: angle = 100; break;
      case POSITION_MAX_SOUS_SICK: angle = 115; break;
      case POSITION_KNOCK_BLEU: angle = 150; break;
      case POSITION_KNOCK_JAUNE: angle = 135; break; // Croisière
      case POSITION_KNOCK_FACE: angle = 130; break;
      default:
        Serial.println("######### ERREUR : POSITION inconnue dans positionner_bras_droit");
        angle = 135; // Croisière par défaut
    }

    if(doucement)
      servo_slowmotion(servo_bras_droit, robot.angle_bras_droit, angle);
    else
      servo_bras_droit.write(angle);

    robot.angle_bras_droit = angle;

    Serial.print("Positionnement bras droit ");
    Serial.print(angle);
    Serial.println("deg");
  }
}


void gr_fusee_init() {
  Serial.println("###### Warning: Fonction fusee_init inutile");
}

void gr_fusee_fermer() {
  servo_fusee.write(74);
}

void gr_fusee_ouvrir() {
  servo_fusee.write(160);
}


void gr_coucou() {
  for(int i = 0; i < 500; i++) {
    delay(600);
    servo_bras_gauche.write(45);
    servo_bras_droit.write(135);
    delay(600);
    servo_bras_gauche.write(80);
    servo_bras_droit.write(165);
  }
}

void funny_action() {
  if(!robot.IS_PR) {
    com_log_println("Fin de match, funny action !");
    gr_fusee_ouvrir();
    delay(1000);
    gr_fusee_fermer();
    delay(800);
    gr_fusee_ouvrir();
    delay(800);
    gr_fusee_fermer();
    delay(1000);
    gr_fusee_ouvrir();
  }
}



/******************************************
OBSOLETE
CODE 2016
Laissé en attendant de faire un beau ménage...
*****************************************/

void gr_rouleaux_liberer() {
  com_log_println("Rouleaux : libérer");
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
  com_log_println("Rouleaux : Avaler");
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
  com_log_println("Rouleaux : Stop");
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
