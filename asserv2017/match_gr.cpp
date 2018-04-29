#include "asserv2017.h"

/** Dans ce fichier, plus on descend, plus on va dans le bas niveau **/

/* Glossaire 2018
  // Parce que Antoine pense à nous
  
  Sur la table
    Depart  : zone de sa couleur proche du milieu de la table
    REP     : Recuperateur Eau Propre (notre côté du terrain)
    REM     : Recuperateur Eau Mixte (notre côté du terrain)
    REP_opp : Recuperateur Eau Propre opp (côté adverse du terrain)
    REM_opp : Recuperateur Eau Mixte opp (côté adverse du terrain)
    CHATEAU : CHATEAU d'eau (le notre)
    STATION : STATION d'epuration (la notre)
    ABEILLE : ABEILLE qui pique (la notre)
    PANNEAU : PANNEAU domotique (le notre)
    CUB1    : groupe de cubes (modules de constructions de batiments HQE) à l'emplacement 1 centré sur [850;540]
    CUB2    : groupe de cubes à l'emplacement 2 centré sur [300;1190]
    CUB3    : groupe de cubes à l'emplacement 3 centré sur [1100;1500]
    CUB1_opp : idem CUB1 par symétrie
    CUB2_opp : idem CUB2 par symétrie
    CUB3_opp : idem CUB3 par symétrie
    ZOC     : Zone de Construction des batiments HQE
  
  
  Dans le robot
    EEU   : Evacuation des Eaux Usees
    CM    : Cuillère à Miel
*/

/** ============================================
  Déclarations constantes, variables, prototypes
  ============================================== */

// Vitesses par défaut
uint32_t const VITESSE_RAPIDE = 100;
uint32_t const VITESSE_LENTE = 50;


// Variables globales de stratégie
// Initialisées avec des variables par défaut. Mieux vaut les re-initialiser dans match_gr & co
bool gr_eau_propre_chargee = false; // Etat chargé/à vide
bool gr_eau_usee_chargee = false; // Etat chargé/à vide
bool tbl_panneau_allume = false;
bool tbl_abeille_activee = false;
bool tbl_REP_vide = false;
bool tbl_REM_vide = false;
bool tbl_REP_opp_vide = false;
bool tbl_REM_opp_vide = false;


uint8_t activer_panneau();
uint8_t vider_REP();
uint8_t activer_abeille();
uint8_t vider_REM();
uint8_t constr_CUB1();

void match_gr_init_servos();



/** ====================
  Paramétrage des servos
  ====================== **/

/* Pour chaque servo, on associe :
    des variables
      Servo servo_exemple;
      uint8_t angle_exemple;
    une abréviation
      EX
    des positions prédéfinies (utiliser l'infinitif)
      const uint8_t EX_INIT = 79; // Au départ
      const uint8_t EX_OUVRIR = 80;
      const uint8_t EX_FERMER = 120;
    une fonction de pilotage générique
      piloter_exemple(uint8_t angle, bool doucement = false, log = true);
        angle       angle à donner au Servo (pas forcément une valeur prédéfinie)
        doucement   true pour y aller doucement
        log         false pour ne pas spammer le monitor

*/

// Evacuation des Eaux Usees (EEU)
// Angle+ = [Sens?]
/*** TODO TBD ***/
const uint8_t EEU_INIT = 79;
const uint8_t EEU_BLOQUER = 80;
const uint8_t EEU_OUVRIR = 81;

// Cuillère à miel (CM)
// Angle+ = [Sens?]
/*** TODO TBD ***/
const uint8_t CM_INIT = 79;
const uint8_t CM_RANGER = 80;
const uint8_t CM_LEVER = 81;
const uint8_t CM_TAPER_ABEILLE = 82;
const uint8_t CM_RELEVER = 83;

// Tri de l'eau (TRI)
// Angle + = [Sens ?]
/*** TODO TBD ***/
const uint8_t TRI_INIT = 79;
const uint8_t TRI_NEUTRE = 80;
const uint8_t TRI_EAU_PROPRE = 81;
const uint8_t TRI_EAU_USEE = 82;


