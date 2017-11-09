# Coupe2017
Code principal et moniteur

## API

**match.cpp** utilitaires haut-niveau commun aux deux robots
```c++
void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to);
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
uint8_t aller_pt_etape(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives);
void definir_vitesse_avance(uint32_t v); { // v entre 0 et 1
void definir_vitesse_rotation(uint32_t v); { // v entre 0 et 1
uint16_t localiser_zone();
Point getPoint(uint8_t idPoint);
bool robot_proche_point(uint8_t idPoint);
bool robot_dans_zone(uint16_t idZone);
bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2);
uint8_t retour(uint8_t valeur);
bool temps_ecoule(uint32_t t0, uint32_t duree);
bool match_minuteur_90s();
void match_demarrer_minuteur();
bool match_termine();
```
**match_gr.cpp** haut-niveau missions du grand robot
```c++
void gr_init();
...
```

**match_pr.cpp** haut-niveau missions du grand robot
```c++
void pr_init();
...
```

**utils.cpp** utilitaires pour le bas niveau
```c++
int32_t mm2tick(int32_t distance);
int32_t tick2mm(int32_t distance);
int32_t radian_vers_orientation(float radian);
float orientation_vers_radian(int32_t orientation);
int32_t rad2deg(float radian);
float deg2rad(int32_t degre);
int32_t symetrie_x(int32_t x);
float symetrie_a_centrale(float a);
float symetrie_a_axiale_y(float a);
int32_t low_pass(int32_t valeur_precedente, int32_t valeur, float coeff);
float normalize_radian(float a);
```

**asserv.cpp** bas-niveau
```c++
void asserv_setup();
void asserv_set_position(Position position);
void asserv_maj_position();
uint8_t asserv_consigne_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t uniquement_avant);
uint8_t asserv_go_xy(int32_t consigne_x_mm, int32_t consigne_y_mm, uint16_t timeout, uint16_t uniquement_avant);
uint8_t asserv_go_toutdroit(int32_t consigne_mm, uint16_t timeout);
uint8_t asserv_rotation_vers_point(int32_t consigneX, int32_t consigneY, uint16_t timeout);
uint8_t asserv_distance(int32_t distance, uint16_t timeout);
uint8_t asserv_rotation_relative(float rotation_rad, uint16_t timeout);
void asserv_maintenir_position();
void asserv_consigne_stop();
void asserv_consigne_pwm(uint16_t pwm_gauche, uint16_t pwm_droite);
void asserv_consigne_polaire(int32_t distance_tick, int32_t rotation_tick);
void asserv_consigne_polaire_delta(int32_t distance_mm_delta, float rotation_rad_delta);
void asserv_loop();
```

**sick.cpp** bas-niveau
```c++
void sick_spi();
uint8_t sick_setup();
uint8_t sick_connect();
uint8_t sick_connected();
size_t sick_start_stream();
uint8_t sick_check_buffer(int length);
void sick_parse_buffer(uint8_t *buffer, uint16_t *distances, uint8_t *rssi);
uint8_t sick_read_data();
void sick_disable_detection(bool disabled);
void sick_traiter_donnees();
```

**codeurs.cpp** bas-niveau
```c++
void codeurs_setup();
void codeurs_sync();
```

**moteurs.cpp** bas-niveau
```c++
void moteurs_init();
void moteur_gauche(int16_t pwm);
void moteur_droite(int16_t pwm);
```

### Aide git
1. `git pull origin master` met à jour les données de .git
1. `git merge origin/master` met les éventuelles nouveautés de .git dans le projet
1. `git status` liste les fichiers modifiés
1. `git add fichier123` ajout un fichier à la liste à mettre dans un commit
1. `git commit -m "added/deleted/modified les bidules modifiés"` créer un commit
1. `git push origin master` envoie le commit sur github

- `git checkout fichier123` reset le fichier par celui qui est dans .git
- `git diff fichier123` fait un différentiel du fichier par rapport à celui dans .git


