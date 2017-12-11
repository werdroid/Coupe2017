#include "asserv2017.h"

/**
 * Comme delay() en ms mais arrête le robot si le match se fini pendant le délai.
 * Retour bloquant.
 */

void minuteur_attendre(uint32_t timeout_ms) {
  uint32_t debut_attente = millis();
  while (1) {
    if (millis() - debut_attente >= timeout_ms) {
      // Fin du minuteur, on retourne au programme
      break;
    }

    minuteur_arreter_tout_si_fin_match();

    delay(DT_MS);
  }
}

/**
 * Lance automatiquement la procédure d'arrêt du bon robot si le
 * minuteur du match est terminé, avec une marge.
 * Les deux procédures sont match_pr_arret() ou match_gr_arret().
 * Retour non bloquant.
 */

void minuteur_arreter_tout_si_fin_match() {
  if (minuteur_temps_restant() < 250) {
    // 250ms restant, inutile de déplacer un servo ou l'asserv,
    // on lance la procédure d'arrêt
    com_printfln("Moins de 250 ms restants !");

    if (robot.IS_PR) {
      match_pr_arret();
    } else {
      match_gr_arret();
    }
  }
}

/**
 * Démarre le minuteur de 90s du match. On sauve la date actuelle en ms.
 * Retour non bloquant.
 */

void minuteur_demarrer() {
  robot.match_debut = millis();
  com_printfln("DebutDuMatch\n");
}

/**
 * Donne le temps restant avant la fin du match de 90s.
 * On fait la différence entre maintenant et la date de lancement moins le temps de jeu.
 * Retour non bloquant.
 */

uint32_t minuteur_temps_restant() {
  return TEMPS_JEU_MS - (millis() - robot.match_debut);
}

/**
 * Attend jusqu'à la fin du match.
 * Retour bloquant.
 */

void minuteur_attendre_fin_match() {
  com_printfln("Attente fin du match.");

  minuteur_attendre(minuteur_temps_restant());
}