// Variables et prototypes Servo
Servo servo_evacuation_eaux_usees; // au pluriel
Servo servo_cuillere_miel;
Servo servo_tri_eau;

uint8_t angle_evactuation_eaux_usees;
uint8_t angle_cuillere_miel;
uint8_t angle_tri_eau;

void piloter_evacuation_eaux_usees(uint8_t angle, bool doucement = false, bool log = true);
void piloter_cuillere_miel(uint8_t angle, bool doucement = false, bool log = true);
void piloter_tri_eau(uint8_t angle, bool doucement = false, bool log = true);


/** =====================================
  Programmes alternatifs (Homolog, Debug)
  ======================================= **/
  
/*  Programme de démonstration :
    Fait des allers-retours sur une table.
    Petite feinte au démarrage avec la funny action.
    
    Mettre à jour @RSE
*/
void demo_allers_retours() {
  
  ecran_console_reset();
  ecran_console_log("Demo\n\n");
  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n");

  bouton_start_down();
  ecran_console_log("Pret\n");

  minuteur_attendre(300);
  asserv_set_position(1000, 1000, 0);
  asserv_maintenir_position();

  bouton_wait_start_up();
  minuteur_demarrer();

  uint8_t error;

  aller_xy(1500, 1000, 30, 1, 10000, 15);

  // bras_position_croisiere();
  com_printfln("En attente");
  while(!robot.sickObstacle) {
    com_printfln("...");
    minuteur_attendre(100);
    robot.match_debut = millis();
  }
  com_printfln("Let's go !");
  /* gr_fusee_ouvrir();
  minuteur_attendre(600);
  gr_fusee_fermer();
  minuteur_attendre(400);
  gr_fusee_ouvrir();
  minuteur_attendre(400); */

  while(1) {
    robot.match_debut = millis();

    aller_xy(2000, 1000, 100, 1, 10000, 20);
    // prendre_minerais();
    aller_xy(1800, 1000, 100, 0, 10000, 20);
    aller_xy(1000, 1000, 100, 1, 10000, 20);
    minuteur_attendre(800);
    // positionner_deux_bras(POSITION_DEPOSER_BAS, false);
    minuteur_attendre(800);
    aller_xy(1200, 1000, 100, 0, 10000, 20);
    minuteur_attendre(800);
    // bras_position_croisiere();
  }
}


/* Programme d'homologation
  Faire au plus simple, éviter les marches arrière
*/
void homologation_gr() {
  uint8_t error;
  uint8_t tentatives = 0;

  ecran_console_reset();
  ecran_console_log("Homolog GR\n");

  if(robot.estVert) {
    ecran_console_log("Couleur : VERT\n");
  }
  else {
    ecran_console_log("Couleur : ORANGE\n");
  }

  ecran_console_log("\n\n");
  ecran_console_log("Les arbitres sont\n");
  ecran_console_log("hyper sympa cette\n");
  ecran_console_log("annee.\n\n");

  ecran_console_log("1. Positionner\n");
  minuteur_attendre(1500);
  match_gr_init_servos();
  
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  bouton_start_down();

  ecran_console_log("Pret\n\n");
  minuteur_attendre(200);

  
  asserv_set_position(900, 200, MATH_PI * -0.75);  // TBC
  asserv_maintenir_position();

  bouton_wait_start_up();

  minuteur_demarrer();

  minuteur_attendre(1000);

  asserv_go_toutdroit(-350, 3000);
  aller_xy(1150, 450, 100, 1, 20000, 10);


  aller_xy(1600, 450, 100, 1, 20000, 10);
  /*aller_pt_etape(PT_ETAPE_15, 100, 1, 20000, 10);
  aller_xy(1000, 1000, 100, 1, 20000, 10);
  aller_xy(1000, 250, 100, 1, 20000, 10);

  asserv_go_toutdroit(-400, 3000);*/

  // recuperer_module1();

  minuteur_attendre(2000);

  // recuperer_module5(false);

  minuteur_attendre_fin_match();
}


