'use strict'
const fetch = require('node-fetch')
module.exports = async(uri, method = 'GET', body, headers)=>{
  try{
    let payload = { method: method, compress: true, timeout: 60000 }
    if(body) payload.body = JSON.stringify(body)
    if(headers) payload.headers = headers
    const obj = await fetch(uri, payload)
    return await obj?.json()
  }catch(e){
    console.error(e);
  }
}
