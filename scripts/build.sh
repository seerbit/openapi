#!/bin/bash
set -e
mkdir -p docs/specs docs/style
echo -n "Building Documentation... "
npm run redoc
npm run convert:external:api
npm run modify:external:api
RESULT=$?
if [[ ${RESULT} != 0 ]]; then
  echo -e "\e[91mFAILED"
  exit 1
fi
cp -r specs docs/
cp assets/style/stylesheet.css docs/style/
mv redoc-static.html docs/index.html
echo -e "\e[32mSUCCESS"
exit 0
