#include "asserv2017.h"
#include "match.h"


/** ============================================
  Déclarations constantes, variables, prototypes
  ============================================== */

uint8_t pr_activer_adp();
uint8_t pr_jouer_action(int action);

uint8_t pr_aller_vers_adp(uint32_t vitesse);
uint8_t pr_pousser_atome(uint8_t atome);

int pr_nb_tentatives[NB_ACTIONS] = { 0 };

/** =====================================
  Programmes alternatifs (Homolog, Debug)
  ======================================= **/

void homologation_pr() {
  ecran_console_reset();
  ecran_console_log("Match PR\n\n");

  if(robot.estJaune)
    ecran_console_log("Couleur : JAUNE\n");
  else
    ecran_console_log("Couleur : VIOLET\n");
  ecran_console_log("\n\n");
  
  ecran_console_log("Les arbitres sont\n");
  ecran_console_log("hyper sympa cette\n");
  ecran_console_log("annee.\n\n");
  
  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  
  ecran_console_log("Initialisation...");
 
  minuteur_attendre(500);
  
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n");
  
  minuteur_attendre(1000);
  
  asserv_set_position(235, 752, 0); // PT_ETAPE_2
  asserv_maintenir_position();
  bouton_wait_start_up();
  
  minuteur_demarrer();
  minuteur_attendre(1000);
 
  aller_xy(1250, 750, VITESSE_RAPIDE, 1, 10000, 50);
  pr_jouer_action(ACTION_POUSSER_ATOME0);
  asserv_go_toutdroit(-50, 2000);
  
  minuteur_attendre_fin_match();
}
  
void debug_pr() {
  ecran_console_log("2 sec\n\n");

  asserv_set_position(1500, 1000, MATH_PI);
  asserv_maintenir_position();
  delay(2000);

  minuteur_demarrer();

  //asserv_go_toutdroit(200, 2000);
  asserv_go_xy(1500, 800, 2000, 1);
  
  asserv_go_xy(1500,1000, 2000, 1);
  asserv_go_xy(1500, 800, 2000, 1);
  asserv_go_xy(1500,1000, 2000, 1);
  /*asserv_distance(-5000, 5000);
  tone_play_end();
  asserv_distance(2000, 2000);
  tone_play_end();
  asserv_distance(-5000, 5000);
*/

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
  
  #ifdef __EMSCRIPTEN__
  com_printfln("----------");
  com_printfln(__DATE__);
  com_printfln(__TIME__);
  com_printfln("----------");
  #endif
  
  
  ecran_console_reset();
  ecran_console_log("Match PR\n\n");
  
  
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
 
  minuteur_attendre(500);
  
  uint8_t error;
  uint8_t action;
  int nb_iterations = 0;
  uint8_t phase1[] = {
    ACTION_ACTIVER_ADP,
    ACTION_POUSSER_ATOME0,
    ACTION_POUSSER_ATOME1,
    ACTION_POUSSER_ATOME2,
    ACTION_POUSSER_ATOMES_CHAOS,
    ACTION_POUSSER_ATOMES_CHAOS_B
    // AS-tu bien retiré la virgule sur la dernière ligne ?
  };
  int len_phase1 = sizeof(phase1) / sizeof(action);
  
  
  pr_init_servos();
  
  ecran_console_log(" Ok\n");

  bouton_start_down();

  ecran_console_log("Pret\n");
  minuteur_attendre(200);
  
  //if(robot.estJaune)
    asserv_set_position(150, 450, 0); // TBC (grossièrement redium, proche PT_ETAPE_1)
  /*else
    asserv_set_position(299, 159, MATH_PI);*/
    
  asserv_maintenir_position();
  bouton_wait_start_up();
  
  minuteur_demarrer();
  minuteur_attendre(500);
  
  /** ------------
    Début du Match
    ------------- **/
  
  minuteur_attendre(3000);

  
  com_printfln("Sort de la zone de départ");
  asserv_go_toutdroit(200, 10000);
  
  
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
    
    pr_jouer_action(phase1[action]);
    
    // Conditions de fin de phase 1
    if(table.adp_active &&
      table.atome_a_bouge[0] && table.atome_a_bouge[1] && table.atome_a_bouge[2] && table.atome_a_bouge[3] && table.atome_a_bouge[4]) {
      com_printfln("=== Tout est fait ! ===");
      break;
    }
    
  }

  minuteur_attendre_fin_match();
}


/** ============
  Actions de jeu
  ============== **/


uint8_t pr_jouer_action(int action) {  
  uint8_t error;
  switch(action) {
    case ACTION_ACTIVER_ADP:             error = pr_activer_adp(); break;
    case ACTION_POUSSER_ATOME0:           error = pr_pousser_atome(0); break;
    case ACTION_POUSSER_ATOME1:           error = pr_pousser_atome(1); break;
    case ACTION_POUSSER_ATOME2:           error = pr_pousser_atome(2); break;
    case ACTION_POUSSER_ATOMES_CHAOS:     error = pr_pousser_atome(3); break;
    case ACTION_POUSSER_ATOMES_CHAOS_B:   error = pr_pousser_atome(4); break;
    default:
      com_printfln("PR ne peut pas faire l'action %d", action);
      error = ERROR_PARAMETRE;
  }
  
  if(error) {
    com_err2str(error);
    if(error == ERROR_PLUS_RIEN_A_FAIRE) return OK;
  }
  
  return error;
}
  

