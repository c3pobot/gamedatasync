'use strict'
const path = require('path')
const Fetch = require('./fetch')
const GAME_API_URI = process.env.CLIENT_URL
module.exports = async()=>{
  try{
    let res = {gameVersion: null, localeVersion: null}
    const obj = await Fetch.json(path.join(GAME_API_URI, 'metadata'), 'POST', {})
    if(obj?.latestGamedataVersion) res.gameVersion = obj.latestGamedataVersion
    if(obj?.latestLocalizationBundleVersion) res.localeVersion = obj.latestLocalizationBundleVersion
    return res
  }catch(e){
    console.error(e);
  }
}
