#include "asserv2017.h"


/** ============================================
  Déclarations constantes, variables, prototypes
  ============================================== */

int pr_rapporter_CUB(int cub, int depart);
int pr_activer_panneau(int depart);
uint8_t pr_jouer_action(int action);

int pr_nb_tentatives[NB_ACTIONS] = { 0 };

int nb_balles_eau_propre_dans_pr = 0;
int nb_balles_eau_usee_dans_pr = 0;
bool pr_panneau_allume = false;
bool pr_a_bouge_CUB[3] = { false };
bool pr_CUB_dans_ZOC[3] = { false };

Point pr_pt_CUB[3] = {{850, 540}, {300, 1190}, {1100, 1500}};


/** ====================
  Paramétrage des servos
  ====================== **/
  
// Bras gauche (BRAS)
// Angle + => Vers le haut
const uint8_t BRAS_INIT = 44;
const uint8_t BRAS_LEVER = 81;
const uint8_t BRAS_POSITION_INTERRUPTEUR = 80;
const uint8_t BRAS_BAISSER = 45;

Servo servo_bras;
uint8_t angle_bras;
void piloter_bras(uint8_t angle, bool doucement = false, bool log = true);


/** =====================================
  Programmes alternatifs (Homolog, Debug)
  ======================================= **/

void homologation_pr() {
  ecran_console_reset();
  ecran_console_log("Match PR\n\n");

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
 
  minuteur_attendre(500);
  
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n");
  
  minuteur_attendre(200);
  
  asserv_set_position(200, 150, MATH_PI2); // TBC
  asserv_maintenir_position();
  bouton_wait_start_up();
  
  
  pr_activer_panneau();
  
  
  
  minuteur_demarrer();
  minuteur_attendre(500);
}
  
