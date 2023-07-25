'use strict'
const fs = require('fs')
const path = require('path')
const log = require('./logger')
const s3client = require('./s3client')
const saveFile = async(filename, data = {})=>{
  try{
    await fs.writeFileSync(path.join(baseDir, 'data', filename), JSON.stringify(data))
    return true
  }catch(e){
    log.error(e)
  }
}
const downloadAll = async()=>{
  try{

    if(!versions)
    if(versions?.length > 0){
      let i = version.length
      while(i--){
        let data = await s3client.get(i)
      }
    }
  }catch(e){
    log.error(e)
  }
}
module.exports = async()=>{
  try{
    log.info('Intial pull of files from object storage...')
    let versions = await s3client.get('versions.json')
    if(!versions) return
    for(let i in versions){
      if(i === 'assetVersion' || i === 'localeVersion' || i === 'gameVersion') continue
      let data = await s3client.get(i)
      if(data) await saveFile(i, data)
    }
    log.info('Intial pull of files from object storage complete...')
    return await saveFile('versions.json', versions)
  }catch(e){
    log.error(e)
  }
}
