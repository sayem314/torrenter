#!/usr/bin/env bash
set -ex

## remove build directory
rm -rf build

## build for 64bit
pkg --out-path build package.json --targets \
node12-linux-x64,\
node12-alpine-x64,\
node12-win-x64,\
node12-macos-x64

## archive builds
cd build
for file in *; do
  du -sh $file
  if [[ $file == *".exe"* ]]; then
    mv $file torrenter.exe
    zip ${file%.*}.zip torrenter.exe
    rm torrenter.exe
  else
    mv $file torrenter
    zip ${file%.*}.zip torrenter
    rm torrenter
  fi
done
du -sh *
