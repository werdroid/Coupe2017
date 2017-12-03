#include "asserv2017.h"

#define W5200_SS_PIN    10

/*------------------------------------------------------------------------------
 * Configuration
 *--------------------------------------------------------------------------- */

const uint16_t SICK_LIMIT_MIN = 90; // 50 = valeurs hors de portée ou signal trop faible, 90 = USB mm
const uint16_t SICK_LIMIT_MAX = 3600; // diagonale de la table mm
const uint16_t TABLE_MARGE_BORDURE = 200; // mmm
const uint16_t DISTANCE_DETECTION = 500; // mm (30 c'est juste)

/*------------------------------------------------------------------------------
 * Protocol du sick
 *--------------------------------------------------------------------------- */

 const uint8_t SICK_STX = 0x02;
 const uint8_t SICK_ETX = 0x03;

 // sEN LMDscandata 1 (string string enum8)
 const uint8_t SICK_STREAM_TRAME[] = {115, 69, 78, 32, 76, 77, 68, 115, 99, 97, 110, 100, 97, 116, 97, 32, 1};
 const uint8_t SICK_ZERO = 0;
 const uint8_t SICK_STREAM_LENGTH = 0x11; // 17
 const uint8_t SICK_STREAM_CHECKSUM = 0x33; // 51

 const uint16_t SICK_OFFSET_RSSI = 652; // 8 bits
 const uint16_t SICK_OFFSET_DISTANCE = 87; // et 88, 16 bits
 const uint16_t SICK_VALUES_LENGTH = 270; // 270 mesures normalement

 const uint16_t SICK_BUFFER_SIZE = 945; // 945

/*------------------------------------------------------------------------------
 * Variables
 *--------------------------------------------------------------------------- */

