#include "asserv2017.h"

#define PIN_DOUT_COMPTEUR_G 21
#define PIN_DOUT_COMPTEUR_D 20

LS7366R codeurs(PIN_DOUT_COMPTEUR_G, PIN_DOUT_COMPTEUR_D, MDR0_CONF, MDR1_CONF);

// ####################################
// Codeurs
// ####################################

void codeurs_setup() {
  codeurs.config();
  codeurs.reset();
}

void codeurs_sync() {
  codeurs.sync();

  robot.codeurGauche = -codeurs.left();
  robot.codeurDroite = codeurs.right();
}
