'use strict'
const gitHubClient = require('../githubClient')
const updateGameFiles = require('./updateGameFiles')
const updateLocalFiles = require('./updateLocalFiles')
const saveGitFile = require('./saveGitFile')
module.exports = async(gameVersion, localeVersion, gitHubVersions = {})=>{
  try{
    let res = {gameVersion: null, localeVersion: null }, oldGameVersion = gitHubVersions['gameVersion'], oldLocalVersion = gitHubVersions['localeVersion'], status = false
    if(!gameVersion || !localeVersion) return res
    let repoFiles = await gitHubClient.getRepoFiles()
    console.log('updating game data files')
    if(gitHubVersions['gameVersion'] !== gameVersion){
      status = await updateGameFiles(gameVersion, gitHubVersions, repoFiles)
      if(status === true) gitHubVersions['gameVersion'] = gameVersion
    }
    if(gitHubVersions['localeVersion'] !== localeVersion){
      status = await updateLocalFiles(gameVersion, gitHubVersions, repoFiles)
      if(status === true) gitHubVersions['localeVersion'] = localeVersion
    }
    let obj = await saveGitFile(gitHubVersions, 'versions.json', (oldGameVersion !== gameVersion || oldLocalVersion |== localeVersion), repoFiles?.find(x=>x.name === 'versions.json')?.sha)
    if(obj?.content?.sha){
      res.gameVersion = gitHubVersions['gameVersion']
      res.localeVersion = gitHubVersions['localeVersion']
    }else{
      res.gameVersion = oldGameVersion
      res.localeVersion = oldLocalVersion
    }
    return res
  }catch(e){
    console.error(e);
  }
}
