'use strict'
const log = require('./logger')
const fs = require('fs')
const path = require('path')
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')
const s3client = require('./s3client')
const readFile = async(file)=>{
  try{
    const obj = fs.readFileSync(path.join(DATA_PATH, file))
    if(obj?.version && obj?.data) return await JSON.parse(obj)
  }catch(e){
    //log.error('error reading '+file)
  }
}
const checkLocalFile = async(file, version)=>{
  try{
    const obj = await readFile(file)
    if(obj?.version && obj?.data && obj.version === version) return true
  }catch(e){
    log.error(e);
  }
}
const saveFile = async(file, version, data)=>{
  try{
    await fs.writeFileSync(path.join(DATA_PATH, file), JSON.stringify({version: version, data: data}))
    return true
  }catch(e){
    log.error(e);
  }
}
module.exports = async(file, version, data)=>{
  try{
    if(!file || !version || !data) return false
    let status = await checkLocalFile(file, version)
    if(!status) status = await saveFile(file, version, data)
    if(!status) return false
    status = false
    let res = await s3client.put(file, { version: version, data: data })
    if(res?.ETag) status = true
    if(status !== true) console.log('error uploading '+file+' to object storage...')
    return status
  }catch(e){
    throw(e);
  }
}
