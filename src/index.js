'use strict'
const path = require('path')
const dataVersions = { gameVersion: null, localeVersion: null, statCalcVersion: null}
const getGameVersions = require('./getGameVersions')
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
      StartSync()
    }else{
      console.log('SWGOH API is not ready. Will try again in 5 seconds ...')
      setTimeout(checkAPIReady, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(checkAPIReady, 5000)
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
    let obj = await getGameVersions(), gameDataNeeded = false, statCalcDataNeeded = false
    if(!obj?.gameVersion || !obj?.localeVersion) return
    if(dataVersions.gameVersion !== obj.gameVersion || dataVersions.localeVersion !== obj.localeVersion) gameDataNeeded = true
    if(dataVersions.statCalcVersion !== obj.gameVersion || dataVersions.localeVersion !== obj.localeVersion) statCalcDataNeeded = true
    let gitHubVersions = await Fetch(path.join(GITHUB_REPO_RAW_URL, 'versions.json'))
    if(gitHubVersions?.gameVersion || gitHubVersions?.localeVersion){
      if(gitHubVersions.gameVersion === obj.gameVersion && gitHubVersions.localeVersion === obj.localeVersion) gameDataNeeded = false
      if(gitHubVersions.gameVersion === obj.gameVersion) dataVersions.gameVersion = gitHubVersions.gameVersion
      if(gitHubVersions.localeVersion === obj.localeVersion) dataVersions.localeVersion = gitHubVersions.localeVersion
      if(gitHubVersions['gameData.json'] === obj.gameVersion){
        statCalcDataNeeded = false
        dataVersions.statCalcVersion = gitHubVersions['gameData.json']
      }
    }
    if(gameDataNeeded){
      let { gameVersion, localeVersion } = await dataUpdate(obj.gameVersion, obj.localeVersion, JSON.parse(JSON.stringify(gitHubVersions)))
      if(gameVersion) dataVersions.gameVersion = gameVersion
      if(localeVersion) dataVersions.localeVersion = localeVersion
    }
    if(statCalcDataNeeded ){
      let statCalcVersion = await dataBuilder(obj.gameVersion, obj.localeVersion, JSON.parse(JSON.stringify(gitHubVersions)))
      if(statCalcVersion) dataVersions.statCalcVersion = statCalcVersion
    }
    console.log(dataVersions)
  }catch(e){
    console.error(e);
  }
}
checkAPIReady()
