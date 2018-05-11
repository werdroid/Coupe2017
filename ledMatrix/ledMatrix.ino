#include "LEDMatrixDriver.hpp"
#include "display_library.h"


// Define the ChipSelect pin for the led matrix (Dont use the SS or MISO pin of your Arduino!)
const uint8_t LEDMATRIX_CS_PIN = 6;

// LED Matrix dimensions (0-n) - eg: 32x8 = 31x7
const int LEDMATRIX_WIDTH = 31;
const int LEDMATRIX_HEIGHT = 7;
const int LEDMATRIX_SEGMENTS = 4;

// Constantes programme
const int ANIM_DELAY = 80; // Peut descendre jusqu'à 50 en défilement continu
const int ANIM_DELAY_MIN = 25; // En-dessous, paraît illisible
const int ANIM_INCREMENTATION_DUREE = 900;


LEDMatrixDriver lmd(LEDMATRIX_SEGMENTS, LEDMATRIX_CS_PIN);

int score = 0;


void setup() {
  
  Serial1.begin(115200);
  Serial1.setTimeout(300);
  
  // init the display
  lmd.setEnabled(true);
  lmd.setIntensity(1);   // 0 = low, 10 = high
  
  lmd.clear();
  
  delay(1000);
  
  afficherWRD();  
}




void loop() {
  char c;
  
  if(Serial1.available() > 0) {
    c = Serial1.read();
    switch(c) {
      case '@': // On efface
        lmd.clear();
        lmd.display();
        break;
      case '=': // Affichage du score précis
        lmd.clear();
        score_definir(Serial1.parseInt());
        break;
      case '+': // Affichage du score par incrément
        score_incrementer(Serial1.parseInt());
        break;
      case '-': // Affichage du score par incrément
        score_incrementer(- Serial1.parseInt());
        break;
      case ':': // Affichage d'un texte. 2 textes différents doivent être séparés de 300 ms (voir SetTimeout)
        lmd.clear();
        defilerTexte((Serial1.readString()).c_str());
        break;
      case ';':
        afficherWRD();
        break;
      case '$':
        lmd.clear();
        afficherNombre(score, LEDMATRIX_WIDTH, 0);
        break;
      case '!':
        afficherObstacle();
        break;
      //default:
        /*for(byte i = 0; i < 5; i++) {
          lmd.setPixel(0, 0, true);
          lmd.display();
          delay(300);
          lmd.setPixel(0, 0, false);
          lmd.display();
          delay(300);
        }*/
        /*Serial1.print("#"); Ce caractère ne doit pas être interprétable par un case ci-dessus
        Serial1.println(c);*/
        
    }
  }
}

void demo() {
  score_incrementer(30);
  delay(2000);
  score_incrementer(-20);
  delay(2000);
  score_incrementer(40);
  delay(2000);
  score_incrementer(25);
}

void score_definir(int nombre) {
  score = nombre;
  afficherNombre(score, LEDMATRIX_WIDTH, 0);
}

void score_incrementer(int nombre) {
  if(nombre == 0) return;
  
  int score_affiche = score;
  bool positif = (nombre > 0);
  int delai;
  int pas;
  
  score += nombre;
  if(score < 0) score = 0;
  
  afficherIncrement(nombre, 0, 1);
  delay(500);
  
  if(!positif) {
    nombre = -nombre;
  }
  
  pas = 1;
  delai = ANIM_INCREMENTATION_DUREE / nombre;
  if(delai < ANIM_DELAY_MIN) {
    // L'affichage sera trop brusque, on va plutôt augmenter le pas
    delai = ANIM_DELAY_MIN;
    pas = nombre / (ANIM_INCREMENTATION_DUREE / ANIM_DELAY_MIN);
  }

  
  if(positif) {
    for(score_affiche; score_affiche <= score; score_affiche += pas) {
      afficherNombre(score_affiche, LEDMATRIX_WIDTH, 0);
      delay(delai);
    }
  }
  else {
    for(score_affiche; score_affiche >= score; score_affiche -= pas) {
      afficherNombre(score_affiche, LEDMATRIX_WIDTH, 0);
      delay(delai);
    }
  }
  
  
  lmd.clear();
  // On s'assure que le score affiché correspond au score attendu (risque de différence due aux arrondis)
  //if(score_affiche != score) {
    afficherNombre(score, LEDMATRIX_WIDTH, 0);
  //}
  
}

void afficherObstacle() {
  afficherRectangle(3, 3, 1, 4, true);
  delay(800);
  afficherRectangle(3, 3, 1, 4, false);
}

