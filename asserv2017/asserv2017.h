#ifndef asserv2017_h
#define asserv2017_h

#include <inttypes.h>
#include <math.h>
#include <limits.h>
#include <climits>

#ifndef __EMSCRIPTEN__
#include <Adafruit_GFX.h>    // Core graphics library
#include <Adafruit_ST7735.h> // Hardware-specific library
#include <Arduino.h>
#include "LS7366R.h"
#include <elapsedMillis.h>
#include <Metro.h>
#include <Ethernet.h>
// #include <socket.h>
#include <w5100.h>
#include <EEPROM.h>
#include <Servo.h>
#include <Bounce.h>
#endif // __EMSCRIPTEN__

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
// Erreurs d'asserv
const uint8_t ERROR_TIMEOUT = 1;
const uint8_t ERROR_OBSTACLE = 2;
const uint8_t ERROR_FIN_MATCH = 3;
const uint8_t AUTRE = 127; // ? (utilisé dans asserv.cpp)
// Erreurs de stratégie
const uint8_t ERROR_CAS_NON_GERE = 10; // Cas non géré (trop complexe)
const uint8_t ERROR_PARAMETRE = 11; // Paramètre envoyé incorrect
const uint8_t ERROR_PLUS_RIEN_A_FAIRE = 12; // Action déjà terminée
const uint8_t ERROR_PAS_POSSIBLE = 14; // Pas le meilleur moment pour
const uint8_t ERROR_PAS_CODE = 15; // Pas encore codé



const uint8_t RT_STATE_SLEEP = 0; // on est dans le main normal
const uint8_t RT_STATE_WAITING = 1; // le main attend la synchro de RT
const uint8_t RT_STATE_RUNNING = 2; // RT est en cours de fonctionnement
const uint8_t RT_STATE_NOTSTARTED = 4; // RT n'est pas encore lancé au boot

const uint8_t ASSERV_MODE_STOP = 0; // frein
const uint8_t ASSERV_MODE_PWM = 1; // tension uniquement
const uint8_t ASSERV_MODE_POLAIRE = 2; // asservissement

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
#define TEMPS_JEU_MS 98000 /* ms */ // On se garde 2 secondes pour l'évacuation des eaux usées

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
  uint8_t symetrie;
  bool sans_symetrie; // 1=on fait pas les symétries
  bool activer_monitor_sick;
  uint8_t programme;
  int score;
  bool homologation = false;
  
  /* Spécificités sur une année */
  bool estJaune; // est égal à l'inverse de symetrie (utilisé en haut niveau), à renommer chaque année partout
  bool propulseur_actif = false;
  bool trappe_ouverte = false;


  /* asserv states */
  uint8_t activeDistance;
  uint8_t activeRotation;
  uint32_t match_debut; // millis() de lancement
  bool match_started = false;

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
  int16_t xMm; // mm /!\ Ne pas récupérer directement pendant un match. Utiliser get_robot_xMm_sans_symetrie() pour prendre en compte l'éventuelle symétrie
  int16_t yMm; // mm (Pas de problème particulier avec yMm)
  float   a; // radian

  uint16_t consigneXmm; // mm
  uint16_t consigneYmm; // mm

  int32_t consigneX; // tick
  int32_t consigneY; // tick

  uint16_t DISTANCE_DETECTION;
  bool sickConnected;
  bool sickObstacle;
  uint32_t sickTramesVides;
  uint32_t sickTramesValides;
  uint32_t sickTramesInvalides;
  uint32_t sickTramesBytes;
  uint32_t sickTramesBytesTotal;
  uint16_t proche_index; // index du point le plus proche
  uint16_t proche_distance; // distance du point le plus proche
  int16_t sickAngleObstacle; // Angle du point le plus proche, dans le cône de détection
  uint16_t sickDistanceObstacle; // Distance du point le plus proche, dans le cône de détection


  // Profiling du CPU
  uint8_t led_state; // Etat de la Led (aussi envoyé vers Monitor)
  uint32_t time_codeurs; // temps de lecture des codeurs (us)
  uint32_t time_sick; // temps de lecture du SICK (us)
  uint32_t time_total; // temps complet de la dernière interruption (us)
  uint32_t time_user; // temps passé dans la stratégie (us)

  // Réglage du déplacement
  uint16_t pwm_max_distance;
  uint16_t pwm_max_rotation;
  
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


// Structure à envoyer en tant que bloc binaire
// On désiarialise via javascript avec un DataViewer
// qui permet de lire/écrire selon chaque type:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
typedef struct {
  // Début de trame sur 4 bytes
  char header1 = ''; // STX
  char header2 = ''; // STX
  char header3 = ''; // STX
  char header4 = ''; // DC1

  // propriétés sur 4 bytes
  uint32_t millis;
  float   a; // float 32bits
  uint32_t time_total;

  // propriétés sur 2 bytes
  int16_t xMm; // mm
  int16_t yMm; // mm
  uint16_t consigneXmm; // mm
  uint16_t consigneYmm; // mm
  int16_t sickAngleObstacle; // deg
  uint16_t sickDistanceObstacle; // mm
  
  // propriétés sur 1 byte
  uint8_t sickObstacle;
  uint8_t isPR;
  uint8_t led_state;

  // compléter pour avoir un total de bytes multiple de 4
  uint8_t empty1;
  /*uint8_t empty2;
  uint8_t empty3;*/

  // Fin de trame sur 4 bytes
  char footer1 = ''; // ETX
  char footer2 = ''; // ETX
  char footer3 = ''; // ETX
  char footer4 = ''; // ETX
} TrameMonitor;

