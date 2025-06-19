#!/bin/bash

if [[ $(docker images -q pong) == "" ]]; then
	docker build -t pong -f Dockerfile.dev .
fi

docker run --rm -p 8000:8000 -v .:/app -it pong
