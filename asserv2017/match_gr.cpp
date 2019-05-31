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
uint8_t gr_activer_adp();
uint8_t gr_extraire_gd();
uint8_t gr_degagement();
uint8_t gr_activer_experience();
uint8_t gr_distributeur(uint8_t place);

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
  robot.homologation = true;
  
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
  asserv_set_position(150, 450, 0); //2019 GR calé dans Tab_Rd en première idée


  asserv_maintenir_position();
  bouton_wait_start_up();

  minuteur_demarrer();
  
  minuteur_attendre(500);
  score_definir(0);
  
  // Programme d'homologation standard GR seul
  //aller_xy(1000, 450, VITESSE_RAPIDE, 1, 10000, 50);
  //gr_jouer_action(ACTION_POUSSER_ATOME1);
  
  // Programme d'homologation avec un seul moteur (moteur droit), en conjonction avec PR
  // /!\ brancher le moteur droit, moteur gauche inactif
  // /!\ débrancher les codeurs pour que GR avance en boucle ouverte
  // Comportement attendu : le robot sort de la zone de départ en décrivant un arc de cercle sur la gauche.
  aller_xy(1000, 450, VITESSE_RAPIDE, 1, 5000, 50); //commande d'avance tout droit, abandon après 5 secondes
  score_incrementer(90);
  

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

  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);
  
  return;
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
  int action; // Sera initialisé pendant le programme
  int nb_iterations = 0;
  int strategie = 1;
  
  int phase1[] = {  
    ACTION_ACTIVER_EXPERIENCE
    /* Actions attribuées à PR,
    ACTION_POUSSER_ATOME0,
    ACTION_POUSSER_ATOME1,
    ACTION_POUSSER_ATOME2,
    ACTION_ACTIVER_EXPERIENCE,
    ACTION_POUSSER_ATOMES_CHAOS,
    ACTION_POUSSER_ATOMES_CHAOS_B*/
    // As-tu bien retiré la virgule sur la dernière ligne ?
  };
  int len_phase1 = sizeof(phase1) / sizeof(action);
  
  bool activer_phase2 = true;
  int phase2[] {
    ACTION_ACTIVER_EXPERIENCE,
    ACTION_ACTIVER_ADP,
    ACTION_EXTRAIRE_GD,
    ACTION_DISTRIBUTEUR3, //le 3 d'abord pour moins gêner Zchaos_own
    ACTION_DISTRIBUTEUR2,
    ACTION_DISTRIBUTEUR1
    // ACTION_DEGAGEMENT
    //ACTION_DISTRIBUTEUR0 //pas prêt pour Match 3 //à la fin : car plus compliqué et trajectoire plus longue que pour accéder aux autres points de distribution
    // As-tu bien retiré la virgule sur la dernière ligne ?
  };
  int len_phase2 = sizeof(phase2) / sizeof(action);
  
  gr_init_servos();

  minuteur_attendre(500);
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n\n");
  minuteur_attendre(200);

  //asserv_set_position(150, 750, 0); //2019 GR calé dans Tab_Gn pour Match 1 (Motorisation NOK)
  asserv_set_position(259, 450, -MATH_PI2); //GR en x correspondant à P3.x, y défini pour être dans Tab_Rd

  asserv_maintenir_position();
  bouton_wait_start_up();
  

  /** ------------
    Début du Match
    ------------- **/

  minuteur_demarrer();
  minuteur_attendre(500);
  score_definir(0);

  // On se décole de la bordure
  //asserv_go_toutdroit(100, 10000);
  
  // Init scores
  score_incrementer(5); // Dépose Expérience => 5 points
  score_incrementer(20); // Antoine: Estimation Match 3 pour PR
    

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
    if(table.experience_activee) {
      break;
    }
    
    
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
      
      if(table.experience_activee
        && table.adp_active
        && table.goldenium_tombe
        && table.distributeur_visite[0]
        && table.distributeur_visite[1]
        && table.distributeur_visite[2]) {
          break;
      }
      
    }
    

  } // activer_phase2
  
  gr_jouer_action(ACTION_DEGAGEMENT);

  minuteur_attendre_fin_match();
}


/** ==============
    Actions de jeu
    ============== **/

