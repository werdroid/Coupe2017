#include "asserv2017.h"
#include "match.h"


/**
  Fonctions commandant un déplacement "intelligent"
  + utilitaires associées
**/


  
/** ====================
  Déplacements sur table
  ====================== **/
  
// Attention, inversion de uniquement_avant et timeout par rapport à asserv_go_xy
// (La logique est : on définit les paramètres de notre consigne avant de définir les conditions d'échec)
// aller_xy = "Va là intelligement"
// asserv_go_xy = "Va là, stupide"
// Tous les paramètres sont obligatoires
uint8_t aller_xy(int32_t x, int32_t y, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {
  uint8_t error;
  uint8_t error2;
  uint8_t tentatives = 0;
  
  
  if(robot.homologation) {
    // Evite que le robot aille ailleurs pendant un programme d'homologation
    max_tentatives = 120;
  }
  
  
  asserv_vitesse_rampe_distance(vitesse);

  if (uniquement_avant) {
    asserv_rotation_vers_point(x, y, 2000);
  }

  do {
    error = asserv_go_xy(x, y, timeout, uniquement_avant);
    tentatives++;
    
    // En cas d'obstacle on fait une pause avant de tenter à nouveau
    if(error == ERROR_OBSTACLE) {
      ledMatrix_indiquer_obstacle();
      minuteur_attendre(1000);
      /*if(tentatives == 3 || tentatives == 5) {
        asserv_go_toutdroit(-80, 1000);
      }*/
    }
  } while (error == ERROR_OBSTACLE && tentatives < max_tentatives);

  if (error != OK) {
    //com_printfln("! Déplacement vers %d, %d abandonné", x, y);
    switch(error) {
      case ERROR_TIMEOUT:
        com_printfln("! Déplacement vers %d, %d abandonné (timeout %d atteint)", x, y, timeout);
        break;
      case ERROR_OBSTACLE:
        com_printfln("! Déplacement vers %d, %d abandonné (OBSTACLE)", x, y);
        break;
      case ERROR_FIN_MATCH:
        com_printfln("! Déplacement vers %d, %d abandonné (FIN MATCH)", x, y);
        break;
      case ERROR_CAS_NON_GERE:
        com_printfln("! Déplacement vers %d, %d abandonné (CAS NON GERE)", x, y);
        break;
      case AUTRE:
        // TODO: ça n'a pas de sens, à préciser ce que c'est 'AUTRE'
        // --> asserv.cpp
        com_printfln("! Déplacement vers %f, %f abandonné (AUTRE ERREUR)", x, y);
        break;
      default:
        com_printfln("! ### Déplacement vers %d, %d abandonné (Erreur inconnue a corriger)", x, y);
    }

    if (tentatives >= max_tentatives) {
      com_printfln("! Après %d tentatives (max)", tentatives);
    }
  }

  return error;
}

uint8_t aller_pt_direct(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {
  Point point = getPoint(idPoint);
  return aller_xy(point.x, point.y, vitesse, uniquement_avant, timeout, max_tentatives);
}

uint8_t aller_pt_etape(uint8_t idPoint, uint32_t vitesse, uint16_t uniquement_avant, uint16_t timeout, uint8_t max_tentatives) {

  /* Si accessible directement : return aller_xy()
     Sinon :
        aller_pt_etape()
        return aller(point_demandé)
  */
  bool point_accessible = false;
  bool je_suis_perdu = false;
  uint8_t point_de_passage;
  uint8_t error;
  Point point;


  switch(idPoint) {

    // [A copier coller dans aller_pt_etape()]
    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Morceau de code généré automatiquement par GenererPtsdePassage
        le 2019-04-27 à 20:48:10
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
    case PT_ETAPE_1:
      com_printfln("Destination P1");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C | ZONE_D | ZONE_E | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_15;
        else if(robot_dans_zone(ZONE_G))
          point_de_passage = PT_ETAPE_13;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_2:
      com_printfln("Destination P2");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C | ZONE_D | ZONE_E | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_15;
        else if(robot_dans_zone(ZONE_G))
          point_de_passage = PT_ETAPE_13;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_3:
      com_printfln("Destination P3");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C | ZONE_D | ZONE_E | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_F | ZONE_G))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_4:
      com_printfln("Destination P4");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C | ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_5;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_5:
      com_printfln("Destination P5");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C | ZONE_D)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_E | ZONE_K))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_6:
      com_printfln("Destination P6");
      if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C | ZONE_D | ZONE_F)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_E | ZONE_K))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_6B1:
      com_printfln("Destination P6B1");
      if(robot_dans_zone(ZONE_C | ZONE_D)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_F))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_K))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_6B2:
      com_printfln("Destination P6B2");
      if(robot_dans_zone(ZONE_C | ZONE_D | ZONE_H)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B))
          point_de_passage = PT_ETAPE_5;
        else if(robot_dans_zone(ZONE_E | ZONE_K))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_6B3:
      com_printfln("Destination P6B3");
      if(robot_dans_zone(ZONE_C | ZONE_D)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B))
          point_de_passage = PT_ETAPE_5;
        else if(robot_dans_zone(ZONE_E | ZONE_K))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_6B4:
      com_printfln("Destination P6B4");
      if(robot_dans_zone(ZONE_C | ZONE_D)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B))
          point_de_passage = PT_ETAPE_5;
        else if(robot_dans_zone(ZONE_E | ZONE_K))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_7:
      com_printfln("Destination P7");
      if(robot_dans_zone(ZONE_A | ZONE_E | ZONE_F | ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_B | ZONE_C | ZONE_D))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_8:
      com_printfln("Destination P8");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_G))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B | ZONE_C | ZONE_D))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_9:
      com_printfln("Destination P9");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_G))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B | ZONE_C | ZONE_D))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_10:
      com_printfln("Destination P10");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B1:
      com_printfln("Destination P11B1");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B2:
      com_printfln("Destination P11B2");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B3:
      com_printfln("Destination P11B3");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B4:
      com_printfln("Destination P11B4");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B5:
      com_printfln("Destination P11B5");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B6:
      com_printfln("Destination P11B6");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B7:
      com_printfln("Destination P11B7");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B8:
      com_printfln("Destination P11B8");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B9:
      com_printfln("Destination P11B9");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B10:
      com_printfln("Destination P11B10");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B11:
      com_printfln("Destination P11B11");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B12:
      com_printfln("Destination P11B12");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_11B13:
      com_printfln("Destination P11B13");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A | ZONE_B | ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_12:
      com_printfln("Destination P12");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_13:
      com_printfln("Destination P13");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_14:
      com_printfln("Destination P14");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_15:
      com_printfln("Destination P15");
      if(robot_dans_zone(ZONE_E | ZONE_F | ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_16:
      com_printfln("Destination P16");
      if(robot_dans_zone(ZONE_F | ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E))
          point_de_passage = PT_ETAPE_15;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_16B:
      com_printfln("Destination P16B");
      if(robot_dans_zone(ZONE_F | ZONE_K)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E))
          point_de_passage = PT_ETAPE_15;
        else if(robot_dans_zone(ZONE_G | ZONE_L | ZONE_M))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_17:
      com_printfln("Destination P17");
      if(robot_dans_zone(ZONE_F | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E))
          point_de_passage = PT_ETAPE_15;
        else if(robot_dans_zone(ZONE_G))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_18:
      com_printfln("Destination P18");
      if(robot_dans_zone(ZONE_E | ZONE_I | ZONE_J | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_12;
        else if(robot_dans_zone(ZONE_G))
          point_de_passage = PT_ETAPE_19;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_K))
          point_de_passage = PT_ETAPE_13;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_19:
      com_printfln("Destination P19");
      if(robot_dans_zone(ZONE_G | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_I | ZONE_J | ZONE_L))
          point_de_passage = PT_ETAPE_18;
        else if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_12;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_K))
          point_de_passage = PT_ETAPE_13;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_19B:
      com_printfln("Destination P19B");
      if(robot_dans_zone(ZONE_G | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_I | ZONE_J | ZONE_L))
          point_de_passage = PT_ETAPE_18;
        else if(robot_dans_zone(ZONE_F))
          point_de_passage = PT_ETAPE_12;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_K))
          point_de_passage = PT_ETAPE_13;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B1:
      com_printfln("Destination P20B1");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B2:
      com_printfln("Destination P20B2");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B3:
      com_printfln("Destination P20B3");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B4:
      com_printfln("Destination P20B4");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B5:
      com_printfln("Destination P20B5");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B6:
      com_printfln("Destination P20B6");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B7:
      com_printfln("Destination P20B7");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B8:
      com_printfln("Destination P20B8");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B9:
      com_printfln("Destination P20B9");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    case PT_ETAPE_20B10:
      com_printfln("Destination P20B10");
      if(robot_dans_zone(ZONE_G | ZONE_K | ZONE_L | ZONE_M)) {
        point_accessible = true;
      }
      else {
        point_accessible = false;
        if(robot_dans_zone(ZONE_A))
          point_de_passage = PT_ETAPE_7;
        else if(robot_dans_zone(ZONE_B))
          point_de_passage = PT_ETAPE_3;
        else if(robot_dans_zone(ZONE_C))
          point_de_passage = PT_ETAPE_4;
        else if(robot_dans_zone(ZONE_D))
          point_de_passage = PT_ETAPE_6;
        else if(robot_dans_zone(ZONE_E | ZONE_F))
          point_de_passage = PT_ETAPE_16;
        else if(robot_dans_zone(ZONE_H))
          point_de_passage = PT_ETAPE_6B2;
        else if(robot_dans_zone(ZONE_I | ZONE_J))
          point_de_passage = PT_ETAPE_18;
        else
          je_suis_perdu = true;
      }
      break;
      
    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/


    /********************************************************/
  }

  if(je_suis_perdu) {
    com_printfln("! ######### ERREUR : Point '%d' sans stratégie", idPoint);
    return ERROR_CAS_NON_GERE;
  }
  else {
    point = getPoint(idPoint);
    if(point_accessible) {
      return aller_xy(point.x, point.y, vitesse, uniquement_avant, timeout, max_tentatives);
    }
    else {
      com_printfln("Détour...");
      error = aller_pt_etape(point_de_passage, vitesse, uniquement_avant, timeout, max_tentatives);
      if(error) return error;
      return aller_pt_etape(idPoint, vitesse, uniquement_avant, timeout, max_tentatives);
    }
  }

}


