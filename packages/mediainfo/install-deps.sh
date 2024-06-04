#YUM=$(which yum)
APT=$(which apt-get)
APK=$(which apk)

if [ ! -z $APT ]; then
  sudo apt-get install -y mediainfo 
elif [ ! -z $APK ]; then
  sudo apk add --no-cache mediainfo
elif [ "$(uname)" = "Darwin" ]; then
  # install system dependencies on mac os with brew
  brew install mediainfo
else
  echo "Could not detect package installer."
  exit 1;
fi
