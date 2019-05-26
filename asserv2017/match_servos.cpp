#include "asserv2017.h"
#include "match.h"

//Antoine 24/03/2019 A mettre à jour pour 2019

/** ============================
  Gestion des servos (Générique)
  ============================== **/

void servo_slowmotion(Servo servo, uint8_t deg_from, uint8_t deg_to) {
  if(deg_from > deg_to) {
    for (; deg_from >= deg_to; deg_from--) {
      servo.write(deg_from);
      minuteur_attendre(20);
    }
  }
  else {
    for (; deg_from <= deg_to; deg_from++) {
      servo.write(deg_from);
      minuteur_attendre(20);
    }
  }
}

// Fait jouer le servo autour de sa position
// Par défaut : jeu = 5, nb = 1
void servo_jouer(Servo servo, uint8_t deg_from, uint8_t jeu, uint8_t nb) {
  for(; nb > 0; nb--) {
    servo_slowmotion(servo, deg_from, deg_from + jeu);
    servo_slowmotion(servo, deg_from + jeu, deg_from - jeu);
    servo_slowmotion(servo, deg_from - jeu, deg_from);
  }
}


/** ========================
  Variables et angles servos
  ========================== **/
/** 
  Voir commentaire général sur les Servos dans match.h
**/

  
// GR
Servo servo_TA; // TA
Servo servo_BDF; // BDF
Servo servo_ADP_translation; // ADPT
Servo servo_ADP_deploiement; // ADPD

uint8_t angle_TA;
uint8_t angle_BDF;
uint8_t angle_ADP_translation;
uint8_t angle_ADP_deploiement;

// PR
Servo servo_bras;
uint8_t angle_bras;


/** ===========
  Attach servos
  ============= **/
  
void gr_attach_servos() {
  servo_TA.attach(9);
  servo_BDF.attach(17);
  servo_ADP_deploiement.attach(5);
  servo_ADP_translation.attach(33);
}


void pr_attach_servos() {
  servo_bras.attach(29);
}


/** =======================
  Initialisation des servos
  ========================= **/

void gr_init_servos() {
  com_printfln("Initialisation des servos");
  
  // Ne jamais utiliser doucement pendant l'init
  piloter_TA(TA_NEUTRE);
  piloter_BDF(BDF_RANGER);
  piloter_ADP_deploiement(ADPD_LEVER);
  piloter_ADP_translation(ADPT_NEUTRE);
}
 
 
void pr_init_servos() {
  com_printfln("Initialisation des servos");
  
  // Ne jamais utiliser doucement pendant l'init
  piloter_bras(BRAS_INIT);
}



/** ================
  Pilotage Servos GR
  ================== **/
  
void piloter_TA(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_TA, angle_TA, angle);
  }
  else {
    servo_TA.write(angle);
  }
  
  angle_TA = angle;
  
  if(log) {
    com_print("TA : ");
    switch(angle) {
      case TA_NEUTRE: com_printfln("Neutre"); break;
      case TA_DECHARGER: com_printfln("Decharger"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}

void piloter_BDF(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_BDF, angle_BDF, angle);
  }
  else {
    servo_BDF.write(angle);
  }
  
  angle_BDF = angle;
  
  if(log) {
    com_print("BDF : ");
    switch(angle) {
      case BDF_RANGER: com_printfln("Ranger"); break;
      case BDF_SUR_PALET: com_printfln("Sur palet"); break;
      case BDF_FAIRE_TOMBER: com_printfln("Faire tomber"); break;
      
      default: com_printfln("%d", angle); break;
    }
  }
}


void piloter_ADP_deploiement(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_ADP_deploiement, angle_ADP_deploiement, angle);
  }
  else {
    servo_ADP_deploiement.write(angle);
  }
  
  angle_ADP_deploiement = angle;
  
  if(log) {
    com_print("ADP depl : ");
    switch(angle) {
      case ADPD_LEVER: com_printfln("Lever"); break;
      case ADPD_BAISSER: com_printfln("Baisser"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}

void piloter_ADP_translation(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_ADP_translation, angle_ADP_translation, angle);
  }
  else {
    servo_ADP_translation.write(angle);
  }
  
  angle_ADP_translation = angle;
  
  if(log) {
    com_print("ADP transl : ");
    switch(angle) {
      case ADPT_JAUNE: com_printfln("Violet"); break;
      case ADPT_VIOLET: com_printfln("Jaune"); break;
      case ADPT_NEUTRE: com_printfln("Neutre"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}


/** ================
  Pilotage Servos PR
  ================== **/

  
void piloter_bras(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_bras, angle_bras, angle);
  }
  else {
    servo_bras.write(angle);
  }
  
  if(log) {
    com_print("Positionnement du bras : ");
    switch(angle) {
      case BRAS_INIT: com_printfln("Init"); break;
      case BRAS_LEVER: com_printfln("Levé"); break;
      case BRAS_POSITION_INTERRUPTEUR: com_printfln("Interrupteur"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}

