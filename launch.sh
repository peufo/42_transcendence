#!/bin/bash

DOCKER_BUILDKIT=1 docker build -t transcendance .
docker run --rm -p 8000:8000 -v .:/app -it transcendance