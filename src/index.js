'use strict'
const dataVersions = { gameVersion: null, localeVersion: null, statCalcVersion: null}
const getGameVersions = require('./getGameVersions')
const fetch = require('./fetch')
const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 5)
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
    await CheckVersions()
    setTimeout(StartSync, SYNC_INTERVAL * 60 * 1000)
  }catch(e){
    console.error(e);
    setTimeout(StartSync, 5000)
  }
}
const CheckVersions = async()=>{
  try{
    const obj = await GetGameVersions(), gameDataNeeded = false, statCalcDataNeeded = false
    if(obj?.gameVersion || obj?.localeVersion) return
    if(dataVersions.gameVersion !== obj.gameVersion || dataVersions.localeVersion !== obj.localeVersion) gameDataNeeded = true
    if(dataVersions.statCalcVersion !== obj.gameVersion || dataVersions.localeVersion !== obj.localeVersion) statCalcDataNeeded = true
    let gitHubVersion = await fetch(path.join(GITHUB_REPO_URL, 'version.json'))
    if(gitHubVersion?.gameVersion || gitHubVersion?.localeVersion || ){
      if(gitHubVersion.gameVersion === obj.gameVersion && gitHubVersion.localeVersion === obj.localeVersion) gameDataNeeded = false
      if(gitHubVersion['gameData.json'] === obj.gameVersion) statCalcDataNeeded = false
    }
    if(gameDataNeeded){
      let { gameVersion, localeVersion } = await dataUpdate(obj.gameVersion, obj.localeVersion)
      if(gameVersion) dataVersions.gameVersion = gameVersion
      if(localeVersion) dataVersions.localeVersion = localeVersion
    }
    if(statCalcDataNeeded ){
      let statCalcVersion = await dataBuilder(obj.gameVersion, obj.localeVersion)
      if(statCalcVersion) dataVersions.statCalcVersion = statCalcVersion
    }
  }catch(e){
    console.error(e);
  }
}
