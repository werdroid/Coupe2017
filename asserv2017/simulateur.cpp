////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////

#ifdef __EMSCRIPTEN__

#include "asserv2017.h"
#include <stdarg.h>
#include <string.h>
#include <emscripten.h> // emscripten_sleep, emscripten_run_script_int
// https://kripken.github.io/emscripten-site/docs/porting/emterpreter.html#emterpreter-async-run-synchronous-code
// emcc asserv2017/match.cpp asserv2017/match_pr.cpp -s EMTERPRETIFY=1 -s EMTERPRETIFY_ASYNC=1 -s ASSERTIONS=1 -s EXPORTED_FUNCTIONS="['_match_pr']" -s DEMANGLE_SUPPORT=1 -std=c++11
// require('./a.out.js')._match_pr();

// Réimlémentation de tout le bas niveau pour être simulé:
// Libs arduino: Servo, delay, millis
// Libs werdroid: ecran, bouton, asserv,

Robot robot;

void Servo::write(int angle) {
  // Rien à faire
}
void Servo::attach(int pin) {
  // Rien à faire
}

unsigned long millis() {
  return EM_ASM_INT({return +new Date}); // donne la date en ms
}

void delay(long time) {
  emscripten_sleep(time); // ms
}

void ecran_console_reset() {
  return;
}

void ecran_console_log(const char* message) {
  com_printfln("ECRAN: %s", message);
}

void com_serial1_print(const char* str) {
  com_printfln("SERIAL1: %s", str);
}

void com_print(const char* msg) { EM_ASM_({ traiterMessage($0 ? 0 : 1, Pointer_stringify($1));}, robot.IS_PR, msg); }

// Taille max d'un log, doit être le plus court possible, la communication prend du temps
// Ls deux derniers caractères sont \n et \0
constexpr uint8_t MAX_LOG_LEN = 80 + 2;
char dest[MAX_LOG_LEN];
void com_printfln(const char* format, ...) {
  va_list args;
  va_start(args, format);
  vsnprintf(dest, MAX_LOG_LEN - 1, format, args); // keep one char for \n
  va_end(args);
  strcat(dest, "\n");
  com_print(dest);
}

TrameMonitor trameMonitor;
void com_send_robot_state() {
  trameMonitor.millis = millis();
  trameMonitor.a = robot.a;
  trameMonitor.xMm = robot.xMm; // mm
  trameMonitor.yMm = robot.yMm; // mm
  trameMonitor.isPR = robot.IS_PR;

  EM_ASM_({
    var ptr = $0;
    var size = $1;
    var robot = $2 ? 0 : 1;
    var buffer = Module.HEAPU8.buffer.slice(ptr, ptr + size);
    traiterTrameMonitor(robot, buffer);
  }, &trameMonitor, sizeof(trameMonitor), robot.IS_PR);
}

void bouton_start_down() {}
void bouton_wait_start_up() {}
void bouton_wait_select_down() {}
void bouton_wait_select_up() {}

void asserv_vitesse_distance(uint32_t v) {}
void asserv_vitesse_rotation(uint32_t v) {}
void asserv_set_position(int32_t x, int32_t y, float a) {
  robot.xMm = symetrie_x(x);
  robot.yMm = y;
  robot.a = symetrie_a_axiale_y(a);
  com_send_robot_state(); // données changées donc on envoie au monitor
}
void asserv_maintenir_position() {}
void asserv_consigne_stop() {}
void asserv_consigne_pwm(uint16_t gauche, uint16_t droite) {}
void asserv_consigne_polaire(int32_t distance, int32_t rotation) {}
void asserv_consigne_polaire_delta(int32_t distance_mm_delta, float rotation_rad_delta) {}
uint8_t asserv_consigne_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t uniquement_avant) {

  // le vecteur à faire
  int32_t vx = consigne_x_mm - robot.xMm; // mm
  int32_t vy = consigne_y_mm - robot.yMm; // mm
  robot.a = atan2(vy, vx);

  /*
  // Il peut être intéressant d'afficher des points intermédiaires pour vérifier l'orientation du robot
  // (permettrait surtout de repérer une marche arrière)
  // Pas réussi à réintégrer les calculs marche arrière / marche avant, ce sera pour plus tard ( TODO )
  int i;
  int points_intermediaires = 3;
  for(i = 1; i < points_intermediaires; i++) {
    robot.xMm = robot.xMm + vx/points_intermediaires;
    robot.yMm = robot.yMm + vy/points_intermediaires;
    com_send_robot_state(); // données changées donc on envoie au monitor
  }
  */

  robot.xMm = consigne_x_mm;
  robot.yMm = consigne_y_mm;
  com_send_robot_state(); // données changées donc on envoie au monitor
  return OK;
}
uint8_t asserv_distance(int32_t consigne_mm, uint16_t timeout) {
  robot.xMm += consigne_mm * cos(robot.a);
  robot.yMm += consigne_mm * sin(robot.a);
  // cette fonction est faite pour se recaler, ici on le fait numériquement
  if (robot.xMm < 0) robot.xMm = 0;
  if (robot.yMm < 0) robot.yMm = 0;
  if (robot.xMm > TABLE_LARGEUR_X) robot.xMm = TABLE_LARGEUR_X;
  if (robot.yMm > TABLE_LARGEUR_Y) robot.yMm = TABLE_LARGEUR_Y;
  com_send_robot_state(); // données changées donc on envoie au monitor
  return OK;
}
uint8_t asserv_go_toutdroit(int32_t consigne_mm, uint16_t timeout) {
  robot.xMm += consigne_mm * cos(robot.a);
  robot.yMm += consigne_mm * sin(robot.a);

  com_send_robot_state(); // données changées donc on envoie au monitor
  return OK;
}
uint8_t asserv_go_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t timeout, uint16_t uniquement_avant) {
  asserv_consigne_xy(consigne_x_mm, consigne_y_mm);
  return OK;
}
uint8_t asserv_rotation_relative(float rotation_rad, uint16_t timeout) {
  robot.a += rotation_rad;
  com_send_robot_state(); // données changées donc on envoie au monitor
  return OK;
}
uint8_t asserv_rotation_vers_point(int32_t x_mm, int32_t y_mm, uint16_t timeout) {
  int32_t vx = x_mm - robot.xMm;
  int32_t vy = y_mm - robot.yMm;
  float angle_relatif_a_faire = atan2(vy, vx); // [-pi, +pi] radians
  return asserv_rotation_relative(angle_relatif_a_faire);
}

void tone_play_start() { com_printfln("SIMU: musique start"); }
void tone_play_alert() { com_printfln("SIMU: musique alert"); }
void tone_play_end() { com_printfln("SIMU: musique end"); }

#endif // __EMSCRIPTEN__

//////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////