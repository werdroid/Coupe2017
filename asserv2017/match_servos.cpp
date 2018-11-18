#include "asserv2017.h"
#include "match.h"


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
Servo servo_evacuation_eaux_usees; // au pluriel
Servo servo_cuillere_miel;
Servo servo_tri_eau;

uint8_t angle_evactuation_eaux_usees;
uint8_t angle_cuillere_miel;
uint8_t angle_tri_eau;

// PR
Servo servo_bras;
uint8_t angle_bras;


/** ===========
  Attach servos
  ============= **/
  
void gr_attach_servos() {
  servo_evacuation_eaux_usees.attach(17);
  servo_cuillere_miel.attach(33);
  servo_tri_eau.attach(9);
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
  piloter_evacuation_eaux_usees(EEU_BLOQUER);
  piloter_cuillere_miel(CM_INIT);
  piloter_tri_eau(TRI_NEUTRE);
}
 
 
void pr_init_servos() {
  com_printfln("Initialisation des servos");
  
  // Ne jamais utiliser doucement pendant l'init
  piloter_bras(BRAS_INIT);
}



/** ================
  Pilotage Servos GR
  ================== **/
  
void piloter_evacuation_eaux_usees(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_evacuation_eaux_usees, angle_evactuation_eaux_usees, angle);
  }
  else {
    servo_evacuation_eaux_usees.write(angle);
  }
  
  angle_evactuation_eaux_usees = angle;
  
  if(log) {
    com_print("Evacuation des eaux usées : ");
    switch(angle) {
      case EEU_BLOQUER: com_printfln("Bloquee"); break;
      case EEU_OUVRIR: com_printfln("Ouverte"); break;
      default: com_printfln("%d", angle); break;
    }
  }
}

void piloter_cuillere_miel(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_cuillere_miel, angle_cuillere_miel, angle);
  }
  else {
    servo_cuillere_miel.write(angle);
  }
  
  angle_cuillere_miel = angle;
  
  if(log) {
    com_print("Cuillere a miel : ");
    switch(angle) {
      case CM_INIT: com_printfln("Init"); break;
      case CM_GAUCHE: com_printfln("Gauche"); break;
      case CM_90: com_printfln("A 90"); break;
      case CM_DROITE: com_printfln("Droite"); break;
      
      default: com_printfln("%d", angle); break;
    }
  }
}


void piloter_tri_eau(uint8_t angle, bool doucement, bool log) {
  if(doucement) {
    servo_slowmotion(servo_tri_eau, angle_tri_eau, angle);
  }
  else {
    servo_tri_eau.write(angle);
  }
  
  angle_tri_eau = angle;
  
  if(log) {
    com_print("Tri : ");
    switch(angle) {
      case TRI_NEUTRE: com_printfln("Neutre"); break;
      case TRI_EAU_PROPRE: com_printfln("Eau propre"); break;
      case TRI_EAU_USEE: com_printfln("Eau usee"); break;
      case TRI_EXTREME_GAUCHE: com_printfln("Extreme Gauche"); break;
      case TRI_EXTREME_DROITE: com_printfln("Extreme Droite"); break;
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

