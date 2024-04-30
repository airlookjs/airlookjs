ARG NODE_VERSION=20
ARG PORT=80
ARG ROUTE_PREFIX

FROM node:${NODE_VERSION}-alpine as base
RUN apk add --no-cache mediainfo bash

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

ENV PORT=$PORT
ENV ROUTE_PREFIX=$ROUTE_PREFIX

EXPOSE $PORT
CMD [ "pnpm", "start" ]