/** ========================
  Utilitaires de déplacement
  ========================== **/
  
//Antoine 24/03/2018 : TODO_Rémi màj code des zones

uint16_t localiser_zone() {
  // Ajout de zone à faire aussi dans getZone() et asserv2017.h
  // Généré automatiquement

  /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Morceau de code généré automatiquement par GenererZonesLocaliser
      le 2019-04-27 à 20:48:08
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
  if(robot_dans_zone(ZONE_E)) {
    com_printfln("Localisé zone E");
    return ZONE_E;
  }
  else if(robot_dans_zone(ZONE_L)) {
    com_printfln("Localisé zone L");
    return ZONE_L;
  }
  else if(robot_dans_zone(ZONE_F)) {
    com_printfln("Localisé zone F");
    return ZONE_F;
  }
  else if(robot_dans_zone(ZONE_G)) {
    com_printfln("Localisé zone G");
    return ZONE_G;
  }
  else if(robot_dans_zone(ZONE_K)) {
    com_printfln("Localisé zone K");
    return ZONE_K;
  }
  else if(robot_dans_zone(ZONE_M)) {
    com_printfln("Localisé zone M");
    return ZONE_M;
  }
  else if(robot_dans_zone(ZONE_B)) {
    com_printfln("Localisé zone B");
    return ZONE_B;
  }
  else if(robot_dans_zone(ZONE_C)) {
    com_printfln("Localisé zone C");
    return ZONE_C;
  }
  else if(robot_dans_zone(ZONE_D)) {
    com_printfln("Localisé zone D");
    return ZONE_D;
  }
  else if(robot_dans_zone(ZONE_A)) {
    com_printfln("Localisé zone A");
    return ZONE_A;
  }
  else if(robot_dans_zone(ZONE_I)) {
    com_printfln("Localisé zone I");
    return ZONE_I;
  }
  else if(robot_dans_zone(ZONE_J)) {
    com_printfln("Localisé zone J");
    return ZONE_J;
  }
  else if(robot_dans_zone(ZONE_H)) {
    com_printfln("Localisé zone H");
    return ZONE_H;
  }
  /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/


  com_printfln("##### Zone inconnue");
  return ZONE_INCONNUE;
}


