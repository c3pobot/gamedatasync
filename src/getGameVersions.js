'use strict'
const GameClient = require('./client')
module.exports = async()=>{
  try{
    let res = {gameVersion: null, localeVersion: null}
    const obj = await GameClient.getMetaData()
    if(obj?.latestGamedataVersion) res.gameVersion = obj.latestGamedataVersion
    if(obj?.latestLocalizationBundleVersion) res.localeVersion = obj.latestLocalizationBundleVersion
    return res
  }catch(e){
    console.error(e);
  }
}