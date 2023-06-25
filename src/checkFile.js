'use strict'
const path = require('path')
const fetch = require('./fetch')
const readFile = require('./readFile')
const saveGitFile = require('./saveGitFile')
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')

const checkLocalFile = async(file, version)=>{
  try{
    const obj = await readFile(file)
    if(obj?.version && obj?.data && obj.version === version) return true
  }catch(e){
    console.error(e);
  }
}
const saveFile = async(file, version, data)=>{
  try{
    await fs.writeFileSync(path.join(DATA_PATH, file), JSON.stringify({version: version, data: data}))
    return true
  }catch(e){
    console.error(e);
  }
}
const githubSave =
module.exports = async(file, version, data, push2git = true, sha)=>{
  try{
    if(!file || !version || !data) return false
    let status = await checkLocalFile(file, version)
    if(!status) status = saveFile(file, version, data)
    if(!status) return false
    if(push2git){
      status = false
      let res = await saveGitFile({version: version, data: data}, file, version, sha)
      if(res?.content?.sha) status = true
      if(status !== true) console.log('error uploading '+file+' to github')
    }
    return status
  }catch(e){
    console.error(e);
  }
}
