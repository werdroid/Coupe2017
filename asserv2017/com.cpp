#include "asserv2017.h"

// USB serial: https://www.pjrc.com/teensy/td_serial.html#txbuffer
// UART serial: https://www.pjrc.com/teensy/td_uart.html

// écrire "coucou" prend 8 microsecondes

static Metro metro = Metro(100);

typedef struct {
  unsigned long millis;
} TrameMonitor; // 8 octets

TrameMonitor trameMonitor;

void com_send_robot_infos() {
  if (lock_loop == RT_STATE_SLEEP) {
    synchronisation();
  }

  trameMonitor.millis = millis();
  /*

  Serial.print('@');
  Serial.write((const uint8_t*) &trameMonitor, sizeof(TrameMonitor));
  Serial.println();//*/

  // Patch lecture comme 2016
  Serial.print("@|Position|\"mmX\":");
  Serial.print(robot.xMm);Serial.print(",\"mmY\":");Serial.print(robot.yMm);
  Serial.print(",\"angleRad\":");
  Serial.print(robot.a);
  Serial.print(",\"angleDeg\":");
  Serial.print(rad2deg(robot.a));
  Serial.print(",\"consigneXmm\":");
  Serial.print(robot.consigneXmm);
  Serial.print(",\"consigneYmm\":");
  Serial.print(robot.consigneYmm);
  Serial.println();

  /*Serial.print("angleDeg");
  Serial.println(rad2deg(robot.a));*/

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

// ####################################
// Communication
// ####################################

void com_setup() {
  Serial.begin(115200);
  metro.reset();
}

void com_loop() {
  if (metro.check()) {
    com_send_robot_infos();
  }
}

// Déclaré et implémenté sous forme de macro dans le header:
// void com_log_println(X);
// void com_log_print(X);
