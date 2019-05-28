#ifndef match_h
#define match_h


/* Glossaire 2019
  // Parce que Antoine pense à vous
  
  Sur la table
    Z_Depart        : Zone de départ
    Tab_Rd          : Tableau périodique – case Rd
    Tab_Gn          : Tableau périodique – case Gn
    Tab_Bl          : Tableau périodique – case Bl
    Tab_Gd          : Tableau périodique – case Gd
    ADP             : Accélérateur de particules
    Balance         : Balance
    Rampe_Balance   : Pente d’accès à la balance (de notre côté)
    Z_Experience    : Zone d’expérience
    Z_Chaos_own     : Zone de chaos de notre côté
    Z_Chaos_opp     : Zone de chaos opposé
    Atome_Oxygene   : Atome d’oxygène

    Distrib_Petit   : Petits distributeurs (réservés)
    Distrib_Grd_own : Grand distributeur de notre côté
    Distrib_Grd_opp : Grand distributeur opposé

  Elements de jeu
    Gn : Greenium
    Bl : Blueium
    Rd : Redium
    Gd : Goldenium

  Dans le robot
    A définir

  Systèmes auxiliaires
    Balise_A    : Balise fixe A (la nôtre)
    Balise_B    : Balise fixe B (la nôtre)
    Balise_C    : Balise fixe C (la nôtre)
    Mat_Central : Système central de détection
*/

/*-----------------------------------------------------------------------------
 * Constantes et variables stratégie (communes PR/GR)
 *----------------------------------------------------------------------------*/

// Constantes de zone, utilisés comme bit masks
/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Code généré automatiquement par GenererListesZones
    le 2019-04-27 à 20:48:03
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
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
const uint16_t ZONE_K = 1 << 11;
const uint16_t ZONE_L = 1 << 12;
const uint16_t ZONE_M = 1 << 13;
/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
// Ajout de zone à faire aussi dans robot_dans_zone();

