'use strict'
const log = require('../logger')
const GameClient = require('../client')
const saveFile = require('../saveFile')

const saveUnits = async(data = [], gameVersion, s3Versions = {})=>{
  try{
    if(data.length === 0) return
    let saveSuccess = 0
    let units = await saveFile('units.json', gameVersion, data.filter(x=>x.obtainable === true && x.obtainableTime === "0"))
    if(units === true){
      s3Versions['units.json'] = gameVersion
      saveSuccess++
    }
    let units_pve = await saveFile('units_pve.json', gameVersion, data.filter(x=>x.obtainable !== true || x.obtainableTime !== "0"))
    if(units_pve === true){
      s3Versions['units_pve.json'] = gameVersion
      saveSuccess++
    }
    if(saveSuccess === 2) return true
  }catch(e){
    throw(e);
  }
}
const getSegment = async( gameDataSegment, gameVersion, s3Versions = {} )=>{
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
        let units = await saveUnits(obj[i], gameVersion, s3Versions)
        if(units === true) saveSuccess++
      }else{
        let status = await saveFile(i+'.json', gameVersion, obj[i])
        if(status === true){
          s3Versions[i+'.json'] = gameVersion
          saveSuccess++
        }
      }
    }
    if(count > 0 && count === saveSuccess) return true
  }catch(e){
    throw(e);
  }
}
module.exports = async(gameVersion, s3Versions = {})=>{
  try{
    if(!gameVersion) return
    let count = 1, saveSuccess = 0
    log.info('Uploading game files for game version '+gameVersion+' to object storage ...')
    const gameEnums = await GameClient.getEnums()
    if(!gameEnums && !gameEnums['GameDataSegment']) return
    let enumStatus = await saveFile( 'enums.json', gameVersion, gameEnums )
    if(enumStatus === true){
      s3Versions['enums.json'] = gameVersion
      saveSuccess++
    }
    for(let i in gameEnums['GameDataSegment']){
      count++;
      let status = await getSegment(gameEnums['GameDataSegment'][i], gameVersion, s3Versions)
      if(status) saveSuccess++
    }
    if(count > Object.values(enumStatus).length && count === saveSuccess) return true
  }catch(e){
    throw(e);
  }
}
