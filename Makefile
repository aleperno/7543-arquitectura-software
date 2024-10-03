artillery-build:
	docker build -t artillery ./perf

artillery-run-ping: artillery-build
	docker run -it --rm --network=7543-arquitectura-software -v ./perf/scenarios/:/scenarios/ artillery npx artillery run /scenarios/ping.yml

artillery-run-dict: artillery-build
	docker run -it --rm --network=7543-arquitectura-software -v ./perf/scenarios/:/scenarios/ artillery npx artillery run /scenarios/dictionary.yml

artillery-run-dict-light: artillery-build
	docker run -it --rm --network=7543-arquitectura-software -v ./perf/scenarios/:/scenarios/ artillery npx artillery run /scenarios/dictionary_light.yml

artillery-run-spaceflight: artillery-build
	docker run -it --rm --network=7543-arquitectura-software -v ./perf/scenarios/:/scenarios/ artillery npx artillery run /scenarios/spaceflight.yml