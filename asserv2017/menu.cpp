#include "asserv2017.h"

const uint EEPROM_ADDRESS_SELECT = 0;
const uint EEPROM_ADDRESS_COULEUR = 1;
const uint EEPROM_ADDRESS_PROGRAMME = 2;
const uint EEPROM_ADDRESS_ROULEAUX = 3;

int menu_input_up();
void match_start();
void match_changer_couleur();
void match_activer_rouleaux();

void menu_start() {
  int selectLength = 9;
  int select, start;

  // Récupération depuis la mémoire permanente
  robot.symetrie = EEPROM.read(EEPROM_ADDRESS_COULEUR);
  robot.programme = EEPROM.read(EEPROM_ADDRESS_PROGRAMME);
  robot.rouleaux_actifs = EEPROM.read(EEPROM_ADDRESS_ROULEAUX);
  int selectPosition = EEPROM.read(EEPROM_ADDRESS_SELECT) % selectLength;

  ecran_print_menu(selectPosition);

  do {
    select = boutons_select_down();
    start = boutons_start_down();

    if (select && !start) {
      com_printfln("Select pressed");
      delay(5);
      selectPosition = (selectPosition + 1) % selectLength;
      EEPROM.write(EEPROM_ADDRESS_SELECT, selectPosition);
      ecran_print_menu(selectPosition);
      if (menu_input_up()) {
        com_printfln("Select released long");
        selectPosition = 0;
        EEPROM.write(EEPROM_ADDRESS_SELECT, selectPosition);
        ecran_print_menu(selectPosition);
      } else {
        com_printfln("Select released");
      }
      continue;
    }

    if (!select && start) {
      com_printfln("Start pressed");
      delay(5);
      menu_input_up();
      com_printfln("Start released");
      switch(selectPosition) {
        case 0:
          match_start();
          break;
          
        case 1:
          match_changer_couleur();
          ecran_print_menu(selectPosition);
          break;
          
        case 2:
          // Menu libre
          
          // match_activer_rouleaux();
          // ecran_print_menu(selectPosition);
          break;
          
        case 3:
          gr_fusee_init();
          static bool open = 0;
          if (open) {
            gr_fusee_fermer();
            open = 0;
          } else {
            gr_fusee_ouvrir();
            open = 1;
          }
          break;
          
        case 4:
          // Menu libre
          break;
          
        case 5:
          menu_changer_programme();
          ecran_print_menu(selectPosition);
          break;
          
        case 6:
          EEPROM.write(EEPROM_ADDRESS_PROGRAMME, robot.programme);  
        
          ecran_console_reset();
          switch(robot.programme) {
            case 0:
              asserv_maintenir_position();
              ecran_console_log("Mode debug\n\n");
              ecran_console_log("Debut dans 5 sec\n\n");
              ecran_console_log("Relever BAU !\n");
              delay(3000); // + 2 dans debug
              if(robot.IS_PR)
                debug_pr();
              else
                debug_gr();
              
              break;
            
            case 1:
              ecran_console_log("30cm en avant");
              robot.activeRotation = 0;
              quadramp_set_1st_order_vars(&robot.ramp_distance, 100, 100);
              asserv_consigne_polaire_delta(300, 0);
              for(;;);
              break;
            
            case 3:
              ecran_console_log("Part et revient");
              asserv_go_xy(1000, 0);
              asserv_rotation_relative(MATH_PI * 2);
              asserv_go_xy(0, 0);
              for(;;);
              break;
              
            case 4:
              ecran_console_log("Homologation");
              /*if(robot.IS_PR)
                homologation_pr();
              else*/
                homologation_gr();
              break;
            
            case 5:
              ecran_console_log("Coucou");
              gr_coucou();
              break;
              
            case 6:
              ecran_console_log("30cm en avant");
              demo_allers_retours();
              break;
             
            case 7:
              // Libre
              
              ecran_console_log("On avait pourtant\n");
              ecran_console_log("dit de ne pas\n");
              ecran_console_log("cliquer...\n\n");
              ecran_console_log("Il ne se passera\n");
              ecran_console_log("rien, vous pouvez\n");
              ecran_console_log("redemarrer.\n");
              break;
          
          }
          
          break;
          
        case 7:
          robot.activer_monitor_sick = !robot.activer_monitor_sick;
          if(robot.activer_monitor_sick) {
            asserv_set_position(1500, 1000, MATH_PI2);
            asserv_maintenir_position();
          }
          break;
          
        case 8:
          // Menu libre
          break;
      }
    }
  } while(1);
}

void menu_print(int selectPosition) {
  // afficher le menu
}

// bloque en attendant les entrées à OFF
int menu_input_up() {
  uint duration_start = millis();

  do {
    int select = boutons_select_down();
    int start = boutons_start_down();

    if (!select && !start) {
      delay(5);
      break;
    }
  } while(1);

  return (millis() - duration_start) > 1000; // long pressed
}

void match_start() {
  // deprecated
  if(robot.IS_PR) {
    match_pr();
  }
  else {
    match_gr();
  }
}

void match_changer_couleur() {
  robot.symetrie = !robot.symetrie;
  EEPROM.write(EEPROM_ADDRESS_COULEUR, robot.symetrie);
  
  robot.estVert = !robot.symetrie;
}

void match_activer_rouleaux() {
  robot.rouleaux_actifs = !robot.rouleaux_actifs;
  EEPROM.write(EEPROM_ADDRESS_ROULEAUX, robot.rouleaux_actifs);
}

void menu_changer_programme() {
  robot.programme = ((robot.programme + 1) % 8);
  //EEPROM.write(EEPROM_ADDRESS_PROGRAMME, robot.programme);
  // On ne va sauvegarder le choix qu'au moment du lancement du programme
}

