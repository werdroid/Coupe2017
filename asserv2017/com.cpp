#include "asserv2017.h"

// USB serial: https://www.pjrc.com/teensy/td_serial.html#txbuffer
// UART serial: https://www.pjrc.com/teensy/td_uart.html

// écrire "coucou" prend 8 microsecondes

static Metro metro = Metro(100);

typedef struct {
  unsigned long millis;
} TrameMonitor; // 8 octets

TrameMonitor trameMontor;

void com_send_robot_infos() {
  if (lock_loop == 0) {
    synchronisation();
  }

  trameMontor.millis = millis();

  Serial.print('@');
  Serial.write((const uint8_t*) &trameMontor, sizeof(TrameMonitor));
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