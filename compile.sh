#!/bin/bash

# COMPILES THE C PROGRAM WITH THE NECESSARY FRAMEWORKS

mkdir -p c/build
sudo /usr/bin/clang c/main.c -arch arm64 -arch x86_64 -F /System/Library/PrivateFrameworks -framework MultitouchSupport -o c/build/multitouch