Point getPoint(uint8_t idPoint) {
  // Ajout de point à faire aussi dans asserv2017.h
  
  /* Alternative : Import depuis Excel : Remplacer par RegExp
    p([0-9]{1,2})\t([0-9]{3,4})\t([0-9]{3,4})
    case PT_ETAPE_$1: return {.x = $2, .y = $3}; break;
  */
  /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Code généré automatiquement par GenererListePoints
      le 2019-04-27 à 20:48:01
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
  // NE PAS CHANGER L'ORDRE !!
  // Les points sont regroupés par environ 15 points pour réduire le temps de recherche d'un point
  if(idPoint <= PT_ETAPE_7) {
    switch(idPoint) {
      case PT_ETAPE_1: return {.x = 236, .y = 450}; break;
      case PT_ETAPE_2: return {.x = 235, .y = 752}; break;
      case PT_ETAPE_3: return {.x = 259, .y = 236}; break;
      case PT_3A: return {.x = 259, .y = 152}; break;
      case PT_ETAPE_4: return {.x = 293, .y = 1342}; break;
      case PT_ETAPE_5: return {.x = 223, .y = 1545}; break;
      case PT_ETAPE_6: return {.x = 214, .y = 1343}; break;
      case PT_ETAPE_6B1: return {.x = 173, .y = 1828}; break;
      case PT_ETAPE_6B2: return {.x = 223, .y = 1794}; break;
      case PT_ETAPE_6B3: return {.x = 276, .y = 1793}; break;
      case PT_ETAPE_6B4: return {.x = 325, .y = 1793}; break;
      case PT_6B1A: return {.x = 174, .y = 1855}; break;
      case PT_6B2A: return {.x = 223, .y = 1855}; break;
      case PT_6B3A: return {.x = 276, .y = 1855}; break;
      case PT_6B4A: return {.x = 323, .y = 1855}; break;
      case PT_ETAPE_7: return {.x = 862, .y = 288}; break;
      default:
        com_printfln("! ####### idPoint '%d' incorrect dans getPoint", idPoint);
        return {.x = 750, .y = 1000}; // Milieu de la demi-table
    }
  }
  else if(idPoint <= PT_ETAPE_11B10) {
    switch(idPoint) {
      case PT_ETAPE_8: return {.x = 749, .y = 450}; break;
      case PT_8A: return {.x = 693, .y = 452}; break;
      case PT_ETAPE_9: return {.x = 749, .y = 753}; break;
      case PT_9A: return {.x = 691, .y = 753}; break;
      case PT_ETAPE_10: return {.x = 496, .y = 1300}; break;
      case PT_10A: return {.x = 495, .y = 1243}; break;
      case PT_ETAPE_11B1: return {.x = 446, .y = 1333}; break;
      case PT_ETAPE_11B2: return {.x = 494, .y = 1333}; break;
      case PT_ETAPE_11B3: return {.x = 542, .y = 1333}; break;
      case PT_ETAPE_11B4: return {.x = 598, .y = 1333}; break;
      case PT_ETAPE_11B5: return {.x = 640, .y = 1333}; break;
      case PT_ETAPE_11B6: return {.x = 699, .y = 1333}; break;
      case PT_ETAPE_11B7: return {.x = 751, .y = 1333}; break;
      case PT_ETAPE_11B8: return {.x = 801, .y = 1333}; break;
      case PT_ETAPE_11B9: return {.x = 851, .y = 1333}; break;
      case PT_ETAPE_11B10: return {.x = 902, .y = 1333}; break;
      default:
        com_printfln("! ####### idPoint '%d' incorrect dans getPoint", idPoint);
        return {.x = 750, .y = 1000}; // Milieu de la demi-table
    }
  }
  else if(idPoint <= PT_11B13A) {
    switch(idPoint) {
      case PT_ETAPE_11B11: return {.x = 948, .y = 1333}; break;
      case PT_ETAPE_11B12: return {.x = 1003, .y = 1333}; break;
      case PT_ETAPE_11B13: return {.x = 1055, .y = 1333}; break;
      case PT_11B1A: return {.x = 446, .y = 1393}; break;
      case PT_11B2A: return {.x = 494, .y = 1393}; break;
      case PT_11B3A: return {.x = 542, .y = 1393}; break;
      case PT_11B4A: return {.x = 598, .y = 1393}; break;
      case PT_11B5A: return {.x = 640, .y = 1393}; break;
      case PT_11B6A: return {.x = 699, .y = 1393}; break;
      case PT_11B7A: return {.x = 751, .y = 1393}; break;
      case PT_11B8A: return {.x = 801, .y = 1393}; break;
      case PT_11B9A: return {.x = 851, .y = 1393}; break;
      case PT_11B10A: return {.x = 902, .y = 1393}; break;
      case PT_11B11A: return {.x = 948, .y = 1393}; break;
      case PT_11B12A: return {.x = 1003, .y = 1393}; break;
      case PT_11B13A: return {.x = 1055, .y = 1393}; break;
      default:
        com_printfln("! ####### idPoint '%d' incorrect dans getPoint", idPoint);
        return {.x = 750, .y = 1000}; // Milieu de la demi-table
    }
  }
  else if(idPoint <= PT_19A) {
    switch(idPoint) {
      case PT_ETAPE_12: return {.x = 1312, .y = 273}; break;
      case PT_12A: return {.x = 1312, .y = 189}; break;
      case PT_ETAPE_13: return {.x = 1679, .y = 273}; break;
      case PT_13A: return {.x = 1679, .y = 189}; break;
      case PT_ETAPE_14: return {.x = 2225, .y = 277}; break;
      case PT_14A: return {.x = 2225, .y = 210}; break;
      case PT_ETAPE_15: return {.x = 1373, .y = 889}; break;
      case PT_ETAPE_16: return {.x = 1364, .y = 1051}; break;
      case PT_16A: return {.x = 1302, .y = 1052}; break;
      case PT_ETAPE_16B: return {.x = 1227, .y = 1334}; break;
      case PT_16BA: return {.x = 1192, .y = 1290}; break;
      case PT_ETAPE_17: return {.x = 1296, .y = 1277}; break;
      case PT_17A: return {.x = 1297, .y = 1427}; break;
      case PT_ETAPE_18: return {.x = 2299, .y = 842}; break;
      case PT_ETAPE_19: return {.x = 2344, .y = 1048}; break;
      case PT_19A: return {.x = 2297, .y = 1047}; break;
      default:
        com_printfln("! ####### idPoint '%d' incorrect dans getPoint", idPoint);
        return {.x = 750, .y = 1000}; // Milieu de la demi-table
    }
  }
  else if(idPoint <= PT_20B4A) {
    switch(idPoint) {
      case PT_ETAPE_19B: return {.x = 2333, .y = 1192}; break;
      case PT_19BA: return {.x = 2281, .y = 1170}; break;
      case PT_ETAPE_20B1: return {.x = 1947, .y = 1333}; break;
      case PT_ETAPE_20B2: return {.x = 1996, .y = 1333}; break;
      case PT_ETAPE_20B3: return {.x = 2048, .y = 1333}; break;
      case PT_ETAPE_20B4: return {.x = 2099, .y = 1333}; break;
      case PT_ETAPE_20B5: return {.x = 2149, .y = 1333}; break;
      case PT_ETAPE_20B6: return {.x = 2198, .y = 1333}; break;
      case PT_ETAPE_20B7: return {.x = 2249, .y = 1333}; break;
      case PT_ETAPE_20B8: return {.x = 2299, .y = 1333}; break;
      case PT_ETAPE_20B9: return {.x = 2350, .y = 1333}; break;
      case PT_ETAPE_20B10: return {.x = 2402, .y = 1333}; break;
      case PT_20B1A: return {.x = 1947, .y = 1393}; break;
      case PT_20B2A: return {.x = 1996, .y = 1393}; break;
      case PT_20B3A: return {.x = 2048, .y = 1393}; break;
      case PT_20B4A: return {.x = 2099, .y = 1393}; break;
      default:
        com_printfln("! ####### idPoint '%d' incorrect dans getPoint", idPoint);
        return {.x = 750, .y = 1000}; // Milieu de la demi-table
    }
  }
  else {
    switch(idPoint) {
      case PT_20B5A: return {.x = 2149, .y = 1393}; break;
      case PT_20B6A: return {.x = 2198, .y = 1393}; break;
      case PT_20B7A: return {.x = 2249, .y = 1393}; break;
      case PT_20B8A: return {.x = 2299, .y = 1393}; break;
      case PT_20B9A: return {.x = 2350, .y = 1393}; break;
      case PT_20B10A: return {.x = 2402, .y = 1393}; break;
      default:
        com_printfln("! ####### idPoint '%d' incorrect dans getPoint", idPoint);
        return {.x = 750, .y = 1000}; // Milieu de la demi-table
    }
  }
  /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/

}


