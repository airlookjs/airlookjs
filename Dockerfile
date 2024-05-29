ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-bullseye as pnpm

RUN corepack enable

WORKDIR /app

COPY ./pnpm-workspace.yaml ./
COPY ./.npmrc ./
COPY ./pnpm-lock.yaml ./
RUN pnpm fetch --frozen-lockfile --unsafe-perm
COPY . ./
RUN pnpm recursive install --offline --frozen-lockfile --unsafe-perm