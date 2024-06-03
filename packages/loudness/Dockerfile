# syntax=docker/dockerfile:1.4
ARG NODE_VERSION=20
ARG ALPINE_VERSION=3.18
ARG PORT=80

FROM node:22-bookworm AS runtime-deps
RUN apt-get update && apt-get install -y \
    libavformat59 \
    libavcodec59 \
    libavutil57 \
    libebur128-1 \
    libsndfile1

FROM node:22-bookworm AS make

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    libavformat-dev \
    libavcodec-dev \
    libavutil-dev \
    libebur128-dev \
    libsndfile1-dev

WORKDIR /app
COPY packages/loudness/install.sh .
RUN ./install.sh

FROM node:${NODE_VERSION}-alpine AS workspace
#ENV PNPM_HOME="/pnpm"
#ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable
COPY ./pnpm-workspace.yaml ./
COPY ./.npmrc ./
COPY ./pnpm-lock.yaml ./

COPY dist/packages/node-healthcheck ./dist/packages/node-healthcheck
COPY dist/packages/shared ./dist/packages/shared

RUN pnpm fetch --prod --frozen-lockfile
COPY . ./
RUN pnpm recursive install --offline --frozen-lockfile
#COPY . /app
#RUN pnpm --filter loudness --prefer-offline --prod deploy pruned --frozen-lockfile
#WORKDIR /app/loudness

#RUN pnpm fetch --prod
#RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod
#RUN pnpm --filter "./loudness" install --frozen-lockfile

FROM workspace AS pruned
#ARG service='loudness'
WORKDIR /app
RUN pnpm --filter loudness --prefer-offline --prod deploy pruned --frozen-lockfile
#RUN pnpm deploy --prod pruned

FROM runtime-deps
WORKDIR /app/loudness
ENV NODE_ENV=production
ENV PORT=$PORT

#COPY --from=pruned /app/pruned/dist dist
#COPY dist/loudness/ .
#copy built binary
COPY /dist/packages/loudness .
COPY --from=make /app/bin bin
#COPY --from=pruned /app/pruned/package.json package.json
COPY --from=pruned /app/pruned/node_modules node_modules


EXPOSE $PORT
#CMD [ "cat" ]
CMD [ "node", "./src/index.js" ]

#ENTRYPOINT ["node", "./src/index.js"]
#ENTRYPOINT [ "node" ]
#ENTRYPOINT [ "bash" ]
#/root/.local/share/pnpm/store/v3