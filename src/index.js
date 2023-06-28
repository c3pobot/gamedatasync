'use strict'
const dataVersions = { gameVersion: null, localeVersion: null, statCalcVersion: null }
const path = require('path')
const getGameVersions = require('./getGameVersions')
const getDataVersions = require('./getDataVersions')
const Fetch = require('./fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/c3pobot/gamedata/main/'
//const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 1)
const dataBuilder = require('./dataBuilder')
const dataUpdate = require('./dataUpdate')
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
    if(data?.gameVersion) dataVersions.gameVersion = data.gameVersion
    if(data?.localeVersion) dataVersions.localeVersion = data.localeVersion
    if(data?.statCalcVersion) dataVersions.statCalcVersion = data.statCalcVersion
    StartSync()
  }catch(e){
    console.error(e);
    StartSync()
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
    let gameDataNeeded = false, statCalcDataNeeded = false
    let obj = await getGameVersions()
    if(!obj?.gameVersion || !obj?.localeVersion) return
    if(dataVersions.gameVersion === obj.gameVersion && dataVersions.localeVersion === obj.localeVersion && dataVersions.statCalcVersion === obj.gameVersion) return
    let gitVersions = await getDataVersions()
    if(gitVersions) gitVersions = gitVersions.gitVersions
    if(!gitVersions) gitVersions = {}
    if(dataVersions.gameVersion !== obj.gameVersion) gameDataNeeded = true
    if(dataVersions.localeVersion !== obj.localeVersion) gameDataNeeded = true
    if(dataVersions.statCalcVersion !== obj.gameVersion) gameDataNeeded = true
    if(gameDataNeeded){
      let { gameVersion, localeVersion, statCalcVersion } = await dataUpdate(obj.gameVersion, obj.localeVersion, obj.assetVersion, JSON.parse(JSON.stringify(gitVersions)))
      if(gameVersion) dataVersions.gameVersion = gameVersion
      if(localeVersion) dataVersions.localeVersion = localeVersion
      if(statCalcVersion) dataVersions.statCalcVersion = statCalcVersion
    }
  }catch(e){
    console.error(e);
  }
}
checkAPIReady()
