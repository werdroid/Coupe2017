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

volatile uint8_t lock_loop = RT_STATE_NOTSTARTED; // thread RT pas encore démarré
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
  boutons_init();

  // Configuration des constantes et actionneurs
  if (analogRead(A12) < 512) { // 0V=PR et 5V=GR (sur 1024)
    pr_init();
  } else {
    gr_init();
  }

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
    } else if (boutons_select_down()) {
      ecran_console_log("\nPassing\n");
      while(boutons_select_down());
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
    } else if (boutons_select_down()) {
      ecran_console_log("\nPassing\n");
      while(boutons_select_down());
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
  timer.priority(128); // min 128, systick qui gère le temps est sur 32 !!
  // Priority numbers are 0 to 255, where lower numbers means higher priority.
  // The Systick interrupt that updates millis is assigned priority 32.
  // By default, Teensyduino defaults most interrupts for priority 128.
  // USB is at 112.
  // Hardware serial is 64.
  // Audio library processing of data is done at 208.
  // Non-interrupt code effectively runs at priority 256.
  // If you use an interrupt, you can set it to any priority you like. If you don't, you'll get the 128 default.
  // Teensy 3.1 can support up to 16 levels of nesting, so priority levels 0 to 15 are all the same, 16 to 31 are the same, and so on
  // IntervalTimer for priority 48, on Teensy 3.1/3.2 it will not block Systick at 32

  // ecran_console_log("Starting menu...\n");
  // menu_start();
  // Lancement du programme du robot
  if (analogRead(A12) < 512) { // 0V=PR et 5V=GR (sur 1024)
    pr_main();
  } else {
    gr_main();
  }
}

void loop() {

}

void interruption_sample() {
  if (lock_loop == RT_STATE_RUNNING) {
    return;
  }
  lock_loop = RT_STATE_RUNNING; // évite de rentrer dans la fonction si elle est déjà en cours

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
  boutons_all_pressed_restart();

  localisation_loop();
  asserv_loop();

  tone_loop();
  com_loop();
  led_update();
  tone_loop();

  if ((micros() - time) >= DT_US) {
    com_log_println("RT INTERRUPTION TOO LONG");
    com_log_println((micros() - time));
  }

  lock_loop = RT_STATE_SLEEP;
}

/* Attend la saisie des capteurs de l'interruption */
void synchronisation() {
  lock_loop = RT_STATE_WAITING;
  while(!RT_STATE_SLEEP);
}

