#include "asserv2017.h"
#include "match.h"

/** Dans ce fichier, plus on descend, plus on va dans le bas niveau **/

/* Glossaire 2019
  // Parce que Antoine pense à vous
  
  Sur la table
    Z_Depart        : Zone de départ
    Tab_Rd          : Tableau périodique – case Rd
    Tab_Gn          : Tableau périodique – case Gn
    Tab_Bl          : Tableau périodique – case Bl
    Tab_Gd          : Tableau périodique – case Gd
    ADP             : Accélérateur de particules
    Balance         : Balance
    Rampe_Balance   : Pente d’accès à la balance (de notre côté)
    Z_Experience    : Zone d’expérience
    Z_Chaos_own     : Zone de chaos de notre côté
    Z_Chaos_opp     : Zone de chaos opposé
    Atome_Oxygene   : Atome d’oxygène

    Distrib_Petit   : Petits distributeurs (réservés)
    Distrib_Grd_own : Grand distributeur de notre côté
    Distrib_Grd_opp : Grand distributeur opposé

  Elements de jeu
    Gn : Greenium
    Bl : Blueium
    Rd : Redium
    Gd : Goldenium

  Dans le robot
    A définir

  Systèmes auxiliaires
    Balise_A    : Balise fixe A (la nôtre)
    Balise_B    : Balise fixe B (la nôtre)
    Balise_C    : Balise fixe C (la nôtre)
    Mat_Central : Système central de détection
*/

/** ============================================
  Déclarations constantes, variables, prototypes
  ============================================== */

uint8_t gr_jouer_action(int action);
int gr_nb_tentatives[NB_ACTIONS] = { 0 };

//#define PIN_DOUT_PROPULSEUR 5 //2018

/*2018
uint8_t gr_allumer_panneau();
uint8_t gr_vider_REP();
uint8_t gr_ouvrir_REP();
uint8_t gr_vider_REM();
uint8_t gr_vider_REP_opp();
uint8_t gr_vider_REM_opp();
uint8_t gr_activer_abeille();
uint8_t gr_deposer_chateau();
uint8_t gr_deposer_station(bool y_aller_meme_si_rien_a_faire = false);
uint8_t gr_rapporter_CUB(int cub);
void gr_trier_vers_eau_propre();
void gr_trier_vers_eau_usee();
*/

// Variables d'état de jeu
/*2018
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
*/