uint8_t gr_jouer_action(int action) {
  
  uint8_t error;

  switch(action) {
    case ACTION_ACTIVER_ADP:              error = gr_activer_adp(); break;
    case ACTION_POUSSER_ATOME0:           error = gr_pousser_atome(0); break;
    case ACTION_POUSSER_ATOME1:           error = gr_pousser_atome(1); break;
    case ACTION_POUSSER_ATOME2:           error = gr_pousser_atome(2); break;
    case ACTION_POUSSER_ATOMES_CHAOS:     error = gr_pousser_atome(3); break;
    case ACTION_POUSSER_ATOMES_CHAOS_B:   error = gr_pousser_atome(4); break;
    case ACTION_POUSSER_ATOMES_CHAOS_ADV: error = gr_pousser_atome(5); break;
    case ACTION_ACTIVER_EXPERIENCE:       error = gr_activer_experience(); break;
    case ACTION_DISTRIBUTEUR0:            error = gr_distributeur(0); break;
    case ACTION_DISTRIBUTEUR1:            error = gr_distributeur(1); break;
    case ACTION_DISTRIBUTEUR2:            error = gr_distributeur(2); break;
    case ACTION_DISTRIBUTEUR3:            error = gr_distributeur(3); break;
    case ACTION_EXTRAIRE_GD:              error = gr_extraire_gd(); break;
    case ACTION_DEGAGEMENT:               error = gr_degagement(); break;
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


uint8_t gr_activer_experience() { 

  uint8_t error;
  
  com_printfln("--- Activer expérience ---");
  if(table.experience_activee) return ERROR_PLUS_RIEN_A_FAIRE;
  gr_nb_tentatives[ACTION_ACTIVER_EXPERIENCE]++;
   
  experience_activer();
  score_incrementer(15); // 15 points si activé
  score_incrementer(12); // 25 points si arrive en haut
  
  table.experience_activee = true;
  
  return OK;
}

uint8_t gr_pousser_atome(uint8_t atome) {
  uint8_t error;
  
  if(atome > 5) return ERROR_PARAMETRE;
  
  
  // ATN : normalement, sans appel, les servos devraient être déjà rangés en configuration de croisière
  piloter_TA(TA_NEUTRE);
  piloter_BDF(BDF_RANGER);
  
  error = pousser_atome(atome);
  
  // Les servos sont déjà en position de croisière, inutile de les "rétablir"
  
  
  // Schéma légèrement différent : on incrémente les tentatives qu'à la fin
  // puisque ERROR_PLUS_RIEN_A_FAIRE est donné dans pousser_atome()
  if(error != ERROR_PLUS_RIEN_A_FAIRE) {
    switch(atome) {
      case 0: gr_nb_tentatives[ACTION_POUSSER_ATOME0]++; break;
      case 1: gr_nb_tentatives[ACTION_POUSSER_ATOME1]++; break;
      case 2: gr_nb_tentatives[ACTION_POUSSER_ATOME2]++; break;
      case 3: gr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS]++; break;
      case 4: gr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS_B]++; break;
      case 5: gr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS_ADV]++; break;
    }
  }
  
  return error;
}

uint8_t gr_activer_adp() {
  uint8_t error;
  Point pt13 = getPoint(PT_ETAPE_13);
   
  com_printfln("--- Activer ADP ---");
   
  if(table.adp_active) return ERROR_PLUS_RIEN_A_FAIRE; //Vérifier que l'action reste à faire
  gr_nb_tentatives[ACTION_ACTIVER_ADP]++;
  

  
  if(!robot_dans_zone(0, 0, 1800, 600)) {
    error = aller_pt_etape(PT_ETAPE_3, VITESSE_RAPIDE, 1, 20000, 10); //TBC_RSE : pourquoi le point étape 3 comme point de retrait ?
    if(error) return error;
  }
  
  //Temp pour Match 3
  //Motif : éviter l'atome devant Tab_Rd. aller_vers_adp ne semble pas l'éviter
  error = aller_pt_etape(PT_ETAPE_3, VITESSE_RAPIDE, 1, 20000, 10); if(error) return error;
  
  //ESSAI 1
  //=======
  
  error = aller_vers_adp(150, 450, VITESSE_RAPIDE);
  if(error) return error;
  com_printfln("Bien arrivé proche de l'ADP");
  // On arrive sur x = PT_ETAPE_13.x, mais y = 150 ou 450
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers l'ADP
  if(error) return error;
  
  
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);
  
  
  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt13.x, 100, VITESSE_LENTE, 0, 3000, 10); //Reculer vers ADP
  
  
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);
    
  error = aller_xy(pt13.x, pt13.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);
  
  //ESSAI 2
  //=======
 
  error = aller_xy(pt13.x-20, pt13.y, VITESSE_RAPIDE, 0, 6000, 10);
  if(error) return error;
  com_printfln("Bien arrivé proche de l'ADP");
  // On arrive sur x = PT_ETAPE_13.x, mais y = 150 ou 450
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers l'ADP
  if(error) return error;
  
  
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);
  
  
  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt13.x-20, 100, VITESSE_LENTE, 0, 3000, 10); //Reculer vers ADP
  
  
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);
    
  error = aller_xy(pt13.x-20, pt13.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);

	
  //ESSAI 3
  //=======
  
  error = aller_xy(pt13.x-40, pt13.y, VITESSE_RAPIDE, 0, 6000, 10);
  if(error) return error;
  com_printfln("Bien arrivé proche de l'ADP");
  // On arrive sur x = PT_ETAPE_13.x, mais y = 150 ou 450
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers l'ADP
  if(error) return error;
  
  
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);
  
  
  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt13.x-40, 100, VITESSE_LENTE, 0, 3000, 10); //Reculer vers ADP
  
  
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);
    
  error = aller_xy(pt13.x-40, pt13.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);
  
  //ESSAI 4
  //=======
  
  error = aller_xy(pt13.x+20, pt13.y, VITESSE_RAPIDE, 0, 6000, 10);
  if(error) return error;
  com_printfln("Bien arrivé proche de l'ADP");
  // On arrive sur x = PT_ETAPE_13.x, mais y = 150 ou 450
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers l'ADP
  if(error) return error;
  
  
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);
  
  
  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt13.x+20, 100, VITESSE_LENTE, 0, 3000, 10); //Reculer vers ADP
  
  
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);
    
  error = aller_xy(pt13.x+20, pt13.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);
  
  
  //FIN ESSAIS
  
  score_incrementer(10);
  table.adp_active = true;
  
  return OK;
  
}

