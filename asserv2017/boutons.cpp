#include "asserv2017.h"

#define PIN_DIN_SELECT 2
#define PIN_DIN_START 3

Bounce start_button = Bounce(PIN_DIN_START, 10);
Bounce select_button = Bounce(PIN_DIN_SELECT, 10);

void boutons_init() {
  pinMode(PIN_DIN_SELECT, INPUT_PULLUP);
  pinMode(PIN_DIN_START, INPUT_PULLUP);
}

// Accès à l'état des boutons

bool boutons_start_up() {
  return digitalRead(PIN_DIN_START);
}

bool boutons_start_down() {
  return !boutons_start_up();
}

bool boutons_select_up() {
  return digitalRead(PIN_DIN_SELECT);
}

bool boutons_select_down() {
  return !boutons_select_up();
}


// Redémarre la Teensy si les deux boutons sont appuyés au moment de l'appel

void boutons_all_pressed_restart() {
  if (boutons_select_down() && boutons_start_down()) {
    // SCB_AIRCR = 0x05FA0004;
    _reboot_Teensyduino_();
  }
}

void wait_start_button_down() {
  for (;;) {
    if (start_button.update() && start_button.fallingEdge()) {
      com_log_println("Button 'Start' down");
      break;
    }
  }
}

void wait_start_button_up() {
  for (;;) {
    if (start_button.update() && start_button.risingEdge()) {
      com_log_println("Button 'Start' up");
      break;
    }
  }
}

void wait_select_button_down() {
  for (;;) {
    if (select_button.update() && select_button.fallingEdge()) {
      com_log_println("Button 'Select' down");
      break;
    }
  }
}

void wait_select_button_up() {
  for (;;) {
    if (select_button.update() && select_button.risingEdge()) {
      com_log_println("Button 'Select' up");
      break;
    }
  }
}

