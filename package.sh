#!/bin/bash

# BUILDS THE MACOS INSTALL PKG

rm -rf pkg
mkdir -p pkg/install-root/Library/Google/Chrome/NativeMessagingHosts
mkdir -p pkg/install-root/usr/local/bin
cp com.stelan.multitouch.json pkg/install-root/Library/Google/Chrome/NativeMessagingHosts/com.stelan.multitouch.json
cp c/build/multitouch pkg/install-root/usr/local/bin/multitouch
pkgbuild --identifier com.stelan.multitouch --version 1.0 --root pkg/install-root --install-location / pkg/Multitouch.pkg