//Servo propulseur; //2018


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

  /*2018
  asserv_set_position(150, 500, 0);
  asserv_maintenir_position();

  bouton_wait_start_up();

  minuteur_demarrer();
  
  minuteur_attendre(900);
  
  ledMatrix_defiler_texte("Les arbitres sont tres sympa cette annee");
  aller_xy(500, 500, VITESSE_RAPIDE, 1, 10000, 50);
  
  gr_rapporter_CUB(1);
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
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  ecran_console_log("Initialisation...");

  // Variables de stratégie
  int action;
  int nb_iterations = 0;
  int strategie = 1;
  
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
  //if(robot.estVert)
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
  
  //if(robot.estVert)
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
    case ACTION_ALLUMER_PANNEAU:    error = gr_allumer_panneau();      break;
    case ACTION_VIDER_REP:          error = gr_vider_REP();         break;
    case ACTION_OUVRIR_REP:         error = gr_ouvrir_REP();         break;
    case ACTION_ACTIVER_ABEILLE:    error = gr_activer_abeille();   break;
    case ACTION_VIDER_REM:          error = gr_vider_REM();         break;
    case ACTION_RAPPORTER_CUB0:     error = gr_rapporter_CUB(0);       break; 
    case ACTION_RAPPORTER_CUB1:     error = gr_rapporter_CUB(1);       break;
    case ACTION_RAPPORTER_CUB2:     error = gr_rapporter_CUB(2);       break; //abandon de cette action
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
  uint8_t error;
  com_printfln("--- Activer panneau ---");  
  if(gr_panneau_allume) return ERROR_PLUS_RIEN_A_FAIRE;
  
  gr_nb_tentatives[ACTION_ALLUMER_PANNEAU]++;

  // Se positionne face à l'interrupteur
  error = aller_pt_etape(PT_ETAPE_11, VITESSE_RAPIDE, 1, 8000, 3);
  if (error) return error;
  error = asserv_rotation_vers_point(1130, 0);
  if (error) return 0;

  // Enclencher l'interrupteur
  error = aller_xy(1130, 150, VITESSE_LENTE, 1, 2000, 5);
  com_printfln("Panneau activé");
  gr_panneau_allume = true;
  score_incrementer(25);

  // Reculer
  error = aller_pt_etape(PT_ETAPE_11, VITESSE_RAPIDE, 0, 8000, 3);
  
  return OK;
}

// Ouvrir = Ouvrir sans récupérer les balles
// Vider = Ouvrir en récupérant les balles
uint8_t gr_ouvrir_REP() {
  
  uint8_t error;
  
  com_printfln("--- Ouvrir REP ---");  
  if(REP_vide) return ERROR_PLUS_RIEN_A_FAIRE;
    
  gr_nb_tentatives[ACTION_OUVRIR_REP]++;
  
  // Initialisation
  error = aller_pt_etape(PT_ETAPE_2, VITESSE_RAPIDE, 1, 8000, 3);
  if (error) return error;
  error = aller_xy(300, 840, VITESSE_RAPIDE, 1, 5000, 3);
  if (error) return error;
  asserv_rotation_vers_point(3000, 840, 2000);
  error = aller_xy(240, 840, VITESSE_RAPIDE, 0, 2000, 3);
  if (error) return error;
    
  //Réalisation
  piloter_cuillere_miel(CM_GAUCHE); //Ouverture loquet récupérateur 1/2
  minuteur_attendre(400);
  piloter_cuillere_miel(CM_DROITE); //Ouverture loquet récupérateur 2/2
  
  score_incrementer(10); //10 pts pour REP ouvert + vidé d'au moins une balle
  
  REP_vide = true;
  com_printfln("REP ouvert");
    
  // Dégagement
  error = aller_xy(300, 840, VITESSE_RAPIDE, 1, 5000, 3); // Dégagement par l'avant pour la rotation vers l'action suivante

  return OK;
}

uint8_t gr_vider_REP() {
  
  uint8_t error;
  
  com_printfln("--- Vider REP ---");  
  if(REP_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  if(nb_balles_eau_propre_dans_gr > 0) return ERROR_PAS_POSSIBLE;
    
  gr_nb_tentatives[ACTION_VIDER_REP]++;
  
  // Initialisation
  error = aller_pt_etape(PT_ETAPE_2, VITESSE_RAPIDE, 1, 8000, 3);
  if (error) return error;
    
  //Réalisation
  piloter_tri_eau(TRI_EXTREME_DROITE, false, true); //Ouverture loquet récupérateur 1/2 - droite vers gauche pour rep
  
  if(robot.estVert) {
    error = aller_xy(150, 940, VITESSE_LENTE, 1, 3000, 3); //Positionnement
  }
  else {
    error = aller_xy(150, 740, VITESSE_LENTE, 1, 3000, 3); //Positionnement    
  }
  
  piloter_tri_eau(TRI_EXTREME_GAUCHE, false, true); //Ouverture loquet récupérateur 2/2 - droite vers gauche pour rep
  score_incrementer(10); //10 pts pour REP ouvert + vidé d'au moins une balle
  
  //--Ecoulement des balles
  minuteur_attendre(5000); 
  
  nb_balles_eau_propre_dans_gr += 8;
  REP_vide = true;
  com_printfln("REP vidé");
  
  // Dégagement
  error = aller_pt_etape(PT_ETAPE_2, VITESSE_RAPIDE, 0, 8000, 3); // Dégagement par l'arrière pour la rotation vers l'action suivante
  // Pas de sous-gestion de l'erreur.
  piloter_tri_eau(TRI_NEUTRE, false, true);
  
  return OK;
}

uint8_t gr_vider_REM() {
  const uint32_t ATTENTE_ENTRE_BALLES = 800; 
  
  uint8_t error;
    
  com_printfln("--- Vider REM ---");
  if(REM_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  if(nb_balles_eau_propre_dans_gr > 4) return ERROR_PAS_POSSIBLE;
  if(nb_balles_eau_usee_dans_gr > 4) return ERROR_PAS_POSSIBLE;
  
  gr_nb_tentatives[ACTION_VIDER_REM]++;
  
  // Initialisation
  error = aller_pt_etape(PT_ETAPE_3, VITESSE_RAPIDE, 1, 8000, 3);
  if (error) return error;

  piloter_tri_eau(TRI_EXTREME_GAUCHE, false, true); //Ouverture loquet récupérateurs 1/2
  error = aller_xy(610, 1850, VITESSE_LENTE, 1, 3000, 3); //Positionnement
  piloter_tri_eau(TRI_EXTREME_DROITE, false, true); //Ouverture loquet récupérateurs 2/2
 
  //Récupération des eaux
  // REM: La couleur de ce récupérateur et de la balle inférieure est celle la zone de départ la plus éloignée. (C2018_Rules_final_FR.pdf)
  piloter_tri_eau(TRI_NEUTRE, false, true); //init
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_usee(); //balle 1
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  // 10 pts pour l'adversaire
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_propre(); //balle 2
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_usee(); //balle 3
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_propre(); //balle 4
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_usee(); //balle 5
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_propre(); //balle 6
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_usee(); //balle 7
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  gr_trier_vers_eau_propre(); //balle 8
  minuteur_attendre(ATTENTE_ENTRE_BALLES);
  
  piloter_tri_eau(TRI_NEUTRE, false, true);
    
  nb_balles_eau_propre_dans_gr += 4;
  nb_balles_eau_usee_dans_gr += 4;
  REM_vide = true;
  com_printfln("REM vidé");

  // Dégagement
  error = aller_pt_etape(PT_ETAPE_6, VITESSE_RAPIDE, 0, 8000, 3); // Dégagement par l'arrière pour la rotation vers l'action suivante
  // Pas de sous-gestion de l'erreur.
  
  return OK;
}

// Rappel : REP_opp ne contient que des balles usées
uint8_t gr_vider_REP_opp() {
  
  uint8_t error;
  
  com_printfln("--- Vider REP Opp ---");
  if(REP_opp_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  if(nb_balles_eau_usee_dans_gr > 0) return ERROR_PAS_POSSIBLE;
  
  gr_nb_tentatives[ACTION_VIDER_REP_OPP]++;
  
  // Initialisation
  error = aller_pt_etape(PT_ETAPE_4, VITESSE_RAPIDE, 1, 8000, 3);
  if (error) return error;
  
  //Réalisation
  piloter_tri_eau(TRI_EXTREME_GAUCHE, false, true); //Ouverture loquet récupérateur 1/2 - gauche vers droite pour rep opp
  error = aller_xy(2850, 940, VITESSE_LENTE, 1, 3000, 3); //Positionnement
  piloter_tri_eau(TRI_EXTREME_DROITE, false, true); //Ouverture loquet récupérateur 2/2 - gauche vers droite pour rep opp
  score_incrementer(10); //10 pts pour REP ouvert
  
  //--Ecoulement des balles
  minuteur_attendre(5000); 
  
  nb_balles_eau_usee_dans_gr += 8;
  REP_opp_vide = true;
  com_printfln("REP Opp vidé");
  //score: pénalité 10 pts si ouverture d'un récupérateur adverse
  
  // Dégagement
  error = aller_pt_etape(PT_ETAPE_4, VITESSE_RAPIDE, 0, 8000, 3); // Dégagement par l'arrière pour la rotation vers l'action suivante
  // Pas de sous-gestion de l'erreur.
  piloter_tri_eau(TRI_NEUTRE, false, true);
  
  return OK;
}

// vider_REM_opp() (attention, séquence des balles opposée)
uint8_t gr_vider_REM_opp() {
  const uint32_t ATTENTE_ENTRE_BALLES = 800; 
  
  uint8_t error;
  
  com_printfln("--- Vider REM Opp ---");
  if(REM_opp_vide) return ERROR_PLUS_RIEN_A_FAIRE;
  /*if(nb_balles_eau_propre_dans_gr > 4) return ERROR_PAS_POSSIBLE;
  if(nb_balles_eau_usee_dans_gr > 4) return ERROR_PAS_POSSIBLE;*/
  
  gr_nb_tentatives[ACTION_VIDER_REM_OPP]++;
    
  int16_t positionnementX = (robot.estVert ? 2290 : 2490);
  
  // /!\ Initialisation sans tri
  error = aller_pt_etape(PT_ETAPE_6S, VITESSE_RAPIDE, 1, 8000, 3);
  if(error) return error;
  
  error = aller_xy(positionnementX, 1750, VITESSE_RAPIDE, 1, 3000, 3); 
  if(error) return error;
  
  // /!\ Réalisation sans tri (uniquement pour station)
  piloter_tri_eau(TRI_EXTREME_DROITE, false, true); //Ouverture loquet récupérateur prépa
  minuteur_attendre(400);
  error = aller_xy(positionnementX, 1850, VITESSE_LENTE, 1, 3000, 3); //Positionnement sans tri
  piloter_tri_eau(TRI_EXTREME_GAUCHE, false, true); //Ouverture loquet récupérateur 1/2
  minuteur_attendre(400); 
  piloter_tri_eau(TRI_EXTREME_DROITE, false, true); //Ouverture loquet récupérateur 2/2
  minuteur_attendre(400);
  score_incrementer(10); //10 pts pour REP ouvert + vidé d'au moins une balle
   
  // /!\  --Ecoulement des balles pour cas sans tri
  minuteur_attendre(5000);  
   
  nb_balles_eau_propre_dans_gr += 4;
  nb_balles_eau_usee_dans_gr += 4;
  REM_opp_vide = true;
  com_printfln("REM_opp vidé");
  
  // Dégagement // [A buggué ici]
  error = aller_xy(positionnementX, 1750, VITESSE_RAPIDE, 0, 3000, 3); //dégagement pour cas sans tri
  piloter_tri_eau(TRI_NEUTRE, false, true);
  minuteur_attendre(400);
  error = aller_pt_etape(PT_ETAPE_6S, VITESSE_RAPIDE, 0, 8000, 3); // Dégagement par l'arrière pour la rotation vers l'action suivante
  // Pas de sous-gestion de l'erreur.
      
  return OK;
}

