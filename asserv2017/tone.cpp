#include "asserv2017.h"

#define TONE_PIN 26
#define LONGUEUR_NOTE 100 // ms

const uint16_t start_music[] = {220, 440, 660, 880, 0};
const uint16_t alert_music[] = {110, 55, 0};
const uint16_t end_music[] = {880, 660, 440, 220, 0};

Metro tempo = Metro(LONGUEUR_NOTE);
const uint16_t *position;

void tone_setup() {
  noTone(TONE_PIN);
  tempo.reset();
}

void tone_loop() {
  if (tempo.check() && position) {
    if (*position) {
      tone(TONE_PIN, *position);
      position++;
    } else {
      noTone(TONE_PIN);
      position = 0;
    }
  }
}

void tone_play_start() {
  position = start_music;
}

void tone_play_alert() {
  position = alert_music;
}

void tone_play_end() {
  position = end_music;
}
