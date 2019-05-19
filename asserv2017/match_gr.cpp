#include "asserv2017.h"
#include "match.h"

/** Dans ce fichier, plus on descend, plus on va dans le bas niveau **/

/** ============================================
  Déclarations constantes, variables, prototypes
  ============================================== */
void gr_test_deplacements();

uint8_t gr_jouer_action(int action);
int gr_nb_tentatives[NB_ACTIONS] = { 0 };


uint8_t gr_pousser_atome(uint8_t atome);

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

  if(robot.estJaune) {
    ecran_console_log("Couleur : JAUNE\n");
  }
  else {
    ecran_console_log("Couleur : VIOLET\n");
  }

  ecran_console_log("\n\n");
  ecran_console_log("Les arbitres sont\n");
  ecran_console_log("hyper sympa cette\n");
  ecran_console_log("annee.\n\n");
  
  ledMatrix_defiler_texte("Les arbitres sont tres sympa cette annee");

  ecran_console_log("1. Positionner\n");
  minuteur_attendre(1500);
  gr_init_servos();
  score_definir(0);
  
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  bouton_start_down();

  ecran_console_log("Pret\n\n");
  minuteur_attendre(200);

  /*
  TODO 2019
  */

  minuteur_attendre_fin_match();
}


/* Programme de Debug, pour tester certaines fonctions.
  Départ automatique après 3+2 secondes. Penser à relever BAU.
*/
void debug_gr() {
  ecran_console_log("Debug GR\n\n");
  ecran_console_log("2 sec\n\n");

  
  minuteur_attendre(200);
  asserv_set_position(1500, 1000, 0);
  asserv_maintenir_position();
  delay(2000);
  

  minuteur_demarrer();
  asserv_go_toutdroit(200, 3000);

  return;
  
  //asserv_go_xy(1500, 800, 2000, 1);

  
  

  //asserv_rotation_vers_point(1500, 0, 3000);
  //bras_position_croisiere();

  com_printfln("Orientation 1 dans 3 sec");
  minuteur_attendre(3000);

  asserv_rotation_vers_point(0, 1000, 3000);


  com_printfln("Orientation 2 dans 3 sec");
  minuteur_attendre(3000);

  asserv_rotation_vers_point(1500, 0, 2000);

  com_printfln("En bas dans 3 sec");
  minuteur_attendre(3000);

  asserv_rotation_vers_point(1500, 2000, 2000);

  com_printfln("Droite dans 3 sec");

  minuteur_attendre(3000);
  asserv_rotation_vers_point(3000, 1000, 3000);
  tone_play_end();
}


void test1_gr() {
  
  const uint32_t ATTENTE_ENTRE_BALLES = 800; 

  
  /*
  
    com_printfln("---- En attente ----");
    bouton_wait_start_up();
    asserv_set_position(150, 500, 0);
    asserv_maintenir_position();
    
    asserv_go_toutdroit(300, 2000);
    
    //gr_jouer_action(ACTION_VIDER_REP);
    gr_jouer_action(ACTION_VIDER_REM_OPP);
    gr_jouer_action(ACTION_DEPOSER_STATION);
    */
    
  
  while(1) {
    delay(500);
    score_definir(225);
    
    delay(2000);
    score_incrementer(25);
    
    delay(2000);
    ledMatrix_indiquer_obstacle();
    score_incrementer(-50);
    
    delay(2000);
    ledMatrix_defiler_texte("Bonne nuit !");
    
    delay(2000);
    ledMatrix_afficher_score();
    ledMatrix_indiquer_obstacle();
    
    delay(2000);
    ledMatrix_afficher_WRD();
    
    delay(2000);
    ledMatrix_effacer();
  }
}

void gr_test_deplacements() {
  
  asserv_set_position(150, 450, 0);
  
  aller_pt_etape(PT_ETAPE_1, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_2, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_3, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_4, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_5, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_6, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_7, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_9, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_10, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B1, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B2, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B3, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B4, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B5, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B6, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B7, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B8, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B9, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B10, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B11, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B12, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_11B13, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_12, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_13, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_14, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_15, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_16, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_16B, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_17, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_18, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_19, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_19B, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B1, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B2, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B3, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B4, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B5, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B6, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B7, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B8, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B9, VITESSE_RAPIDE, 1, 10000, 5);
  aller_pt_etape(PT_ETAPE_20B10, VITESSE_RAPIDE, 1, 10000, 5);
}

