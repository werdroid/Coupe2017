#include "asserv2017.h"
#include "match.h"


/** ================
    Gestion du score
    ================ **/
  
void score_definir(int valeur) {
  robot.score = valeur;
  ledMatrix_definir_score(valeur);
}
  
void score_incrementer(int increment) {
  robot.score += increment;
  
  if(robot.score < 0)
    robot.score = 0;
  
  ledMatrix_incrementer_score(increment);
}


