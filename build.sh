#!/bin/bash
node index.js bundle json/swagger.json -t template.hbs
mv redoc-static.html  docs/index.html