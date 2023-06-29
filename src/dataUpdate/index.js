'use strict'
const gitHubClient = require('../gitHubClient')
const updateGameFiles = require('./updateGameFiles')
const updateLocalFiles = require('./updateLocalFiles')
const saveGitFile = require('../saveGitFile')
const dataBuilder = require('../dataBuilder')
module.exports = async(gameVersion, localeVersion, assetVersion, gitHubVersions = {})=>{
  try{
    let oldAssetVersion = gitHubVersions.assetVersion, oldGameVersion = gitHubVersions.gameVersion, oldLocalVersion = gitHubVersions.localeVersion, oldStatCalcVersion = gitHubVersions['gameData.json']
    delete gitHubVersions.assetVersion
    let res = {gameVersion: null, localeVersion: null, statCalcVersion: null, assetVersion: null  }
    let status = false
    if(!gameVersion || !localeVersion || !assetVersion) return
    let repoFiles = await gitHubClient.getRepoFiles()
    console.log('updating game data files...')
    if(gitHubVersions['gameVersion'] !== gameVersion){
      status = await updateGameFiles(gameVersion, gitHubVersions, repoFiles)
      if(status === true) gitHubVersions.gameVersion = gameVersion
    }
    if(gitHubVersions['localeVersion'] !== localeVersion){
      status = await updateLocalFiles(localeVersion, gitHubVersions, repoFiles)
      if(status === true) gitHubVersions.localeVersion = localeVersion
    }
    if(gitHubVersions['gameData.json'] !== gameVersion || !gitHubVersions['gameData.json']){
      status = await dataBuilder(gameVersion, gitHubVersions, repoFiles)
      if(status === true) gitHubVersions['gameData.json'] = gameVersion
    }
    if(gameVersion === gitHubVersions.gameVersion && localeVersion === gitHubVersions.localeVersion){
      gitHubVersions.assetVersion = assetVersion
    }else{
      gitHubVersions.assetVersion = oldAssetVersion
    }
    let obj = await saveGitFile(gitHubVersions, 'versions.json', gameVersion, repoFiles?.find(x=>x.name === 'versions.json')?.sha)
    if(obj?.content?.sha){
      console.log('game files updated to version '+gitHubVersions['gameVersion']+'. Locale files updated to version '+gitHubVersions['localeVersion']+'...')
      res.gameVersion = gitHubVersions.gameVersion
      res.localeVersion = gitHubVersions.localeVersion
      res.statCalcVersion = gitHubVersions['gameData.json']
      res.assetVersion = gitHubVersions.assetVersion
    }else{
      console.log('error updating game and locale files...')
      res.gameVersion = oldGameVersion
      res.localeVersion = oldLocalVersion
      res.statCalcVersion = oldStatCalcVersion
    }
    return res
  }catch(e){
    throw(e);
  }
}
