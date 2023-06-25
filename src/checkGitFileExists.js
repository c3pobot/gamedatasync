'use strict'
const path = require('path')
const Fetch = require('./fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
module.exports = async(file, version)=>{
  try{
    if(!file || !version) return false
    let obj = await Fetch(path.join(GITHUB_REPO_RAW_URL, file))
    if(obj?.version && obj?.data && obj?.version === version) return true
  }catch(e){
    console.error(e);
  }
}
