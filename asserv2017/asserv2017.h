#ifndef asserv2017_h
#define asserv2017_h

#include <Adafruit_GFX.h>    // Core graphics library
#include <Adafruit_ST7735.h> // Hardware-specific library
#include <inttypes.h>
#include <math.h>
#include <limits.h>
#include <climits>
#include <Arduino.h>
#include "LS7366R.h"
#include <elapsedMillis.h>
#include <Metro.h>
#include <Ethernet.h>
#include <socket.h>
#include <w5100.h>
#include <EEPROM.h>
#include <Servo.h>
#include <Bounce.h>

#define MATH_PI M_PI
#define MATH_2PI MATH_PI * 2.0
#define MATH_PI2 MATH_PI * 0.5

// ####################################
// Assert macro
// ####################################

#define assert(val, msg) char msg[val ? 0 : -1];

/*-----------------------------------------------------------------------------
 * Enum
 *----------------------------------------------------------------------------*/

const uint8_t OK = 0;
const uint8_t ERROR_TIMEOUT = 1;
const uint8_t ERROR_OBSTACLE = 2;
const uint8_t AUTRE = 127;

// Voir schéma table, les désignations ne correspondent pas aux termes du règlement
const uint8_t ZONE_INCONNUE = 0;
const uint8_t ZONE_CABINES = 10;
const uint8_t ZONE_CONSTRUCTION = 20;
const uint8_t ZONE_PECHE = 30;
const uint8_t ZONE_DUNE = 40;

const uint8_t RT_STATE_SLEEP = 0; // on est dans le main normal
const uint8_t RT_STATE_WAITING = 1; // le main attend la synchro de RT
const uint8_t RT_STATE_RUNNING = 2; // RT est en cours de fonctionnement
const uint8_t RT_STATE_NOTSTARTED = 4; // RT n'est pas encore lancé au boot

/*-----------------------------------------------------------------------------
 * Configuration
 *----------------------------------------------------------------------------*/

// General
#define HZ 100
#define DT (1.0/HZ)
#define DT_MS (DT*1000)
#define DT_US (DT*1000000)

#define TABLE_LARGEUR_X 3000 /* mm */
#define TABLE_LARGEUR_Y 2000 /* mm */

#define SPD_MAX_MM 200 // mm/s
#define ACC_MAX_MM 300 // mm/s2
// #define SPD_MAX SPD_MAX_MM * ASSERV_COEFF_TICKS_PAR_MM_PR // tick/s
// #define ACC_MAX ACC_MAX_MM * ASSERV_COEFF_TICKS_PAR_MM_PR // tick/s2

#define PIN_DIN_SELECT 2
#define PIN_DIN_START 3

/*-----------------------------------------------------------------------------
 * Data structures
 *----------------------------------------------------------------------------*/


struct quadramp_filter {
  uint32_t var_2nd_ord_pos;
  uint32_t var_2nd_ord_neg;
  uint32_t var_1st_ord_pos;
  uint32_t var_1st_ord_neg;

  int32_t previous_var;
  int32_t previous_out;
  int32_t previous_in;
};

typedef struct {
  uint8_t symetrie; // 0=violet 1=vert
  bool sans_symetrie; // 1=on fait pas les symmétries
  uint8_t coquillage;
  bool rouleaux_actifs;

  /* asserv states */
  uint8_t activeDistance;
  uint8_t activeRotation;
  uint32_t match_debut; // millis() de lancement

  int32_t codeurGauche; // tick
  int32_t codeurDroite; // tick

  // Localication
  int32_t distance; // tick
  int32_t rotation; // tick

  // Asserv
  struct quadramp_filter ramp_distance;
  struct quadramp_filter ramp_rotation;
  int32_t consigneDistance; // tick
  int32_t consigneRotation; // tick

  int32_t erreurDistance; // tick
  int32_t erreurRotation; // tick, positif = sens des aiguilles d'une montre

  int16_t moteurGauche;
  int16_t moteurDroite;
  int16_t pwm_max;

  // repère de la table x, y, a
  float x; // tick
  float y; // tick
  int32_t delta_d; // tick/t (vitesse)
  int32_t delta_r; // tick/t (vitesse)
  int16_t xMm; // mm
  int16_t yMm; // mm
  float   a; // radian
  int16_t pwm; // force la pwm si différent de zéro

  uint16_t consigneXmm; // mm
  uint16_t consigneYmm; // mm

  int32_t consigneX; // tick
  int32_t consigneY; // tick


  bool sickConnected;
  bool sickObstacle;
  uint32_t sickTramesVides;
  uint32_t sickTramesValides;
  uint32_t sickTramesInvalides;
  uint32_t sickTramesBytes;
  uint32_t sickTramesBytesTotal;
  uint16_t proche_index; // index du point le plus proche
  uint16_t proche_distance; // distance du point le plus proche

  // Profiling du CPU
  uint32_t time_codeurs;
  uint32_t time_sick;
} Robot;

typedef struct {
  int32_t x;
  int32_t y;
} Point; // 8 octets

typedef struct {
  int32_t x;
  int32_t y;
  int32_t a;
} Position; // 12 octets

