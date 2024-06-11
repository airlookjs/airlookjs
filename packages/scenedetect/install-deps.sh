#YUM=$(which yum)
APT=$(which apt-get)
APK=$(which apk)

if [ ! -z $APT ]; then
  sudo apt-get install -y libavformat-dev ffmpeg python3 mkvtoolnix pipx 
elif [ ! -z $APK ]; then
  sudo apk add --no-cache libavformat-dev ffmpeg python3 mkvtoolnix pipx
elif [ "$(uname)" = "Darwin" ]; then
  # install system dependencies on mac os with brew
  brew install libavformat-dev
  brew install ffmpeg
  brew install python3
  brew install mkvtoolnix
  brew install pipx
else
  echo "Could not detect package installer."
  exit 1;
fi

pipx ensurepath
pipx install opencv-python --include-deps
pipx install scenedetect --include-deps
pipx inject scenedetect opencv-python
