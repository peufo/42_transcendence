FROM oven/bun:latest
RUN apt-get update
RUN apt-get install -y bash
RUN apt-get install -y openssl
RUN apt-get install -y nodejs
RUN apt-get install -y npm
# RUN apk add --no-cache bash
# RUN apk add --no-cache openssl
# RUN apk add --no-cache nodejs
# RUN apk add --no-cache npm
RUN openssl req -x509 -newkey rsa:2048 -nodes -keyout /ssl.key -out /ssl.cert -sha256 -days 365 -subj "/C=CH/ST=Vaud/L=Lausanne/O=42/OU=Transcendance/CN=localhost"
COPY . /app
WORKDIR /app
RUN bun install
RUN bun run build
EXPOSE 8000
CMD [ "bun", "start" ]