// Constantes de points
// Ici, pas de bit mask. On évite les puissances de 2 pour éviter toute confusion avec un idZone
/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Code généré automatiquement par GenererListePoints
    le 2019-04-27 à 20:48:01
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
// #############################
// NE PAS CHANGER CES VALEURS !!
// #############################
// Points actions (PT_#A) distingués des Points étape (PT_ETAPE_#) pour réduire les risques d'erreur suite à une modification précipitée
// (Un remplacement d'un PT_3A par PT_3 provoquera une erreur à la compilation)
const uint8_t PT_ETAPE_1 = 41;
const uint8_t PT_ETAPE_2 = 42;
const uint8_t PT_ETAPE_3 = 43;
const uint8_t PT_3A = 44;
const uint8_t PT_ETAPE_4 = 45;
const uint8_t PT_ETAPE_5 = 46;
const uint8_t PT_ETAPE_6 = 47;
const uint8_t PT_ETAPE_6B1 = 48;
const uint8_t PT_ETAPE_6B2 = 50;
const uint8_t PT_ETAPE_6B3 = 51;
const uint8_t PT_ETAPE_6B4 = 52;
const uint8_t PT_6B1A = 53;
const uint8_t PT_6B2A = 54;
const uint8_t PT_6B3A = 55;
const uint8_t PT_6B4A = 56;
const uint8_t PT_ETAPE_7 = 57;
const uint8_t PT_ETAPE_8 = 58;
const uint8_t PT_8A = 59;
const uint8_t PT_ETAPE_9 = 60;
const uint8_t PT_9A = 61;
const uint8_t PT_ETAPE_10 = 62;
const uint8_t PT_10A = 63;
const uint8_t PT_ETAPE_11B1 = 65;
const uint8_t PT_ETAPE_11B2 = 66;
const uint8_t PT_ETAPE_11B3 = 67;
const uint8_t PT_ETAPE_11B4 = 68;
const uint8_t PT_ETAPE_11B5 = 69;
const uint8_t PT_ETAPE_11B6 = 70;
const uint8_t PT_ETAPE_11B7 = 71;
const uint8_t PT_ETAPE_11B8 = 72;
const uint8_t PT_ETAPE_11B9 = 73;
const uint8_t PT_ETAPE_11B10 = 74;
const uint8_t PT_ETAPE_11B11 = 75;
const uint8_t PT_ETAPE_11B12 = 76;
const uint8_t PT_ETAPE_11B13 = 77;
const uint8_t PT_11B1A = 78;
const uint8_t PT_11B2A = 79;
const uint8_t PT_11B3A = 80;
const uint8_t PT_11B4A = 82;
const uint8_t PT_11B5A = 83;
const uint8_t PT_11B6A = 84;
const uint8_t PT_11B7A = 85;
const uint8_t PT_11B8A = 86;
const uint8_t PT_11B9A = 87;
const uint8_t PT_11B10A = 88;
const uint8_t PT_11B11A = 89;
const uint8_t PT_11B12A = 90;
const uint8_t PT_11B13A = 91;
const uint8_t PT_ETAPE_12 = 92;
const uint8_t PT_12A = 93;
const uint8_t PT_ETAPE_13 = 94;
const uint8_t PT_13A = 95;
const uint8_t PT_ETAPE_14 = 96;
const uint8_t PT_14A = 97;
const uint8_t PT_ETAPE_15 = 98;
const uint8_t PT_ETAPE_16 = 99;
const uint8_t PT_16A = 101;
const uint8_t PT_ETAPE_16B = 102;
const uint8_t PT_16BA = 103;
const uint8_t PT_ETAPE_17 = 104;
const uint8_t PT_17A = 105;
const uint8_t PT_ETAPE_18 = 106;
const uint8_t PT_ETAPE_19 = 107;
const uint8_t PT_19A = 108;
const uint8_t PT_ETAPE_19B = 109;
const uint8_t PT_19BA = 110;
const uint8_t PT_ETAPE_20B1 = 111;
const uint8_t PT_ETAPE_20B2 = 112;
const uint8_t PT_ETAPE_20B3 = 113;
const uint8_t PT_ETAPE_20B4 = 114;
const uint8_t PT_ETAPE_20B5 = 115;
const uint8_t PT_ETAPE_20B6 = 116;
const uint8_t PT_ETAPE_20B7 = 117;
const uint8_t PT_ETAPE_20B8 = 118;
const uint8_t PT_ETAPE_20B9 = 119;
const uint8_t PT_ETAPE_20B10 = 120;
const uint8_t PT_20B1A = 122;
const uint8_t PT_20B2A = 123;
const uint8_t PT_20B3A = 124;
const uint8_t PT_20B4A = 125;
const uint8_t PT_20B5A = 126;
const uint8_t PT_20B6A = 127;
const uint8_t PT_20B7A = 128;
const uint8_t PT_20B8A = 129;
const uint8_t PT_20B9A = 130;
const uint8_t PT_20B10A = 131;
/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
// Ajout de point à faire aussi dans match_deplacements.cpp > getPoint();


// Vitesses par défaut

// VITESSE_LENTE et VITESSE_RAPIDE sont associées à
// robot.VITESSE_DISTANCE_NOMINALE, VITESSE_ROTATION_NOMINALE, VITESSE_DISTANCE_LENTE et VITESSE_ROTATION_LENTE
// définis dans pr_init et gr_init.
// VITESSE_LENTE et VITESSE_RAPIDE sont à considérer comme des enum et seront
// interceptés dans aller_xy() (ET UNIQUEMENT aller_xy !!)
// Ne pas les modifier
uint32_t const VITESSE_RAPIDE = 2; 
uint32_t const VITESSE_LENTE = 1;
// D'autres valeurs peuvent tout de même être spécifiées si nécessaire
// Exemple :
// uint32_t const VITESSE_POUSSER = 45;

