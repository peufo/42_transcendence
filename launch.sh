#!/bin/bash

docker volume create db-transcendence
docker build -t transcendence .
docker run --rm -p 8000:8000 -v db-transcendence:/app -it transcendence
