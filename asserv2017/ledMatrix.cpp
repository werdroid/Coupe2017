#include "asserv2017.h"

/**
  Nota : Serial.setTimeout() défini à 300 (Vérifier !) sur affScore
**/

// Efface la ledMatrix
void ledMatrix_effacer() {
  com_serial1_print("@");
  
  com_printfln("ledMatrix: Effacer");
}

// Définit le score à la valeur donnée en paramètre
// et l'affiche instantanément
void ledMatrix_definir_score(int valeur) {
  com_serial1_printf("=%d", valeur);
  
  com_printfln("ledMatrix: Score = %d", valeur);
}

// Affiche le score en mémoire (dans la Teensy affScore)
void ledMatrix_afficher_score() {
  com_serial1_print("$");
  
  com_printfln("ledMatrix: Afficher score mémorisé");
}

// Incrémente le score (progressivement) du nombre indiqué
void ledMatrix_incrementer_score(int increment) {
  if(increment > 0)
    com_serial1_printf("+%d", increment);
  else if(increment < 0)
    com_serial1_printf("-%d", -increment);
  else
    return;
    
  com_printfln("ledMatrix: Score += %d", increment);
}

// Fait défiler un texte sur la LedMatrix
void ledMatrix_defiler_texte(const char* str) {
  com_serial1_printf(":%s", str);
  
  com_printfln("ledMatrix: %s", str);
}

// Affiche WeR'Droid en continu
void ledMatrix_afficher_WRD() {
  com_serial1_print(";");
  
  com_printfln("ledMatrix: WRD");
}
