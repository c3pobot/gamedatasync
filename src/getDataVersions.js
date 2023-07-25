'use strict'
const s3client = require('./s3client')
module.exports = async()=>{
  try{
    let s3Versions = await s3client.get('versions.json')
    if(!s3Versions) s3Versions = {}
    return s3Versions
  }catch(e){
    throw(e)
  }
}
/*
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
module.exports = async()=>{
  try{
    let gitHubVersions = await Fetch(path.join(GITHUB_REPO_RAW_URL, 'versions.json'))
    if(!gitHubVersions) gitHubVersions = {}
    return gitHubVersions
  }catch(e){
    throw(e);
  }
}
*/