/** =============
  Programme MATCH
  =============== **/
  
void match_gr() {
  int start;
  uint8_t error;

  
  ecran_console_reset();


  /** ==========================
    Préparation & Initialisation
    ============================ **/

  ecran_console_reset();
  ecran_console_log("Match GR\n");

  if(robot.estJaune)
    ecran_console_log("Couleur : JAUNE\n");
  else
    ecran_console_log("Couleur : VIOLET\n");
  ecran_console_log("\n\n");

  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  ecran_console_log("Initialisation...");

  // Variables de stratégie
  int action;
  int nb_iterations = 0;
  int strategie = 1;
  
  
  
  
  return gr_test_deplacements();
  
  int phase1[] = {
    /*2018
    //ACTION_ALLUMER_PANNEAU, (PR)
    //ACTION_VIDER_REP,
    //ACTION_DEPOSER_CHATEAU,
    //ACTION_VIDER_REM,
    //ACTION_DEPOSER_STATION,
    //ACTION_RAPPORTER_CUB2, (j'y crois pas)
    //ACTION_DEPOSER_CHATEAU,
    //ACTION_DEPOSER_STATION,
    ACTION_RAPPORTER_CUB1,
    ACTION_OUVRIR_REP,
    ACTION_ACTIVER_ABEILLE
    //ACTION_VIDER_REM_OPP,
    //ACTION_DEPOSER_STATION
    //ACTION_DEPOSER_CHATEAU
    */
    // As-tu bien retiré la virgule sur la dernière ligne ?
  };
  int len_phase1 = sizeof(phase1) / sizeof(action);
  
  bool activer_phase2 = true;
  int phase2[] {
    /*2018
    //ACTION_VIDER_REP_OPP,
    ACTION_VIDER_REM_OPP,
    ACTION_DEPOSER_STATION
    //ACTION_DEPOSER_STATION,
    //ACTION_DEPOSER_CHATEAU
    */
    // As-tu bien retiré la virgule sur la dernière ligne ?
  };
  int len_phase2 = sizeof(phase2) / sizeof(action);
  
  gr_init_servos();


  minuteur_attendre(500);
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n\n");
  minuteur_attendre(200);
  
  /*2018
  // Démarrage en pi = Problème !
  //if(robot.estJaune)
    asserv_set_position(250, 500, 0);
  /*else
    asserv_set_position(150, 500, MATH_PI); // Pi => 0 après application de la symétrie
    */

  asserv_set_position(150, 450, 0); //2019 GR calé dans Tab_Rd en première idée


  asserv_maintenir_position();
  bouton_wait_start_up();
  

  /** ------------
    Début du Match
    ------------- **/

  minuteur_demarrer();
  minuteur_attendre(500); //TBC_RSE : ATN: pourquoi attendre ?
  score_definir(0);
  
  //if(robot.estJaune)
    asserv_go_toutdroit(300, 10000);
  /*else
    asserv_go_toutdroit(-400, 10000);*/
    
  //aller_xy(500, 500, VITESSE_RAPIDE, 1, 5000, 30);
  
  
  // Init scores
  score_incrementer(5); // Dépose Expérience => 5 points
  score_incrementer(0); // Score attendu PR à définir
    

  /**
	Stratégie de jeu 2019 GR seul [Niveau 1]:
	=========================================

  Réaliser dans l'ordre :
	1/ ACTIVER_EXPERIENCE
  2/ CLASSER_ATOMES_TABLEAU, tout en évitant les atomes sur le chemin.
  3/ Prendre les atomes du grand distributeur de notre côté, tout en évitant les atomes sur le chemin.
  4/ Pousser les atomes de la Z_Chaos de notre côté vers Tab_Rd
  5/ ACTIVER_ADP
  6/ PRENDRE_GOLDENIUM
  7/ DEPOSE_BALANCE, dépose du goldenium (en haut de la pile), et des atomes les plus lourds notre grand distributeur (en premier temps je propose de filtrer les Redium que l'on gardera pour l'ADP)
  8/ Prendre les atomes de notre petit distributeur
  9/ DEPOSE_BALANCE, dépose des atomes restants jusqu'à atteindre 6 atomes dans la balance
  10/ DEPOSE_ADP, déposer les atomes restants dans l'ADP

	Gestion des erreurs :
	Si une action de mouvement est obstruée (max_tentatives = 3 atteint),
		aller à l'action suivante et retenter l'action précédente manquée à la fin.
	Si une action de mouvement vers une zone de dépôt (DEPOSE_BALANCE) est obstruée (max_tentatives = 3 atteint),
			aller à un point de retrait : Aller à p15
			puis aller à BALANCE

	Coordonnées des points de passage pré-enregistrées.

	Stratégie de jeu [Niveau 2]:
	=========================================
	
	Choix dynamique de la prochaine action en fonction de l'espérance de points associé à chaque action.
	Anticiper les blocages par d'autres robots sur les itinéraires et l'intégrer au choix de la prochaine action.
	Intégrer la possibilité de se localiser sur le terrain avec les balises si GR perdu (définir conditions pour estimer que GR est perdu).
	Intégrer la vision de srécupérateurs par le SICK pour anticiper les erreurs de position.

	Stratégie de jeu [Niveau 3]:
	=========================================

	Intégrer la vision du jeu des robots adverses pour le choix des actions (comptage du temps passé des robots devant les récupérateurs).
	Vider les récupérateurs d'eau adverses.

	Coordonnées des points de passage gérées par le robot.

	Stratégie de jeu [Niveau 4]:
	=========================================

	Prévision du déplacement des robots adverses et intégration au choix de la prochaine action.

	
	Stratégie de jeu [Niveau 5]:
	=========================================

	Interruption d'une action en cours pour une autre action au cours du mouvement si l'espérance de points est modifiée.
	Evitement fluide des robots adverses.

  **/

  /** ----------------------------------
    Bouclage sur les actions principales
    ------------------------------------ **/
    
  com_printfln("=== Phase 1 ===");
    
  action = len_phase1;
  while(1) {
    
    #ifdef __EMSCRIPTEN__
    nb_iterations++;
    if(nb_iterations > 50) {
      com_printfln("! #### BOUCLE INFINIE ? ###");
      break;
    }
    #endif
  
  
    action++;
    if(action >= len_phase1) {
      action = 0;
      com_printfln("=== (1) On boucle ===");
    }

    gr_jouer_action(phase1[action]);

    
    // Est-ce qu'on doit continuer à faire des trucs ?
    
    /*2018
    if(abeille_activee
    && REP_vide
    && gr_CUB_dans_ZOC[1]) {
      
      nb_iterations = 0;
      while(1) {
        #ifdef __EMSCRIPTEN__
        nb_iterations++;
        if(nb_iterations > 50) {
          com_printfln("! #### BOUCLE INFINIE ? ###");
          break;
        }
        #endif
        
        // Plus rien à évacuer ?
        gr_jouer_action(ACTION_DEPOSER_CHATEAU);
        gr_jouer_action(ACTION_DEPOSER_STATION);
        
        if(/*nb_balles_eau_propre_dans_gr == 0
        &&*/ /*nb_balles_eau_usee_dans_gr == 0) {
          break;
        }
        
      }
          
    break;
        
    }
    */
    
  } // Fin de la première partie !
  
  
  // Allons chez l'adversaire...
  com_printfln("=== Phase 2 ===");
  if(activer_phase2) {
    nb_iterations = 0;
    action = len_phase2;
    while(1) {
      
      #ifdef __EMSCRIPTEN__
      nb_iterations++;
      if(nb_iterations > 50) {
        com_printfln("! #### BOUCLE INFINIE ? ###");
        break;
      }
      #endif
      
      
      action++;
      if(action >= len_phase2) {
        action = 0;
        
        com_printfln("=== (2) On boucle ===");
      }

      gr_jouer_action(phase2[action]);
      
      /*2018
      if(REM_opp_vide
      && nb_balles_eau_usee_dans_gr == 0) {
        /*
        if(nb_balles_eau_usee_dans_gr == 0) {
          break;
        }*/
        
        /*break;
      }
      */
      
    }
    
    /*2018
    gr_deposer_station(true);
    */
  } // activer_phase2
  /*2018
  piloter_evacuation_eaux_usees(EEU_OUVRIR);
  */

  minuteur_attendre_fin_match();
}


