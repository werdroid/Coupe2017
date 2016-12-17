#include "asserv2017.h"

Bounce start_button = Bounce(PIN_DIN_START, 10);
Bounce select_button = Bounce(PIN_DIN_SELECT, 10);

void wait_start_button_down() {
  for (;;) {
    if (start_button.update() && start_button.fallingEdge()) {
      Serial.println("Button 'Start' down");
      break;
    }
  }
}

void wait_start_button_up() {
  for (;;) {
    if (start_button.update() && start_button.risingEdge()) {
      Serial.println("Button 'Start' up");
      break;
    }
  }
}

void wait_select_button_down() {
  for (;;) {
    if (select_button.update() && select_button.fallingEdge()) {
      Serial.println("Button 'Select' down");
      break;
    }
  }
}

void wait_select_button_up() {
  for (;;) {
    if (select_button.update() && select_button.risingEdge()) {
      Serial.println("Button 'Select' up");
      break;
    }
  }
}

void softRestart() {
  // SCB_AIRCR = 0x05FA0004;
  _reboot_Teensyduino_();
}

void general_setup() {
  pinMode(PIN_DIN_SELECT, INPUT_PULLUP);
  pinMode(PIN_DIN_START, INPUT_PULLUP);
  pinMode(PIN_DIN_START, INPUT_PULLUP);

  /*
  typedef struct {
    bool IS_PR;
    float ASSERV_COEFF_TICKS_PAR_MM;
    float ASSERV_COEFF_TICKS_PAR_RADIAN;
    float ASSERV_DISTANCE_KP;
    float ASSERV_DISTANCE_KD;
    float ASSERV_ROTATION_KP;
    float ASSERV_ROTATION_KD;
  } Config;
  */
  if (analogRead(A12) < 512) { // 0V=PR et 5V=GR (sur 1024)
    Serial.println("PETIT ROBOT");
    config.IS_PR = 1;
    config.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 1mm -> 12.25 pas
    config.ASSERV_COEFF_TICKS_PAR_RADIAN = 2207.0f; // 1rad -> 2207pas
    config.ASSERV_DISTANCE_KP = 0.15f; // 30 avril pr
    config.ASSERV_DISTANCE_KD = 1.5f; // 30 avril pr
    config.ASSERV_ROTATION_KP = 0.09f; // 30 avril pr
    config.ASSERV_ROTATION_KD = 1.1f; // 30 avril pr

    // 100*100/12.5 = 800mm/s
    // 10*100/12.5 = 80mm/s
    quadramp_init(&robot.ramp_distance);
    quadramp_set_1st_order_vars(&robot.ramp_distance, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_distance, 1, 1);

    quadramp_init(&robot.ramp_rotation);
    quadramp_set_1st_order_vars(&robot.ramp_rotation, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_rotation, 1, 1);
  } else {
    Serial.println("GRAND ROBOT");
    config.IS_PR = 0;
    config.ASSERV_COEFF_TICKS_PAR_MM = 12.25f; // 3 mai gr
    config.ASSERV_COEFF_TICKS_PAR_RADIAN = 3404.0f; // 4 mai gr
    config.ASSERV_DISTANCE_KP = 0.1f;
    config.ASSERV_DISTANCE_KD = 0.8f;
    config.ASSERV_ROTATION_KP = 0.1f;
    config.ASSERV_ROTATION_KD = 1.8f;

    // 100*100/12.5 = 800mm/s
    // 10*100/12.5 = 80mm/s
    quadramp_init(&robot.ramp_distance);
    quadramp_set_1st_order_vars(&robot.ramp_distance, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_distance, 1, 10);

    quadramp_init(&robot.ramp_rotation);
    quadramp_set_1st_order_vars(&robot.ramp_rotation, 100, 100);
    quadramp_set_2nd_order_vars(&robot.ramp_rotation, 1, 1);

    gr_rouleaux_stop();
  }
}

void general_loop() {
  int select = !digitalRead(PIN_DIN_SELECT);
  int start = !digitalRead(PIN_DIN_START);

  if (select && start) {
    softRestart();
  }
  if (select) {
    Serial.print("SELECT PRESSED\n");
  }
  if (start) {
    Serial.print("START PRESSED\n");
  }
}
