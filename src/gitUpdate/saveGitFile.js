'use strict'
const gitHubClient = require('./gitHubClient')
module.exports = async(fileName, data, commitMsg, sha)=>{
  try{
    if(!data || !fileName || !commitMsg) return
    let obj = Buffer.from(JSON.stringify(data)).toString('base64')
    if(obj) return await gitHubClient.push(fileName, obj, commitMsg, sha)
  }catch(e){
    throw(e);
  }
}
