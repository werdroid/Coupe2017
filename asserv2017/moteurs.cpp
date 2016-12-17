#include "asserv2017.h"

#define PIN_DOUT_MOTEUR_PWM_G 22
#define PIN_DOUT_MOTEUR_PWM_D 23
#define PIN_DOUT_MOTEUR_DIR_G 24
#define PIN_DOUT_MOTEUR_DIR_D 25

// PWM à 20 le robot se déplace avec difficulté voir pas du tout

// ####################################
// Moteurs
// ####################################

void moteurs_init()
{
  pinMode(PIN_DOUT_MOTEUR_PWM_G, OUTPUT);
  pinMode(PIN_DOUT_MOTEUR_DIR_G, OUTPUT);

  pinMode(PIN_DOUT_MOTEUR_PWM_D, OUTPUT);
  pinMode(PIN_DOUT_MOTEUR_DIR_D, OUTPUT);

  moteur_gauche(0);
  moteur_droite(0);
}

void moteur_gauche(int16_t pwm)
{
  // pwm = constrain(pwm, -robot.pwm_max, robot.pwm_max);

  if (pwm >= 0) { // moteurs en mirroir, le gauche doit être inversé pour que les deux aillent en avant
    analogWrite(PIN_DOUT_MOTEUR_PWM_G, pwm);
    digitalWrite(PIN_DOUT_MOTEUR_DIR_G, LOW);
  } else {
    analogWrite(PIN_DOUT_MOTEUR_PWM_G, -pwm);
    digitalWrite(PIN_DOUT_MOTEUR_DIR_G, HIGH);
  }
}

void moteur_droite(int16_t pwm)
{
  // pwm = constrain(pwm, -robot.pwm_max, robot.pwm_max);

  if (pwm >= 0) {
    analogWrite(PIN_DOUT_MOTEUR_PWM_D, pwm);
    digitalWrite(PIN_DOUT_MOTEUR_DIR_D, HIGH);
  } else {
    analogWrite(PIN_DOUT_MOTEUR_PWM_D, -pwm);
    digitalWrite(PIN_DOUT_MOTEUR_DIR_D, LOW);
  }
}
