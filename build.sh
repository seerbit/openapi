#!/bin/bash
mkdir -p docs/specs
node index.js bundle specs/openapi.json -t assets/style/template.hbs
cp -r specs docs/
mv redoc-static.html docs/index.html
