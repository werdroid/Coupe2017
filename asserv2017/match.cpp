#include "asserv2017.h"
#include "match.h"


/** ================
    Actions communes
    ================ **/
    
uint8_t pousser_atome(uint8_t atome) { 
  uint8_t error;
  
  com_printfln("--- Rapporter Atome %d ---", atome);
  if(atome > 5) return ERROR_PARAMETRE;
  if(table.atome_rapporte[atome]) return ERROR_PLUS_RIEN_A_FAIRE;

  int points = 0;

  // Positionnement proche des atomes
  com_printfln("Direction l'atome");
  /*
    L'idée initiale était de retourner vers l'endroit où on a abandonné l'atome
    Mais les cas d'utilisation sont très rares, et pas forcément pertinents...
  if(!atome_a_bouge[atome]) {
    */
    switch(atome) {
      case 0:
        error = aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;

      case 1:
        error = aller_pt_etape(PT_ETAPE_9, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        error = aller_xy(700, 900, VITESSE_LENTE, 1, 4000, 2);
        // On continue normalement même si erreur (on est juste à côté)
        break;

      case 2:
        /** TODO : Discuter
        Si dans ZONE_E : passer par PT_ETAPE_9 puis 11B6 ?
        **/
        error = aller_pt_etape(PT_ETAPE_10, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;
        
      case 3:
        /** TODO : Discuter
        Si dans ZONE_E : passer par PT_ETAPE_9 avant ?
        **/
        error = aller_pt_etape(PT_ETAPE_16, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;
        
      case 4:
        error = aller_pt_etape(PT_ETAPE_16B, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;
        
      case 5:
        error = aller_pt_etape(PT_ETAPE_19, VITESSE_RAPIDE, 1, 8000, 10);
        if(error) return error;
        
    }
    
  /*
  }
  else {
    if(table.atome_position[atome].x < 200    // Trop proche du bord gauche
        || table.atome_position[atome].x > 1300 // Trop proche de l'adversaire
        || table.atome_position[atome].y > 1100 // Trop proche du bord bas
        || table.atome_position[atome].y < 750) { // Trop proche de la zone de construction, l'échec était sans doute dû à un timeout...
      table.atome_rapporte[atome] = true; // On considère l'action comme réalisée pour ne pas tenter de la refaire
      com_printfln("Trop proche d'un bord");
      return OK;
    }
    
    switch(atome) {
      case 0:
      case 1:
      case 2:
        table.atome_rapporte[atome] = true;
        com_err2str(ERROR_NON_CODE);
        return OK;
        break;
      case 3:
      case 4:
        error = aller_xy(table.atome_position[atome].x, table.atome_position[atome].y, VITESSE_RAPIDE, 1, 5000, 3);
        if(error) {
          if(gr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS] + gr_nb_tentatives[ACTION_POUSSER_ATOMES_CHAOS_B] >= 4) {
            com_printfln("Abandon de la zone chaos");
            table.atome_rapporte[4] = true; // 4 et 5 correspondent tous les 2 à la zone chaos
            table.atome_rapporte[5] = true;
            return OK;
          }
          else {
            return error;
          }
        }
    }
  }
  */
  
  // Déplacement vers tableau périodique
  switch(atome) {
    case 0:
      error = aller_xy(500, 450, VITESSE_POUSSER_ATOMES, 1, 8000, 10);
      table.atome_a_bouge[0] = true;
      
      if(error) {
        table.atome_position[0].x = robot.xMm;
        table.atome_position[0].y = robot.yMm;
        return error;
      }
      else {
        score_incrementer(6); //1pt + 5pts correctement classé
        table.atome_rapporte[0] = true;
      }
      break;
      
    case 1:
      error = aller_xy(450, 600, VITESSE_POUSSER_ATOMES, 1, 8000, 10);
      table.atome_a_bouge[1] = true;
      if(error) {
        table.atome_position[1].x = robot.xMm;
        table.atome_position[1].y = robot.yMm;
        return error;
      }
      else {
        score_incrementer(6); //1pt + 5pts correctement classé
        table.atome_rapporte[1] = true;
      }
      break;
      
    case 2:
      error = aller_xy(400, 900, VITESSE_POUSSER_ATOMES, 1, 8000, 10);
      table.atome_a_bouge[2] = true;
      if(error) {
        table.atome_position[2].x = robot.xMm;
        table.atome_position[2].y = robot.yMm;
        return error;
      }
      else {
        score_incrementer(6); //1pt + 5pts correctement classé
        table.atome_rapporte[2] = true;
      }
      break;
      
    case 3:
      error = aller_xy(450, 1050, VITESSE_POUSSER_ATOMES, 1, 10000, 10);
      table.atome_a_bouge[3] = true;
      table.atome_a_bouge[4] = true;
      if(error) {
        table.atome_position[3].x = robot.xMm;
        table.atome_position[3].y = robot.yMm;
        table.atome_position[4].x = robot.xMm;
        table.atome_position[4].y = robot.yMm;
        return error;
      }
      else {
        if(!table.atome_rapporte[4])
          points += 9; //4 atomes * 1pt + le bleu correctement placé * 5pts
        else
          points += 1;
        if(!table.atome_rapporte[2]) points += 1; // le vert n'avait pas déjà été rapporté, on l'a mis dans le bleu au passage
        table.atome_rapporte[3] = true;
        score_incrementer(points);
      }
      break;
      
    case 4:
      error = aller_xy(400, 550, VITESSE_POUSSER_ATOMES, 1, 10000, 10);
      table.atome_a_bouge[3] = true;
      table.atome_a_bouge[4] = true;
      if(error) {
        table.atome_position[3].x = robot.xMm;
        table.atome_position[3].y = robot.yMm;
        table.atome_position[4].x = robot.xMm;
        table.atome_position[4].y = robot.yMm;
        return error;
      }
      else {
        if(!table.atome_rapporte[3])
          points += 13; //4 atomes * 1pt + 2 rouges biens placés * 5pts - 1 perdu (en espérant que ce soit pas un rouge...)
        else
          points += 1; // Le mouvement a permis d'en récupérer 1
        if(!table.atome_rapporte[1]) points += 6;
        table.atome_rapporte[4] = true;
        score_incrementer(points);
      }
      break;
      
    case 5:
      error = aller_xy(450, 1050, VITESSE_POUSSER_ATOMES, 1, 15000, 10);
      table.atome_a_bouge[5] = true;
      if(robot_dans_zone(ZONE_B | ZONE_E)) {
        table.atome_a_bouge[3] = true;
        table.atome_a_bouge[4] = true;
      }
      if(error) {
        table.atome_position[5].x = robot.xMm;
        table.atome_position[5].y = robot.yMm;
        if(robot_dans_zone(ZONE_B | ZONE_E)) {
          table.atome_position[3].x = robot.xMm;
          table.atome_position[3].y = robot.yMm;
          table.atome_position[4].x = robot.xMm;
          table.atome_position[4].y = robot.yMm;
        }
        return error;
      }
      else {
        if(!table.atome_rapporte[3] && !table.atome_rapporte[4])
          points += 12; // 8 atomes * 1 pt + 1 bien placé dans le lot quand même, non ? * 5pts - 1 perdu
        else
          points += 9; // 4 atomes * 1pt + le bleu bien placé * 5 pts
        if(!table.atome_rapporte[2]) points += 1; // le vert n'avait pas déjà été rapporté, on l'a mis dans le bleu au passage
        table.atome_rapporte[5] = true;
        score_incrementer(points);
      }
      break;
      
  }
  
  asserv_go_toutdroit(-80, 2000); // On recule avant de tourner
  
  return OK;
}

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