void debug_pr() {
  ecran_console_log("2 sec\n\n");

  asserv_set_position(1500, 750, 0);
  delay(2000);

  minuteur_demarrer();

  asserv_distance(-5000, 5000);
  tone_play_end();
  asserv_distance(2000, 2000);
  tone_play_end();
  asserv_distance(-5000, 5000);


  tone_play_end();
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


/** =============
  Programme MATCH
  =============== **/

void match_pr() {
  ecran_console_reset();
  ecran_console_log("Match PR\n\n");

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
 
  
  minuteur_attendre(500);
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n");
  minuteur_attendre(200);
  asserv_set_position(200, 150, MATH_PI2); // TBC
  asserv_maintenir_position();
  bouton_wait_start_up();
  
  minuteur_demarrer();
  minuteur_attendre(500);
  
  /** ------------
    Début du Match
    ------------- **/

  uint8_t error;
  bool continuer_boucle;
  int nb_iterations;
  
  int action;
  int const NOMBRE_ACTIONS = 2;
  int action_pr_nb_tentatives[NOMBRE_ACTIONS] = { 0 };
  int action_avancement[NOMBRE_ACTIONS] = { 0 };

  
  delay(2000);

  
  com_printfln("Sort de la zone de départ");
  error = aller_xy(200, 300, VITESSE_RAPIDE, 1, 3000, 10);

  
  action = 0;
  
  /** ----------------------------------
    Bouclage sur les actions principales
    ------------------------------------ **/
    
  do {
    continuer_boucle = true;
    
    
    /** On effectue l'action **/
    
    action_pr_nb_tentatives[action]++;
    
    switch(action) {
      case 0:
        action_avancement[action] = pr_activer_panneau(action_avancement[action]);
        break;
        
      case 1:
        action_avancement[action] = pr_rapporter_CUB(0, action_avancement[action]);
        break;
        
      default:
        com_printfln("! ######### ERREUR : action inconnue");
    }
    
    
    com_printfln("::: Action %d [%d] :::", action, action_avancement[action]);
    

    /** Recherche de la prochaine action à effectuer **/
    // (celle qui n'a pas encore un statut OK)
    nb_iterations = 0;      
    do {
      action++;
      action = action % NOMBRE_ACTIONS;
      
      nb_iterations++;
      com_printfln("Prochaine action : %d [%d] ?", action, action_avancement[action]);
    } while(action_avancement[action] == 100 && nb_iterations <= NOMBRE_ACTIONS);
    // tant qu'on n'a pas réussi toutes les actions (on ne parcourt cette liste qu'une fois, sinon boucle infinie)
    
    
    if(action_avancement[action] == 100) {
      // On a déjà tout réussi, on pourra s'arrêter ici
      continuer_boucle = false;
    }
    
  } while(continuer_boucle);
  
  minuteur_attendre_fin_match();
}


/** ============
  Actions de jeu
  ============== **/
/*
uint8_t pr_jouer_action(int action) {  
  uint8_t error;

  switch(action) {
    case ACTION_ALLUMER_PANNEAU:    error = pr_allumer_panneau(); break;
    case ACTION_RAPPORTER_CUB0:   error = rapporter_CUB(0); break;
    case ACTION_RAPPORTER_CUB1:   error = rapporter_CUB(1); break;
    case ACTION_RAPPORTER_CUB2:   error = rapporter_CUB(2); break;
    default:
      com_printfln("PR ne peut pas faire l'action %d", action);
      error = ERROR_PARAMETRE;
  }
  
  if(error) {
    com_err2str(error);
    if(error == ERROR_PLUS_RIEN_A_FAIRE) return OK
  }
  
  return error;
}*/  
  
int pr_activer_panneau(int depart) {
  uint8_t error;
  com_printfln("==== Activation du panneau ====");

  /*** TODO Ensemble des points à confirmer ***/
  
  
  // Se positionne face à l'interrupteur
  error = aller_pt_etape(PT_ETAPE_11, VITESSE_RAPIDE, 1, 5000, 5);
  if(error) return 0;
  
  error = asserv_rotation_vers_point(1130, 0);
  if(error) return 0;
  
  // Lever le bras
  piloter_bras(BRAS_POSITION_INTERRUPTEUR);
  
  // Enclencher l'interrupteur
  error = aller_xy(1130, 100, VITESSE_RAPIDE, 1, 2000, 5);
  if(error) {
    piloter_bras(BRAS_BAISSER);
    return 20;
  }
  
  // Reculer
  error = aller_pt_etape(PT_ETAPE_11, VITESSE_RAPIDE, 0, 5000, 3);
  piloter_bras(BRAS_BAISSER);
  
  return 100;
}

int pr_rapporter_CUB(int cub, int depart) {
  uint8_t error;
  
  com_printfln("==== Rapporter CUB%d ====", cub);
  
  if(cub >= 3) {
    com_printfln("! ####### cub doit être 0 1 ou 2 (reçu : %d)", cub);
    com_err2str(ERROR_PARAMETRE);
    return 100;
  }
  
  switch(depart) {
    case 0:
    
      // On se positionne devant les cubes à des endroits savamment étudiés
      switch(cub) {
        case 0:
          error = aller_xy(1130, 600, VITESSE_RAPIDE, 1, 5000, 3);
          if(error) return 0;
          
          error = aller_xy(880, 750, VITESSE_RAPIDE, 1, 3000, 3);
          if(error) return 0;
          break;
          
          
        case 1:
          com_err2str(ERROR_PAS_CODE);
          return 100;
          break;
          
          
        case 2:
          com_err2str(ERROR_PAS_CODE);
          return 100;
          break;
      }
    
      break;
      
    case 60:
      // On a abandonné les cubes lors d'une précédente tentative.
      // Essayons de se replacer près d'eux
      
      if(pr_pt_CUB[cub].x < 200    // Trop proche du bord gauche
        || pr_pt_CUB[cub].x > 1300 // Trop proche de l'adversaire
        || pr_pt_CUB[cub].y > 1100 // Trop proche du bord bas
        || pr_pt_CUB[cub].y < 900) { // Trop proche de la zone de construction, l'échec était sans doute dû à un timeout...
        com_err2str(ERROR_CAS_NON_GERE);
        return 100;
      }
      
      error = aller_xy(pr_pt_CUB[cub].x, pr_pt_CUB[cub].y, VITESSE_RAPIDE, 1, 5000, 3);
      if(error) return 60;
      
      break;
      
    default:
      com_err2str(ERROR_PARAMETRE);
      com_printfln("Attendu : 0|60 ; Reçu : %d", depart);
      return 0;
  }
  
  
  // Déplacement vers la zone de construction
  switch(cub) {
    case 0:    
      error = aller_xy(820, 150, VITESSE_POUSSER_CUBES, 1, 8000, 6);
      break;
    case 1:
      error = aller_xy(550, 150, VITESSE_POUSSER_CUBES, 1, 8000, 6);
      break;
    case 2:
      error = aller_xy(700, 150, VITESSE_POUSSER_CUBES, 1, 8000, 6);
      break;
  }
  
  // Erreur lorsqu'on a voulu rapporter les cubes
  // Abandon mais sauvegarde de l'emplacement des cubes
  if(error) {
    // En réalité, on sauvegarde la position du robot, mais c'est pas si mal
    pr_pt_CUB[cub].x = robot.xMm;
    pr_pt_CUB[cub].y = robot.yMm;
  
    com_printfln("CUB%d placé en {%d, %d}", cub, robot.xMm, robot.yMm);
    return 60;
  }
  
  
  return 100;
}
  

  
/** =============
  Actions de base
  =============== **/

void match_pr_arret() {
  com_printfln("On stop les moteurs");
  asserv_consigne_stop();
}

/** =======================
  Positionnement des Servos
  ========================= **/
  
void pr_init_servos() {
  com_printfln("Initialisation des servos");
  
  // Ne jamais utiliser doucement pendant l'init
  piloter_bras(BRAS_INIT);
}
  
  
void piloter_bras(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_bras, angle_bras, angle);
  }
  else {
    servo_bras.write(angle);
  }
  
  if(log) {
    com_print("Positionnement du bras : ");
    switch(angle) {
      case BRAS_INIT: com_printfln("Init"); break;
      case BRAS_LEVER: com_printfln("Levé"); break;
      case BRAS_POSITION_INTERRUPTEUR: com_printfln("Interrupteur"); break;
      case BRAS_BAISSER: com_printfln("Baissé"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}


/** ==============================
  Initialisation des données robot
  ================================ **/

// Initialisation des variables de configuration
// Initialisation des actionneurs spécifiques

void pr_init() {
  robot.IS_PR = true; // première instruction dès que possible avant menu, match, etc

  // Valeurs PR2016 = Alien2017 = Alien2018
  robot.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 1mm -> 12.25 pas
  robot.ASSERV_COEFF_TICKS_PAR_RADIAN = 2207.0f; // 1rad -> 2207pas
  robot.ASSERV_DISTANCE_KP = 0.15f; // 30 avril pr
  robot.ASSERV_DISTANCE_KD = 1.5f; // 30 avril pr
  robot.ASSERV_ROTATION_KP = 0.09f; // 30 avril pr
  robot.ASSERV_ROTATION_KD = 1.1f; // 30 avril pr
}