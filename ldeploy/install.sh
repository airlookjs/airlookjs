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

mkdir build
cd build
cmake .. -DDISABLE_RSVG2=yes -DDISABLE_GTK2=yes -DDISABLE_QT5=yes -DENABLE_INTERNAL_QUEUE_H=ON
make 

# copy contents of build to bin
cp -r ./ ../../../bin