typedef struct {
  // Début de trame
  char header1 = ''; // STX
  char header2 = ''; // STX
  char header3 = ''; // STX
  char header4 = ''; // DC2

  // 2 octets
  uint16_t index;
  int16_t angleDeg;
  // x: non utilisé
  // y: non utilisé
  uint16_t distance;
  
  // 1 octet
  uint8_t rssi;
  
  uint8_t empty1;

  
  // Fin de trame sur 4 bytes
  char footer1 = ''; // ETX
  char footer2 = ''; // ETX
  char footer3 = ''; // ETX
  char footer4 = ''; // ETX
} TrameSick;

extern Robot robot;
volatile extern uint8_t lock_loop;



/*-----------------------------------------------------------------------------
 * Simulator only (not robot)
 *----------------------------------------------------------------------------*/

#ifdef __EMSCRIPTEN__

class Servo {
public:
  void write(int angle);
  void attach(int pin);
};

unsigned long millis();
void delay(long time);

#endif

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
int32_t get_robot_xMm_sans_symetrie();
float symetrie_a_centrale(float a);
float symetrie_a_axiale_y(float a);
float angle_relatif_robot_point(int32_t x, int32_t y , float a, int32_t xx, int32_t yy);

// Minuteur de match
void minuteur_attendre(uint32_t timeout_ms);
void minuteur_demarrer();
int32_t minuteur_temps_restant();
void minuteur_attendre_fin_match();
void minuteur_arreter_tout_si_fin_match();

// General
void synchronisation();

// GR
extern "C" {
void gr_init();
void match_gr();
}

// PR
extern "C" {
void pr_init();
void match_pr();
}


// Menu
void menu_start();
void menu_changer_programme();

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
void bouton_start_down();
void bouton_wait_start_up();
void bouton_wait_select_down();
void bouton_wait_select_up();

// Asserv
void asserv_setup();
void asserv_reglage_constantes();
void asserv_loop();
void asserv_maj_position();
void asserv_set_position(int32_t x, int32_t y, float a);

void asserv_vitesse_rampe_distance(uint32_t v);
void asserv_vitesse_rampe_rotation(uint32_t v);
void asserv_vitesse_pwm_distance(uint16_t pwm_max);
void asserv_vitesse_pwm_rotation(uint16_t pwm_max);
void asserv_maintenir_position();
void asserv_activer_maintien_distance(bool activer);
void asserv_activer_maintien_rotation(bool activer);
void asserv_consigne_stop();
void asserv_consigne_pwm(uint16_t gauche, uint16_t droite);
void asserv_consigne_polaire(int32_t distance, int32_t rotation);
void asserv_consigne_polaire_delta(int32_t distance_mm_delta, float rotation_rad_delta);
uint8_t asserv_consigne_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t uniquement_avant = 0);
uint8_t asserv_distance(int32_t distance_mm, uint16_t timeout = 0);
uint8_t asserv_go_toutdroit(int32_t consigne_mm, uint16_t timeout = 0);
uint8_t asserv_go_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t timeout = 0, uint16_t uniquement_avant = 0);
uint8_t asserv_rotation_relative(float rotation_rad, uint16_t timeout = 5000);
uint8_t asserv_rotation_vers_point(int32_t x_mm, int32_t y_mm, uint16_t timeout = 0);

// Communication
uint8_t com_err2str(uint8_t error);
void com_setup();
void com_loop();

void com_send_robot_state();
void com_send_robot_infos();
void com_send_position();
void com_printfln(const char* format, ...);
void com_print(const char* str);
void com_serial1_printf(const char* format, ...);
void com_serial1_print(const char* str);
void com_serial3_printf(const char* format, ...);
void com_serial3_print(const char* str);
void xBee_lumiere(bool allumer);


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

// ledMatrix
void ledMatrix_effacer();
void ledMatrix_definir_score(int valeur);
void ledMatrix_afficher_score();
void ledMatrix_incrementer_score(int increment);
void ledMatrix_defiler_texte(const char* str);
void ledMatrix_afficher_WRD();
void ledMatrix_indiquer_obstacle();

// SICK
uint8_t sick_setup();
uint8_t sick_connect();
uint8_t sick_connected();
size_t sick_start_stream();
uint8_t sick_read_data(); // met à jour distances_values et rssi_values
void sick_traiter_donnees(); // met à jour sickObstacle et points
void sick_disable_detection(bool enabled); // désactive la détection

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

#endif // ifndef asserv2017_h
