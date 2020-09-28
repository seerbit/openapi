#!/bin/bash
mkdir -p docs/specs
echo -n "Building Documentation... "
node index.js bundle specs/openapi.json -t assets/style/template.hbs &> /dev/null
RESULT=$?
if [[ ${RESULT} != 0 ]]; then
  echo -e "\e[91mFAILED"
  exit 1
fi
cp -r specs docs/
mv redoc-static.html docs/index.html
echo -e "\e[32mSUCCESS"
exit 0