byte mac_client[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
IPAddress ip_client(192, 168, 0, 2);
const IPAddress ip_serveur(192, 168, 0, 1);
const int port_serveur_ascii = 2111;
const int port_serveur_binaire = 2112;
EthernetClient client;

uint8_t buffer[SICK_BUFFER_SIZE];
uint16_t distances_values[SICK_VALUES_LENGTH]; // 270 octets
uint8_t rssi_values[SICK_VALUES_LENGTH]; // 270 octets
Point points[SICK_VALUES_LENGTH]; // 2160 octets
bool detection_enabled = true; // à faux, le sick ne détectera jamais rien comme obstacle

/*------------------------------------------------------------------------------
 * Utilitaires
 *--------------------------------------------------------------------------- */

// Dans la table avec marges de sécurité
inline bool point_dans_la_table(const Point point) {
  return point.x > TABLE_MARGE_BORDURE &&
          point.y > TABLE_MARGE_BORDURE &&
          point.x < TABLE_LARGEUR_X + TABLE_MARGE_BORDURE &&
          point.y < TABLE_LARGEUR_Y + TABLE_MARGE_BORDURE;
}

inline bool angle_dans_le_cone(int16_t angle) {
  return -40 < angle && angle < 40;
}

inline int16_t index_vers_angle(uint16_t index) { // 0° c'est devant le robot
  return 135 - index;
}

inline int16_t distance_valide(uint16_t distance) {
  return SICK_LIMIT_MIN < distance && distance < SICK_LIMIT_MAX;
}

inline int dist(const Point p1, const Point p2) {
  return abs(p1.x - p2.x) + abs(p1.y - p2.y); // distance = abs( ( x1 - x2 ) + ( y1 - y2) )
}

/*------------------------------------------------------------------------------
 * Utilitaires
 *--------------------------------------------------------------------------- */

void sick_spi() {
  // Switch to W5200 if another device has taken control of SPI
  // 33.3 Mhz garanti
  // 80.0 Mhz théorique (fonction de longueur piste et multi-devices)
  // dixit la doc de W5200
  // SPI_CLOCK_12MHz fonctionnel en 2017
  // SPI_CLOCK_24MHz maximum de la Teensy
  SPIFIFO.begin(W5200_SS_PIN, SPI_CLOCK_12MHz);
}

uint8_t sick_setup() {
  if (!W5100.init()) {
    return 0; // error
  }

  robot.sickTramesVides = 0;
  robot.sickTramesValides = 0;
  robot.sickTramesInvalides = 0;
  robot.sickTramesBytes = 0;
  robot.sickTramesBytesTotal = 0;

  Ethernet.begin(mac_client, ip_client);
  W5100.setRetransmissionTime(250); // en 100us
  W5100.writeSnRX_SIZE(0, 0x4); // 4Ko socket 0
  W5100.writeSnRX_SIZE(1, 0x0); // 0Ko socke 1
  delay(500); // second to init ethernet
  return 1; // ok
}

uint8_t sick_connect() {
  sick_spi();
  return client.connect(ip_serveur, port_serveur_binaire);
}

uint8_t sick_connected() {
  sick_spi();
  return client.connected();
}

size_t sick_start_stream() {
  sick_spi();
  // write retourne size ou 0 en cas d'erreur
  client.write(SICK_STX);
  client.write(SICK_STX);
  client.write(SICK_STX);
  client.write(SICK_STX);
  client.write(SICK_ZERO);
  client.write(SICK_ZERO);
  client.write(SICK_ZERO);
  client.write(SICK_STREAM_LENGTH);
  client.write(SICK_STREAM_TRAME, SICK_STREAM_LENGTH);
  return client.write(SICK_STREAM_CHECKSUM);
}

uint8_t sick_check_buffer(int length) {
  // 4 octets STX
  if (buffer[0] != SICK_STX ||
        buffer[1] != SICK_STX ||
        buffer[2] != SICK_STX ||
        buffer[3] != SICK_STX) {
    // com_printfln("Erreur trame: 4xSTX pas bon");
    // for (int i=0; i<10; i++) com_printfln(buffer[i], HEX);
    return false;
  }

  // 4 octets taille de trame
  int taille_trame_utile = ((buffer[6] << 8) + buffer[7]);
  if (taille_trame_utile != 927 && taille_trame_utile != 936) { // sick 561 et 571
    com_printfln("Erreur trame: trame utile devrait faire 927 ou 936, reçu: %d", taille_trame_utile);
    return false;
  }

  if (length < 936) {
    com_printfln("Erreur trame: la taille de la trame devrait être au moins 936, reçu: %d", length);
    return false;
  }

  return true;
}

void sick_parse_buffer(uint8_t *buffer, uint16_t *distances, uint8_t *rssi) {
  robot.proche_index = 0xFFFF;
  robot.proche_distance = 0xFFFF;

  for (uint16_t i = 0; i < SICK_VALUES_LENGTH; i++) {
    distances[i] = (buffer[(i << 1) + SICK_OFFSET_DISTANCE] << 8) +
                   buffer[(i << 1) + 1 + SICK_OFFSET_DISTANCE];
    rssi[i] = buffer[i + SICK_OFFSET_RSSI];

    if (distances[i] < robot.proche_distance && distance_valide(distances[i])) {
      robot.proche_distance = distances[i];
      robot.proche_index = i;
    }
  }

  // var angle = 135 - i; // 0° centré vers l'avant
}

uint8_t flag_data_ready = 0;

uint8_t sick_read_data() {
  int len;

  if (flag_data_ready) {
    sick_traiter_donnees();
    flag_data_ready = 0;
    return 0;
  }

  sick_spi();

  // // on veut au moins le premier octet de valide sinon on boucle jusqu'à une borne
  // uint32_t i = 0;
  // while (1) {
  //   unsigned char c = client.read();
  //   if (c == SICK_STX) {
  //     buffer[0] = SICK_STX;
  //     break;
  //   }

  //   i++;
  //   if (i > SICK_BUFFER_SIZE) {
  //     robot.sickTramesInvalides++;
  //     com_printfln("trame invalide");
  //     return 0;
  //   }
  // }

  // -1 ou 0 ou size
  len = client.read((unsigned char*)(buffer), SICK_BUFFER_SIZE);
  // len = 0;
  // while (client.available()) {
  //   buffer[len] = client.read();
  //   len++;
  // }

  if (len == 0 || len == -1) {
    robot.sickTramesVides++;
    return 1;
  }

  robot.sickTramesBytes = len;
  robot.sickTramesBytesTotal += len;

  if (sick_check_buffer(len)) {
    sick_parse_buffer(buffer, distances_values, rssi_values);
    flag_data_ready = 1;
    robot.sickTramesValides++;
    return 1;
  } else if (len) {
    robot.sickTramesInvalides++;
    while(client.read() != -1); // purge
    // com_printfln("trame invalide");
    return 0;
  } else {
    com_printfln("SICK improbable");
    return 1;
  }
}

void sick_disable_detection(bool disabled) {
  if (disabled) {
    com_printfln("SICK sick_disable_detection=true");
  } else {
    com_printfln("SICK sick_disable_detection=false");
  }

  detection_enabled = !disabled;
}

void sick_traiter_donnees() {
  robot.sickObstacle = false;

  if (detection_enabled == false) {
    // la détection est désactivée, inutile de traiter les données du sick
    // et robot.sickObstacle restera à false
    return;
  }

  for (uint16_t i = 0; i < SICK_VALUES_LENGTH; i++) {
    if (!angle_dans_le_cone(index_vers_angle(i))) {
      continue; // on calcule rien pour les points en dehors du cone
    }

    // Convertir les distances/degrés en points absolus sur la table
    points[i].x = robot.xMm + distances_values[i] * cos(robot.a + index_vers_angle(i) / 180.0 * MATH_PI);
    points[i].y = robot.yMm + distances_values[i] * sin(robot.a + index_vers_angle(i) / 180.0 * MATH_PI);


    // Points valides
    if (point_dans_la_table(points[i]) &&
      distance_valide(distances_values[i]) &&
      distances_values[i] < DISTANCE_DETECTION) {
      robot.sickObstacle = true;
    }
  }
  
  // Démonstration fonctionnement Sick (utilisable avec MonitorSick)
  if(robot.activer_monitor_sick) {
    for (uint16_t i = 0; i < SICK_VALUES_LENGTH; i++) {
      // Envoi des points pour MonitorSick
      // (Destiné uniquement aux présentations au public)
      com_printfln("#,index:%d,angleDeg:%d,x:%d,y:%d,dist:%d,rssi:%d", i, index_vers_angle(i), points[i].x, points[i].y, distances_values[i], rssi_values[i]);
    }
  }
}