typedef struct {
  bool IS_PR;
  float ASSERV_COEFF_TICKS_PAR_MM;
  float ASSERV_COEFF_TICKS_PAR_RADIAN;
  float ASSERV_DISTANCE_KP;
  float ASSERV_DISTANCE_KD;
  float ASSERV_ROTATION_KP;
  float ASSERV_ROTATION_KD;
} Config;

extern Robot robot;
extern Config config;
volatile extern uint8_t lock_loop;

/*-----------------------------------------------------------------------------
 * Functions prototypes
 *----------------------------------------------------------------------------*/

// Utils
int32_t low_pass(int32_t valeur_precedente, int32_t valeur, float coeff);
float normalize_radian(float a);
int32_t mm2tick(int32_t distance);
int32_t tick2mm(int32_t distance);
int32_t radian_vers_orientation(float distance);
float orientation_vers_radian(int32_t orientation);
int32_t rad2deg(float radian);
float deg2rad(int32_t degre);
int32_t symetrie_x(int32_t x);
float symetrie_a(float a);

// General
void synchronisation();
void general_setup();
void general_loop();
void wait_start_button_down();
void wait_start_button_up();

// Match
void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to);
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
void definir_vitesse_avance(uint32_t v);
void definir_vitesse_rotation(uint32_t v);
uint8_t localiser_zone();
uint8_t retour(uint8_t valeur);
bool temps_ecoule(uint32_t t0, uint32_t duree);
bool match_termine();

// PR
void debug_pr();
void match_pr();
void volets_fermer();
void volets_ouvrir();
void canne_baisser();
void canne_monter();


// GR
void grosse_dune_1();
void grosse_dune_2();
void grosse_dune_suite();
void petite_dune1();
void liberer_cubes();
void debug_gr();
void match_gr();
void funny_action();
void gr_parasol_init();
void gr_parasol_fermer();
void gr_parasol_ouvrir();

void gr_rouleaux_liberer();
void gr_rouleaux_avaler();
void gr_rouleaux_stop();

// Menu
void menu_start();

// Tone
void tone_setup();
void tone_loop();
void tone_play_start();
void tone_play_alert();
void tone_play_end();

// Moteurs
void moteurs_init();
void moteur_gauche(const int16_t pwm);
void moteur_droite(const int16_t pwm);

// Codeurs
void codeurs_setup();
void codeurs_sync();

// Localisation
void localisation_loop();
void localisation_set(Position position);
bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2);

// Asserv
void asserv_setup();
void asservissement_polaire();
void controlPos(float erreurDistance, float erreurRotation);
void controle_distance(int32_t erreurDistance);
void controle_rotation(float erreurRotationRadian);
void asserv_raz_consignes();

uint8_t tout_droit(int32_t distance, uint16_t timeout = 0);
uint8_t faire_rotation(float rotation_rad, uint16_t timeout = 0);
uint8_t consignesXY(int32_t consigneX, int32_t consigneY, uint16_t uniquement_avant = 0);
void consignesOrbite(int32_t consigneX, int32_t consigneY);
uint8_t asserv_goxy(int32_t consigneX, int32_t consigneY, uint16_t timeout = 0, uint16_t uniquement_avant = 0);
uint8_t asserv_goa(float orientation, uint16_t timeout = 5000, uint8_t sans_symetrie = 0);
uint8_t asserv_goa_point(int32_t consigneX, int32_t consigneY, uint16_t timeout = 0);

// Communication
void com_setup();
void com_loop();

void com_send_robot_infos();
#define com_log_println(X); if(lock_loop==0){synchronisation();}Serial.println(X);
#define com_log_print(X); if(lock_loop==0){synchronisation();}Serial.print(X);

// Monitor Panel
void monitorCodeurs();
void monitorMoteurs();
void monitorPosition();
void monitorAsserv();
void monitorErreurConsignes();
void monitorSickStats();

// LED activity
void led_setup();
void led_update();
void led_blink_slow();
void led_blink_quick();

// Ecran
void ecran_setup();
void ecran_console_reset();
void ecran_console_log(const char* message);
void ecran_console_error(const char* message);
void ecran_print_menu(int);
void ecran_print_menu_status();
void ecran_print_debug();

// SICK
uint8_t sick_setup();
uint8_t sick_connect();
uint8_t sick_connected();
size_t sick_start_stream();
uint8_t sick_read_data(); // met à jour distances_values et rssi_values
void sick_traiter_donnees(); // met à jour sickObstacle et points

// Manager
void manager_setup();
void manager_loop();

// Quadramp
void quadramp_init(struct quadramp_filter *q);
void quadramp_set_2nd_order_vars(struct quadramp_filter *q,
         uint32_t var_2nd_ord_pos,
         uint32_t var_2nd_ord_neg);
void quadramp_set_1st_order_vars(struct quadramp_filter *q,
         uint32_t var_1st_ord_pos,
         uint32_t var_1st_ord_neg);
uint8_t quadramp_is_finished(struct quadramp_filter *q);
int32_t quadramp_do_filter(struct quadramp_filter *q, int32_t in);
#define NEXT(n, i)  (((n) + (i)/(n)) >> 1)

#endif