uint8_t pr_activer_adp() {
  uint8_t error;
  Point pt13 = getPoint(PT_ETAPE_13);
  
  if(table.adp_active) return ERROR_PLUS_RIEN_A_FAIRE;
  pr_nb_tentatives[ACTION_ACTIVER_ADP]++;
  
  error = pr_aller_vers_adp(VITESSE_RAPIDE);
  if(error) return error;
  com_printfln("Bien arrivé proche de l'ADP");
  // On arrive sur x = PT_ETAPE_13.x, mais y = 150 ou 450
  
  piloter_bras(BRAS_LEVER);
  
  error = asserv_rotation_vers_point(pt13.x, 0, 2000);
  if(error) return error;
  
  /****** TODO *******/
  com_printfln("## Programmer la suite ##");
  /****** TODO *******/
  
  table.adp_active = true;
  
  return OK;
  
}




uint8_t pr_pousser_atome(uint8_t atome) {
  uint8_t error;
  
  piloter_bras(BRAS_LEVER);
  
  error = pousser_atome(atome);
  
  if(error != ERROR_PLUS_RIEN_A_FAIRE) {
    switch(atome) {
      case 0: pr_nb_tentatives[ACTION_POUSSER_ATOME0]++; break;
      case 1: pr_nb_tentatives[ACTION_POUSSER_ATOME1]++; break;
      case 2: pr_nb_tentatives[ACTION_POUSSER_ATOME2]++; break;
      case 3: pr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS]++; break;
      case 4: pr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS_B]++; break;
    }
  }
  
  piloter_bras(BRAS_BAISSER);
  
  return error;
}
  
/** =============
  Actions de base
  =============== **/

uint8_t pr_aller_vers_adp(uint32_t vitesse) {
  /*
    essayer par chemin direct
    si gêné, descend un peu, et continue d'essayer par petits morceaux,
    en tentant de se remettre au plus près de la bordure régulièrement
    Si gêné, tente de se mettre au plus près de la bordure
  */
  
  const uint8_t SUIVRE_ROUTE = 1;
  const uint8_t ALLER_VERS_DEVIATION = 2;
  const uint8_t SUIVRE_DEVIATION = 4;
  const uint8_t REVENIR_VERS_ROUTE = 8;
  
  uint8_t error;
  Point ptDestination = getPoint(PT_ETAPE_13);
  uint8_t chemin = SUIVRE_ROUTE;
  uint8_t nb_boucles = 0;
  
  
  com_printfln("--- Direction Blueium ---");
  if(table.adp_active) return ERROR_PLUS_RIEN_A_FAIRE;
  
  
  // Déterminer des conditions de début ??
  if(!robot_dans_zone(0, 0, 1800, 600)) {
    error = aller_pt_etape(PT_ETAPE_3, vitesse, 1, 20000, 10);
    if(error) return error;
  }
  
  while(nb_boucles < 30) {
    nb_boucles++;
  
    switch(chemin) {
      case SUIVRE_ROUTE:
        error = aller_xy(ptDestination.x, ptDestination.y, vitesse, 1, 20000, 5);
        
        switch(error) {
          case ERROR_OBSTACLE:
            chemin = ALLER_VERS_DEVIATION;
            break;
          case OK:
            return OK;
            break;
          default:
            return error;
        }
        break;

      case ALLER_VERS_DEVIATION:
        // On essaye de se décaler
        error = aller_xy(robot.xMm, 450, vitesse, 1, 20000, 3);
        switch(error) {
          case ERROR_OBSTACLE:
            // PR est encerclé => obligé d'attendre un peu :
            minuteur_attendre(5000);
            chemin = SUIVRE_ROUTE;
            break;
          case OK:
            chemin = SUIVRE_DEVIATION;
            break;
          default:
            return error;
        }
        
        break;

      case SUIVRE_DEVIATION:
        error = aller_xy(ptDestination.x, 450, vitesse, 1, 20000, 5);
        switch(error) {
          case ERROR_OBSTACLE:
            chemin = REVENIR_VERS_ROUTE;
            break;
          case OK:
            return OK;
            break;
          default:
            return error;
        }
        break;

      case REVENIR_VERS_ROUTE:
          error = aller_xy(ptDestination.x, 150, vitesse, 1, 20000, 3);
          switch(error) {
            case ERROR_OBSTACLE:
              minuteur_attendre(5000);
              chemin = SUIVRE_DEVIATION;
              break;
            case OK:
              chemin = SUIVRE_ROUTE;
              break;
            default:
              return error;
          }
          break;

      default:
        return ERROR_CAS_NON_GERE;
    }

    if(nb_boucles >= 30) {
      return ERROR_TIMEOUT;
    }

  }
  
  return ERROR_TIMEOUT;
}

void match_pr_arret() {
  asserv_consigne_stop();
  com_printfln("On stop les moteurs");
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

  /*Valeurs de gain asserv PR2016 = Alien2017 = Alien2018 -- rétablis après test */
  robot.ASSERV_DISTANCE_KP = 0.15f; // 30 avril pr
  robot.ASSERV_DISTANCE_KD = 1.5f; // 30 avril pr
  robot.ASSERV_ROTATION_KP = 0.09f; // 30 avril pr
  robot.ASSERV_ROTATION_KD = 1.1f; // 30 avril pr

  //Réglage gains PR du 02/06/2018 [asserv sans rampe]
  /*robot.ASSERV_DISTANCE_KP = 0.06f;
  robot.ASSERV_DISTANCE_KD = 0.08f;
  robot.ASSERV_ROTATION_KP = 0.05f;
  robot.ASSERV_ROTATION_KD = 0.01;*/
 
  robot.DISTANCE_DETECTION = 750; // mm 9/05/2018
  
  robot.pwm_max_distance = 127;
  robot.pwm_max_rotation = 50;
  
  pr_attach_servos();
}
