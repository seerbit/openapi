#!/bin/bash
node index.js bundle json/seerbitapi.json -t template.hbs
mv redoc-static.html  docs/index.html