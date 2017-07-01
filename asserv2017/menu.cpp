#include "asserv2017.h"

const uint EEPROM_ADDRESS_SELECT = 0;
const uint EEPROM_ADDRESS_COULEUR = 1;
const uint EEPROM_ADDRESS_COQUILLAGE = 2;
const uint EEPROM_ADDRESS_ROULEAUX = 3;

int menu_input_up();
void match_start();
void match_changer_couleur();
void match_changer_coquillage();
void match_activer_rouleaux();

void menu_start() {
  int selectLength = 9;
  int select, start;
  robot.symetrie = EEPROM.read(EEPROM_ADDRESS_COULEUR);
  robot.coquillage = EEPROM.read(EEPROM_ADDRESS_COQUILLAGE);
  robot.rouleaux_actifs = EEPROM.read(EEPROM_ADDRESS_ROULEAUX);
  robot.activer_monitor_sick = false;
  int selectPosition = EEPROM.read(EEPROM_ADDRESS_SELECT) % selectLength;
  int state_rouleaux = 0;
  ecran_print_menu(selectPosition);

  do {
    select = boutons_select_down();
    start = boutons_start_down();

    if (select && !start) {
      com_log_println("Select pressed");
      delay(5);
      selectPosition = (selectPosition + 1) % selectLength;
      EEPROM.write(EEPROM_ADDRESS_SELECT, selectPosition);
      ecran_print_menu(selectPosition);
      if (menu_input_up()) {
        com_log_println("Select released long");
        selectPosition = 0;
        EEPROM.write(EEPROM_ADDRESS_SELECT, selectPosition);
        ecran_print_menu(selectPosition);
      } else {
        com_log_println("Select released");
      }
      continue;
    }

    if (!select && start) {
      com_log_println("Start pressed");
      delay(5);
      menu_input_up();
      com_log_println("Start released");
      switch(selectPosition) {
        case 0:
          match_start();
          break;
        case 1:
          match_changer_couleur();
          ecran_print_menu(selectPosition);
          break;
        case 2:
          robot.activer_monitor_sick = !robot.activer_monitor_sick;
          if(robot.activer_monitor_sick) {
            localisation_set({x: 1500, y: 1000, a: MATH_PI2});
            asserv_raz_consignes();
          }
          ecran_print_menu(selectPosition);
          /*
          if(robot.IS_PR) {
            // Nothing
          }
          else {
            homologation_gr();
          }*/
          break;
        case 3:
          /*
          ecran_console_reset();
          ecran_console_log("Mode debug");

          localisation_set({x: 0, y: 0, a: 0});
          asserv_raz_consignes();

          for(;;);
          */
          ecran_console_reset();
          asserv_raz_consignes();
          ecran_console_log("Mode debug\n\n");
          ecran_console_log("Debut dans 5 sec\n\n");
          ecran_console_log("Relever BAU !\n");
          delay(3000);
          if(robot.IS_PR)
            debug_pr();
          else
            debug_gr();

          break;
        case 4:
          /*tout_droit(mm2tick(300));
          ecran_print_menu(selectPosition);*/
          ecran_console_reset();
          ecran_console_log("Coucou");
          gr_coucou();
          break;
        case 5:
          demo_allers_retours();
          /*ecran_console_reset();
          ecran_console_log("Tourner 10x");
          robot.activeDistance = 0;
          quadramp_set_1st_order_vars(&robot.ramp_rotation, 60, 60);
          asserv_consigne_polaire_delta(0, MATH_PI * 2 * 10);
          for(;;);*/
          break;
        case 6:
          if(1) {
            ecran_console_reset();
            ecran_console_log("30cm en avant");
            robot.activeRotation = 0;
            quadramp_set_1st_order_vars(&robot.ramp_distance, 100, 100);
            asserv_consigne_polaire_delta(300, 0);
            for(;;);
          }
          else {
            match_activer_rouleaux();
            ecran_print_menu(selectPosition);
          }
          break;
        case 7:
          ecran_console_reset();
          ecran_console_log("Part et revient");
          asserv_goxy(1000, 0);
          faire_rotation(MATH_PI * 2);
          asserv_goxy(0, 0);
          for(;;);
          break;
        case 8:
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
}

void match_changer_coquillage() {
  robot.coquillage = ((robot.coquillage + 1) % 5);
  EEPROM.write(EEPROM_ADDRESS_COQUILLAGE, robot.coquillage);
}

void match_activer_rouleaux() {
  robot.rouleaux_actifs = !robot.rouleaux_actifs;
  EEPROM.write(EEPROM_ADDRESS_ROULEAUX, robot.rouleaux_actifs);
}

