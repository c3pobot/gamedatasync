'use strict'
const fetch = require('./fetch')
const saveGitFile = require('./saveGitFile')
module.exports = async(fileName, data = {}, sha)=>{
  try{
    let remoteFile = await fetch(fileName)
    if(remoteFile?.version === data?.version) return true
    let res = await saveGitFile(fileName, data, data.version, sha)
    if(res?.content?.sha) return true
  }catch(e){
    throw(e)
  }
}
