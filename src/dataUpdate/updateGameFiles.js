'use strict'
const GameClient = require('./client')
const gitHubClient = require('../gitHubClient')
const checkFile = require('../checkFile')
const saveUnits = async(data = [], gameVersion, gitHubVersions = {}, repoFiles = [])=>{
  try{
    if(data.length === 0) return
    let saveSuccess = 0
    let units = await checkFile('units.json', gameVersion, data.filter(x=>x.obtainable === true && x.obtainableTime === "0"), (gitHubVersions['units.json'] !== gameVersion), repoFiles.find(x=>x.name === 'units.json')?.sha)
    if(units === true){
      gitHubVersions['units.json'] = gameVersion
      saveSuccess++
    }
    let units_pve = await checkFile('units_pve.json', gameVersion, data.filter(x=>x.obtainable !== true || x.obtainableTime !== "0"), (gitHubVersions['units_pve.json'] !== gameVersion), repoFiles.find(x=>x.name === 'units_pve.json')?.sha)
    if(units_pve === true){
      gitHubVersions['units_pve.json'] = gameVersion
      saveSuccess++
    }
    if(saveSuccess === 2) return true
  }catch(e){
    console.error(e);
  }
}
const getSegment = async(gameDataSegment, gameVersion, gitHubVersions = {}, repoFiles = [])=>{
  try{
    let count = 0, saveSuccess = 0
    let obj = await GameClient.getGameData(gameVersion, true, gameDataSegment)
    if(!obj) return
    for(let i in obj){
      count++;
      if(!obj[i] || obj[i].length === 0){
        saveSuccess++;
        continue;
      }
      if(i === 'units'){
        let units = await saveUnits(obj[i], gameVersion, gitHubVersions, repoFiles)
        if(units === true) saveSuccess++
      }else{
        let status = await checkFile(i+'.json', gameVersion, obj[i], (gitHubVersions[i+'.json'] !== gameVersion), repoFiles.find(x=>x.name === i+'.json')?.sha)
        if(status === true){
          gitHubVersions[i+'.json'] = gameVersion
          saveSuccess++
        }
      }
    }
    if(count > 0 && count === saveSuccess) return true
  }catch(e){
    console.error(e);
  }
}
module.exports = async(gameVersion, gitHubVersions = {}, repoFiles = [])=>{
  try{
    if(!gameVersion) return
    let count = 1, saveSuccess = 0
    console.log('Uploading game files for game version '+gameVersion+' to github ...')
    const gameEnums = await GameClient.getEnums()
    if(!gameEnums && !gameEnums['GameDataSegment']) return
    let enumStatus = await checkFile('enums.json', gameVersion, gameEnums, (gitHubVersions['enums.json'] !== gameVersion), repoFiles.find(x=>x.name === 'enums.json')?.sha)
    if(enumStatus === true){
      gitHubVersions['enums.json'] = gameVersion
      saveSuccess++
    }
    for(let x in gameEnums['GameDataSegment']){
      count++;
      let status = await getSegment(gameEnums['GameDataSegment'][i], gameVersion, gitHubVersions, repoFiles)
      if(status) saveSuccess++
    }
    if(count > Object.values(enumStatus).length && count === saveSuccess) return true
  }catch(e){
    console.error(e);
  }
}
