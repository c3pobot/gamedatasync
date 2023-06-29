'use strict'
const dataVersions = { gameVersion: null, localeVersion: null, statCalcVersion: null, assetVersion: null }
const path = require('path')
const getGameVersions = require('./getGameVersions')
const getDataVersions = require('./getDataVersions')
const Fetch = require('./fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/c3pobot/gamedata/main/'
//const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 1)
const dataBuilder = require('./dataBuilder')
const dataUpdate = require('./dataUpdate')
let updateInProgress = false
const checkAPIReady = async()=>{
  try{
    const obj = await getGameVersions()
    if(obj?.gameVersion){
      console.log('SWGOH API is ready ...')
      GetIntialVersions()
    }else{
      console.log('SWGOH API is not ready. Will try again in 5 seconds ...')
      setTimeout(checkAPIReady, 5000)
    }
  }catch(e){
    console.error(e);
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
    console.log('Initial data versions '+JSON.stringify(dataVersions))
    StartSync()
  }catch(e){
    console.error(e);
    setTimeout(GetIntialVersions, 5000)
  }
}
const StartSync = async()=>{
  try{
    let status = await CheckVersions()
    setTimeout(StartSync, SYNC_INTERVAL * 60 * 1000)
  }catch(e){
    console.error(e);
    setTimeout(StartSync, 5000)
  }
}
const CheckVersions = async()=>{
  try{
    let gameDataNeeded = false
    let obj = await getGameVersions()
    if(!obj?.gameVersion || !obj?.localeVersion || !obj?.assetVersion) return
    if(dataVersions.gameVersion === obj.gameVersion && dataVersions.localeVersion === obj.localeVersion && dataVersions.statCalcVersion === obj.gameVersion && dataVersions.assetVersion === obj.assetVersion) return
    let gitVersions = await getDataVersions()
    if(!gitVersions) gitVersions = {}
    if(dataVersions.gameVersion !== obj.gameVersion) gameDataNeeded = true
    if(dataVersions.localeVersion !== obj.localeVersion) gameDataNeeded = true
    if(dataVersions.statCalcVersion !== obj.gameVersion) gameDataNeeded = true
    if(dataVersions.assetVersion !== obj.assetVersion) gameDataNeeded = true
    if(gameDataNeeded && !updateInProgress){
      updateInProgress = true
      let status = await dataUpdate(obj.gameVersion, obj.localeVersion, obj.assetVersion, JSON.parse(JSON.stringify(gitVersions)))
      if(status?.gameVersion) dataVersions.gameVersion = status.gameVersion
      if(status?.localeVersion) dataVersions.localeVersion = status.localeVersion
      if(status?.statCalcVersion) dataVersions.statCalcVersion = status.statCalcVersion
      if(status?.assetVersion) dataVersions.assetVersion = status.assetVersion
    }
    updateInProgress = false
  }catch(e){
    updateInProgress = false
    console.error(e);
  }
}
checkAPIReady()