void afficherWRD() {
  int x = 0;

  lmd.clear();
  for(int i = 0; i < WRD_LEN; i++) {
    drawSprite(WRD[i], x, 1, WRD_LARGEUR[i], WRD_HAUTEUR);
    x += WRD_LARGEUR[i];
    x++; // Ajout d'une colonne de séparation entre chaque lettre.
  }
  lmd.display();
  
}


// Alignement à gauche
void afficherIncrement(int nombre, byte x, byte y) {
  //if(score > 1000) return;
  if(nombre == 0) return;
  
  // Affichage du +/-
  drawSprite(SYMBOLES_PETIT_FOND[ (nombre > 0 ? 0 : 1) ], x, y, SYMBOLES_PETIT_FOND_LARGEUR, SYMBOLES_PETIT_FOND_HAUTEUR);
  x += SYMBOLES_PETIT_FOND_LARGEUR;
  
  // Passage en absolu
  if(nombre < 0)
    nombre = -nombre;
  
  // On détermine le nombre de chiffres pour savoir où commencer
  byte nbChiffres = 0;
  int nombre2 = nombre;
  do {
    nbChiffres++;
    nombre2 /= 10;
  } while(nombre2 > 0);
  x += (nbChiffres - 1) * CHIFFRES_PETIT_FOND_LARGEUR;
  
  // Et on affiche l'incrément
  byte chiffre;
  do {
    chiffre = nombre % 10;
    
    drawSprite(CHIFFRES_PETIT_FOND[chiffre], x, y, CHIFFRES_PETIT_FOND_LARGEUR, CHIFFRES_PETIT_FOND_HAUTEUR);
    
    x -= CHIFFRES_PETIT_FOND_LARGEUR;
    nombre /= 10;
    
  } while(nombre > 0);
  
  lmd.display();
}

void afficherRectangle(int largeur, int hauteur, int posX, int posY, bool allumer) {
  for(int x = 0; x < largeur; x++) {
    for(int y = 0; y < hauteur; y++) {
      lmd.setPixel(posX + x, posY + y, allumer);
    }
  }
  lmd.display();
}


// xFin => Alignement à droite
void afficherNombre(int nombre, byte xFin, byte y) {
  
  byte chiffre;
  byte x = xFin;
  
  do {
    chiffre = nombre % 10;
    x -= CHIFFRES6_LARGEUR;
    
    drawSprite(CHIFFRES6[chiffre], x, y, CHIFFRES6_LARGEUR, CHIFFRES6_HAUTEUR);
    
    nombre /= 10;
    
  } while(nombre > 0);
  
  lmd.display();
  
}

// Fortement inspiré de https://github.com/bartoszbielawski/LEDMatrixDriver/blob/master/examples/MarqueeText/MarqueeText.ino
// ATTENTION, affiche le texte 1 fois en entier, ne peut être interrompu
void defilerTexte(const char *text) {
  int len = strlen(text);
  int x = LEDMATRIX_WIDTH;
  int delai;
  
  /*if(len > 10)
    delai = 12;
  else*/
    delai = 25;

  while(x >= len * -8) {
    drawString(text, len, x, 0);
    lmd.display();
    
    delay(delai);
    x--;
  }
}

// Dessine l'élément demandé
// Fortement inspiré de https://github.com/bartoszbielawski/LEDMatrixDriver/blob/master/examples/DrawSprites/DrawSprites.ino
void drawSprite(const byte* sprite, int x, int y, int width, int height) {
  
  int mask;
  
  for(int iy = 0; iy < height; iy++) {
    mask = 1 << (width - 1);
    
    for(int ix = 0; ix < width; ix++) {
      lmd.setPixel(x + ix, y + iy, (bool)(sprite[iy] & mask));
      mask = mask >> 1;
    }
    
  }
}
void drawSprite64(uint64_t sprite, int x, int y, int width, int height) {
  
  byte row;
  for(int iy = 0; iy < height; iy++) {
    row = (sprite >> iy * width) & 0xFF;
    
    for(int ix = 0; ix < width; ix++) {
      lmd.setPixel(x + ix, y + iy, bitRead(row, ix));
    }
    
  }
}

// Ecris un texte à l'endroit demandé
// Fortement inspiré de https://github.com/bartoszbielawski/LEDMatrixDriver/blob/master/examples/MarqueeText/MarqueeText.ino
void drawString(const char* text, int len, int x, int y ) {
  
  for( int idx = 0; idx < len; idx ++ ) {
    int c = text[idx] - 32;

    // stop if char is outside visible area
    if( x + idx * 8  > LEDMATRIX_WIDTH )
      return;

    // only draw if char is visible
    if( 8 + x + idx * 8 > 0 )
      drawSprite64( ASCII[c], x + idx * 8, y, 8, 8 );
  }
}