uint8_t gr_activer_abeille() {
  uint8_t error;
  com_printfln("--- Activer Abeille ---");
  if(abeille_activee) return ERROR_PLUS_RIEN_A_FAIRE;

  gr_nb_tentatives[ACTION_ACTIVER_ABEILLE]++;
   
  // Initialisation de l'action
  error = aller_pt_etape(PT_ETAPE_6, VITESSE_RAPIDE, 1, 8000, 3); // Approche de l'abeille 1/4
  if (error) return error;
  error = aller_xy(230, 1770, VITESSE_RAPIDE, 1, 3000, 3); // Approche de l'abeille 2/4
  //if (error) return error;
  
  if(robot.estVert) {
    piloter_cuillere_miel(CM_GAUCHE); //armer avant approche, en vert, cuillère à gauche vu du servo
  }
  else {
    piloter_cuillere_miel(CM_DROITE); //armer avant approche
  }
  
  // Recalage ...
  com_print("Recalage en Y...");
  error = asserv_rotation_vers_point(230, 0, 2000);
  sick_disable_detection(true); // On recule vers la bordure, inutile de détecter devant...
  error = aller_xy(230, 2000, VITESSE_RAPIDE, 0, 1500, 5);
  if(error == ERROR_TIMEOUT) {
    robot.y = mm2tick(1850);
    com_printfln("OK");
  }
  sick_disable_detection(false);
  // Un coup de cuillère au passage
  minuteur_attendre(500);
  piloter_cuillere_miel(robot.estVert ? CM_DROITE : CM_GAUCHE); // Activer
  minuteur_attendre(500);
  piloter_cuillere_miel(robot.estVert ? CM_GAUCHE : CM_DROITE); // Retour en position
  minuteur_attendre(500);
  // Et on continue pour de vrai
  error = aller_xy(230, 1770,  VITESSE_RAPIDE, 1, 3000, 3);
  
  com_print("Recalage en X...");
  error = asserv_rotation_vers_point(3000, 1770, 2000);
  sick_disable_detection(true);
  error = aller_xy(0, 1770, VITESSE_LENTE, 0, 1500, 5);
  if(error == ERROR_TIMEOUT) {
    robot.x = mm2tick(symetrie_x(150));
    com_printfln("OK");
  }
  sick_disable_detection(false);
  error = aller_xy(230, 1770,  VITESSE_RAPIDE, 1, 3000, 3);
  // ... On est bon
  
  //Approche de l'abeille
  error = aller_xy(273, 1600, VITESSE_RAPIDE, 1, 3000, 3);
  if (error) return error;
  error = asserv_rotation_vers_point(346, 1400, 2000);  
  if (error) return error; 
  
  for(int i = 1; i <= 2; i++) {
    
    if(robot.estVert) {
      piloter_cuillere_miel(CM_GAUCHE);
    }
    else {
      piloter_cuillere_miel(CM_DROITE);
    }
    minuteur_attendre(400);
    
    error = aller_xy(200, 1800 + gr_nb_tentatives[ACTION_ACTIVER_ABEILLE], VITESSE_RAPIDE, 0, 3000, 3); // Tendance à planter ?
    if (error) return error;
     error = asserv_rotation_vers_point(200, 0, 2000);
    //if (error) return error; // Pourquoi abandonner ici ?
    sick_disable_detection(true);
    error = aller_xy(200, 2000, VITESSE_RAPIDE, 0, 2000, 5);
    if(error == ERROR_TIMEOUT) {
      robot.y = mm2tick(1850);
      com_printfln("(Recalé au passage)");
    }
    sick_disable_detection(false);
    
    com_printfln("ABEILLE atteinte.");

    // Réalisation de l'action
    if(robot.estVert) {
      piloter_cuillere_miel(CM_DROITE);
    }
    else {
      piloter_cuillere_miel(CM_GAUCHE);
    }
    minuteur_attendre(400);

  }

  abeille_activee = true; //espérance
  com_printfln("Abeille activée");
  score_incrementer(50);
 
  // Dégagement
  error = aller_xy(200, 1800, VITESSE_RAPIDE, 1, 5000, 10);
  error = aller_xy(273, 1600, VITESSE_RAPIDE, 1, 5000, 10);
  // Pas de sous-gestion de l'erreur. L'abeille est activée. 
 
  return OK;
}