uint8_t gr_extraire_gd() {
  uint8_t error;
  Point pt14 = getPoint(PT_ETAPE_14);
   
  com_printfln("--- Extraire Gd ---");
  
  if(!table.adp_active) return ERROR_PAS_POSSIBLE;
  
  if(table.goldenium_tombe) return ERROR_PLUS_RIEN_A_FAIRE; //Vérifier que l'action reste à faire
  gr_nb_tentatives[ACTION_EXTRAIRE_GD]++;
  
  //ESSAI 1
  //=======
  
  error = aller_pt_etape(PT_ETAPE_14, VITESSE_RAPIDE, 1, 20000, 10); if(error) return error;
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers Gd
  if(error) return error;

  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);

  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt14.x, 100, VITESSE_LENTE, 0, 6000, 10); //Reculer vers Gd
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);

  error = aller_xy(pt14.x, pt14.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);
  
  //ESSAI 2
  //=======
  
  error = aller_xy(pt14.x-20, pt13.y, VITESSE_RAPIDE, 0, 6000, 10);
  if(error) return error;
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers Gd
  if(error) return error;

  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);

  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt14.x-20, 100, VITESSE_LENTE, 0, 6000, 10); //Reculer vers Gd
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);

  error = aller_xy(pt14.x-20, pt14.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);
  
  //ESSAI 3
  //=======
  
  error = aller_xy(pt14.x-40, pt13.y, VITESSE_RAPIDE, 0, 6000, 10);
  if(error) return error;
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers Gd
  if(error) return error;

  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);

  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt14.x-40, 100, VITESSE_LENTE, 0, 6000, 10); //Reculer vers Gd
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);

  error = aller_xy(pt14.x-40, pt14.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);
  
  //ESSAI 4
  //=======
  
  error = aller_xy(pt14.x+20, pt13.y, VITESSE_RAPIDE, 0, 6000, 10);
  if(error) return error;
  
  error = asserv_rotation_vers_point(get_robot_xMm_sans_symetrie(), 2000, 2000); //rotation de GR pour présenter l'arrière vers Gd
  if(error) return error;

  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE);

  com_printfln("Dos au mur");
  asserv_activer_maintien_rotation(false);
  // !!!!!!!!!!!!!
  // !! NE PAS METTRE DE return TANT QUE LA ROTATION N'A PAS ETE REACTIVEE !
  // !!!!!!!!!!!!!
  error = aller_xy(pt14.x+20, 100, VITESSE_LENTE, 0, 6000, 10); //Reculer vers Gd
  
  minuteur_attendre(600);
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_JAUNE : ADPT_VERS_VIOLET);
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_BAISSER);
  minuteur_attendre(800); // Je ne sais plus si c'est nécessaire ou pas...
  piloter_ADP_translation(robot.estJaune ? ADPT_VERS_VIOLET : ADPT_VERS_JAUNE); //retrait au cas où l'on est en contact, sinon le servo pour lever le mobile sera bloqué
  minuteur_attendre(800);
  piloter_ADP_deploiement(ADPD_LEVER);
  minuteur_attendre(600);

  error = aller_xy(pt14.x+20, pt14.y, VITESSE_RAPIDE, 1, 6000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  asserv_activer_maintien_rotation(true);

  //FIN ESSAIS
  
  score_incrementer(20);
  table.goldenium_tombe = true;
  
  return OK;
  
}


