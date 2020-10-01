#!/bin/bash
const fetch = require('node-fetch');
fetch(process.env.SLNL, 
{ method: 'POST', 
body: JSON.stringify({"text":"Redoc Publish Successful"} )
}
)
    .then(json =>  console.log("SUCCESS"))
    .catch(e=> console.log(e.message))