/** ==============
    Actions de jeu
    ============== **/

/* Actions 2018

Fonction					=> note si succès
-------------------------------------------------------------
uint8_t vider_REP()			=> REP_vide = true;
uint8_t vider_REM()			=> REM_vide = true;
uint8_t vider_REP_opp()		=> REP_opp_vide = true;
uint8_t vider_REM_opp()		=> REM_opp_vide = true;
    => Et aussi nb_balles_eau_(propre|usee)_dans_robot > 0

uint8_t deposer_chateau()	=> nb_balles_eau_propre_dans_gr = 0;
uint8_t deposer_station()	=> nb_balles_eau_usee_dans_gr = 0;

uint8_t allumer_panneau()	=> gr_panneau_allume = true;
uint8_t activer_abeille()	=> abeille_activee = true;

uint8_t constr_CUB0() (jusque ZOC)
uint8_t degager_CUB1() (non défini TBC_ATN)
uint8_t degager_CUB2() (hors STATION, chez STATION opp)

*/    

uint8_t gr_jouer_action(int action) {
  
  uint8_t error;

  switch(action) {
    case ACTION_POUSSER_ATOME0:           error = gr_pousser_atome(0); break;
    case ACTION_POUSSER_ATOME1:           error = gr_pousser_atome(1); break;
    case ACTION_POUSSER_ATOME2:           error = gr_pousser_atome(2); break;
    case ACTION_POUSSER_ATOMES_CHAOS:     error = gr_pousser_atome(3); break;
    case ACTION_POUSSER_ATOMES_CHAOS_B:   error = gr_pousser_atome(4); break;
    default:
      com_printfln("GR ne peut pas faire l'action %d", action);
      error = ERROR_PARAMETRE;
  }
  
  com_err2str(error);
  if(error) {
    if(error == ERROR_PLUS_RIEN_A_FAIRE) return OK;
  }
  
  return error;
}