uint8_t gr_distributeur(uint8_t place) {
	// place = 1 : petit distributeur own, pour les deux atomes à droite, qui comprennent un Redium
	// place = 2 : grand distributeur own, pour les deux atomes à gauche
	// place = 3 : grand distributeur own, pour les deux atomes au milieu
	// place = 4 : grand distributeur own, pour les deux atomes à droite
	/** Les mouvements vers le grand distributeur opp ne sont pas codés à ce stade. **/
	
	uint8_t error;
	uint8_t distrib_x;
	uint8_t distrib_y;
  
  com_printfln("--- Distributeur %d ---", place);
      
	if(place > 3) return ERROR_PARAMETRE;
  if(table.distributeur_visite[place]) return ERROR_PLUS_RIEN_A_FAIRE;
  
	
  piloter_BDF(BDF_RANGER);
  
	switch(place) {
		case 0: //Petit distributeur own, on se positionne pour les deux atomes à droite, qui comprennent un Redium
      gr_nb_tentatives[ACTION_DISTRIBUTEUR0]++;
			error = aller_pt_etape(PT_ETAPE_6B3, VITESSE_RAPIDE, 1, 10000, 10); if(error) return error;
			
      asserv_activer_maintien_rotation(false);
      error = aller_pt_direct(PT_6B3A, VITESSE_RAPIDE, 1, 3000, 10);
      // error gérée après le switch (!! Ne pas oublier de réactiver la rotation !!)
      break;
		case 1: //Grand distributeur own, on se positionne pour les deux atomes à gauche
			gr_nb_tentatives[ACTION_DISTRIBUTEUR1]++;
      error = aller_pt_etape(PT_ETAPE_11B3, VITESSE_RAPIDE, 1, 10000, 10); if(error) return error;
      
      asserv_activer_maintien_rotation(false);
			error = aller_pt_direct(PT_11B3A, VITESSE_RAPIDE, 1, 3000, 10);
      break;
		case 2: //Grand distributeur own, on se positionne pour les deux atomes au milieu
			gr_nb_tentatives[ACTION_DISTRIBUTEUR2]++;
      error = aller_pt_etape(PT_ETAPE_11B7, VITESSE_RAPIDE, 1, 10000, 10); if(error) return error;
      
      asserv_activer_maintien_rotation(false);
      error = aller_pt_direct(PT_11B7A, VITESSE_RAPIDE, 1, 3000, 10);
      break;
		case 3: //Grand distributeur own, on se positionne pour les deux atomes à droite
			gr_nb_tentatives[ACTION_DISTRIBUTEUR3]++;
			error = aller_pt_etape(PT_ETAPE_11B11, VITESSE_RAPIDE, 1, 10000, 10); if(error) return error;
      
      asserv_activer_maintien_rotation(false);
			error = aller_pt_direct(PT_11B11A, VITESSE_RAPIDE, 1, 3000, 10);
      break;
  }
  
  if(error && error != ERROR_TIMEOUT) {
    asserv_activer_maintien_rotation(true);
    return error;
  }
			/** TODO : prévoir un recalage plutôt que les points action, pour s'assurer d'arriver en contact avec la bordure **/
			
	//Action BDF
  piloter_BDF(BDF_FAIRE_TOMBER);
	minuteur_attendre(1500);
  
  
  // On recule lentement
  com_printfln("On recule lentement");
  uint16_t memoire_pwm = robot.pwm_max_distance;
  robot.pwm_max_distance = 20;
  minuteur_attendre(200);
  asserv_go_toutdroit(-100, 5000);
  minuteur_attendre(200);
  robot.pwm_max_distance = memoire_pwm;
	
	minuteur_attendre(1000);
  asserv_activer_maintien_rotation(true);
  
  // Potentiellement inutile si on a déjà reculé. Sauf pour le petit distributeur où l'espace est limité et où en reculant trop on peut etre bloqué en rotation.
  // Gardé pour Match 3
  /**TODO confirmer cette section**/
  // Retour en arrière à la position libre de mouvement
	switch(place) {
		case 0: //Petit distributeur own, on se positionne pour les deux atomes à droite, qui comprennent un Redium
			error = aller_pt_etape(PT_ETAPE_6B3, VITESSE_RAPIDE, 0, 20000, 10); if(error) return error;
      break;
		case 1: //Grand distributeur own, on se positionne pour les deux atomes à gauche
			error = aller_pt_etape(PT_ETAPE_11B3, VITESSE_RAPIDE, 0, 20000, 10); if(error) return error;
      break;
		case 2: //Grand distributeur own, on se positionne pour les deux atomes au milieu
			error = aller_pt_etape(PT_ETAPE_11B7, VITESSE_RAPIDE, 0, 20000, 10); if(error) return error;
      break;
		case 3: //Grand distributeur own, on se positionne pour les deux atomes à droite
			error = aller_pt_etape(PT_ETAPE_11B11, VITESSE_RAPIDE, 0, 20000, 10); if(error) return error;
      // Contournement Zchaos_own pour aller déposer les atomes dans le tableau périodique
      error = aller_pt_etape(PT_ETAPE_11B7, VITESSE_RAPIDE, 1, 20000, 10); if(error) return error;
      break;
	}
  
  piloter_BDF(BDF_RANGER);
	
  // Aller déposer les atomes dans le tableau périodique
  error = aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 1, 20000, 10); if(error) return error;
  //error = aller_pt_etape(PT_ETAPE_1, VITESSE_LENTE, 1, 20000, 10); if(error) return error;
  error = aller_xy(450, 450, VITESSE_POUSSER_ATOMES, 1, 20000, 10); if(error) return error; //aller moins loin que P1
  
  minuteur_attendre(1000);
  
  piloter_TA(TA_DECHARGER);
  score_incrementer(7);
  minuteur_attendre(1000);
  piloter_TA(TA_NEUTRE);
  
  minuteur_attendre(1000);
  // Reculer pour se dégager
  //error = aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 0, 20000, 10); if(error) return error;
  error = aller_xy(749, 450, VITESSE_RAPIDE, 0, 20000, 10); if(error) return error; //aller à P8 en ignorant la logique de contournement
  

  
  table.distributeur_visite[place] = true;
  return OK;
}

