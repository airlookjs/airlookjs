
#YUM=$(which yum)
APT=$(which apt-get)
APK=$(which apk)

if [ ! -z $APT ]; then
  sudo apt-get install -y git cmake libavformat-dev libavcodec-dev libavutil-dev libebur128-dev libsndfile1-dev 
elif [ ! -z $APK ]; then
  sudo apk add --no-cache git cmake make g++ ffmpeg-libavformat ffmpeg-libavcodec ffmpeg-libavutil libebur128-dev libsndfile
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
