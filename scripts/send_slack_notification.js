#!/bin/bash
const fetch = require('node-fetch');
const msg = process.argv[2] == 'failure' ?
 "Failed to deploy Open API reference. Kindly check GitHub Actions for a detailed report"
: "Successfuly deployed Open API Reference";
fetch(process.env.SLNL, 
{ method: 'POST', 
body: JSON.stringify({"text":msg} )
}
)
    .then(json =>  console.log("SUCCESS"))
    .catch(e=> console.log(e.message))