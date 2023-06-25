'use strict'
const path = require('path')
const gitHubClient = require('../gitHubClient')
const checkFile = require('../checkFile')
const getDataFiles = require('./getDataFiles')
const buildData = require('./buildData')
const saveGitFile = require('../saveGitFile')
const Fetch = require('../fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

module.exports = async(gameVersion, gitHubVersions = {}, repoFiles = [])=>{
  try{
    if(!gameVersion) return
    console.log('creating gameData.json for version '+gameVersion)
    let uploadFile = true, status, oldStatCalcVersion = gitHubVersions['gameData.json'], gameData
    if(gitHubVersions['gameData.json']) gameData = await Fetch(path.join(GITHUB_REPO_RAW_URL, 'gameData.json'))
    if(gameData?.version && gameData?.data && gameData.version === gameVersion){
      uploadFile = false
      gameData = gameData.data
    }else{
      gameData = null
      let data = await getDataFiles(gameVersion)
      if(!data) return
      gameData = await buildData(data)
    }
    if(gameData) status = await checkFile('gameData.json', gameVersion, gameData, uploadFile, repoFiles.find(x=>x.name === 'gameData.json')?.sha)
    if(status) gitHubVersions['gameData.json'] = gameVersion
    let obj = await saveGitFile(gitHubVersions, 'versions.json', gameVersion, repoFiles?.find(x=>x.name === 'versions.json')?.sha)
    if(obj?.content?.sha){
      console.log('gameData.json updated to version '+gameVersion+'...')
      return true
    }else{
      console.log('error updating gameData.json')
      return false
    }
  }catch(e){
    console.error(e);
  }
}
