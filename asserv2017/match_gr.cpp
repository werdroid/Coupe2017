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
    CUB0    : groupe de cubes (modules de constructions de batiments HQE) à l'emplacement 1 centré sur [850;540]
    CUB1    : groupe de cubes à l'emplacement 2 centré sur [300;1190]
    CUB2    : groupe de cubes à l'emplacement 3 centré sur [1100;1500]
    CUB0_opp : idem CUB0 par symétrie
    CUB1_opp : idem CUB1 par symétrie
    CUB2_opp : idem CUB2 par symétrie
    ZOC     : Zone de Construction des batiments HQE
  
  
  Dans le robot
    EEU   : Evacuation des Eaux Usees
    CM    : Cuillère à Miel
*/

/** ============================================
  Déclarations constantes, variables, prototypes
  ============================================== */


void gr_init_servos();
uint8_t gr_jouer_action(int action);
uint8_t gr_allumer_panneau();
uint8_t gr_vider_REP();
uint8_t gr_vider_REM();
uint8_t gr_vider_REP_opp();
uint8_t gr_vider_REM_opp();
uint8_t gr_activer_abeille();
uint8_t gr_deposer_chateau();
uint8_t gr_deposer_station();
uint8_t gr_rapporter_CUB(int cub);

int gr_nb_tentatives[NB_ACTIONS] = { 0 };

// Variables d'état de jeu
int nb_balles_eau_propre_dans_gr = 0;
int nb_balles_eau_usee_dans_gr = 0;
bool gr_panneau_allume = false;
bool abeille_activee = false;
bool REP_vide = false;
bool REM_vide = false;
bool REP_opp_vide = false;
bool REM_opp_vide = false;
bool gr_a_bouge_CUB[3] = { false };
bool gr_CUB_dans_ZOC[3] = { false };

Point gr_pt_CUB[3] = {{850, 540}, {300, 1190}, {1100, 1500}};


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
      ! Toutes les valeurs doivent être différentes
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
const uint8_t CM_INIT = 79; //ATN: = position ranger ?
const uint8_t CM_BAISSER = 81; //ATN: modifié LEVER à BAISSER.
const uint8_t CM_TAPER_ABEILLE = 82;
const uint8_t CM_RELEVER = 83;
const uint8_t CM_RANGER = 80;

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

  
  asserv_set_position(150, 500, 0);
  asserv_maintenir_position();

  bouton_wait_start_up();

  minuteur_demarrer();
  
  minuteur_attendre(900);
  
  ledMatrix_defiler_texte("Les arbitres sont tres sympa cette annee");
  asserv_go_toutdroit(100, 30000);
  
  gr_activer_abeille();

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


