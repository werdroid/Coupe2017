#include "asserv2017.h"

#define ecran_cs   6  // CS & DC can use pins 2, 6, 9, 10, 15, 20, 21, 22, 23
#define ecran_dc   15   //  but certain pairs must NOT be used: 2+10, 6+9, 20+23, 21+22
#define rst  16 // RST can use any pin

Adafruit_ST7735 tft = Adafruit_ST7735(ecran_cs, ecran_dc, rst);
//Adafruit_ST7735 tft = Adafruit_ST7735(ecran_cs, ecran_dc, 11, 14, rst);

void ecran_setup() {
  // penser à mettre le reset à 5V
  // https://www.pjrc.com/teensy/td_libs_ST7735.html
  tft.initR(INITR_BLACKTAB);
}

void ecran_console_reset() {
  tft.fillScreen(ST7735_BLACK);
  tft.setCursor(0, 0);
  tft.setTextColor(ST7735_WHITE);
  tft.setTextWrap(true);
  // on fixe ça ? tft.setTextSize(2);
}

void ecran_console_log(const char* message) {
  //SPIFIFO.begin(ecran_cs, SPI_CLOCK_4MHz);
  tft.setTextColor(ST7735_WHITE);
  tft.print(message);
  com_log_print(message);
}

void ecran_console_error(const char* message) {
  tft.setTextColor(ST7735_RED);
  tft.print(message);
  com_log_print(message);
}

void ecran_print_menu(int selector) {
  uint16_t couleur_robot;
  
  String optionsMenu[] = {
    "\n\n   Demarrer match   ",
    "\n\n   Couleur:    XXXXX",
    "\n\n   Homologation     ",
    "\n\n   Debug            ",
    "\n\n   Tout droit 30cm  ",
    "\n\n   Test tourner x10 ",
    "\n\n   30 cm avant      ",
    "\n\n   Test part/revient",
    "\n\n   Servo Fusee      "
  };

  if(robot.IS_PR) {
    optionsMenu[0] = "\n\n   Demarrer match PR";
    optionsMenu[2] = "\n\n   (Homologation)   ";
  }
  else {
    optionsMenu[0] = "\n\n   Demarrer match GR";
  }
  
  if(robot.symetrie) {
    optionsMenu[1] = "\n\n   Couleur:    JAUNE";
    couleur_robot = ST7735_YELLOW;
  } else {
    optionsMenu[1] = "\n\n   Couleur:     BLEU";
    couleur_robot = ST7735_BLUE;
  }


  uint16_t couleur = ST7735_WHITE;

  
  // Fond
  synchronisation();
  tft.fillScreen(couleur);
  tft.setCursor(0, 0);
  tft.setTextColor(ST7735_BLACK);
  tft.setTextWrap(true);

  // Texte haut
  // tft.setTextSize(2);
  // tft.setTextColor(couleur_robot);
  // tft.print("\n  PR   \n");
  tft.setTextColor(ST7735_BLACK);
  tft.setTextSize(1);

  // Textes menu
  synchronisation();
  for (int i = 0; i < 9; i++){
    tft.print(optionsMenu[i]);
  }

  //cadres
  tft.drawFastHLine(1, 1, tft.width()-2, ST7735_BLACK);
  tft.drawFastHLine(1, tft.height()-2, tft.width()-2, ST7735_BLACK);
  tft.drawFastVLine(1, 1, tft.height()-2, ST7735_BLACK);
  tft.drawFastVLine(tft.width()-2, 1, tft.height()-2, ST7735_BLACK);
  tft.drawFastHLine(3, 3, tft.width()-6, ST7735_BLACK);
  tft.drawFastHLine(3, tft.height()-4, tft.width()-6, ST7735_BLACK);
  tft.drawFastVLine(3, 3, tft.height()-6, ST7735_BLACK);
  tft.drawFastVLine(tft.width()-4, 4, tft.height()-7, ST7735_BLACK);

  //pokeballs
  tft.fillCircle(4,4, 4, couleur_robot);
  tft.drawCircle(4,4, 4, ST7735_BLACK);
  tft.fillCircle(4,tft.height()-4,4,couleur_robot);
  tft.drawCircle(4,tft.height()-4,4,ST7735_BLACK);
  tft.fillCircle(tft.width()-4,tft.height()-4,4,couleur_robot);
  tft.drawCircle(tft.width()-4,tft.height()-4,4,ST7735_BLACK);
  tft.fillCircle(tft.width()-4,4, 4, couleur_robot);
  tft.drawCircle(tft.width()-4,4, 4, ST7735_BLACK);

  //selecteur
  int x = -25, y = selector*16 + 14;
  int offsetY = 0; // 35
  tft.fillTriangle(30 + x, offsetY + y, 30 + x, offsetY + y + 10, 35 + x, offsetY + y + 5, ST7735_BLACK);
}

void ecran_print_menu_status() {
  synchronisation();
  tft.setCursor(18, 140);
  if (sick_connected()) {
    tft.setTextColor(ST7735_GREEN);
  } else {
    tft.setTextColor(ST7735_RED);
  }
  tft.print("SICK");
}

void ecran_print_debug() {
  synchronisation();

  tft.fillScreen(ST7735_BLACK);
  tft.setCursor(0, 0);
  tft.setTextColor(ST7735_WHITE);
  tft.setTextWrap(true);

  tft.print("Codeurs\n");
  tft.print(robot.codeurGauche);
  tft.print("\n");
  tft.print(robot.codeurDroite);
  tft.print("\n");

  tft.print("Coords ticks\n");
  tft.print("x ");
  tft.print(robot.x);
  tft.print("\n");
  tft.print("y ");
  tft.print(robot.y);
  tft.print("\n");
  tft.print("a ");
  tft.print(robot.a);
  tft.print("\n");

  tft.print("Coords mm ");
  tft.print(robot.xMm);
  tft.print(" ");
  tft.print(robot.yMm);
  tft.print("\n");
}


