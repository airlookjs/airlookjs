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

WORKDIR /app/loudness
COPY loudness/install.sh .
RUN ./install.sh

FROM node:${NODE_VERSION}-alpine AS workspace
#ENV PNPM_HOME="/pnpm"
#ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /app
WORKDIR /app/loudness
RUN ls
#RUN pnpm fetch --prod
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod
#RUN pnpm --filter "./loudness" install --frozen-lockfile

FROM workspace AS pruned
#ARG service='loudness'
WORKDIR /app/loudness

# run nx build
RUN pnpm deploy --prod pruned

FROM runtime-deps
WORKDIR /app/loudness
ENV NODE_ENV=production
ENV PORT=$PORT

#COPY --from=pruned /app/pruned/dist dist
#COPY dist/loudness/ .
#copy built binary
COPY --from=make /app/loudness/bin bin
COPY --from=pruned /app/loudness/pruned/package.json package.json
COPY --from=pruned /app/loudness/pruned/node_modules node_modules

EXPOSE $PORT
#CMD [ "cat" ]
#CMD [ "node", "dist/src/index.js" ]

#ENTRYPOINT ["node", "./src/index.js"]
#ENTRYPOINT [ "node" ]
ENTRYPOINT [ "bash" ]
#/root/.local/share/pnpm/store/v3