'use strict'
const path = require('path')
const log = require('./logger')
const getS3Files = require('./getS3Files')
const getGameVersions = require('./getGameVersions')
const getDataVersions = require('./getDataVersions')
const gitUpdate = require('./gitUpdate')
const { dataVersions } = require('./dataVersions')

const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 1)
const dataBuilder = require('./dataBuilder')
const dataUpdate = require('./dataUpdate')

let updateInProgress = false
const initalDownload = async()=>{
  try{
    await getS3Files()
    checkAPIReady()
  }catch(e){
    log.error(e)
  }
}
const checkAPIReady = async()=>{
  try{
    const obj = await getGameVersions()
    if(obj?.gameVersion){
      log.info('SWGOH API is ready ...')
      GetIntialVersions()
    }else{
      log.info('SWGOH API is not ready. Will try again in 5 seconds ...')
      setTimeout(checkAPIReady, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(checkAPIReady, 5000)
  }
}
const GetIntialVersions = async()=>{
  try{
    let data = await getDataVersions()
    if(!data) data = {}
    if(data.gameVersion) dataVersions.gameVersion = data.gameVersion
    if(data.localeVersion) dataVersions.localeVersion = data.localeVersion
    if(data['gameData.json']) dataVersions.statCalcVersion = data['gameData.json']
    if(data.assetVersion) dataVersions.assetVersion = data.assetVersion
    log.info('Initial data versions '+JSON.stringify(dataVersions))
    StartSync()
  }catch(e){
    log.error(e);
    setTimeout(GetIntialVersions, 5000)
  }
}
const StartSync = async()=>{
  try{
    let status = await CheckVersions()
    await gitUpdate()
    setTimeout(StartSync, SYNC_INTERVAL * 10 * 1000)
  }catch(e){
    log.error(e);
    setTimeout(StartSync, 5000)
  }
}
const CheckVersions = async()=>{
  try{
    let gameDataNeeded = false
    let obj = await getGameVersions()
    if(!obj?.gameVersion || !obj?.localeVersion || !obj?.assetVersion) return
    if(dataVersions.gameVersion === obj.gameVersion && dataVersions.localeVersion === obj.localeVersion && dataVersions.statCalcVersion === obj.gameVersion && dataVersions.assetVersion === obj.assetVersion) return
    let s3Versions = await getDataVersions()
    if(!s3Versions) s3Versions = {}
    if(dataVersions.gameVersion !== obj.gameVersion) gameDataNeeded = true
    if(dataVersions.localeVersion !== obj.localeVersion) gameDataNeeded = true
    if(dataVersions.statCalcVersion !== obj.gameVersion) gameDataNeeded = true
    if(dataVersions.assetVersion !== obj.assetVersion) gameDataNeeded = true
    if(gameDataNeeded && !updateInProgress){
      updateInProgress = true
      await dataUpdate(obj.gameVersion, obj.localeVersion, obj.assetVersion, JSON.parse(JSON.stringify(s3Versions)))
    }
    updateInProgress = false
  }catch(e){
    updateInProgress = false
    log.error(e);
  }
}
initalDownload()
