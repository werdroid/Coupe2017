#include "asserv2017.h"

/*Servo servo_canne;
Servo servo_volets;*/

/* Glossaire
  PCD : Petit Cratère Départ
  PCL : Petit Cratère Lunaire
  GCC : Grand Cratère Coin
  Depot : zone de sa couleur devant la soute de la navette (coin de la table)
  Depart : zone de sa couleur proche du milieu de la table
*/


void debug_gr() {
  ecran_console_log("2 sec\n\n");
  localisation_set({x: 1500, y: 1000, a: 0});

  delay(2000);


  ecran_console_log("DebutDuMatch\n");
  robot.match_debut = millis();

  aller_xy(3000, 1000, 100, 1, 3000, 50);

  tone_play_end();
}

void match_gr() {

  int start;
  uint8_t error;
  
  // Vitesses par défaut
  int const VITESSE_A_VIDE = 100;
  int const VITESSE_CHARGE = 80;
  
  // Variables de stratégie
  bool minerais_charges = false; // Etat chargé/à vide
  int action_en_cours = 0; // Numéro de l'action en cours
  int const nombre_actions = 5;
  int const nombre_attributs = 2;
  int etat_actions[nombre_actions][nombre_attributs] = { 0 };
  /*
    etat_actions :
    
    Dimension 1 :
      0 - recuperer_minerais_pcd4
      1 - recuperer_minerais_pcl
      2 - recuperer_minerais_gcc10
      3 - recuperer_minerais_gcc14
      4 - recuperer_minerais_pcd7
  
    Dimension 2 :
      0 - Visite (0 non, 1 oui)
      1 - Erreur  (1 oui)
  */
  
  // Variables internes
  int i;
  int nb_iterations;
  

  /** ==========================
    Préparation & Initialisation
    ============================ **/
  
  ecran_console_reset();
  ecran_console_log("Match GR\n\n");

  if(robot.symetrie) {
    ecran_console_log("Couleur : VERT\n");
  }
  else {
    ecran_console_log("Couleur : VIOLET\n");
  }
  ecran_console_log("\n\n");

  ecran_console_log("1. Positionner\n");
  ecran_console_log("2. Jack in\n");
  ecran_console_log("3. BAU off\n");
  ecran_console_log("4. Jack out\n\n");

  wait_start_button_down();
  ecran_console_log("Pret\n");

  localisation_set({x: 900, y: 200, a: 0});  // TBC
  asserv_raz_consignes();
  
  /***** TO DO *******/
  /*servo_canne.attach(5);
  //servo_canne.write(0); // rentré
  canne_monter();
  servo_volets.attach(4);
  volets_fermer();
  /************/

  wait_start_button_up();
  
  /** ============
    Début du match
    ============== **/
  
  ecran_console_log("DebutDuMatch\n");
  robot.match_debut = millis();
  

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
      
      switch(action_en_cours) {
        case 0: error = recuperer_minerais_pcd4(); break;
        case 1: error = recuperer_minerais_pcl(); break;
        case 2: error = recuperer_minerais_gcc10(); break;
        case 3: error = recuperer_minerais_gcc14(); break;
        case 4: error = recuperer_minerais_pcd7(); break;
        default:
          com_log_println("######### ERREUR : action_en_cours inconnu");
      }
      
      if(error) {
        etat_actions[action_en_cours][1] = 1; // Enregistrement de l'erreur
        com_log_println("Echec du chargement.");
      }
      else {
        etat_actions[action_en_cours][0] = 1; // Enregistrement de la visite
        minerais_charges = true;
        com_log_println("Minerais chargés.");
      }

      
      /** ===================
        Collecte des minerais
        ===================== **/
        
      while(minerais_charges && !match_termine()) {
      // [TODO] confirmer condition match_termine
      
        error = deposer_minerais_zone_depot();
        
        if(error) {
          // Minerais pas déposés : on se déplace à un point de secours pour revenir à la boucle while suivante
          com_log_println("Echec de la dépose. En route vers point de secours.");
          
          if(robot.xMm > 600 && robot.yMm < 1400) {
            //Pas de sous-gestion de l'erreur : Si erreur on retente d'aller au dépôt à la boucle while suivante
            //Marche arrière autorisée
            error = aller_pt_etape(PT_ETAPE_1, 100, 0, 15000, 3); 
          }
          else {
            //Pas de sous-gestion de l'erreur : Si erreur on retente d'aller au dépôt à la boucle while suivante
            //Marche arrière autorisée
            error = aller_pt_etape(PT_ETAPE_14, 100, 0, 15000, 3); 
          }
          
        }
        else {
          minerais_charges = false; // Minerais déposés
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
  
  
  funny_action();
  
  com_log_println("_______ Terminé");

  tone_play_end();
}


/* Points étapes et orientations à viser pour la collecte des minerais
PCD1 : pt4; x = 650; y = 540;
PCD2 : pt7; x = 650; y = 540;
PCL : pt14; x = 1070; y = 1870;
GCC1 : pt10; x = 0; y = 2000;
GCC2 : pt14; x = 0; y = 2000;
*/

uint8_t recuperer_minerais_pcd4() {
  uint8_t error;

  com_log_println("En route vers PCD via P4.");

  error = aller_pt_etape(PT_ETAPE_4, 100, 1, 10000, 3); 
  if(error) return error;

  com_log_println("PCD4 atteint.");

  error = asserv_goa_point(650, 540, 3000);
  if(error) return error;

  error = prendre_minerais();
  if(error) return error;

  error = aller_pt_etape(PT_ETAPE_4, 100, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés

  return OK;
}

uint8_t recuperer_minerais_pcd7() {
  uint8_t error;

  com_log_println("En route vers PCD via P7.");

  error = aller_pt_etape(PT_ETAPE_7, 100, 1, 10000, 3);
  if(error) return error;

  com_log_println("PCD7 atteint.");

  error = asserv_goa_point(650, 540, 3000);
  if(error) return error;

  error = prendre_minerais();
  if(error) return error;

  error = aller_pt_etape(PT_ETAPE_7, 100, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés

  return OK;
}

uint8_t recuperer_minerais_pcl() {
  uint8_t error;
  
  com_log_println("En route vers PCL.");

  error = aller_pt_etape(PT_ETAPE_14, 100, 1, 10000, 3);
  if(error) return error;

  com_log_println("PCL atteint.");

  error = asserv_goa_point(1070, 1870, 3000);
  if(error) return error;

  error = prendre_minerais();
  if(error) return error;

  error = aller_pt_etape(PT_ETAPE_14, 100, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés

  return OK;
}

uint8_t recuperer_minerais_gcc10() {
  uint8_t error;
  
  com_log_println("En route vers GCC via P10.");

  error = aller_pt_etape(PT_ETAPE_10, 100, 1, 10000, 3);
  if(error) return error;

  com_log_println("GCC10 atteint.");

  error = asserv_goa_point(0, 2000, 3000);
  if(error) return error;

  error = prendre_minerais();
  if(error) return error;

  error = aller_pt_etape(PT_ETAPE_10, 100, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés

  return OK;
}

uint8_t recuperer_minerais_gcc14() {
  uint8_t error;
  
  com_log_println("En route vers GCC via P14.");

  error = aller_pt_etape(PT_ETAPE_14, 100, 1, 10000, 3);
  if(error) return error;

  com_log_println("GCC14 atteint.");

  error = asserv_goa_point(0, 2000, 3000);
  if(error) return error;

  error = prendre_minerais();
  if(error) return error;

  error = aller_pt_etape(PT_ETAPE_14, 100, 0, 3000, 3); // Dégagement par l'arrière du cratère pour la rotation vers le dépôt
  // Pas de sous-gestion de l'erreur. Les minerais sont chargés.

  return OK;
}

uint8_t deposer_minerais_zone_depot() {
  uint8_t error;
  
  com_log_println("En route vers Dépôt.");

  error = aller_pt_etape(PT_ETAPE_7, 100, 1, 10000, 3);
  if(error) return error;

  com_log_println("Dépôt atteint.");

  error = asserv_goa_point(0, 300, 0);
  if(error) return error;

  error = deposer_minerais();
  if(error) return error;

  error = aller_pt_etape(PT_ETAPE_7, 100, 0, 3000, 3); // Dégagement par l'arrière du dépôt pour la rotation vers un cratère
  // Pas de sous-gestion de l'erreur. Les minerais sont déchargés.

  return OK;
}

uint8_t prendre_minerais() {
  uint8_t error;
  
  // TBD_AT. 
  // Prendre et déposer de front avec les deux bras ou de biais un bras à la fois après une rotation ?
  // Quel est l'encombrement du robot ? (=quel est le point x,y le plus proche à utiliser pour le début de la collecte?)

  //Draft
  //baisser_bras_droit();
  //lever_bras_droit();

  return OK;
}

uint8_t deposer_minerais() {
  uint8_t error;
  
  // TBD_AT
  // Déposer avec le bras droit possible malgré la bascule ?

  return OK;
}