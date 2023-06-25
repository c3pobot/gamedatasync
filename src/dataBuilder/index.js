'use strict'
module.exports = async(gameVersion, localeVersion)=>{
  try{
    if(!gameVersion || !localeVersion) return
    console.log('updating gameData.json')
  }catch(e){
    console.error(e);
  }
}
