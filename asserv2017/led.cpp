#include "asserv2017.h"

#define PIN_DOUT_LED_INTERN 13

// ####################################
// LED activity
// ####################################

static uint8_t led_state = 1;
static Metro metro = Metro(0);

void led_setup() {
  pinMode(PIN_DOUT_LED_INTERN, OUTPUT);
  digitalWrite(PIN_DOUT_LED_INTERN, HIGH);
  led_blink_slow();
  metro.reset();
}

void led_update() {
  if (metro.check()) {
    led_state = 1 - led_state;
    digitalWrite(PIN_DOUT_LED_INTERN, led_state);
    com_printfln("#LedChange");
  }
}

void led_blink_slow() {
  metro.interval(800);
}

void led_blink_quick() {
  metro.interval(100);
}
