


// Chiffres de largeur 8 
// Source : https://xantorohara.github.io/led-matrix-editor/ [Set N°1 - Digits]
// (Décalé 1 cran vers le haut)
const byte CHIFFRES8_LARGEUR = 8;
const byte CHIFFRES8_HAUTEUR = 8;
const byte CHIFFRES8[][CHIFFRES8_HAUTEUR] = {
{
  B00111100,
  B01100110,
  B01101110,
  B01110110,
  B01100110,
  B01100110,
  B00111100,
  B00000000
},{
  B00011000,
  B00011000,
  B00111000,
  B00011000,
  B00011000,
  B00011000,
  B01111110,
  B00000000
},{
  B00111100,
  B01100110,
  B00000110,
  B00001100,
  B00110000,
  B01100000,
  B01111110,
  B00000000
},{
  B00111100,
  B01100110,
  B00000110,
  B00011100,
  B00000110,
  B01100110,
  B00111100,
  B00000000
},{
  B00001100,
  B00011100,
  B00101100,
  B01001100,
  B01111110,
  B00001100,
  B00001100,
  B00000000
},{
  B01111110,
  B01100000,
  B01111100,
  B00000110,
  B00000110,
  B01100110,
  B00111100,
  B00000000
},{
  B00111100,
  B01100110,
  B01100000,
  B01111100,
  B01100110,
  B01100110,
  B00111100,
  B00000000
},{
  B01111110,
  B01100110,
  B00001100,
  B00001100,
  B00011000,
  B00011000,
  B00011000,
  B00000000
},{
  B00111100,
  B01100110,
  B01100110,
  B00111100,
  B01100110,
  B01100110,
  B00111100,
  B00000000
},{
  B00111100,
  B01100110,
  B01100110,
  B00111110,
  B00000110,
  B01100110,
  B00111100,
  B00000000
}};
const int CHIFFRES8_LEN = sizeof(CHIFFRES8)/CHIFFRES8_HAUTEUR;

// Chiffres de largeur 6
// Source : https://xantorohara.github.io/led-matrix-editor/ [Set N°3 - Digits]
// 2 dernières colonnes retirées
const byte CHIFFRES6_LARGEUR = 6;
const byte CHIFFRES6_HAUTEUR = 8;
const byte CHIFFRES6[][CHIFFRES6_HAUTEUR] = {
{
  B001110,
  B010001,
  B010001,
  B010001,
  B010001,
  B010001,
  B010001,
  B001110
},{
  B000100,
  B001100,
  B000100,
  B000100,
  B000100,
  B000100,
  B000100,
  B001110
},{
  B001110,
  B010001,
  B000001,
  B000001,
  B000010,
  B000100,
  B001000,
  B011111
},{
  B001110,
  B010001,
  B000001,
  B000110,
  B000001,
  B000001,
  B010001,
  B001110
},{
  B000001,
  B000011,
  B000101,
  B001001,
  B010001,
  B011111,
  B000001,
  B000001
},{
  B011111,
  B010000,
  B010000,
  B011110,
  B000001,
  B000001,
  B010001,
  B001110
},{
  B001110,
  B010001,
  B010000,
  B011110,
  B010001,
  B010001,
  B010001,
  B001110
},{
  B011111,
  B000001,
  B000001,
  B000010,
  B000100,
  B001000,
  B001000,
  B001000
},{
  B001110,
  B010001,
  B010001,
  B001110,
  B010001,
  B010001,
  B010001,
  B001110
},{
  B001110,
  B010001,
  B010001,
  B010001,
  B001111,
  B000001,
  B010001,
  B001110
}};
const int CHIFFRES6_LEN = sizeof(CHIFFRES6)/CHIFFRES6_HAUTEUR;


