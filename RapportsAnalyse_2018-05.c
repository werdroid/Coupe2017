/**
Analyse du bug au démarrage
**/

/** Programme de test 
Vidéo associée : https://www.dropbox.com/sh/n7onqh2otfins52/AAA0bYWwhNy5mLe11BmCiBhla?dl=0
20180520_133810.mp4
**/
void debug_pr() {
  ecran_console_log("2 sec\n\n");

  robot.logAsserv = true;
  com_printfln("--- Appel a asserv_set_position ---");
  asserv_set_position(1500, 1000, MATH_PI2);
  com_printfln("--- Appel a maintenir_position ---");
  asserv_maintenir_position();
  com_printfln("--- Attente de 1000 ---");
  minuteur_attendre(1000);

  com_printfln("--- Demarrage minuteur ---");
  minuteur_demarrer();
  
  com_printfln("--- go tout droit 1 ---");
  asserv_go_toutdroit(100, 2000);
  com_printfln("--- Attente de 1000 ---");
  minuteur_attendre(1000);
  com_printfln("--- go tout droit 2 ---");
  asserv_go_toutdroit(100, 2000);
  com_printfln("--- Fin ---");
  robot.logAsserv = false;
  //asserv_go_xy(1500, 800, 200, 1);
  
  /*asserv_distance(-5000, 5000);
  tone_play_end();
  asserv_distance(2000, 2000);
  tone_play_end();
  asserv_distance(-5000, 5000);
*/

  tone_play_end();
}


/** 
Ce tableau liste :
idTrame, aDeg, tMatch

tMatch = -1 tant que le Match n'a pas démarré (avec minuteur_demarrer)
sinon tMatch = temps écoulé depuis minuteur_demarrer() (en secondes)


195	-0	-1
196	-0	-1
197	-0	-1
198	90	-1    <<<< aDeg passe de -0 à 90 => dû à set_position (OU maintenir_position ?)
199	81	-1
200	63	-1
201	44	-1
202	32	-1
203	36	-1
204	38	-1
205	54	-1
206	67	-1
207	70	-1
208	88	0     <<<< minuteur_demarrer()
209	85	0     <<<< Le robot avance tout droit
210	84	0
211	86	0
212	86	0
213	86	1
214	86	1
215	86	1
216	86	1
217	86	1
218	86	1
219	86	1
220	86	1
221	85	1
222	84	2
223	83	2
224	82	2
225	83	2
226	83	2
227	83	2
228	83	2
229	83	2
230	83	3
231	83	3
232	83	3
233	83	3
234	83	3
235	83	3
236	83	3
237	83	3
238	83	3
239	83	3
240	83	4
241	83	4
242	83	4
243	83	4
244	83	4
245	83	4
246	83	4
247	83	4
248	83	4
249	83	4
250	83	5
251	83	5
252	83	5
253	83	5
254	83	5
255	83	5
256	82	5
257	82	5
258	83	5
259	83	5
260	83	6
261	83	6
262	83	6
263	83	6
264	83	6
265	83	6
266	83	6
267	83	6
268	83	6
269	83	6
270	83	7
271	83	7
272	83	7
273	83	7
274	83	7
275	83	7
276	83	7
277	83	7
278	83	7
*/


/*****************************
Nouveau test avec une tempo avant et apres minuteur_attendre
*****************************/

void debug_pr() {
  ecran_console_log("2 sec\n\n");

  robot.logAsserv = true;
  com_printfln("--- Appel a asserv_set_position ---");
  asserv_set_position(1500, 1000, MATH_PI2);
  com_printfln("--- Appel a maintenir_position ---");
  asserv_maintenir_position();
  com_printfln("--- Attente de 500 ---");
  minuteur_attendre(500);   

  com_printfln("--- Demarrage minuteur ---");
  minuteur_demarrer();
  com_printfln("--- Attente de 1000 ---");
  minuteur_attendre(1000); /**** NOUVELLE TEMPO ICI ****/
  
  com_printfln("--- go tout droit 1 ---"); 
  asserv_go_toutdroit(100, 2000);
  com_printfln("--- Attente de 1000 ---");
  minuteur_attendre(1000);
  com_printfln("--- go tout droit 2 ---");
  asserv_go_toutdroit(100, 2000);
  com_printfln("--- Fin ---");
  robot.logAsserv = false;
  //asserv_go_xy(1500, 800, 200, 1);
  
  /*asserv_distance(-5000, 5000);
  tone_play_end();
  asserv_distance(2000, 2000);
  tone_play_end();
  asserv_distance(-5000, 5000);
*/

  tone_play_end();
}


/**

151	6	-1
152	6	-1
153	6	-1
154	6	-1
155	6	-1
156	89	-1    <<<< set_position ou maintenir_position
157	78	-1
158	59	-1
159	39	-1
160	41	-1
161	42	0     <<<< minuteur_demarrer
162	51	0
163	67	0
164	71	0
165	77	0     <<<< il est dans son axe
166	85	0
167	86	0
168	86	0
169	86	0
170	86	0
171	86	1
172	85	1
173	83	1
174	84	1
175	84	1
176	84	1
177	84	2
178	84	2
**/


/* Ce que je n'explique pas :
En match (match_gr, match_pr), le robot fait son petit gauche-droite APRES avoir enlevé le jack.


Par exemple en match 2 :
https://www.dropbox.com/sh/n7onqh2otfins52/AAA0bYWwhNy5mLe11BmCiBhla?dl=0
GOPR1419Trim.mp4
/!\ Match 2 comportait encore le bug du "je regarde n'importe où avant d'aller qq part"

Programme complet sur 
https://github.com/werdroid/Coupe2017/blob/7d06a12559b38024626b6cfd51aa842f7dbdd497/asserv2017/match_gr.cpp#L409

Mais voilà la partie intéressante :
*/

(...)

  bouton_start_down();

  ecran_console_log("Pret\n\n");
  minuteur_attendre(200);
  asserv_set_position(150, 500, 0);
  asserv_maintenir_position();
  bouton_wait_start_up();
  

  /** ------------
    Début du Match
    ------------- **/

  minuteur_demarrer();
  minuteur_attendre(500);
  score_definir(0);
  
  asserv_go_toutdroit(350, 10000);

(...)
  
/*
Est-ce que bouton_wait_start_up() bloque un mouvement demandé par asserv_maintenir_position ?

Je dois faire des tests supplémentaires pour déterminer le moment précis où le robot fait sa rotation, mais je n'ai plus de batterie...

*/
