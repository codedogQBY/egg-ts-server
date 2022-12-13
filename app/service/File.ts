import { Service } from 'egg';
import qiniu from 'qiniu';

interface RespBody {
    key: string
    hash: string
    size: number
    bucket: string
    mimeType: string
}
interface File{
  field:string
  filename:string
  encoding:string
  mime:string
  fieldname:string
  transferEncoding:string,
  mimeType:string,
  filepath:string
}

export default class FileService extends Service {
    // 获取上传凭证
    public updateToken(){
        const {accessKey, secretKey, bucket} = this.app.config.qiniu
        const putPolicy = new qiniu.rs.PutPolicy({
            scope: bucket,
            // 上传成功后返回数据键值对参数设置
            returnBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)", "mimeType":"$(mimeType)"}',
          })
        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
        return putPolicy.uploadToken(mac)
    }

    // 上传文件
    async uploadFiles(file: File,type:string): Promise<RespBody> {
        const ctx = this.ctx
        return new Promise((resolve, reject) => {
          const config: qiniu.conf.Config = new qiniu.conf.Config({
            useHttpsDomain: true, // 是否使用https域名
            useCdnDomain: true, // 上传是否使用cdn加速
          })
          
          const formUploader = new qiniu.form_up.FormUploader(config) //  生成表单上传的类
          const putExtra = new qiniu.form_up.PutExtra() //  生成表单提交额外参数
          formUploader.putFile(
            ctx.service.file.updateToken(),
            `upload/${type}/${file.filename}`, // 默认上传到upload文件夹下
            file.filepath,
            putExtra,
            function (respErr, respBody, respInfo) {
              if (respErr) {
                console.log(respErr)
                reject(respErr)
              }
              if (respInfo.statusCode == 200) {
                resolve(respBody)
              } else {
                console.log(respInfo.statusCode)
                reject(respBody)
              }
            }
          )
        })
      }
}