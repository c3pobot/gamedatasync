'use strict'
const fetch = require('./fetch')
const readFile = require('./readFile')
module.exports = async(file, version)=>{
  try{
    const obj = await readFile(file)
    if(obj?.version && obj?.data && obj.version === version) return true
  }catch(e){
    console.error(e);
  }
}
