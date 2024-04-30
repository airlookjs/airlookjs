FROM node:20-alpine as compile-stage
#RUN apt update
# CMAKE is required
#RUN apt install -y cmake

# Libtag is required if we want to use the tag input
# RUN apt install -y libtag1-dev
# RUN apt install -y libtagc0-dev

# FFMPEG input
RUN apk add --no-cache git cmake make g++ ffmpeg-libavformat ffmpeg-libavcodec ffmpeg-libavutil libebur128-dev libsndfile

# DISABLED INPUTS
# MPG123 input
# RUN apt install -y libmpg123-dev
# LIBMPCDEC input
# RUN apt install -y libmpcdec-dev

# LIBSNDFILE input

# DISABLED GUIS
# QT gui
# RUN apt install -y qt5-default
# GTK2 gui
# RUN apt install -y gtk2.0
RUN corepack enable
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# Copy package.json and pnpm-lock.yaml
COPY pnpm-lock.yaml package.json ./
# Install dependencies
RUN pnpm i 

COPY . /usr/src/app
RUN /usr/src/app/install.sh

EXPOSE 1280

CMD [ "pnpm", "start" ]
