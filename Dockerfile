FROM node:24-alpine3.22 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .

RUN echo "DEBUG: Listing everything in /app" && find /app | sort

RUN echo "== DEBUG: Listing /app ==" && ls -la /app && \
    echo "== DEBUG: Listing /app/src ==" && ls -la /app/src || echo "src missing" && \
    echo "== DEBUG: Listing /app/config ==" && ls -la /app/config || echo "config missing"

RUN pwd
RUN ls -la
RUN ls -la config
RUN ls -la src/server


RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN mkdir -p build
RUN pnpm run build

RUN ls -laR /app/build

FROM base
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/config/.env ./config/.env

RUN ls -laR /app/build

EXPOSE 8000
CMD [ "pnpm", "start" ]