/* Programme de Debug, pour tester certaines fonctions.
  Départ automatique après 3+2 secondes. Penser à relever BAU.
*/
void debug_gr() {
  ecran_console_log("Debug GR\n\n");
  ecran_console_log("2 sec\n\n");

  minuteur_attendre(200);
  asserv_set_position(737, 1578, MATH_PI * -0.5);
  asserv_maintenir_position();
  minuteur_attendre(1800);

  minuteur_demarrer();

  minuteur_attendre(500);

  //asserv_rotation_vers_point(1500, 0, 3000);
  //bras_position_croisiere();

  com_printfln("Orientation 1 dans 3 sec");
  minuteur_attendre(3000);

  asserv_rotation_vers_point(737, 0, 3000);

  com_printfln("Baisser le bras dans 3 sec");
  minuteur_attendre(3000);
  /*if(robot.symetrie) {
    positionner_bras_gauche(POSITION_KNOCK_JAUNE, false);
  }
  else {
    positionner_bras_droit(POSITION_KNOCK_BLEU, false);
  }*/

  com_printfln("Orientation 2 dans 3 sec");
  minuteur_attendre(3000);

  asserv_rotation_vers_point(1500, 573, 2000); // Rotation (= "Knocker")

  com_printfln("Croisiere dans 3 sec");
  minuteur_attendre(3000);

  //bras_position_croisiere();

  tone_play_end();
}

// ============================================================
// Debut section Edition ATN/DKI
// ============================================================

