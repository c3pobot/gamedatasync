'use strict'
const { dataVersions } = require('../dataVersions')
const { gitVersions } = require('./gitVersions')
const gitHubClient = require('./gitHubClient')
const saveGitFile = require('./saveGitFile')
const updateRepo = require('./updateRepo')
const log = require('../logger')
const fetch = require('./fetch')

module.exports = async()=>{
  try{
    if(!dataVersions.gameVersion || !dataVersions.localeVersion) return
    if(dataVersions.gameVersion === gitVersions.gameVersion && dataVersions.localeVersion === gitVersions.localeVersion) return
    let versions = await fetch('versions.json')
    if(!versions) versions = {}
    if(dataVersions.gameVersion === versions?.gameVersion && dataVersions.localeVersion === versions.localeVersion){
      gitVersions.gameVersion = versions?.gameVersion
      gitVersions.localeVersion = versions?.localeVersion
      return
    }
    log.info('Updating gitHub Repo for '+dataVersions.gameVersion+' and '+dataVersions.localeVersion)
    let repoFiles = await gitHubClient.getRepoFiles()
    let status = await updateRepo(dataVersions.gameVersion, dataVersions.localeVersion, repoFiles, versions)
    if(status){
      versions.gameVersion = dataVersions.gameVersion
      versions.localeVersion = dataVersions.localeVersion
      versions.assetVersion = dataVersions.assetVersion
      let obj = await saveGitFile('versions.json', versions, dataVersions.gameVersion, repoFiles.find(x=>x.name === 'versions.json')?.sha)
      if(obj?.content?.sha){
        log.info('gitHub repo files updated successfully...')
        gitVersions.gameVersion = dataVersions?.gameVersion
        gitVersions.localeVersion = dataVersions?.localeVersion
      }else{
        log.info('error saving versions.json file')
      }
    }else{
      log.info('error updating files')
    }
  }catch(e){
    log.error(e)
  }
}
