#!/bin/bash

docker volume create db-transcendance
docker build -t transcendance .
docker run --rm -p 8000:8000 -v db-transcendance:/app -it transcendance
