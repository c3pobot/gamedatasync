'use strict'
const path = require('path')
const fs = require('fs')
const log = require('../logger')

const checkGitFile = require('./checkGitFile')
const getLocalFile = async(file)=>{
  try{
    let obj = await fs.readFileSync(path.join(baseDir, 'data', file))
    if(obj) return JSON.parse(obj)
  }catch(e){
    throw(e)
  }
}

module.exports = async(gameVersion, localeVersion, repoFiles, gitVersions = {})=>{
  try{
    if(!gameVersion || !localeVersion) return
    let fileList = await getLocalFile('versions.json')
    if(!fileList || fileList?.gameVersion !== gameVersion || fileList?.localeVersion !== localeVersion) return
    let count = Object.values(fileList).length, success = 0
    if(!count) return
    count = count - 3

    for(let i in fileList){
      if(i === 'gameVersion' || i === 'localeVersion' || i === 'assetVersion') continue
      let data = await getLocalFile(i)
      if(!data || !data.version || !data.data) continue
      if(data.version === gameVersion || data.version === localeVersion){
        let status = await checkGitFile(i, data, repoFiles?.find(x=>x.name === i)?.sha)
        if(status){
          gitVersions[i] === data.version
          success++
        }
      }
    }
    if(count > 0 && count === success) return true
  }catch(e){
    throw(e)
  }
}
