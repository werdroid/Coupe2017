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
const uint8_t ERROR_FIN_MATCH = 3;
const uint8_t ERROR_STRATEGIE = 4; // Par exemple, cas non géré
const uint8_t AUTRE = 127;

const uint8_t RT_STATE_SLEEP = 0; // on est dans le main normal
const uint8_t RT_STATE_WAITING = 1; // le main attend la synchro de RT
const uint8_t RT_STATE_RUNNING = 2; // RT est en cours de fonctionnement
const uint8_t RT_STATE_NOTSTARTED = 4; // RT n'est pas encore lancé au boot

const uint8_t ASSERV_MODE_STOP = 0;
const uint8_t ASSERV_MODE_PWM = 1;
const uint8_t ASSERV_MODE_POLAIRE = 2;

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
  bool IS_PR;
  uint8_t symetrie; // 0=bleu 1=jaune
  bool sans_symetrie; // 1=on fait pas les symmétries
  uint8_t coquillage;
  bool rouleaux_actifs;
  int angle_bras_gauche;
  int angle_bras_droit;

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
  uint8_t asserv_mode;

  int16_t consigne_pwm_gauche;
  int16_t consigne_pwm_droite;

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

  // Configuration, initialisée au tout début
  float ASSERV_COEFF_TICKS_PAR_MM;
  float ASSERV_COEFF_TICKS_PAR_RADIAN;
  float ASSERV_DISTANCE_KP;
  float ASSERV_DISTANCE_KD;
  float ASSERV_ROTATION_KP;
  float ASSERV_ROTATION_KD;
} Robot;

typedef struct {
  int32_t x;
  int32_t y;
} Point; // 8 octets

typedef struct {
  int32_t x1;
  int32_t y1;
  int32_t x2;
  int32_t y2;
} Zone;

typedef struct {
  int32_t x;
  int32_t y;
  float a;
} Position; // 12 octets

extern Robot robot;
volatile extern uint8_t lock_loop;


/*-----------------------------------------------------------------------------
 * Constantes de stratégie
 *----------------------------------------------------------------------------*/


// Constantes de zone, utilisés comme bit masks
const uint16_t ZONE_INCONNUE = 0;
const uint16_t ZONE_A = 1 << 1;
const uint16_t ZONE_B = 1 << 2;
const uint16_t ZONE_C = 1 << 3;
const uint16_t ZONE_D = 1 << 4;
const uint16_t ZONE_E = 1 << 5;
const uint16_t ZONE_F = 1 << 6;
const uint16_t ZONE_G = 1 << 7;
const uint16_t ZONE_H = 1 << 8;
const uint16_t ZONE_I = 1 << 9;
const uint16_t ZONE_J = 1 << 10;
// Ajout de zone à faire aussi dans robot_dans_zone();

// Constantes de points
// Ici, pas de bit mask. On évite les multiples de 2 pour éviter toute confusion avec un idZone
const uint8_t PT_ETAPE_1 = 41;
const uint8_t PT_ETAPE_4 = 44;
const uint8_t PT_ETAPE_7 = 47;
const uint8_t PT_ETAPE_8 = 48;
const uint8_t PT_ETAPE_10 = 50;
const uint8_t PT_ETAPE_14 = 54;
const uint8_t PT_ETAPE_15 = 55;
// Ajout de point à faire aussi dans match.cpp > getPoint();


// Positions de bras
const uint8_t POSITION_CROISIERE = 1;
const uint8_t POSITION_RECOLTER = 2;
const uint8_t POSITION_DEPOSER_BAS = 3;
const uint8_t POSITION_DEPOSER_HAUT = 4;
const uint8_t POSITION_APPROCHE_DEPOT_HAUT = 5;
const uint8_t POSITION_MAX_SOUS_SICK = 6;
const uint8_t POSITION_KNOCK_BLEU = 7;
const uint8_t POSITION_KNOCK_JAUNE = 8;


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
float symetrie_a_centrale(float a);
float symetrie_a_axiale_y(float a);

// General
void synchronisation();

// Match
void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to);
uint8_t aller_pt_etape(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
void definir_vitesse_avance(uint32_t v);
void definir_vitesse_rotation(uint32_t v);
uint16_t localiser_zone();
Point getPoint(uint8_t idPoint);
uint8_t retour(uint8_t valeur);
bool temps_ecoule(uint32_t t0, uint32_t duree);
bool match_termine();
bool match_minuteur_90s();
void match_demarrer_minuteur();

// GR
void gr_init();
void gr_main();

void homologation_gr();
void debug_gr();
void match_gr();
void gr_coucou();

uint8_t recuperer_minerais_pcd4();
uint8_t recuperer_minerais_pcd7();
uint8_t recuperer_minerais_pcl();
uint8_t recuperer_minerais_gcc10();
uint8_t recuperer_minerais_gcc14();
uint8_t deposer_minerais_zone_depot(bool avec_robot_secondaire);
uint8_t knocker_module2();
uint8_t recuperer_fusee_depart();
uint8_t recuperer_module1();
uint8_t recuperer_module5();
uint8_t degager_module5();
uint8_t prendre_minerais();
void bras_position_croisiere();
void positionner_deux_bras(uint8_t position, bool doucement);
void positionner_bras_gauche(uint8_t position, bool doucement);
void positionner_bras_droit(uint8_t position, bool doucement);

void funny_action();
void gr_fusee_init();
void gr_fusee_fermer();
void gr_fusee_ouvrir();


// PR
void pr_init();
void pr_main();

void grosse_dune_1();
void grosse_dune_2();
void grosse_dune_suite();
void petite_dune1();
void liberer_cubes();
void debug_pr();
void match_pr();

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

// Boutons
void boutons_init();
void boutons_all_pressed_restart();
bool boutons_start_up();
bool boutons_start_down();
bool boutons_select_up();
bool boutons_select_down();
void wait_start_button_down();
void wait_start_button_up();
void wait_select_button_down();
void wait_select_button_up();

// Localisation
void localisation_loop();
void localisation_set(Position position);
bool robot_proche_point(uint8_t idPoint);
bool robot_dans_zone(uint16_t idZone);
bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2);

// Asserv
void asserv_setup();
void asserv_raz_consignes();
void asserv_loop();

void asserv_consigne_stop();
void asserv_consigne_pwm(uint16_t gauche, uint16_t droite);
void asserv_consigne_polaire(int32_t distance, int32_t rotation);
void asserv_consigne_polaire_delta(int32_t distance_mm_delta, float rotation_rad_delta);

uint8_t tout_droit(int32_t distance, uint16_t timeout = 0);
uint8_t faire_rotation(float rotation_rad, uint16_t timeout = 0);
uint8_t consignesXY(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t uniquement_avant = 0);
uint8_t asserv_goxy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t timeout = 0, uint16_t uniquement_avant = 0);
uint8_t asserv_goa(float orientation, uint16_t timeout = 5000, uint8_t sans_symetrie = 0);
uint8_t asserv_goa_point(int32_t consigneX, int32_t consigneY, uint16_t timeout = 0);
uint8_t asserv_go_toutdroit(int32_t consigne_mm, uint16_t timeout = 0);

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
