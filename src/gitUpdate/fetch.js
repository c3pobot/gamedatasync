'use strict'
const log = require('../logger')
const path = require('path')
const fetch = require('node-fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

const parseResponse = async(res)=>{
  try{
    if(res?.status?.toString().startsWith('2')) return await res.json()
  }catch(e){
    log.error(e);
  }
}
module.exports = async(file, method = 'GET', body, headers)=>{
  try{
    let payload = { method: method, compress: true, timeout: 60000 }
    if(body) payload.body = JSON.stringify(body)
    if(headers) payload.headers = headers
    const obj = await fetch(path.join(GITHUB_REPO_RAW_URL, file), payload)
    if(obj) return await parseResponse(obj)
  }catch(e){
    log.error(e);
  }
}
