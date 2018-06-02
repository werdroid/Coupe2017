#include "asserv2017.h"
#include <string.h>

// USB serial: https://www.pjrc.com/teensy/td_serial.html#txbuffer
// UART serial: https://www.pjrc.com/teensy/td_uart.html

// écrire "coucou" prend 8 microsecondes

static Metro metro = Metro(100);

TrameMonitor trameMonitor;


void com_send_robot_state() {
  if (lock_loop == RT_STATE_SLEEP) {
    synchronisation();
  }

  trameMonitor.millis = millis();
  trameMonitor.a = robot.a;
  trameMonitor.xMm = robot.xMm; // mm
  trameMonitor.yMm = robot.yMm; // mm
  trameMonitor.isPR = robot.IS_PR;
  trameMonitor.led_state = robot.led_state;

  trameMonitor.proche_distance = robot.proche_distance;
  trameMonitor.sickObstacle = robot.sickObstacle;
  trameMonitor.time_total = robot.time_total;

  Serial.write((uint8_t *)&trameMonitor, sizeof(trameMonitor));
}

// Ancienne méthode pour envoyer les infos sous forme textuelle
// Maintenant com_send_robot_state prend le relai et envoie du binaire
void com_send_robot_infos() {
  if (lock_loop == RT_STATE_SLEEP) {
    synchronisation();
  }

  Serial.print("@|Position|\"mmX\":");
  Serial.print(robot.xMm);
  Serial.print(",\"mmY\":");
  Serial.print(robot.yMm);
  Serial.print(",\"angleRad\":");
  Serial.print(robot.a);
  Serial.print(",\"angleDeg\":");
  Serial.print(rad2deg(robot.a));
  Serial.print(",\"consigneXmm\":");
  Serial.print(robot.consigneXmm);
  Serial.print(",\"consigneYmm\":");
  Serial.print(robot.consigneYmm);
  Serial.println();

  Serial.print("@|Sick|\"vides\":");
  Serial.print(robot.sickTramesVides);
  Serial.print(",\"valides\":");
  Serial.print(robot.sickTramesValides);
  Serial.print(",\"invalides\":");
  Serial.print(robot.sickTramesInvalides);
  Serial.print(",\"bytes\":");
  Serial.print(robot.sickTramesBytes);
  Serial.print(",\"total\":");
  Serial.print(robot.sickTramesBytesTotal);
  Serial.print(",\"distanceMm\":");
  Serial.print(robot.proche_distance); // mm
  Serial.print(",\"obstacle\":");
  Serial.print(robot.sickObstacle ? "\"oui\"" : "\"non\"");
  Serial.println();
}


// Renvoie la constante d'erreur sous forme de log
// Nota : pas forcément pertinent avec TIMEOUT et OBSTACLE qui sont déjà bien décrits dans match.cpp
uint8_t com_err2str(uint8_t error) {
  // Mettre également à jour simulateur.cpp
  switch(error) {
    case OK:
      com_printfln("OK");
      break;
    case ERROR_TIMEOUT:
      com_printfln("! ERROR_TIMEOUT");
      break;
    case ERROR_OBSTACLE:
      com_printfln("! ERROR_OBSTACLE");
      break;
    case ERROR_FIN_MATCH:
      com_printfln("! ERROR_FIN_MATCH");
      break;
    case ERROR_CAS_NON_GERE:
      com_printfln("! ERROR_CAS_NON_GERE");
      break;
    case ERROR_PARAMETRE:
      com_printfln("! ##### ERROR_PARAMETRE #####");
      break;
    case ERROR_PAS_CODE:
      com_printfln("! ERROR_PAS_CODE");
      break;
    case ERROR_PLUS_RIEN_A_FAIRE:
      com_printfln("! ERROR_PLUS_RIEN_A_FAIRE");
      break;
    case ERROR_PAS_POSSIBLE:
      com_printfln("! ERROR_PAS_POSSIBLE");
      break;
    case AUTRE:
      com_printfln("! # AUTRE");
      break;
    default:
      com_printfln("! ##### ERROR_??? : %d", error);
  }
  return error;
}

// ####################################
// Communication
// ####################################


void com_setup() {
  Serial.begin(115200); // serial par l'USB
  Serial1.begin(115200); // serial hardware pin 0 et 1
  Serial.setTimeout(300);
  metro.reset();
}

void com_loop() {
  if (metro.check()) {
    com_send_robot_state(); // envoie binaire
  }
}

// Taille max d'un log, doit être le plus court possible, la communication prend du temps
// Ls deux derniers caractères sont \n et \0
constexpr uint8_t MAX_LOG_LEN = 120 + 2;
char dest[MAX_LOG_LEN];
void com_printfln(const char* format, ...) {
  va_list args;
  va_start(args, format);
  vsnprintf(dest, MAX_LOG_LEN - 1, format, args); // keep one char for \n
  va_end(args);
  strcat(dest, "\n");
  com_print(dest);
}

// Sortie USB des logs
void com_print(const char* str) {
  if (lock_loop == RT_STATE_SLEEP) {
    synchronisation();
  }
  Serial.print(str);
}


// Sortie sur le pin 1

// Termine par \0 (pas de \n). Max = 50 caractères
constexpr uint8_t MAX_SERIAL1_LEN = 50 + 1;
char dest_serial1[MAX_SERIAL1_LEN];
void com_serial1_printf(const char* format, ...) {
  va_list args;
  va_start(args, format);
  vsnprintf(dest_serial1, MAX_SERIAL1_LEN, format, args);
  va_end(args);
  com_serial1_print(dest_serial1);
}

void com_serial1_print(const char* str) {
  if (lock_loop == RT_STATE_SLEEP) {
    synchronisation();
  }
  Serial1.print(str);
}