uint8_t gr_degagement() {
  //Raison d'être : ne pas rester immobile devant le tableau périodique à la fin de toutes les actions. Cela bloquerait les actions de PR.
  
  uint8_t error;
  Point pt13 = getPoint(PT_ETAPE_13);
     
  com_printfln("--- Degagement ---");
  
  
  
  //Match 3 ne visitant que distrib places 1, 2 et 3
  if(!table.distributeur_visite[1] || !table.distributeur_visite[2] || !table.distributeur_visite[3])
    return ERROR_CAS_NON_GERE;
    
  if(!robot_dans_zone(0, 0, 1800, 600)) {
    error = aller_pt_etape(PT_ETAPE_3, VITESSE_RAPIDE, 1, 20000, 10); //TBC_RSE : pourquoi le point étape 3 comme point de retrait ?
    if(error) return error;
  }
  
  error = aller_pt_etape(PT_ETAPE_13, VITESSE_RAPIDE, 1, 15000, 30);
  if(error) return error;
  com_printfln("Bien arrivé proche de l'ADP");
  // On arrive sur x = PT_ETAPE_13.x, mais y = 150 ou 450
  
  error = asserv_rotation_vers_point(pt13.x, 2000, 2000); //rotation de GR pour présenter l'arrière vers l'ADP
  if(error) return error;
  /*
  com_printfln("Dos au mur");
  error = aller_xy(pt13.x, 100, VITESSE_LENTE, 0, 6000, 10); //Reculer vers ADP

  minuteur_attendre(20000); //temps long, arbitraire.
  error = aller_xy(pt13.x, pt13.y, VITESSE_RAPIDE, 1, 20000, 10); //Avancer vers une zone où le robot peut tourner sans bloquer pour la suite
  */

  return OK;
}


/** =============
  Actions de base
  ===============   
  
  Il s'agit d'actions effectuées par le robot, appelées surtout par les actions de jeu.
**/



void match_gr_arret() {
  asserv_consigne_stop();
  com_printfln("! On stoppe les moteurs");
  
  piloter_TA(TA_DECHARGER);
  
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
  
  robot.pwm_max_distance = 70; // 40 Tres_lent ; 90 intermédiaire
  robot.pwm_max_rotation = 50;
  
  
  // Actionneurs à init  
  gr_attach_servos();
  
  gr_init_servos();
}
