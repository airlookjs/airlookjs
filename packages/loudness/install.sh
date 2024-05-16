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

#if [ "$(uname)" = "" ]; then
# TODO install system dependencies on linux, or use docker for tests, see dockerfile for dependencies
#fi

if [ "$(uname)" = "Darwin" ]; then
  # install system dependencies on mac os with brew
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
fi

mkdir build
cd build
cmake .. -DDISABLE_RSVG2=yes -DDISABLE_GTK2=yes -DDISABLE_QT5=yes -DENABLE_INTERNAL_QUEUE_H=ON
make 

# copy contents of build to bin
cp -r ./ ../../../bin
