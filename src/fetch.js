'use strict'
const fetch = require('node-fetch')
const parseResponse = async(res)=>{
  try{
    if(res?.status?.toString().startsWith('2')) return await res.json()
  }catch(e){
    console.error(e);
  }
}
module.exports = async(uri, method = 'GET', body, headers)=>{
  try{
    let payload = { method: method, compress: true, timeout: 60000 }
    if(body) payload.body = JSON.stringify(body)
    if(headers) payload.headers = headers
    const obj = await fetch(uri, payload)
    if(obj) return await parseResponse(obj)
  }catch(e){
    console.error(e);
  }
}
