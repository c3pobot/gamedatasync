'use strict'
const path = require('path')
const Fetch = require('../fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const gameDataFilesNeeded = ['equipment', 'relicTierDefinition', 'skill', 'statModSet', 'statProgression', 'table', 'units', 'xpTable']
const getDataFile = async(file, version)=>{
  try{
    let obj = await Fetch(path.join(GITHUB_REPO_RAW_URL, file))
    if(obj?.version && obj?.data && obj?.version === version) return obj.data
  }catch(e){
    console.error(e);
  }
}
module.exports = async(gameVersion) =>{
  try{
    let data = {}, count = 0
    for(let i in gameDataFilesNeeded){
      let file = await getDataFile(gameDataFilesNeeded[i]+'.json', gameVersion)
      if(file?.length > 0){
        data[gameDataFilesNeeded[i]] = file
        count++
      }else{
        return;
      }
    }
    if(count > 0 && count === +gameDataFilesNeeded.length) return data
  }catch(e){
    console.error(e);
  }
}
