FROM node:24-alpine3.22 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app
RUN corepack install

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
# TODO: bind local.db on docker-compose instead
COPY --from=build /app/local.db /app/local.db
EXPOSE 8000
CMD [ "pnpm", "start" ]