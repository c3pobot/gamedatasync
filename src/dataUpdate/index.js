'use strict'
const gitHubClient = require('./githubClient')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    if(!gameVersion || !localeVersion) return
    console.log('updating game data files')
    let res = { gameVersion: null, localeVersion: null }
  }catch(e){
    console.error(e);
  }
}