/** =============
  Programme MATCH
  =============== **/
  
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
	  n - vider_REP
	  n - vider_REM
	  n - vider_REP_opp
	  n - vider_REM_opp
	  n - activer_panneau
      n - activer_abeille
	  n - constr_CUB1 (jusque ZOC)
	  n - degager_CUB2 (non défini TBC_ATN)
	  n - degager_CUB3 (hors STATION, chez STATION opp)

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
  ecran_console_log("Match GR\n");

  if(robot.estVert) {
    ecran_console_log("Couleur : VERT\n");
  }
  else {
    ecran_console_log("Couleur : ORANGE\n");
  }
  ecran_console_log("\n\n");

  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  ecran_console_log("Initialisation...");


  // Initialisation des variables de stratégie
  action_en_cours = 0; ////// ATTENTION, != 0 pour TESTS UNIQUEMENT
  bool gr_eau_propre_chargee = false; // Etat chargé/à vide
  bool gr_eau_usee_chargee = false; // Etat chargé/à vide
  bool tbl_panneau_allume = false;
  bool tbl_abeille_activee = false;
  bool tbl_REP_vide = false;
  bool tbl_REM_vide = false;
  bool tbl_REP_opp_vide = false;
  bool tbl_REM_opp_vide = false;


  minuteur_attendre(500);
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n\n");
  minuteur_attendre(200);
  asserv_set_position(886, 196, MATH_PI * -0.75); //TBC_ATN
  asserv_maintenir_position();
  bouton_wait_start_up();


  /** ============
    Début du match
    ============== **/

  minuteur_demarrer();
  minuteur_attendre(500); //TBC_RSE : ATN: pourquoi attendre ?
  asserv_go_toutdroit(-450, 5000); //TBC_ATN


  /**
	Stratégie de jeu 2018 GR seul [Niveau 1]:
	=========================================

	Visiter dans l'ordre :
	PANNEAU, REP, CHATEAU, ABEILLE, REM, degager CUB3, STATION, tout en évitant les cubes sur le chemin.
	Si le temps le permet, visiter :
	CUB 1, ZOC

	Gestion des erreurs :
	Si une action de mouvement est obstruée (max_tentatives = 3 atteint),
		aller à l'action suivante et retenter l'action précédente manquée à la fin.
	Si une action de mouvement vers une zone de dépôt (CHATEAU, STATION, ZOC) est obstruée (max_tentatives = 3 atteint),
		Si destination = CHATEAU
			aller à un point de retrait: Aller à [610;1540]
			puis aller à CHATEAU
		Si destination = STATION
			aller à un point de retrait: Aller à [400;840]
			puis aller à STATION
		Si destination = ZOC
			aller à un point de retrait: Aller à [850;1190]	directement, tourner sans reculer et mettre les cubes en vrac

	Coordonnées des points de passage pré-enregistrées.

	Stratégie de jeu 2018 GR seul [Niveau 2]:
	=========================================
	
	Choix dynamique de la prochaine action en fonction de l'espérance de points associé à chaque action.
	Anticiper les blocages par d'autres robots sur les itinéraires et l'intégrer au choix de la prochaine action.
	Intégrer la possibilité de se localiser sur le terrain avec les balises si GR perdu (définir conditions pour estimer que GR est perdu).
	Intégrer la vision de srécupérateurs par le SICK pour anticiper les erreurs de position.

	Stratégie de jeu 2018 GR seul [Niveau 3]:
	=========================================

	Intégrer la vision du jeu des robots adverses pour le choix des actions (comptage du temps passé des robots devant les récupérateurs).
	Vider les récupérateurs d'eau adverses.

	Coordonnées des points de passage gérées par le robot.

	Stratégie de jeu 2018 GR seul [Niveau 4]:
	=========================================

	Prévision du déplacement des robots adverses et intégration au choix de la prochaine action.

	
	Stratégie de jeu 2018 GR seul [Niveau 5]:
	=========================================

	Interruption d'une action en cours pour une autre action au cours du mouvement si l'espérance de points est modifiée.
	Evitement fluide des robots adverses.

  **/

  do {

    // [Prévision pour Stratégie Niveau 2 2017]
    //  Une fois les actions de base terminées, on passe à une autre boucle.

      /** =======================
		  Réalisation des actions
          ======================= **/

      /*Proposition stratégie 2018 v1 Antoine
		  0 - activer_panneau
		  1 - vider_REP (puis CHATEAU)
		  2 - activer_abeille
		  3 - vider_REM (puis degager CUB3 puis STATION)
		  4 - constr_CUB1
      */

	  //Nota : seules les actions primaires sont à instruire ici (prendre un élément), les autres actions (déposer l'élément, dégager un élément qui gêne) en découlent

      switch(action_en_cours) {
        case 0: error = activer_panneau(); break;
        case 1: error = vider_REP(); break;
        case 2: error = activer_abeille(); break;
        case 3: error = vider_REM(); break;
        case 4: error = constr_CUB1(); break;

        default:
          com_printfln("! ######### ERREUR : action_en_cours inconnue");
          error = ERROR_STRATEGIE;
      }

      if (error) {
        etat_actions[action_en_cours][1] = 1; // Enregistrement de l'erreur
        com_printfln(":: Echec sur action %d ::", action_en_cours);
      }
      else {
        etat_actions[action_en_cours][0] = 1; // Enregistrement de la visite
        com_printfln(":: Action %d terminee ::", action_en_cours);
      }

      /** =============================
          Dépose des éléments collectés
          ============================= **/

	  //while(gr_eau_propre_chargee) {}  //TBD_ATN
	  //while(gr_eau_usee_chargee) {} //TBD_ATN

	   /*2017 pour mémoire 
      while(gr_minerais_charges) {
		  
        error = deposer_minerais_zone_depot(false);

        if (error) {
          // Minerais pas déposés : on se déplace à un point de secours pour revenir à la boucle while suivante
          com_printfln("Echec de la dépose. En route vers point de secours.");

          if (robot.xMm > 600 && robot.yMm < 1400) {
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
          com_printfln("Minerais déposés.");
        }

      }
	  */

      /** ========
        Et après ?
        ========== **/
      // Recherche de l'action suivante parmi les points de collecte non visités (etat_actions[id][0] == 0)

      nb_iterations = 0; // Pour éviter la boucle infinie
      do {
        action_en_cours++;
        if (action_en_cours >= nombre_actions) {
          action_en_cours = 0;
        }
        nb_iterations++;
      } while(etat_actions[action_en_cours][0] == 1 && nb_iterations <= nombre_actions);

        // tant qu'on n'a pas trouvé un point de collecte non visité, ET qu'on n'a pas parcouru toutes les actions possibles 1 fois
        // En stratégie Niveau 1 2017, le <= plutôt que < est volontaire :
        //    Si toutes les actions sont visitées (etat_actions[][0] à 1),
        //    la boucle finira avec action_en_cours = action_en_cours + 1
        //    On recommencera donc des actions déjà accomplies (sait-on jamais, on en a peut-être oublié ?)
        // En stratégie Niveau 2 2017, mettre <


    // [Prévision pour stratégie Niveau 2 2017]
    // } // Fin du while() niveau 1

  } while (minuteur_temps_restant() > 500 && nb_iterations <= nombre_actions); // pas assez de temps pour commencer autre chose
  // --- 2ème condition ajoutée déc 2017 pour éviter boucle infinie sur le simulateur

  minuteur_attendre_fin_match(); // les actions de fin (funny action, buzzer, afficheur) démarrent à la fin du minuteur
}