uint8_t gr_pousser_atome(uint8_t atome) {
  uint8_t error;
  
  if(atome > 4) return ERROR_PARAMETRE;
  
  // TODO : Ranger la pelle et/ou la bar de faire ?
  
  error = pousser_atome(atome);
  
  // TODO : Rétablir des servos ?
  
  if(error != ERROR_PLUS_RIEN_A_FAIRE) {
    switch(atome) {
      case 0: gr_nb_tentatives[ACTION_POUSSER_ATOME0]++; break;
      case 1: gr_nb_tentatives[ACTION_POUSSER_ATOME1]++; break;
      case 2: gr_nb_tentatives[ACTION_POUSSER_ATOME2]++; break;
      case 3: gr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS]++; break;
      case 4: gr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS_B]++; break;
    }
  }
  
  return error;
}




/** =============
  Actions de base
  ===============   
  
  Il s'agit d'actions effectuées par le robot, appelées surtout par les actions de jeu.
**/



void match_gr_arret() {
  asserv_consigne_stop();
  com_printfln("! On stoppe les moteurs");
  
  /*2018
  piloter_evacuation_eaux_usees(EEU_OUVRIR);
  */

  // ATN: afficher score final. J'ai enlevé le lancement de la funny action de 2017.
  
  tone_play_end();
}



/** ==============================
  Initialisation des données robot
  ================================ **/

void gr_init() {
  robot.IS_PR = false; // première instruction dès que possible avant menu, match, etc
  
  // Valeurs GR2016 = GR2018
  robot.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 3 mai gr
  robot.ASSERV_COEFF_TICKS_PAR_RADIAN = 3404.0f; // 4 mai gr
  /*robot.ASSERV_DISTANCE_KP = 0.1f;
  robot.ASSERV_DISTANCE_KD = 0.8f;
  robot.ASSERV_ROTATION_KP = 0.1f;
  robot.ASSERV_ROTATION_KD = 1.8f;*/

  /* GR2018 : Essais de réglage au 11/05/2018
  robot.ASSERV_DISTANCE_KP = 0.1f;
  robot.ASSERV_DISTANCE_KD = 0.8f;
  robot.ASSERV_ROTATION_KP = 0.2f;
  robot.ASSERV_ROTATION_KD = 2.2f;
  */

  // GR2018 : Màj paramètres asserv du 29/05/2018
  robot.ASSERV_DISTANCE_KP = 0.06f;
  robot.ASSERV_DISTANCE_KD = 0.3f;
  robot.ASSERV_ROTATION_KP = 0.06f;
  robot.ASSERV_ROTATION_KD = 0.4f;
  
  
  robot.DISTANCE_DETECTION = 500; // mm 9/05/2018
  
  robot.pwm_max_distance = 127; // 40 Tres_lent ; 90 intermédiaire
  robot.pwm_max_rotation = 50;
  
  
  // Actionneurs à init  
  gr_attach_servos();
  
  gr_init_servos();
}
