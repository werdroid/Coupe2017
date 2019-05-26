#include "asserv2017.h"

#define PIN_DOUT_LED_INTERN 13

// ####################################
// LED activity
// ####################################

static Metro metro = Metro(0);

void led_setup() {
  pinMode(PIN_DOUT_LED_INTERN, OUTPUT);
  digitalWrite(PIN_DOUT_LED_INTERN, HIGH);
  led_blink_slow();
  metro.reset();
}

void led_update() {
  if (metro.check()) {
    robot.led_state = 1 - robot.led_state;
    digitalWrite(PIN_DOUT_LED_INTERN, robot.led_state);
    xBee_lumiere(robot.led_state);
  }
}

void led_blink_slow() {
  metro.interval(800);
}

void led_blink_quick() {
  metro.interval(100);
}
