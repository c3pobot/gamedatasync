'use strict'
const GameClient = require('../client')
const gitHubClient = require('../gitHubClient')
const checkFile = require('../checkFile')
const checkGitFileExists = require('../checkGitFileExists')
const JSZip = require('jszip');
const { createInterface } = require('readline');
const { once } = require('events');
const processStreamByLine = async (fileStream) => {
  const langMap = {};

  try {
    const rl = createInterface({
      input: fileStream,
      //crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const result = processLocalizationLine(line);
      if (result) {
        const [key, val] = result;
        langMap[key] = val;
      }
    });

    await once(rl, 'close');
  } catch (err) {
    console.error(err);
  }

  return langMap;
};
const processLocalizationLine = (line) => {
  if (line.startsWith('#')) return;
  let [ key, val ] = line.split(/\|/g).map(s => s.trim());
  if (!key || !val) return;
  val = val.replace(/^\[[0-9A-F]*?\](.*)\s+\(([A-Z]+)\)\[-\]$/, (m,p1,p2) => p1);
  return [key, val];
}
module.exports = async(localeVersion, gitHubVersions = {}, repoFiles = [])=>{
  try{
    if(!localeVersion) return
    console.log('Uploading locale files for version '+localeVersion+' to github ...')
    let count = 0, saveSuccess = 0
    let localeFiles = await GameClient.getLocalizationBundle(localeVersion, false)
    if(!localeFiles) return
    let zipped = await (new JSZip())
          .loadAsync(Buffer.from(localeFiles.localizationBundle, 'base64'), { base64:true });
    localeFiles = Object.entries(zipped.files);
    if(!localeFiles) return
    for(let [lang, content] of localeFiles){
      count++
      let fileStream = content.nodeStream();
      let langMap = await processStreamByLine(fileStream);
      if(!langMap) continue;
      let uploadFile = true
      if(gitHubVersions[lang+'.json'] === localeVersion) uploadFile = false
      if(uploadFile === true && gitHubVersions[lang+'.json']){
        let gitFileExists = await checkGitFileExists(lang+'.json', localeVersion)
        if(gitFileExists === true) uploadFile = false
      }
      let status = await checkFile(lang+'.json', localeVersion, langMap, uploadFile, repoFiles.find(x=>x.name === lang+'.json')?.sha)
      if(status) saveSuccess++
    }
    if(count > 0 && count === saveSuccess) return true
  }catch(e){
    console.error(e);
  }
}
