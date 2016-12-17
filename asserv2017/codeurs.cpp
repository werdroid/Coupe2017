#include "asserv2017.h"

#define PIN_DOUT_COMPTEUR_G 21
#define PIN_DOUT_COMPTEUR_D 20

LS7366R codeurs(PIN_DOUT_COMPTEUR_G, PIN_DOUT_COMPTEUR_D, MDR0_CONF, MDR1_CONF);

// ####################################
// Codeurs
// ####################################

// gestion des anomalies de compatage (par exemple un reset)

static int32_t gauche_precedent = 0;
static int32_t droite_precedent = 0;

static int32_t gauche_correction = 0;
static int32_t droite_correction = 0;

void codeurs_setup() {
  codeurs.config();
  codeurs.reset();
}

void codeurs_sync() {
  codeurs.sync();

  int32_t gauche = -codeurs.left() + gauche_correction;
  int32_t droite = codeurs.right() + droite_correction;

  if (abs(gauche - gauche_precedent) > mm_vers_ticks(200) || abs(droite - droite_precedent) > mm_vers_ticks(200)) {
    Serial.println("---------- Défaut de codeurs détecté (et compensé)");
    Serial.print("G: ");
    Serial.print(gauche_precedent);
    Serial.print(" -> ");
    Serial.print(gauche);
    Serial.print(" | D: ");
    Serial.print(droite_precedent);
    Serial.print(" -> ");
    Serial.println(droite);

    codeurs_setup();
    gauche_correction = gauche_precedent;
    droite_correction = droite_precedent;
    gauche = -codeurs.left();
    droite = codeurs.right();
  }

  robot.codeurGauche = gauche + gauche_correction;
  robot.codeurDroite = droite + droite_correction;

  gauche_precedent = gauche;
  droite_precedent = droite;
}