uint8_t gr_deposer_station(bool y_aller_meme_si_rien_a_faire) {
  uint8_t error;
  com_printfln("--- Evacuer Eaux Usées ---");
  if(!y_aller_meme_si_rien_a_faire && nb_balles_eau_usee_dans_gr == 0) return ERROR_PLUS_RIEN_A_FAIRE;
  
  gr_nb_tentatives[ACTION_DEPOSER_STATION]++;
  
  // Initialisation de l'action
  error = aller_pt_etape(PT_ETAPE_6S, VITESSE_RAPIDE, 1, 8000, 10); //notre station est dans le côté opposé
  if (error) return error;

  // Réalisation de l'action
  error = aller_xy(1700, 1500, VITESSE_LENTE, 1, 4000, 3); //se déplacer davantage pour dégager les cubes
  error = aller_xy(1810, 1500, VITESSE_RAPIDE, 0, 4000, 3);
  if (error) return error;
  error = asserv_rotation_vers_point(1810, 0);
  if (error) return error;
  error = aller_xy(1810, 1700, VITESSE_LENTE, 0, 4000, 3); //on recule vers la station // [A buggué ici]
  
  // --Largage 
  piloter_evacuation_eaux_usees(EEU_OUVRIR, true, true); //ouvrir trappe
  minuteur_attendre(4000); //tempo pour attendre l'écoulement des balles
  piloter_evacuation_eaux_usees(EEU_BLOQUER, false, true); //fermer trappe
  minuteur_attendre(400);
  
  // 2ème largage
  error = aller_xy(1810, 1500, VITESSE_RAPIDE, 1, 3000, 3); // Dégagement par l'avant
  minuteur_attendre(200);
  error = aller_xy(1810, 1700, VITESSE_LENTE, 0, 3000, 3); //on recule vers la station
  minuteur_attendre(100);
  piloter_evacuation_eaux_usees(EEU_OUVRIR, true, true); //ouvrir trappe
  minuteur_attendre(4000); //tempo pour attendre l'écoulement des balles
  piloter_evacuation_eaux_usees(EEU_BLOQUER, false, true); //fermer trappe
  minuteur_attendre(400);
  
  
  // Dégagement
  error = aller_xy(1810, 1500, VITESSE_RAPIDE, 1, 3000, 3); // Dégagement par l'avant
  // Pas de sous-gestion de l'erreur. Eau déposée.

  score_incrementer(10*nb_balles_eau_usee_dans_gr);
  nb_balles_eau_usee_dans_gr = 0; //hypothèse de bon déroulement de l'action
  com_printfln("Eaux usées larguées");
  
  return OK;
}

