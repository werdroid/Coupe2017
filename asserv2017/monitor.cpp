#include "asserv2017.h"

#define Sp(X) Serial.print(X)


// ####################################
// Communication
// ####################################

void monitorCodeurs() {
  Sp("@|Codeurs|G:");
  Sp(robot.codeurGauche);
  Sp(",D:");
  Sp(robot.codeurDroite);
  Serial.println();
}

void monitorPosition() {
  Sp("@|Position|\"TicksX\":");
  Sp(robot.x);Sp(",\"TicksY\":");Sp(robot.y);
  Sp(",\"mmX\":");
  Sp(robot.xMm);Sp(",\"mmY\":");Sp(robot.yMm);
  Sp(",\"angleRad\":");
  Sp(robot.a);
  Sp(",\"angleDeg\":");
  Sp(radian_en_degre(robot.a));
  Serial.println();
}

void monitorMoteurs() {
  Sp("@|Moteurs|G:");
  Sp(robot.moteurGauche);
  Sp(",D:");
  Sp(robot.moteurDroite);
  Serial.println();
}

void monitorAsserv() {
  Sp("@|Consigne|ConsigneDistance:");
  Sp(robot.consigneDistance);
  Sp(",Distance:");
  Sp(robot.distance);
  Sp(",ConsigneRotation:");
  Sp(robot.consigneRotation);
  Sp(",Rotation:");
  Sp(robot.rotation);
  Serial.println();
}

void monitorErreurConsignes() {
  Sp("@|ErreurConsigne|ErreurDistance:");
  Sp(robot.erreurDistance);
  Sp(",ErreurRotation:");
  Sp(robot.erreurRotation);
  Serial.println();
}

void monitorSickStats() {
  Sp("@|Sick|\"vides\":");
  Sp(robot.sickTramesVides);
  Sp(",\"valides\":");
  Sp(robot.sickTramesValides);
  Sp(",\"invalides\":");
  Sp(robot.sickTramesInvalides);
  Sp(",\"bytes\":");
  Sp(robot.sickTramesBytes);
  Sp(",\"total\":");
  Sp(robot.sickTramesBytesTotal);
  Sp(",\"distanceMm\":");
  Sp(robot.proche_distance); // mm
  Sp(",\"obstacle\":");
  Sp(robot.sickObstacle ? "\"oui\"" : "\"non\"");
  Serial.println();
}
