#!/bin/sh
git clone https://github.com/airlookjs/loudness-scanner
cd loudness-scanner
#git submodule init
#git submodule update

if [ "$(uname)" == "Darwin" ]; then
  # only on mac os
  brew install ffmpeg@4
  brew install glib  
  brew install gstreamer  
  brew install taglib   
  brew install mpg123  
  brew install librsvg  
  brew install qt@5  
  brew install libsndfile  
  brew install gtk 

  export Qt5_DIR="/opt/homebrew/opt/qt@5/lib/cmake/Qt5"
  export PATH="/opt/homebrew/opt/ffmpeg@4/bin:$PATH"
  export PKG_CONFIG_PATH="/opt/homebrew/opt/ffmpeg@4/lib/pkgconfig:/opt/homebrew/opt/librsvg/lib/pkgconfig"
  export CXX=g++
  export CC=gcc
  #export LDFLAGS="pkg-config --libs librsvg-2.0 -L/opt/homebrew/opt/ffmpeg@4/lib"
  #export CPPFLAGS="-I/opt/homebrew/opt/ffmpeg@4/include"
fi


mkdir build
cd build
cmake ..
make