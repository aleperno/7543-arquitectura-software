artillery-build:
	docker build -t artillery ./perf

artillery-run-example: artillery-build
	docker run -it --rm --network=host -v ./perf/scenarios/:/scenarios/ artillery npx artillery run /scenarios/example.yml
