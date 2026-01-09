#!/bin/bash

# BUMPS THE EXTENSION VERSION IN THE MANIFEST.JSON AND THEN ZIPS THE EXTENSION SO IT CAN BE UPLOADED TO THE CHROME STORE

MANIFEST="extension/src/manifest.json"

# Read current version
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' "$MANIFEST" | grep -o '[0-9.]*')

# Split version into parts
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"

# Increment the last part
LAST_INDEX=$((${#VERSION_PARTS[@]} - 1))
VERSION_PARTS[$LAST_INDEX]=$((${VERSION_PARTS[$LAST_INDEX]} + 1))

# Join back together
NEW_VERSION=$(IFS='.'; echo "${VERSION_PARTS[*]}")

# Update manifest.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST"

echo "Bumped version: $CURRENT_VERSION -> $NEW_VERSION"

# Build extension zip
zip -r extension/build/extension.zip extension/src