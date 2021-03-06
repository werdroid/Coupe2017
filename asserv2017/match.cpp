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

  if(robot.IS_PR) {
    piloter_bras(BRAS_LEVER);
  }

  int points = 0;

  // Positionnement proche des atomes
  com_printfln("Direction l'atome");
  /*
    L'idée initiale était de retourner vers l'endroit où on a abandonné l'atome
    Mais les cas d'utilisation sont très rares, et pas forcément pertinents...
  if(!atome_a_bouge[atome]) {
    */
    switch(atome) {
      case 0: //Prise de l'atome devant Tab_Rd, déplacement dans Tab_Rd
        error = aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;

      case 1: //Prise de l'atome devant Tab_Gn, déplacement dans Tab_Rd
        error = aller_pt_etape(PT_ETAPE_9, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        error = aller_xy(700, 900, VITESSE_LENTE, 1, 4000, 2);
        // On continue normalement même si erreur (on est juste à côté)
        break;

      case 2: //Prise des atomes devant Tab_Bl, Tab_Gn, et Tab_Rd (s'il y a), et déplacement dans Tab_Rd
        /** TODO : Discuter
        Si dans ZONE_E : passer par PT_ETAPE_9 puis 11B6 ?
        ATN: OK, permet de contourner l'atome pour l'arrivée par le haut (sera non valide si départ vers le bas)
        **/
        
        //Pour départ vers le haut uniquement
        //error = aller_pt_etape(PT_ETAPE_9, VITESSE_RAPIDE, 1, 8000, 6);
        //if(error) return error;
        //error = aller_pt_etape(PT_ETAPE_11B6, VITESSE_RAPIDE, 1, 8000, 6);
        //if(error) return error;
        
        error = aller_pt_etape(PT_ETAPE_10, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;
        
      case 3: //ACTION_POUSSER_ATOMES_CHAOS - Prise des atomes de la zone de chaos own, mettre dans Tab_Rd
        /** TODO : Discuter
        Si dans ZONE_E : passer par PT_ETAPE_9 avant ?
        Antoine : non, en destination de P16/P16bis on contourne Zchos own via P15
        **/
        error = aller_pt_etape(PT_ETAPE_16, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;
        
      case 4: //ACTION_POUSSER_ATOMES_CHAOS_B - Prise des atomes de la zone de chaos own, mettre dans Tab_Bl
        error = aller_pt_etape(PT_ETAPE_16B, VITESSE_RAPIDE, 1, 8000, 6);
        if(error) return error;
        break;
        
      case 5: //ACTION_POUSSER_ATOMES_CHAOS_ADV - Prise des atomes de la zone de chaos opp, mettre dans Tab_Bl
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
      error = aller_xy(450, 450, VITESSE_POUSSER_ATOMES, 1, 8000, 7);
      table.atome_a_bouge[0] = true;
      
      if(error) {
        table.atome_position[0].x = robot.xMm; //On retient la position du robot avant de laisser l'atome pour y revenir plus tard
        table.atome_position[0].y = robot.yMm;
        return error;
      }
      else {
        score_incrementer(6); //1pt + 5pts correctement classé
        table.atome_rapporte[0] = true;
      }
      break;
      
    case 1:
      error = aller_xy(450, 600, VITESSE_POUSSER_ATOMES, 1, 8000, 7);
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
      //error = aller_xy(400, 900, VITESSE_POUSSER_ATOMES, 1, 8000, 10); //Pour mettre l'atome devant Tab_Bl dans Tab_Gn

      // Un centre d'atome est supposé être à 150 mm du centre de PR. On pousse les atomes jusqu'à les mettre devant Tab_Rd.
      // Coord y_atomes souhaitée = 450
      // Coord y_robot = y_atomes + 150 = 600
      error = aller_xy(496, 600, VITESSE_POUSSER_ATOMES, 1, 8000, 7); if(error) return error;
      asserv_go_toutdroit(-80, 2000); // On recule avant de tourner
      // On se positionne pour rentrer les atomes dans Tab_Rd
      error = aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 1, 8000, 6); if(error) return error;
      //On rentre les atomes dans Tab_Rd
      error = aller_xy(450, 450, VITESSE_POUSSER_ATOMES, 1, 8000, 7); if(error) return error;
            
      table.atome_a_bouge[2] = true;
      
      /**A revoir suite aux mouvements multiples définis ci-dessus et leurs conditions de sortie**/
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
      error = aller_xy(450, 1050, VITESSE_POUSSER_ATOMES, 1, 10000, 7);
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
      //error = aller_xy(400, 550, VITESSE_POUSSER_ATOMES, 1, 10000, 10);
      //Nouvelle version en 2 étapes
      //On rapporte les atomes devant Tab_Rd
      error = aller_xy(591, 559, VITESSE_POUSSER_ATOMES, 1, 8000, 4); if(error) return error;
      asserv_go_toutdroit(-80, 2000); // On recule avant de tourner
      // On se positionne pour rentrer les atomes dans Tab_Rd
      error = aller_pt_etape(PT_ETAPE_8, VITESSE_RAPIDE, 1, 8000, 4); if(error) return error;
      //On rentre les atomes dans Tab_Rd
      error = aller_xy(450, 450, VITESSE_POUSSER_ATOMES, 1, 8000, 4);
            
      
      table.atome_a_bouge[3] = true;
      table.atome_a_bouge[4] = true;
      
      /**A revoir suite aux mouvements multiples définis ci-dessus et leurs conditions de sortie**/
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
      error = aller_xy(450, 1050, VITESSE_POUSSER_ATOMES, 1, 15000, 7);
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


uint8_t aller_vers_adp(int32_t yDirect, int32_t yDetour, uint32_t vitesse) {
  /*
    essayer par chemin direct
    si gêné, descend un peu, et continue d'essayer par petits morceaux,
    en tentant de se remettre au plus près de la bordure régulièrement
    Si gêné, tente de se mettre au plus près de la bordure
  */
  /*
    ATTENTION ! Peut ne pas fonctionner si le robot s'interdit de tourner quand il voit un obstacle...
  
  **/
  
  const uint8_t SUIVRE_ROUTE = 1;
  const uint8_t ALLER_VERS_DEVIATION = 2;
  const uint8_t SUIVRE_DEVIATION = 4;
  const uint8_t REVENIR_VERS_ROUTE = 8;
  
  uint8_t error;
  Point ptDestination = getPoint(PT_ETAPE_13);
  uint8_t chemin = SUIVRE_ROUTE;
  uint8_t nb_boucles = 0;
  
  
  com_printfln("--- Direction Blueium ---");
  if(table.adp_active) return ERROR_PLUS_RIEN_A_FAIRE;
  
  
  // Déterminer des conditions de début ??  
  while(nb_boucles < 30) {
    nb_boucles++;
  
    switch(chemin) {
      case SUIVRE_ROUTE:
        error = aller_xy(ptDestination.x, ptDestination.y, vitesse, 1, 20000, 5);
        
        switch(error) {
          case ERROR_OBSTACLE:
            chemin = ALLER_VERS_DEVIATION;
            break;
          case OK:
            return OK;
            break;
          default:
            return error;
        }
        break;

      case ALLER_VERS_DEVIATION:
        // On essaye de se décaler
        error = aller_xy(robot.xMm, yDetour, vitesse, 1, 20000, 3);
        switch(error) {
          case ERROR_OBSTACLE:
            // On est encerclé => obligé d'attendre un peu :
            minuteur_attendre(5000);
            chemin = SUIVRE_ROUTE;
            break;
          case OK:
            chemin = SUIVRE_DEVIATION;
            break;
          default:
            return error;
        }
        
        break;

      case SUIVRE_DEVIATION:
        error = aller_xy(ptDestination.x, yDetour, vitesse, 1, 20000, 5);
        switch(error) {
          case ERROR_OBSTACLE:
            chemin = REVENIR_VERS_ROUTE;
            break;
          case OK:
            return OK;
            break;
          default:
            return error;
        }
        break;

      case REVENIR_VERS_ROUTE:
          error = aller_xy(robot.xMm, yDirect, vitesse, 1, 20000, 3);
          switch(error) {
            case ERROR_OBSTACLE:
              minuteur_attendre(5000);
              chemin = SUIVRE_DEVIATION;
              break;
            case OK:
              chemin = SUIVRE_ROUTE;
              break;
            default:
              return error;
          }
          break;

      default:
        return ERROR_CAS_NON_GERE;
    }

    if(nb_boucles >= 30) {
      return ERROR_TIMEOUT;
    }

  }
  
  return ERROR_TIMEOUT;
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


/** ==========
    Expérience
    ========== **/

void experience_activer() {
  com_serial3_print("9");
}