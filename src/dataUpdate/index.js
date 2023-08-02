'use strict'
const fs = require('fs')
const path = require('path')
const log = require('../logger')
const { dataVersions } = require('../dataVersions')
const s3client = require('../s3client')
const updateGameFiles = require('./updateGameFiles')
const updateLocalFiles = require('./updateLocalFiles')
const dataBuilder = require('../dataBuilder')
const saveVersionFile = async(data = {})=>{
  try{
    await fs.writeFileSync(path.join(baseDir, 'data', 'versions.json'), JSON.stringify(data))
    return await s3client.put('versions.json', data)
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion, s3Versions = {})=>{
  try{
    let oldAssetVersion = s3Versions.assetVersion, oldGameVersion = s3Versions.gameVersion, oldLocalVersion = s3Versions.localeVersion, oldStatCalcVersion = s3Versions['gameData.json']
    delete s3Versions.assetVersion
    let status = false
    if(!gameVersion || !localeVersion || !assetVersion) return
    log.info('updating game data files...')
    if(s3Versions['gameVersion'] !== gameVersion){
      status = await updateGameFiles(gameVersion, s3Versions)
      if(status === true) s3Versions.gameVersion = gameVersion
    }
    if(s3Versions['localeVersion'] !== localeVersion){
      status = await updateLocalFiles(localeVersion, s3Versions)
      if(status === true) s3Versions.localeVersion = localeVersion
    }
    if(s3Versions['gameData.json'] !== gameVersion || !s3Versions['gameData.json']){
      status = await dataBuilder(gameVersion, s3Versions)
      if(status === true) s3Versions['gameData.json'] = gameVersion
    }
    if(gameVersion === s3Versions.gameVersion && localeVersion === s3Versions.localeVersion){
      s3Versions.assetVersion = assetVersion
    }else{
      s3Versions.assetVersion = oldAssetVersion
    }
    console.log(s3Versions)
    let obj = await saveVersionFile(s3Versions)
    if(obj?.ETag){
      log.info('game files updated to version '+s3Versions['gameVersion']+'. Locale files updated to version '+s3Versions['localeVersion']+'...')
      dataVersions.gameVersion = s3Versions.gameVersion
      dataVersions.localeVersion = s3Versions.localeVersion
      dataVersions.statCalcVersion = s3Versions['gameData.json']
      dataVersions.assetVersion = s3Versions.assetVersion
    }else{
      log.error('error updating game and locale files...')
      dataVersions.gameVersion = oldGameVersion
      dataVersions.localeVersion = oldLocalVersion
      dataVersions.statCalcVersion = oldStatCalcVersion
    }
  }catch(e){
    throw(e);
  }
}
