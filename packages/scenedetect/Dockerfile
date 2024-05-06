ARG NX_WORKSPACE_IMAGE=airlook-aigs-app/workspace:latest
ARG NODE_VERSION=20.10.0

FROM ${NX_WORKSPACE_IMAGE} as pnpm

FROM pnpm as pruned
WORKDIR /app/services/scenedetect
RUN pnpm nx build scenedetect
RUN pnpm --filter scenedetect --prefer-offline --prod deploy pruned --frozen-lockfile --unsafe-perm

FROM node:${NODE_VERSION}-bullseye as build

# RUN sed -i "s/main/main contrib non-free/g" /etc/apt/sources.list
RUN apt-get update

RUN apt-get install -y libavformat-dev
RUN apt-get install -y libavcodec-dev
RUN apt-get install -y libavutil-dev

RUN apt-get install -y ffmpeg
RUN apt-get install -y python3 python3-pip
RUN pip3 install scenedetect[opencv-headless]

WORKDIR /app
COPY --from=pruned /app/services/scenedetect/pruned .
COPY --from=pruned /app/services/scenedetect/build ./build

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ENV PORT 80
EXPOSE 80

# must be run with yarn, as pnpm is not included in the pruned image
CMD [ "yarn", "run", "start" ]