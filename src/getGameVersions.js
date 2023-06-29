'use strict'
const GameClient = require('./client')
module.exports = async()=>{
  try{
    let res = {gameVersion: null, localeVersion: null, assetVersion: null}
    const obj = await GameClient.getMetaData()
    if(obj?.latestGamedataVersion) res.gameVersion = obj.latestGamedataVersion
    if(obj?.latestLocalizationBundleVersion) res.localeVersion = obj.latestLocalizationBundleVersion
    if(obj?.assetVersion) res.assetVersion = obj.assetVersion
    return res
  }catch(e){
    throw(e);
  }
}