void test1_gr() {
  while(1) {
    delay(500);
    score_definir(225);
    
    delay(2000);
    score_incrementer(25);
    
    delay(2000);
    score_incrementer(-50);
    
    delay(2000);
    ledMatrix_defiler_texte("Bonne nuit !");
    
    delay(2000);
    ledMatrix_afficher_score();
    
    delay(2000);
    ledMatrix_afficher_WRD();
    
    delay(2000);
    ledMatrix_effacer();
  }
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

  if(robot.estVert)
    ecran_console_log("Couleur : VERT\n");
  else
    ecran_console_log("Couleur : ORANGE\n");
  ecran_console_log("\n\n");

  ecran_console_log("1. Positionner\n");
  ecran_console_log(" . Retirer tasseaux\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  ecran_console_log("Initialisation...");

  // Variables de stratégie
  int action;
  int nb_iterations = 0;
  int strategie = 1;
  
  int phase1[] = {
    ACTION_ALLUMER_PANNEAU,
    ACTION_VIDER_REP,
    ACTION_DEPOSER_CHATEAU,
    ACTION_ACTIVER_ABEILLE,
    ACTION_VIDER_REM,
    ACTION_DEPOSER_STATION,
    ACTION_RAPPORTER_CUB2,
    ACTION_DEPOSER_CHATEAU,
    ACTION_DEPOSER_STATION,
    ACTION_RAPPORTER_CUB1,
    ACTION_DEPOSER_CHATEAU,
    ACTION_RAPPORTER_CUB0
    // AS-tu bien retiré la virgule sur la dernière ligne ?
  };
  int len_phase1 = sizeof(phase1) / sizeof(action);
  
  int phase2[] {
    ACTION_VIDER_REP_OPP,
    ACTION_DEPOSER_STATION,
    ACTION_VIDER_REM_OPP,
    ACTION_DEPOSER_STATION,
    ACTION_DEPOSER_CHATEAU
    // AS-tu bien retiré la virgule sur la dernière ligne ?
  };
  int len_phase2 = sizeof(phase2) / sizeof(action);
  
  gr_init_servos();
  score_definir(0);


  minuteur_attendre(500);
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n\n");
  minuteur_attendre(200);
  asserv_set_position(886, 196, MATH_PI * -0.75); //TBC_ATN
  asserv_maintenir_position();
  bouton_wait_start_up();
  

  /** ------------
    Début du Match
    ------------- **/

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

  /** ----------------------------------
    Bouclage sur les actions principales
    ------------------------------------ **/
    
  com_printfln("=== Phase 1 ===");
    
  action = len_phase1;
  while(1) {
    
    #ifdef __EMSCRIPTEN__
    nb_iterations++;
    if(nb_iterations > 50) {
      com_printfln("#### BOUCLE INFINIE ? ###");
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
    if(gr_panneau_allume
    && abeille_activee
    && REP_vide
    && REM_vide
    && gr_CUB_dans_ZOC[0]
    && gr_CUB_dans_ZOC[1]
    && gr_CUB_dans_ZOC[2]) {
      
      nb_iterations = 0;
      while(1) {
        #ifdef __EMSCRIPTEN__
        nb_iterations++;
        if(nb_iterations > 50) {
          com_printfln("#### BOUCLE INFINIE ? ###");
          break;
        }
        #endif
        
        // Plus rien à évacuer ?
        gr_jouer_action(ACTION_DEPOSER_CHATEAU);
        gr_jouer_action(ACTION_DEPOSER_STATION);
        
        if(nb_balles_eau_propre_dans_gr == 0
        && nb_balles_eau_usee_dans_gr == 0) {
          break;
        }
        
      }
      
      break;
        
    }
    
    
  } // Fin de la première partie !
  
  
  // Allons chez l'adversaire...
  com_printfln("=== Phase 2 ===");
  
  nb_iterations = 0;
  action = len_phase2;
  while(1) {
    
    #ifdef __EMSCRIPTEN__
    nb_iterations++;
    if(nb_iterations > 50) {
      com_printfln("#### BOUCLE INFINIE ? ###");
      break;
    }
    #endif
    
    
    action++;
    if(action >= len_phase2) {
      action = 0;
      
      com_printfln("=== (2) On boucle ===");
    }

    gr_jouer_action(phase2[action]);
    
    
    if(REM_opp_vide
    && REP_opp_vide) {
      
      if(nb_balles_eau_propre_dans_gr == 0
      && nb_balles_eau_usee_dans_gr == 0) {
        break;
      }
      break;
    }
    
    
  }
  

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
    case ACTION_ALLUMER_PANNEAU:    error = gr_allumer_panneau();      break;
    case ACTION_VIDER_REP:          error = gr_vider_REP();         break;
    case ACTION_ACTIVER_ABEILLE:    error = gr_activer_abeille();   break;
    case ACTION_VIDER_REM:          error = gr_vider_REM();         break;
    case ACTION_RAPPORTER_CUB0:     error = gr_rapporter_CUB(0);       break;
    case ACTION_RAPPORTER_CUB1:     error = gr_rapporter_CUB(1);       break;
    case ACTION_RAPPORTER_CUB2:     error = gr_rapporter_CUB(2);       break;
    case ACTION_VIDER_REM_OPP:      error = gr_vider_REM_opp();     break;
    case ACTION_VIDER_REP_OPP:      error = gr_vider_REP_opp();     break;
    case ACTION_DEPOSER_CHATEAU:    error = gr_deposer_chateau();   break;
    case ACTION_DEPOSER_STATION:    error = gr_deposer_station();   break;
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

uint8_t gr_allumer_panneau() {
  com_printfln("--- Activer panneau ---");  
  if(gr_panneau_allume) return ERROR_PLUS_RIEN_A_FAIRE;
  
  gr_nb_tentatives[ACTION_ALLUMER_PANNEAU]++;
  
  
  com_printfln("! ### Non codé");
  
  gr_panneau_allume = true;
  
  return OK;
}

uint8_t gr_vider_REP() {
  com_printfln("--- Vider REP ---");  
  if(REP_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  
  gr_nb_tentatives[ACTION_VIDER_REP]++;
  
  
  com_printfln("! ### Non codé");
  
  nb_balles_eau_propre_dans_gr++;
  REP_vide = true;
  
  return OK;
}

uint8_t gr_vider_REM() {
  com_printfln("--- Vider REM ---");
  if(REM_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  
  
  gr_nb_tentatives[ACTION_VIDER_REM]++;
  
  com_printfln("! ### Non codé");
  
  nb_balles_eau_propre_dans_gr++;
  nb_balles_eau_usee_dans_gr++;
  REM_vide = true;
  
  return OK;
}

// Rappel : REP_opp ne contient que des balles usées
uint8_t gr_vider_REP_opp() {
  com_printfln("--- Vider REP Opp ---");
  if(REP_opp_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  
  gr_nb_tentatives[ACTION_VIDER_REP_OPP]++;
  
  com_printfln("! ### Non codé");
  
  nb_balles_eau_usee_dans_gr++;
  REP_opp_vide = true;
  
  return OK;
}

// vider_REM_opp() (attention, séquence des balles opposée)
uint8_t gr_vider_REM_opp() {
  com_printfln("--- Vider REM Opp ---");
  if(REM_opp_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  
  gr_nb_tentatives[ACTION_VIDER_REM_OPP]++;
  
  com_printfln("! ### Non codé");

  nb_balles_eau_propre_dans_gr++;
  nb_balles_eau_usee_dans_gr++;
  REM_opp_vide = true;
  
  return OK;
}

uint8_t gr_activer_abeille() {
  com_printfln("--- Activer Abeille ---");
  if(abeille_activee) return ERROR_PLUS_RIEN_A_FAIRE;
  
  gr_nb_tentatives[ACTION_ACTIVER_ABEILLE]++;
  
  // Initialisation de l'action

  error = aller_pt_etape(PT_ETAPE_6, VITESSE_A_VIDE, 1, 8000, 3); // Approche de l'abeille 1/4
  if (error) return error;
  error = aller_xy(200, 1800, VITESSE_A_VIDE, 1, 3000, 3); // Approche de l'abeille 2/4
  if (error) return error;
  error = asserv_rotation_vers_point(0, 100, 2000); // Approche de l'abeille 3/4
  if (error) return error;
  error = aller_xy(170, 1830, VITESSE_A_VIDE, 1, 3000, 3); // Approche de l'abeille 4/4
  if (error) return error;
  com_printfln("ABEILLE atteinte.");

  // Réalisation de l'action
  piloter_cuillere_miel(CM_BAISSER, false, true) //baisser rapidement
  piloter_cuillere_miel(CM_TAPER_ABEILLE, true, true) //contact doux
  minuteur_attendre(2000); //tempo pour assurer l'enclenchement du mécanisme de l'abeille
  abeille_activee = true;
  com_printfln("Abeille activée");
  piloter_cuillere_miel(CM_RELEVER, false, true) //relever rapidement
  piloter_cuillere_miel(CM_RANGER, true, true) //rangement doux
  
  // Dégagement
  error = aller_xy(200, 1800, VITESSE_A_VIDE, 0, 3000, 3); // Dégagement par l'arrière pour la rotation vers l'action suivante
  // Pas de sous-gestion de l'erreur. L'abeille est activée. 
  
  return OK;
}


uint8_t gr_deposer_station() {
  com_printfln("--- Evacuer Eaux Usées ---");
  if(nb_balles_eau_usee_dans_gr == 0) return ERROR_PLUS_RIEN_A_FAIRE;
  
  return OK;
}

uint8_t gr_deposer_chateau() {
  com_printfln("--- Evacuer Eau Propre ---");
  if(nb_balles_eau_propre_dans_gr == 0) return ERROR_PLUS_RIEN_A_FAIRE;
  
  return OK;
}




uint8_t gr_rapporter_CUB(int cub) {
  com_printfln("--- Rapporter CUB%d ---", cub);
  
  switch(cub) {
    case 0: gr_nb_tentatives[ACTION_RAPPORTER_CUB0]++; break;
    case 1: gr_nb_tentatives[ACTION_RAPPORTER_CUB1]++; break;
    case 2: gr_nb_tentatives[ACTION_RAPPORTER_CUB2]++; break;
    default: return ERROR_PARAMETRE;
  }
  
  com_printfln("! ### Non codé");
  // S'inspire de PR (voire mettre en commun)
  return OK;
}

uint8_t gr_degager_CUB2() {
  com_printfln("--- Dégager CUB2 ---");
  com_printfln("! ### Non codé");
  return OK;
}



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


/** =============
  Actions de base
  ===============   
  
  Il s'agit d'actions effectuées par le robot, appelées surtout par les actions de jeu.
**/


void match_gr_arret() {
  com_printfln("On stoppe les moteurs");
  asserv_consigne_stop();

  // ATN: afficher score final. J'ai enlevé le lancement de la funny action de 2017.
  
  tone_play_end();
}


/** =======================
  Positionnement des Servos
  =========================
  
  Voir commentaire général sur les Servos dans la section Définition
    @2019 : créer une classe ServoWRD
    [Pas fait 2018, doute sur implémentation d'une liste de constantes pré-définies]
**/

void gr_init_servos() {
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
  servo_evacuation_eaux_usees.attach(10);
  servo_cuillere_miel.attach(30); //TBD_RSE
  servo_tri_eau.attach(9);

}
