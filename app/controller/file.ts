import { Controller } from 'egg';

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

export default class fileController extends Controller {
  public async uploadImg() {
    const { ctx } = this;
      try {
        const file = ctx.request.files[0] as unknown as File
        const data = await ctx.service.file.uploadFiles(file,'image');
        ctx.helper.response.handleSuccess({ ctx, msg: '上传图片成功', data: {
            path: `/resource/${data.key}`,
            name: file.filename,
            mimetype: file.mimeType,
            size: file.encoding,
        } });
      } catch (error) {
          console.log(error);
          ctx.helper.response.handleError({ ctx, msg: '上传图片失败' });
      }
  }
}