/* Points étapes et orientations à viser pour initialiser les actions // MAJ TBD_ATN
PCD1  : pt4;  viser x = 650;  y = 540;
PCD2  : pt7;  viser x = 650;  y = 540;
PCL   : pt14; viser x = 1070; y = 1870;
GCC1  : pt10; viser x = 0;    y = 2000;
GCC2  : pt14; viser x = 0;    y = 2000;
Depot : pt7;  viser x = 80;   y = 0;
M2knk : pt14; viser x = 737;  y = 0;
Fdep  : pt15; /
*/

/* Déplacements pour les actions // MAJ TBD_ATN
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


/** ==============
    Actions de jeu
    ============== **/

/* Actions 2018

Fonction					=> note si succès
-------------------------------------------------------------
uint8_t vider_REP()			=> tbl_REP_vide = true;
uint8_t vider_REM()			=> tbl_REM_vide = true;
uint8_t vider_REP_opp()		=> tbl_REP_opp_vide = true;
uint8_t vider_REM_opp()		=> tbl_REM_opp_vide = true;

uint8_t deposer_chateau()	=> gr_eau_propre_chargee = false;
uint8_t deposer_station()	=> gr_eau_usee_chargee = false;

uint8_t activer_panneau()	=> tbl_panneau_allume = true;
uint8_t activer_abeille()	=> tbl_abeille_activee = true;

uint8_t constr_CUB1() (jusque ZOC)
uint8_t degager_CUB2() (non défini TBC_ATN)
uint8_t degager_CUB3() (hors STATION, chez STATION opp)

*/


