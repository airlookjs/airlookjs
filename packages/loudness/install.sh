#!/bin/sh
if result=$(./bin/loudness --version 2>&1); then
    echo "loudness already installed:"
    echo "${result}"
    exit 0
fi

mkdir -p lib
cd lib 

rm -rf loudness-scanner
git clone --recurse-submodules -j8 --depth=1 https://github.com/airlookjs/loudness-scanner
cd loudness-scanner

#YUM=$(which yum)
APT=$(which apt)
APK=$(which apk)

if [[ ! -z $APT ]]; then
  apt install -y git cmake libavformat-dev libavcodec-dev libavutil-dev libebur128-dev libsndfile1-dev 
elif [[ ! -z $APK ]]; then
  apk add --no-cache git cmake make g++ ffmpeg-libavformat ffmpeg-libavcodec ffmpeg-libavutil libebur128-dev libsndfile
elif [ "$(uname)" = "Darwin" ]; then
  # install system dependencies on mac os with brew
  brew install cmake
  brew install ffmpeg@4
  brew install glib  
  brew install gstreamer  
  brew install taglib   
  #brew install mpg123  
  #brew install librsvg  
  #brew install qt@5  
  brew install libsndfile  
  #brew install gtk 
  #export Qt5_DIR="/opt/homebrew/opt/qt@5/lib/cmake/Qt5"
  export PATH="/opt/homebrew/opt/ffmpeg@4/bin:$PATH"
  export PKG_CONFIG_PATH="/opt/homebrew/opt/ffmpeg@4/lib/pkgconfig"
  export CXX=g++
  export CC=gcc
else
  echo "Could not detect package installer."
  exit 1;
fi

mkdir build
cd build
cmake .. -DDISABLE_RSVG2=yes -DDISABLE_GTK2=yes -DDISABLE_QT5=yes -DENABLE_INTERNAL_QUEUE_H=ON
make 

# copy contents of build to bin
cp -r ./ ../../../bin
