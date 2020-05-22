# Execution
* Edit the tests/FASTAPI.postman_environment.json and amend the base URL as appropriate
* Run the following if you want an html report to be created under tests/tests/newman/
`docker run --mount type=bind,source="$(pwd)"/tests,target=/etc/newman --entrypoint /bin/sh postman/newman:ubuntu -c "npm i -g newman-reporter-html; newman run backend_collection.json -e FASTAPI.postman_environment.json -r html"``
* Run the following if you want an exit code:
`docker run --mount type=bind,source="$(pwd)"/tests,target=/etc/newman postman/newman:ubuntu run backend_collection.json -e FASTAPI.postman_environment.json`