/* Actions 2017 pour mémoire

uint8_t recuperer_minerais_gcc10() {
  uint8_t error;

  com_printfln("----- Minerais GCC10 -----");

  // Initialisation de l'action

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_10, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;
  com_printfln("GCC10 atteint.");

  // Réalisation de l'action
  error = aller_xy(350, 1440, VITESSE_A_VIDE, 1, 3000, 3); // S'approche du cratère
  error = asserv_rotation_vers_point(0, 2000, 2000); // S'oriente correctement

  error = prendre_minerais();
  gr_minerais_charges = true;
  com_printfln("Minerais charges");

  // Dégagement
  error = aller_pt_etape(PT_ETAPE_10, VITESSE_CHARGE, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés.

  return OK;
}

uint8_t deposer_minerais_zone_depot(bool avec_robot_secondaire) {
  uint8_t error;

  com_printfln("----- Deposer vers depot -----");


  // En route vers dépôt
  com_printfln("En route vers Depot.");
  error = aller_pt_etape(PT_ETAPE_7, VITESSE_CHARGE, 1, 9000, 3);
  if(error) return error;

  com_printfln("Depot atteint.");



  // Début du dépôt dans la zone de départ
  // Vitesse ralentie (80) pour éviter de cogner partout
  if(avec_robot_secondaire) {
    // Approche
    positionner_deux_bras(POSITION_APPROCHE_DEPOT_HAUT, false);
    error = aller_xy(240, 550, 80, 1, 2000, 2);

    if(error) {
      com_printfln("! Recalage impossible");
    }
    else {
      com_printfln("Recalage");
      aller_xy(240, 0, VITESSE_LENTE, 1, 2000, 3); // Recalage bordure
      asserv_set_position(240, 480, MATH_PI * -0.5);
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

    //error = asserv_rotation_vers_point(210, 0, 2000);
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

  com_printfln("----- Knocker Module 2 -----");


  // Déplacement vers base lunaire
  com_printfln("En route vers la base lunaire, module 2.");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_14, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return error;

  com_printfln("Base lunaire, module 2 atteint.");


  if(robot.symetrie) {
    // Approche
    error = aller_xy(737, 1578, VITESSE_A_VIDE, 1, 8000, 3);
    if(error) return error;

    error = asserv_rotation_vers_point(737, 0, 3000);
    //if(error) return error;
    positionner_bras_gauche(POSITION_KNOCK_JAUNE, false);

    error = asserv_rotation_vers_point(1500, 573, 2000); // Rotation (= "Knocker")
    // Pas de retour d'erreur (sinon nécessite de connaître l'angle du robot lors de l'erreur)
  }
  else {
    error = aller_xy(760, 1556, VITESSE_A_VIDE, 1, 8000, 3);
    if(error) return error;

    error = asserv_rotation_vers_point(760, 0, 3000);
    positionner_bras_droit(POSITION_KNOCK_BLEU, false);

    error = asserv_rotation_vers_point(1500, 573, 2000); // Rotation (= "Knocker")
  }

  bras_position_croisiere();

  // Dégagement
  // La position de fin a une marge autour permettant une rotation vers une nouvelle destination.

  return OK;
}

uint8_t recuperer_module1() {
  // Gestion des erreurs :
  // si l'action échoue et que l'on part sur une autre action, on ne sait pas où sera le module sur la table
  // => Inutile de la refaire.
  // On renvoie donc OK même s'il y a une erreur

  uint8_t error;

  com_printfln("----- Recuperer Module 1 -----");

  // Initialisation de l'action
  com_printfln("Je vais récupérer le module 1. Taiaut !");

  bras_position_croisiere();

  error = aller_pt_etape(PT_ETAPE_15, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return OK;


  // Réalisation de l'action
  error = aller_xy(1070, 854, VITESSE_A_VIDE, 1, 8000, 3);
  if(error) return OK;

  // error = asserv_rotation_vers_point(1000, 600, 1000);
  // if(error) return OK;

  error = aller_xy(920, 320, VITESSE_LENTE, 1, 8000, 3);
  if(error) return OK;


  com_printfln("Module 1 dans la zone de départ !");

  // Dégagement
  asserv_go_toutdroit(-400, 2000);

  return OK;
}

// Action à réaliser avant toute extraction de minerais.
// Une visite de P8 (où se trouve aussi Module 5) rendrait inutile cette action.
uint8_t recuperer_module5(bool prendre_minerais_gcc_au_passage) {
  uint8_t error;
  // Retrait de la gestion des erreurs : si l'action échoue et que l'on part sur une autre action, on ne sait pas où sera le module sur la table => Inutile à refaire.

  com_printfln("----- Recuperer Module 5 -----");
  if(prendre_minerais_gcc_au_passage) {
    com_printfln("en prenant qq minerais au passage !");
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
    com_printfln("Minerais charges");

    error = aller_xy(490, 1455, VITESSE_CHARGE, 0, 3000, 3);
  }

  error = aller_xy(320, 1200, VITESSE_A_VIDE, 1, 10000, 3);
  if(error) return OK;

  // error = asserv_rotation_vers_point(500, 1100, 3000);
  // if(error) return OK;

  error = aller_xy(920, 856, VITESSE_LENTE, 1, 10000, 3);
  if(error) return OK;

  // error = asserv_rotation_vers_point(920, 0, 3000);
  // if(error) return OK;

  // TBD Faire une rotation lente si possible
  error = aller_xy(920, 320, VITESSE_LENTE, 1, 10000, 3);
  if(error) return OK;

  asserv_go_toutdroit(-400, 2000);

  com_printfln("Fin du déplacement pour Module 5 dans la zone de départ.");

  // Dégagement
  // La position de fin a une marge autour permettant une rotation vers une nouvelle destination.

  return OK;
}

uint8_t degager_module5() { //Action de préparation du terrain : évacuation des modules lunaires de la piste de déplacement
  // A lancer après recuperer_module1(). Une visite de (800;950) avant pousserait le module 1 qui deviendrait irrécupérable.
  uint8_t error;

  com_printfln("----- Degager Module 5 -----");

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
*/