uint8_t gr_deposer_chateau() {
  uint8_t error;
  com_printfln("--- Evacuer Eau Propre ---");
  if(nb_balles_eau_propre_dans_gr == 0) return ERROR_PLUS_RIEN_A_FAIRE;

  return ERROR_PAS_POSSIBLE;
  
  gr_nb_tentatives[ACTION_DEPOSER_CHATEAU]++;
  
  // Initialisation de l'action
  error = aller_pt_etape(PT_ETAPE_1, VITESSE_RAPIDE, 1, 8000, 3);
  if (error) return error;

  // Réalisation de l'action
  error = asserv_rotation_vers_point(270, 2000, 3000);
  error = aller_xy(270, 150, VITESSE_LENTE, 0, 3000, 3);

  // Projection des balles
  gr_activer_propulseur(true);
  minuteur_attendre(5000); //tempo pour attendre l'écoulement des balles
  gr_activer_propulseur(false);

  // Dégagement
  error = aller_pt_etape(PT_ETAPE_1, VITESSE_RAPIDE, 1, 3000, 3); // Dégagement par l'avant
  // Pas de sous-gestion de l'erreur. Balles déposées.

  score_incrementer(5*nb_balles_eau_propre_dans_gr);
  nb_balles_eau_propre_dans_gr = 0; //hypothèse de bon déroulement de l'action
  com_printfln("Eaux propres larguées"); 
  return OK;
}


