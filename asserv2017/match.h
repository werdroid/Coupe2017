#ifndef match_h
#define match_h


/*-----------------------------------------------------------------------------
 * Constantes et variables stratégie (communes PR/GR)
 *----------------------------------------------------------------------------*/

// Constantes de zone, utilisés comme bit masks
const uint16_t ZONE_INCONNUE = 0;
const uint16_t ZONE_A = 1 << 1;
const uint16_t ZONE_B = 1 << 2;
const uint16_t ZONE_C = 1 << 3;
const uint16_t ZONE_D = 1 << 4;
  // S pour Symétrie
const uint16_t ZONE_AS = 1 << 5;
const uint16_t ZONE_BS = 1 << 6;
const uint16_t ZONE_CS = 1 << 7;
const uint16_t ZONE_DS = 1 << 8;
// Info: jusqu'à 10 en 2017
// Ajout de zone à faire aussi dans robot_dans_zone();

// Constantes de points
// Ici, pas de bit mask. On évite les puissances de 2 pour éviter toute confusion avec un idZone
const uint8_t PT_ETAPE_1 = 41;
const uint8_t PT_ETAPE_2 = 42;
const uint8_t PT_ETAPE_3 = 43;
const uint8_t PT_ETAPE_4 = 44;
const uint8_t PT_ETAPE_5 = 45;
const uint8_t PT_ETAPE_6 = 46;
const uint8_t PT_ETAPE_6S = 86;
const uint8_t PT_ETAPE_8 = 48;
const uint8_t PT_ETAPE_9 = 49;
const uint8_t PT_ETAPE_10 = 50;
const uint8_t PT_ETAPE_11 = 51;
const uint8_t PT_ETAPE_12 = 52;
const uint8_t PT_ETAPE_12S = 92;
const uint8_t PT_ETAPE_13 = 53;
const uint8_t PT_ETAPE_14 = 54;
// Ajout de point à faire aussi dans match_deplacements.cpp > getPoint();


// Vitesses par défaut
uint32_t const VITESSE_RAPIDE = 100;
uint32_t const VITESSE_LENTE = 50;
uint32_t const VITESSE_POUSSER_CUBES = 80;

// Actions
// Les numéros doivent être uniques et continus de 0 à NB_ACTIONS
// L'ordre n'a pas d'importance
const int ACTION_ALLUMER_PANNEAU    = 0;
const int ACTION_VIDER_REP          = 1;
const int ACTION_ACTIVER_ABEILLE    = 2;
const int ACTION_VIDER_REM          = 3;
const int ACTION_RAPPORTER_CUB0     = 4;
const int ACTION_RAPPORTER_CUB1     = 5;
const int ACTION_RAPPORTER_CUB2     = 6;
const int ACTION_VIDER_REM_OPP      = 7;
const int ACTION_VIDER_REP_OPP      = 8;
const int ACTION_DEPOSER_CHATEAU = 9;
const int ACTION_DEPOSER_STATION = 10;
const int ACTION_OUVRIR_REP      = 11;

const int NB_ACTIONS = 12; // Dernière action + 1


/*-----------------------------------------------------------------------------
 * Structure stratégie
 *----------------------------------------------------------------------------*/
typedef struct {
  // Exemples fictifs
  uint8_t nb_balles = 0;
  bool cub_en_position_initiale = true;
} Table;
extern Table table;
 

/*-----------------------------------------------------------------------------
 * Functions prototypes
 *----------------------------------------------------------------------------*/

 
// ------ Score (match.cpp) ------
void score_incrementer(int increment);
void score_definir(int valeur);


// ------ Déplacements (match_deplacements.cpp) ------
uint8_t aller_pt_etape(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
uint16_t localiser_zone();
Point getPoint(uint8_t idPoint);
bool robot_proche_point(uint8_t idPoint, uint8_t marge = 50);
bool robot_dans_zone(uint16_t idZone);
bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2);


// ------ Actions GR (match_gr.cpp) ------
void demo_allers_retours();
void homologation_gr();
void debug_gr();
void test1_gr();
void gr_coucou();
void match_gr_arret();

void gr_activer_propulseur(bool activer);


// ------ Actions PR (match_pr.cpp) ------
void match_pr_arret();
void debug_pr();
void homologation_pr();



/*-----------------------------------------------------------------------------
 * Pilotage des servos
 *----------------------------------------------------------------------------*/

// ----- Générique -----
void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to);
void servo_jouer(Servo servo, uint8_t deg_from, uint8_t jeu = 5, uint8_t nb = 1);


// ----- Attach & Init -----
void gr_attach_servos();
void pr_attach_servos();

void gr_init_servos();
void pr_init_servos();


// ----- Pilotage ------
/* Pour chaque servo, on associe :
    des variables
      Servo servo_exemple;
      uint8_t angle_exemple;
    une abréviation
      EX
    des positions prédéfinies (utiliser l'infinitif)
      ! Toutes les valeurs doivent être différentes
      const uint8_t EX_INIT = 79; // Au départ
      const uint8_t EX_OUVRIR = 80;
      const uint8_t EX_FERMER = 120;
    une fonction de pilotage générique
      piloter_exemple(uint8_t angle, bool doucement = false, log = true);
        angle       angle à donner au Servo (pas forcément une valeur prédéfinie)
        doucement   true pour y aller doucement
        log         false pour ne pas spammer le monitor

        
    @2019 : Voir pour créer une classe ServoWRD
    [Pas fait 2018, doute sur implémentation d'une liste de constantes pré-définies]
*/

// ... GR ...
// Evacuation des Eaux Usees (EEU)
// Angle+ = [Sens?]
const uint8_t EEU_BLOQUER = 90;
const uint8_t EEU_OUVRIR = 25;

// Cuillère à miel (CM)
// Angle+ = Vers la gauche
const uint8_t CM_INIT = 37;
const uint8_t CM_GAUCHE = 160;
const uint8_t CM_90 = 104;
const uint8_t CM_DROITE = 40;

// Tri de l'eau (TRI)
// Angle + = Vers la droite
const uint8_t TRI_NEUTRE = 100;
const uint8_t TRI_EAU_PROPRE = 130;
const uint8_t TRI_EAU_USEE = 60;
const uint8_t TRI_EXTREME_GAUCHE = 65;
const uint8_t TRI_EXTREME_DROITE = 140;

// ... PR ...
// Bras gauche (BRAS)
// Angle + => Vers le haut
const uint8_t BRAS_INIT = 29;
const uint8_t BRAS_LEVER = 60;
const uint8_t BRAS_POSITION_INTERRUPTEUR = 55;



// ----- Prototypes -----
// GR
void piloter_evacuation_eaux_usees(uint8_t angle, bool doucement = false, bool log = true);
void piloter_cuillere_miel(uint8_t angle, bool doucement = false, bool log = true);
void piloter_tri_eau(uint8_t angle, bool doucement = false, bool log = true);

// PR
void piloter_bras(uint8_t angle, bool doucement = false, bool log = true);



#endif // ifndef match_h
