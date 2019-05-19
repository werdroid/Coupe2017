#include "asserv2017.h"
#include "match.h"

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

    // Si le minuteur a démarré, alors on va vérifier que le match
    // n'est pas terminé avant de lancer un delay(), si c'est le cas
    // alors on lancera la procédure d'arrêt.
    if (robot.match_debut) {
      minuteur_arreter_tout_si_fin_match();
    }

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
    com_printfln("Fin minuteur, procedure d'arret");

    // Le match est terminé, on désactive donc le minuteur
    // pour éviter qu'on arrête une seconde fois le match
    robot.match_debut = 0;

    if (robot.IS_PR) {
      match_pr_arret();
    } else {
      match_gr_arret();
    }

    // Après la procédure d'arrêt, on coupe le programme en le
    // faisant boucler indéfiniement.
    com_printfln("#FinProgramme");
    while(1) delay(DT_MS);
  }
}

/**
 * Démarre le minuteur de 90s du match. On sauve la date actuelle en ms.
 * Retour non bloquant.
 */

void minuteur_demarrer() {
  robot.match_started = true;
  robot.match_debut = millis();
  com_printfln("#DebutDuMatch\n");
}

/**
 * Donne le temps restant avant la fin du match de 90s.
 * On fait la différence entre maintenant et la date de lancement moins le temps de jeu.
 * Retour non bloquant.
 */

int32_t minuteur_temps_restant() {
  if(!robot.match_started) return TEMPS_JEU_MS;
  
  return TEMPS_JEU_MS - (millis() - robot.match_debut);
}

/**
 * Attend jusqu'à la fin du match.
 * Retour bloquant.
 */

void minuteur_attendre_fin_match() {
  com_printfln("Attente fin du match (reste %d ms)", minuteur_temps_restant());

  minuteur_attendre(minuteur_temps_restant());
}

void minuteur_entrer_dans_une_boucle_infinie_et_ne_plus_jamais_en_sortir() {
  //while(1);
  // TODO :: Remettre while(1) quand cette fonction sera correctement remplacée par son équivalent dans le simulateur
  com_printfln("Je suis dans une boucle infinie et je n'en sortirai plus jamais.");
}