uint8_t gr_rapporter_CUB(int cub) {   // Note : Voir pour une mise en commun avec code pr
  uint8_t error;
  com_printfln("--- Rapporter CUB%d ---", cub);
  if(gr_CUB_dans_ZOC[cub]) return ERROR_PLUS_RIEN_A_FAIRE;
  
  switch(cub) {
    case 0:
      gr_nb_tentatives[ACTION_RAPPORTER_CUB0]++;
      break;
    case 1:
      gr_nb_tentatives[ACTION_RAPPORTER_CUB1]++;
      break;
    case 2:
      gr_nb_tentatives[ACTION_RAPPORTER_CUB2]++;
      break;
    default:
      return ERROR_PARAMETRE;
  }
  
  
  // Positionnement proche des cubes
  // [TODO] Ajuster dans le cas où ça a déjà été déplacé
  switch(cub) {
    case 0: gr_nb_tentatives[ACTION_RAPPORTER_CUB0]++;
      error = aller_pt_etape(PT_ETAPE_13, VITESSE_RAPIDE, 1, 8000, 10);
      if (error) return error;
      break;

    case 1: gr_nb_tentatives[ACTION_RAPPORTER_CUB1]++;
      error = aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 1, 8000, 10);
      if (error) return error;
      break;

    case 2: gr_nb_tentatives[ACTION_RAPPORTER_CUB2]++; 
      com_err2str(ERROR_PAS_CODE);
      return OK;
      break;
  }
  
  // Déplacement vers la zone de construction
  switch (cub) {
  case 0:
    error = aller_xy(850, 350, VITESSE_POUSSER_CUBES, 1, 8000, 10);
    score_incrementer(4); //5 cubes dans ZOC
    break;
  case 1:
    error = aller_xy(612, 350, VITESSE_POUSSER_CUBES, 1, 8000, 10);
    score_incrementer(4); //4/5 cubes dans ZOC
    break;
  case 2:
    //error = aller_xy(700, 150, VITESSE_POUSSER_CUBES, 1, 8000, 6); //copié de PR
    break;
  }
  
  gr_a_bouge_CUB[cub] = true;
  
  if(error) {
    // Stocker la position du cube... [TODO]
    return error;
  }
  else {
    gr_CUB_dans_ZOC[cub] = true;
  }
  
  asserv_go_toutdroit(-80, 2000); // On recule avant de tourner
  
  return OK;
}




/** =============
  Actions de base
  ===============   
  
  Il s'agit d'actions effectuées par le robot, appelées surtout par les actions de jeu.
**/

/*2018
void gr_activer_propulseur(bool activer) {
  //pin 5
  if(activer) {
    propulseur.write(255);
  }
  else {
    propulseur.write(0);
  }
  robot.propulseur_actif = activer;
  
  
}

void gr_trier_vers_eau_usee() {
  piloter_tri_eau(TRI_EAU_USEE, false, true);
}

void gr_trier_vers_eau_propre() {
  piloter_tri_eau(TRI_EAU_PROPRE, false, true);
}
*/

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
  
  /*2018
  propulseur.attach(PIN_DOUT_PROPULSEUR);
  propulseur.write(0);
  //pinMode(PIN_DOUT_PROPULSEUR, OUTPUT);
  //analogWrite(PIN_DOUT_PROPULSEUR, 0);
  */
  
  gr_init_servos();
}