// marge = 50 si non renseigné
bool robot_proche_point(uint8_t idPoint, uint8_t marge) {
  Point point = getPoint(idPoint);
  return robot_dans_zone(point.x - marge, point.y - marge, point.x + marge, point.y + marge);
}


bool robot_dans_zone(uint16_t idZone) {
  // En mode bit mask, donc idZone peut tester plusieurs zones d'un coup
  // [Les zones peuvent donc se  chevaucher ? [TBC]]
  
  bool result = false;

  /*com_printfln("Zones testées : %d", idZone);
  com_send_position();*/
  
  /* Alternative, Import depuis Excel : Remplacer par Regexp
    z([A-Z])\t([0-9]{1,4})\t([0-9]{1,4})\t([0-9]{1,4})\t([0-9]{1,4})
    if\(\(idZone & ZONE_$1\) == ZONE_$1\)\n  result |= robot_dans_zone\($2, $3, $4, $5\);\n
  */
  /*
    [Il peut être intéressant de trier les conditions par ordre de fréquence probable]
    Et d'ajouter cette ligne à mi-chemin
    
    if(result) return result; // Bilan à mi-parcours. Inutile de continuer si on est déjà true
  */
  
  /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Code généré automatiquement par GenererListesZones
      le 2019-04-29 à 23:09:38
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/
  if((idZone & ZONE_A) == ZONE_A)
    result |= robot_dans_zone(0, 0, 276, 266);

  if((idZone & ZONE_B) == ZONE_B)
    result |= robot_dans_zone(0, 266, 276, 1277);

  if((idZone & ZONE_C) == ZONE_C)
    result |= robot_dans_zone(0, 1277, 276, 1639);

  if(result) return result;

  if((idZone & ZONE_D) == ZONE_D)
    result |= robot_dans_zone(0, 1639, 400, 2000);

  if((idZone & ZONE_E) == ZONE_E)
    result |= robot_dans_zone(276, 0, 1226, 1160);

  if((idZone & ZONE_F) == ZONE_F)
    result |= robot_dans_zone(276, 1160, 1500, 1639);

  if(result) return result;

  if((idZone & ZONE_G) == ZONE_G)
    result |= robot_dans_zone(1500, 1160, 2450, 1639);

  if((idZone & ZONE_H) == ZONE_H)
    result |= robot_dans_zone(400, 1639, 1500, 2000);

  if((idZone & ZONE_I) == ZONE_I)
    result |= robot_dans_zone(2450, 0, 3000, 1639);

  if(result) return result;

  if((idZone & ZONE_J) == ZONE_J)
    result |= robot_dans_zone(1500, 1639, 3000, 2000);

  if((idZone & ZONE_K) == ZONE_K)
    result |= robot_dans_zone(1226, 0, 1500, 1160);

  if((idZone & ZONE_L) == ZONE_L)
    result |= robot_dans_zone(1500, 0, 2180, 1160);

  if((idZone & ZONE_M) == ZONE_M)
    result |= robot_dans_zone(2180, 0, 2450, 1160);

  /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/

  return result;
}

bool robot_dans_zone(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
  if(x1 > x2 || y1 > y2) {
    tone_play_alert();
    com_printfln("! ############### Erreur : paramètres de robot_dans_zone mal définis.");
  }

  /*
  if(!robot.symetrie)
    return (robot.xMm >= x1 && robot.xMm <= x2) && (robot.yMm >= y1 && robot.yMm <= y2);
  else
    return (robot.xMm <= symetrie_x(x1) && robot.xMm >= symetrie_x(x2) && (robot.yMm >= y1 && robot.yMm <= y2));
//*/
 /* if((symetrie_x(robot.xMm) >= x1 && symetrie_x(robot.xMm) <= x2) && (robot.yMm >= y1 && robot.yMm <= y2))
    com_printfln("Dans (%d, %d), (%d, %d)", x1, y1, x2, y2);
  else
    com_printfln("Pas dans (%d, %d), (%d, %d)", x1, y1, x2, y2);*/


  // Ne peut-on pas se contenter d'un
  return (symetrie_x(robot.xMm) >= x1 && symetrie_x(robot.xMm) <= x2) && (robot.yMm >= y1 && robot.yMm <= y2);
  // ? (trop tard pour tester maintenant)

}

