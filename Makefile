all:
	@echo "Compilation du simulateur du monitor"
	@emcc asserv2017/simulateur.cpp asserv2017/match.cpp asserv2017/match_deplacements.cpp asserv2017/match_pr.cpp asserv2017/match_gr.cpp asserv2017/match_servos.cpp asserv2017/minuteur.cpp asserv2017/utils.cpp asserv2017/ledMatrix.cpp -s EMTERPRETIFY=1 -s EMTERPRETIFY_ASYNC=1 -s ASSERTIONS=1 -s EXPORTED_FUNCTIONS="['_gr_init', '_match_gr', '_match_pr', '_pr_init']" -std=c++11 -o monitor/script/simulateur.js
	@cp monitor/script/simulateur.js monitorv2/script/simulateur.js
