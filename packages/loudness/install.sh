#!/bin/sh
rm -rf loudness-scanner
git clone --recurse-submodules -j8 --depth=1 https://github.com/airlookjs/loudness-scanner
cd loudness-scanner

if [ "$(uname)" == "Darwin" ]; then
  # only on mac os
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