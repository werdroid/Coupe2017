#include "asserv2017.h"

#define Sp(X) Serial.print(X)

static Metro metro = Metro(100);

void printCodeurs();
void printMoteurs();
void printPosition();
void printAsserv();
void printErreurConsignes();
void printSickStats();

// ####################################
// Communication
// ####################################

void com_setup() {
  Serial.begin(115200);
  metro.reset();
}

void com_loop() {
  /* if (metro.check()) {
    // printCodeurs();
    printPosition();
    // printMoteurs();
    // printAsserv();
    // printErreurConsignes();
    printSickStats();
    Sp("\n");
  } */
  if (metro.check()) {
    // printCodeurs();
    monitorPosition();
    // printMoteurs();
    // printAsserv();
    // printErreurConsignes();
    monitorSickStats();
  }
}

void printCodeurs() {
  Sp("Codeurs: ");
  Sp(robot.codeurGauche);
  Sp(",");
  Sp(robot.codeurDroite);
  Serial.println();
}

void printPosition() {
  Sp("Position:");
  Sp(" ticks=");
  Sp(robot.x);Sp(",");Sp(robot.y);
  Sp(", mm=");
  Sp(robot.xMm);Sp(",");Sp(robot.yMm);
  Sp(", angle=");
  Sp(robot.a);
  Sp("(");
  Sp(radian_en_degre(robot.a));
  Sp(")");
  Serial.println();
}

void printMoteurs() {
  Sp("Moteurs: ");
  Sp(robot.moteurGauche);
  Sp(", ");
  Sp(robot.moteurDroite);
  Sp("pwm");
  Serial.println();
}

void printAsserv() {
  Sp("Consigne: distance ");
  Sp(robot.consigneDistance);
  Sp("/");
  Sp(robot.distance);
  Sp(", rotation ");
  Sp(robot.consigneRotation);
  Sp("/");
  Sp(robot.rotation);
  Serial.println();
}

void printErreurConsignes() {
  Sp("Erreur consigne distance = ");
  Sp(robot.erreurDistance);
  Sp(", rotation = ");
  Sp(robot.erreurRotation);
  Serial.println();
}

void printSickStats() {
  Sp("Stats sick: vides=");
  Sp(robot.sickTramesVides);
  Sp(", valides=");
  Sp(robot.sickTramesValides);
  Sp(", invalides=");
  Sp(robot.sickTramesInvalides);
  Sp(", bytes=");
  Sp(robot.sickTramesBytes);
  Sp(", total=");
  Sp(robot.sickTramesBytesTotal);
  Sp(", distance=");
  Sp(robot.proche_distance);
  Sp("mm, obstacle=");
  Sp(robot.sickObstacle ? "oui" : "non");
  Serial.println();
}

void writeSerial() {
  // Sp("Erreurs: ");
  // Sp(robot.erreurGauche);
  // Sp(", ");
  // Serial.println(robot.erreurDroite);

  // Serial.print(millis());Serial.print(" - ");
  // Sp("Consignes: rotation=");
  // Sp(robot.erreurRotation);
  // Sp(", distance=");
  // Sp(robot.erreurDistance);
  // Serial.println();

  // Sp("Vitesse: ");
  // Sp(robot.vitesse_distance);
  // Serial.println();

  // Sp(robot.consigneRotation);
  // Sp(",");
  // Sp(robot.consigneDistance);
  // Serial.println();
}