// Chiffres style affichage 7 segments sur fond allumé
// Largeur = 4, Hauteur = 7
const byte CHIFFRES_PETIT_FOND_LARGEUR = 4;
const byte CHIFFRES_PETIT_FOND_HAUTEUR = 7;
const byte CHIFFRES_PETIT_FOND[][CHIFFRES_PETIT_FOND_HAUTEUR] = {
{
  B1111,
  B0001,
  B0101,
  B0101,
  B0101,
  B0001,
  B1111
},{
  B1111,
  B1101,
  B1101,
  B1101,
  B1101,
  B1101,
  B1111
},{
  B1111,
  B0001,
  B1101,
  B0001,
  B0111,
  B0001,
  B1111
},{
  B1111,
  B0001,
  B1101,
  B1001,
  B1101,
  B0001,
  B1111
},{
  B1111,
  B0101,
  B0101,
  B0001,
  B1101,
  B1101,
  B1111
},{
  B1111,
  B0001,
  B0111,
  B0001,
  B1101,
  B0001,
  B1111
},{
  B1111,
  B0001,
  B0111,
  B0001,
  B0101,
  B0001,
  B1111
},{
  B1111,
  B0001,
  B1101,
  B1101,
  B1101,
  B1101,
  B1111
},{
  B1111,
  B0001,
  B0101,
  B0001,
  B0101,
  B0001,
  B1111
},{
  B1111,
  B0001,
  B0101,
  B0001,
  B1101,
  B0001,
  B1111
}};
const int CHIFFRES_PETIT_FOND_LEN = sizeof(CHIFFRES_PETIT_FOND)/CHIFFRES_PETIT_FOND_HAUTEUR;

// Chiffres style affichage 7 segments sur fond allumé
// Largeur = 4
const byte SYMBOLES_PETIT_FOND_LARGEUR = 5;
const byte SYMBOLES_PETIT_FOND_HAUTEUR = 7;
const byte SYMBOLES_PETIT_FOND[][SYMBOLES_PETIT_FOND_HAUTEUR] = {
{ // 0: +
  B11111,
  B11111,
  B11011,
  B10001,
  B11011,
  B11111,
  B11111
},{ // 1: -
  B11111,
  B11111,
  B11111,
  B10001,
  B11111,
  B11111,
  B11111
}};
const int SYMBOLES_PETIT_FOND_LEN = sizeof(SYMBOLES_PETIT_FOND)/SYMBOLES_PETIT_FOND_HAUTEUR;

// WeR'Droid
const byte WRD_LARGEUR[] = {5, 3, 3, 1, 3, 2, 3, 1, 3};
const byte WRD_HAUTEUR = 6;
const byte WRD[][WRD_HAUTEUR] = {
{ // W
  B10001,
  B10001,
  B10001,
  B10101,
  B10101,
  B01010
},{ // e
  B000,
  B010,
  B101,
  B111,
  B100,
  B011
},{ // R
  B110,
  B101,
  B101,
  B110,
  B101,
  B101
},{ // '
  B1,
  B1,
  B0,
  B0,
  B0,
  B0
},{ // D
  B110,
  B101,
  B101,
  B101,
  B101,
  B110
},{ // r
  B00,
  B00,
  B01,
  B10,
  B10,
  B10
},{ // o
  B000,
  B000,
  B010,
  B101,
  B101,
  B010
},{ // i
  B0,
  B1,
  B0,
  B1,
  B1,
  B1
},{ // d
  B001,
  B001,
  B011,
  B101,
  B101,
  B011
}};
const int WRD_LEN = sizeof(WRD)/WRD_HAUTEUR;


// Un petit bonhomme qui marche
// Source : https://github.com/bartoszbielawski/LEDMatrixDriver/blob/master/examples/DrawSprites/DrawSprites.ino
const byte BONHOMME_MARCHE_LARGEUR = 8;
const byte BONHOMME_MARCHE_HAUTEUR = 8;
const byte BONHOMME_MARCHE[][BONHOMME_MARCHE_HAUTEUR] = {
{ B00011000,
  B00100100,
  B00100100,
  B00011000,
  B01111110,
  B00011000,
  B00100100,
  B01000010},
  
{ B00011000,
  B00100100,
  B00100100,
  B00011010,
  B01111100,
  B00011000,
  B01100100,
  B00000010},
  
{ B00011000,
  B00100100,
  B00100100,
  B00011010,
  B00111100,
  B01011000,
  B00110100,
  B00000100},

{ B00011000,
  B00100100,
  B00100100,
  B00011010,
  B00111100,
  B01011000,
  B00011000,
  B00011000},

{ B00011000,
  B00100100,
  B00100100,
  B00011010,
  B00111100,
  B01011000,
  B00010100,
  B00010000},
  
{ B00011000,
  B00100100,
  B00100100,
  B00011000,
  B00111110,
  B01011000,
  B00010100,
  B00010100}
};
const int BONHOMME_MARCHE_LEN = sizeof(BONHOMME_MARCHE)/BONHOMME_MARCHE_HAUTEUR;

