#!/bin/bash

# COMPILES THE C PROGRAM WITH THE NECESSARY FRAMEWORKS

sudo /usr/bin/clang c/main.c -F /System/Library/PrivateFrameworks -framework MultitouchSupport -o c/build/multitouch