// Actions
// Les numéros doivent être uniques et continus de 0 à NB_ACTIONS
// L'ordre n'a pas d'importance
const uint8_t ACTION_ACTIVER_ADP = 0;
const uint8_t ACTION_POUSSER_ATOME0 = 1;
const uint8_t ACTION_POUSSER_ATOME1 = 2;
const uint8_t ACTION_POUSSER_ATOME2 = 3;
const uint8_t ACTION_POUSSER_ATOMES_CHAOS = 4;
const uint8_t ACTION_POUSSER_ATOMES_CHAOS_B = 5;
const uint8_t ACTION_POUSSER_ATOMES_CHAOS_ADV = 6;
const uint8_t ACTION_ACTIVER_EXPERIENCE = 7;
const uint8_t NB_ACTIONS = 8; // Dernière action + 1


/*-----------------------------------------------------------------------------
 * Structure stratégie
 *----------------------------------------------------------------------------*/
typedef struct {
  bool adp_active = false;
  bool experience_activee = false;
  
  /* Numérotation des atomes :
      0 Rd
      1 Gr
      2 Bl
      3 Zone de chaos, par PT_ETAPE_16
      4 Zone de chaos, par PT_ETAPE_16B
      5 Zone chaos adverse
  */
  bool atome_a_bouge[6] = { false };
  bool atome_rapporte[6] = { false };
  Point atome_position[6] = { {500, 4500}, {500, 750}, {500, 1050}, {1000, 1050}, {1000, 1050}, {2000, 1050} };
  
  // Autres exemples fictifs
  bool goldenium_tombe = false;
} Table;
extern Table table;
 

/*-----------------------------------------------------------------------------
 * Functions prototypes
 *----------------------------------------------------------------------------*/

 
// ------ Score (match.cpp) ------
void score_incrementer(int increment);
void score_definir(int valeur);


// ------ Expérience (match.cpp) ------
void experience_activer();

// ------ Déplacements (match_deplacements.cpp) ------
uint8_t aller_pt_etape(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
uint8_t aller_pt_direct(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
uint16_t localiser_zone();
Point getPoint(uint8_t idPoint);
bool robot_proche_point(uint8_t idPoint, uint8_t marge = 50);
bool robot_dans_zone(uint16_t idZone);
bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2);


// ------ Actions communes (match.cpp) ------
uint8_t pousser_atome(uint8_t atome);
uint8_t aller_vers_adp(int32_t yDirect, int32_t yDetour, uint32_t vitesse);

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
// TA (Tractopelle atomique)
// Angle+ = Décharger
const uint8_t TA_NEUTRE = 47;
const uint8_t TA_DECHARGER = 90;

// BDF (Barre de fer)
// Angle+ = Le bras du plateau monte
const uint8_t BDF_RANGER = 70;
const uint8_t BDF_SUR_PALET = 114;
const uint8_t BDF_FAIRE_TOMBER = 155;

// ADP translation (ADPT)
// Angle+ = Vers la droite du robot
const uint8_t ADPT_JAUNE = 126;
const uint8_t ADPT_VIOLET = 44;
const uint8_t ADPT_NEUTRE = 90;

// ADP Deploiement (ADPD)
// Angle+ = Vers le haut
const uint8_t ADPD_LEVER = 126;
const uint8_t ADPD_BAISSER = 20;



// ... PR ...
// Bras gauche (BRAS)
// Angle + => Vers le haut
const uint8_t BRAS_INIT = 29;
const uint8_t BRAS_LEVER = 60;
const uint8_t BRAS_BAISSER = 31;
const uint8_t BRAS_POSITION_INTERRUPTEUR = 55;



// ----- Prototypes -----
// GR
void piloter_TA(uint8_t angle, bool doucement = false, bool log = true);
void piloter_BDF(uint8_t angle, bool doucement = false, bool log = true);
void piloter_ADP_deploiement(uint8_t angle, bool doucement = false, bool log = true);
void piloter_ADP_translation(uint8_t angle, bool doucement = false, bool log = true);

// PR
void piloter_bras(uint8_t angle, bool doucement = false, bool log = true);



#endif // ifndef match_h
