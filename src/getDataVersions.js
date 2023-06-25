'use strict'
const path = require('path')
const Fetch = require('./fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
module.exports = async()=>{
  try{
    const obj = { gameVersion: null, localeVersion: null, statCalcVersion: null, gitVersions: {}}
    let gitHubVersions = await Fetch(path.join(GITHUB_REPO_RAW_URL, 'versions.json'))
    if(!gitHubVersions) gitHubVersions = {}
    if(gitHubVersions.gameVersion) obj.gameVersion = gitHubVersions.gameVersion
    if(gitHubVersions.gameVersion) obj.localeVersion = gitHubVersions.localeVersion
    if(gitHubVersions['gameData.json']) obj.statCalcVersion = gitHubVersions['gameData.json']
    if(gitHubVersions) obj.gitVersions = gitHubVersions
    return obj
  }catch(e){
    console.error(e);
  }
}
