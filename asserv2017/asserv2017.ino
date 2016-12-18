// ####################################
// Libs
// ####################################

#include <Adafruit_GFX.h>    // Core graphics library
#include <Adafruit_ST7735.h> // Hardware-specific library
#include <FlexiTimer2.h>
#include <Metro.h>
#include <SPI.h>
#include <elapsedMillis.h>
#include <Ethernet.h>
#include <socket.h>
#include <w5100.h> // modifier constancte W5200_RESET_PIN
#include <EEPROM.h>

#include "asserv2017.h"

// ####################################
// Globals
// ####################################

Robot robot;
Config config;

volatile uint8_t lock_loop;
elapsedMicros time_total;
elapsedMicros time_solo;
IntervalTimer timer;

// ####################################
// Setup
// ####################################

#define sclk 14 // SCLK can be pin 13 or 14
#define mosi 11 // MOSI can be pin 7 or 11
#define miso 12 // MISO can be pin 12 or 8

void setup() {
  Serial.begin(9600);
  // https://www.pjrc.com/teensy/td_libs_SPI.html
  SPI.setSCK(sclk);
  // SPI.setMOSI(mosi);
  // SPI.setMISO(miso);
  SPI.begin();

  ecran_setup();
  general_setup();
  SPI.setSCK(sclk); // après l'écran car il le remet sur le 13

  // // Affectation de SCLK sur pin 14 au lieu de 13, après le init de l'écran
  // // Pin 13 as normal digital
  // CORE_PIN13_CONFIG = PORT_PCR_MUX(1); //   Alt1 = PTC5.  chip pin PTC5
  // // And then reassign pin 14 to SCK
  // CORE_PIN14_CONFIG = PORT_PCR_DSE | PORT_PCR_MUX(2); // Alt2=SPIO_SCK.  chip pin PTD1

  ecran_console_reset();
  ecran_console_log("Ecran OK\n");

  ecran_console_log("Init W5200 mac/ip\n");
  if (!sick_setup()) {
    ecran_console_error("Init W5200 ERROR\n");
    return;
  }
  ecran_console_log("Init W5200 OK\n");

  ecran_console_log("Connexion SICK");
  while (1) {
    if (sick_connect()) {
      ecran_console_log(" OK\n");
      break;
    } else if (!digitalRead(PIN_DIN_SELECT)) {
      ecran_console_log("\nPassing\n");
      while(!digitalRead(PIN_DIN_SELECT));
      delay(5);
      break;
    } else {
      ecran_console_error(".");
      delay(100);
    }
  }

  ecran_console_log("Commande stream");
  while (1) {
    if (sick_start_stream()) {
      // la led clignote, ça veut dire que start_stream passe le SPI au mauvais endroit
      ecran_console_log(" OK\n");
      break;
    } else if (!digitalRead(PIN_DIN_SELECT)) {
      ecran_console_log("\nPassing\n");
      while(!digitalRead(PIN_DIN_SELECT));
      delay(5);
      break;
    } else {
      ecran_console_error(".");
      delay(100);
    }
  }

  ecran_console_log("Init rest...\n");
  led_setup(); // après les périph SPI pour l'init du pin 13
  codeurs_setup();
  com_setup();
  moteurs_init();
  asserv_setup();
  tone_setup();
  tone_play_start();

  ecran_console_log("Starting interrupt...\n");
  // https://www.pjrc.com/teensy/td_timing_IntervalTimer.html
  timer.begin(interruption_sample, DT_US);
  timer.priority(0);

  ecran_console_log("Starting menu...\n");
  menu_start();
}

void loop() {

}

void interruption_sample() {
  if (lock_loop == 2) {
    return;
  }
  lock_loop = 2; // évite de rentrer dans la fonction si elle est déjà en cours

  time_total = 0;
  unsigned long time = micros();

  tone_loop();

  time_solo = 0;
  codeurs_sync();
  robot.time_codeurs = time_solo;

  time_solo = 0;
  sick_read_data();
  robot.time_sick = time_solo;

  tone_loop();
  general_loop();

  localisation_loop();
  asservissement_polaire();

  tone_loop();
  com_loop();
  led_update();
  tone_loop();

  if ((micros() - time) >= DT_US) {
    Serial.print("INT ERR ");
    // Serial.print("Surcharge interruption: ");
    Serial.print((micros() - time));
    Serial.print("us total, ");
    Serial.print(robot.time_codeurs);
    Serial.print("us codeurs, ");
    Serial.print(robot.time_sick);
    Serial.print("us sick");
    Serial.println();
  }
    // Serial.print(robot.time_sick);
    // Serial.print("us sick");
    // Serial.println();

  lock_loop = 0;
}

/* Attend la saisie des capteurs de l'interruption */
void synchronisation() {
  lock_loop = 1;
  while(lock_loop);
}

