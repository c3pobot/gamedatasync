'use strict'
const log = require('./logger')
const S3_BUCKET = process.env.S3_BUCKET || 'gamedata'
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT, // e.g. https://eu2.contabostorage.com/bucketname
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'US-central',
    forcePathStyle : true
});
module.exports.list = async()=>{
  try{
    let command = new ListObjectsV2Command({ Bucket: S3_BUCKET})
    let obj = await s3.send(command)
    return obj?.Contents
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(filename)=>{
  try{
    let res
    let command =  new GetObjectCommand({Bucket: S3_BUCKET, Key: filename})
    let obj = await s3.send(command)
    if(obj?.Body) res = await obj.Body.transformToString()
    if(res){
      return JSON.parse(res)
    }
  }catch(e){
    log.error(e)
  }
}
module.exports.put = async(filename, data = {})=>{
  try{
    let payload = { Body: JSON.stringify(data), Key: filename, Bucket: S3_BUCKET, ContentType: 'application/json' }
    let command = new PutObjectCommand(payload)
    let obj = await s3.send(command)
    if(obj?.ETag) return obj
  }catch(e){
    log.error(e)
  }
}