// Lettres largeur 8
// Source : https://xantorohara.github.io/led-matrix-editor/ [Set N°2 - Letters & signs fusionnés dans un seul tableau]
const byte ASCII_LARGEUR = 8;
const byte ASCII_HAUTEUR = 8;
const uint64_t ASCII[] = {
  0x0000000000000000, // Espace
  0x00180018183c3c18, // !
  0x0000000000363636, // "
  0x0036367f367f3636, // #
  0x000c1f301e033e0c, // $
  0x0063660c18336300, // %
  0x006e333b6e1c361c, // &
  0x0000000000030606, // '
  0x00180c0606060c18, // (
  0x00060c1818180c06, // )
  0x0000663cff3c6600, // *
  0x00000c0c3f0c0c00, // +
  0x060c0c0000000000, // ,
  0x000000003f000000, // -
  0x000c0c0000000000, // .
  0x000103060c183060, // /
  0x003e676f7b73633e, // 0
  0x003f0c0c0c0c0e0c, // 1
  0x003f33061c30331e, // 2
  0x001e33301c30331e, // 3
  0x0078307f33363c38, // 4
  0x001e3330301f033f, // 5
  0x001e33331f03061c, // 6
  0x000c0c0c1830333f, // 7
  0x001e33331e33331e, // 8
  0x000e18303e33331e, // 9
  0x000c0c00000c0c00, // :
  0x060c0c00000c0c00, // ;
  0x00180c0603060c18, // <
  0x00003f00003f0000, // =
  0x00060c1830180c06, // >
  0x000c000c1830331e, // ?
  0x001e037b7b7b633e, // @
  0x0033333f33331e0c, // A
  0x003f66663e66663f, // B
  0x003c66030303663c,
  0x001f36666666361f,
  0x007f46161e16467f, // E
  0x000f06161e16467f,
  0x007c66730303663c,
  0x003333333f333333,
  0x001e0c0c0c0c0c1e,
  0x001e333330303078, // J
  0x006766361e366667,
  0x007f66460606060f,
  0x0063636b7f7f7763,
  0x006363737b6f6763,
  0x001c36636363361c, // O
  0x000f06063e66663f,
  0x00381e3b3333331e,
  0x006766363e66663f,
  0x001e33380e07331e,
  0x001e0c0c0c0c2d3f, // T
  0x003f333333333333,
  0x000c1e3333333333,
  0x0063777f6b636363,
  0x0063361c1c366363, // X
  0x001e0c0c1e333333, // Y
  0x007f664c1831637f, // Z
  0x001e06060606061e, // [
  0x00406030180c0603, // (Antislash)
  0x001e18181818181e, // ]
  0x0000000063361c08, // ^
  0x003f000000000000, // _
  0x0000000000180c0c, // `
  0x006e333e301e0000, // a
  0x003b66663e060607, // b
  0x001e3303331e0000,
  0x006e33333e303038,
  0x001e033f331e0000, // e
  0x000f06060f06361c,
  0x1f303e33336e0000,
  0x006766666e360607,
  0x001e0c0c0c0e000c,
  0x1e33333030300030, // j
  0x0067361e36660607,
  0x001e0c0c0c0c0c0e,
  0x00636b7f7f330000,
  0x00333333331f0000,
  0x001e3333331e0000, // o
  0x0f063e66663b0000,
  0x78303e33336e0000,
  0x000f06666e3b0000,
  0x001f301e033e0000,
  0x00182c0c0c3e0c08, // t
  0x006e333333330000,
  0x000c1e3333330000,
  0x00367f7f6b630000,
  0x0063361c36630000, // x
  0x1f303e3333330000, // y
  0x003f260c193f0000, // z
  0x00380c0c070c0c38, // {
  0x0008080808080800, // |
  0x00070c0c380c0c07, // }
  0x0000000000003b6e // ~
};
const int ASCII_LEN = sizeof(ASCII)/ASCII_HAUTEUR;