uint8_t activer_panneau() {
  return OK;
}
uint8_t vider_REP() {
  return OK;
}
uint8_t activer_abeille() {
  return OK;
}
uint8_t vider_REM() {
  return OK;
}
uint8_t constr_CUB1() {
  return OK;
}


/** =============
  Actions de base
  =============== **/

void match_gr_arret() {
  com_printfln("On stoppe les moteurs");
  asserv_consigne_stop();

  // ATN: afficher score final. J'ai enlevé le lancement de la funny action de 2017.
  
  tone_play_end();
}
  
  
  // TODO RSE
  
// Il faudrait prévoir les fonctions suivantes pour les actionneurs :
// vider_REP()
// vider_REM()
// vider_REP_opp()
// vider_REM_opp() (attention, séquence des balles opposée)

/*uint8_t prendre_minerais() {
  positionner_bras_gauche(POSITION_RECOLTER, false);
  positionner_bras_droit(POSITION_RECOLTER, false);
  minuteur_attendre(500);
  positionner_bras_droit(POSITION_CROISIERE, true);
  positionner_bras_gauche(POSITION_CROISIERE, true);

  return OK;
}
*/



// ============================================================
// Fin section Edition ATN/DKI
// ============================================================


/** =======================
  Positionnement des Servos
  ========================= **/
  
/* Voir commentaire général sur les Servos dans la section Définition
    @2019 : créer une classe ServoWRD
    [Pas fait 2018, doute sur implémentation d'une liste de constantes pré-définies]
*/

void match_gr_init_servos() {
  com_printfln("Initialisation des servos");
  
  // Ne jamais utiliser doucement pendant l'init
  piloter_evacuation_eaux_usees(EEU_INIT);
  piloter_cuillere_miel(CM_INIT);
  piloter_tri_eau(TRI_INIT);
}
  
  
void piloter_evacuation_eaux_usees(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_evacuation_eaux_usees, angle_evactuation_eaux_usees, angle);
  }
  else {
    servo_evacuation_eaux_usees.write(angle);
  }
  
  if(log) {
    com_print("Evacuation des eaux usées : ");
    switch(angle) {
      case EEU_INIT: com_printfln("Init"); break;
      case EEU_BLOQUER: com_printfln("Bloquee"); break;
      case EEU_OUVRIR: com_printfln("Ouverte"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}

void piloter_cuillere_miel(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_cuillere_miel, angle_cuillere_miel, angle);
  }
  else {
    servo_cuillere_miel.write(angle);
  }
  
  if(log) {
    com_print("Cuillere a miel : ");
    switch(angle) {
      case CM_INIT: com_printfln("Init"); break;
      case CM_RANGER: com_printfln("Rangée"); break;
      case CM_LEVER: com_printfln("Levée"); break;
      case CM_TAPER_ABEILLE: com_printfln("Bzzz"); break;
      case CM_RELEVER: com_printfln("Relevée"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}


void piloter_tri_eau(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_tri_eau, angle_tri_eau, angle);
  }
  else {
    servo_tri_eau.write(angle);
  }
  
  if(log) {
    com_print("Tri : ");
    switch(angle) {
      case TRI_INIT: com_printfln("Init"); break;
      case TRI_NEUTRE: com_printfln("Neutre"); break;
      case TRI_EAU_PROPRE: com_printfln("Eau propre"); break;
      case TRI_EAU_USEE: com_printfln("Eau usee"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}


/** ==============================
  Initialisation des données robot
  ================================ **/

void gr_init() {
  robot.IS_PR = false; // première instruction dès que possible avant menu, match, etc
  
  // Valeurs GR2016 = GR2018
  robot.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 3 mai gr
  robot.ASSERV_COEFF_TICKS_PAR_RADIAN = 3404.0f; // 4 mai gr
  robot.ASSERV_DISTANCE_KP = 0.1f;
  robot.ASSERV_DISTANCE_KD = 0.8f;
  robot.ASSERV_ROTATION_KP = 0.1f;
  robot.ASSERV_ROTATION_KD = 1.8f;

  // Actionneurs à init
  servo_evacuation_eaux_usees.attach(29); // TBD_RSE
  servo_cuillere_miel.attach(30); //TBD_RSE
  servo_tri_eau.attach(31); //TBD_RSE

}
