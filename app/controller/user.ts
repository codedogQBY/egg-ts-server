import { Controller } from 'egg';
import { Op } from 'sequelize';
import svgCaptcha from 'svg-captcha';
/**
 * @Controller user
 */

export default class UserController extends Controller {
  /**
     * @summary 用户注册
     * @Description 用户注册接口
     * @Router POST /api/register
     * @Request body registerRequest *body
     * @Response 200 registerResponse ok
     */
  public async register() {
    const ctx = this.ctx;
    try {
      const { password, userName, email, code } = ctx.request.body as { password: string, userName: string, email: string, code: string };
      const { bool, msg } = await ctx.service.user.checkUserNameAndEmail(userName, email);
      if (!bool) {

        if (+code !== +ctx.session?.code) {
          ctx.helper.response.handleError({ ctx, msg: '验证码错误' });
          return;
        }
        await ctx.model.User.create({
          password, user_name: userName, email,
        });
        ctx.helper.response.handleSuccess({ ctx, msg: '注册成功' });
      } else {
        ctx.helper.response.handleErrorr({ ctx, msg });
      }

    } catch (error) {
      ctx.helper.response.handleErrorr({ ctx, msg: '用户注册失败' });
    }
  }


  /**
     * @summary 获取注册验证码
     * @Description 获取注册验证码
     * @Router POST /api/sendCodeEmail
     * @Request body sendCodeEmailRequest *body
     * @Response 200 sendCodeEmailResponse ok
     */
  public async sendCodeEmail() {
    const ctx = this.ctx;
    try {
      const { email, userName } = ctx.request.body as { userName: string, email: string };
      const { bool, msg } = await ctx.service.user.checkUserNameAndEmail(userName, email);
      if (!bool) {
        ctx.helper.response.handleError({ ctx, msg });
      }
      const code = (Math.random() * 1000000).toFixed();
      // 在会话中添加验证码字段code
      ctx.session!.code = code;
      // 发送邮件
      ctx.helper.mail.sendMail({
        to: email,
        subject: '验证码',
        text: '验证码',
        html: `
                <div >
                    <p>您正在注册智能营销平台帐号，用户名<b>${userName}</b>，
                    验证邮箱为<b>${email}</b> 。
                    验证码为：</p>
                    <p style="color: green;font-weight: 600;margin: 0 6px;text-align: center; font-size: 20px">
                      ${code}
                    </p>
                    <p>请在注册页面填写该改验证码</p>
                    <p>若不是您所发，请忽略</p>
                </div>
            `,
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '邮件发送成功' });
    } catch (error) {
      console.log(error);
      ctx.helper.response.handleError({ ctx, msg: '邮件发送失败' });
    }
  }

  /**
     * @summary 用户登录
     * @Description 用户登录接口
     * @Router POST /api/login
     * @Request body loginRequest *body
     * @Response 200 loginResponse ok
     */
  public async login() {
    const ctx = this.ctx;
    try {
      const { userName, password, code } = ctx.request.body as { userName: string, password: string, code:string};
      const loginCode = ctx.session!.loginCode;
      if (code !== loginCode) {
        ctx.helper.response.handleError({ ctx, msg: '验证码错误', data: false });
      }
      const user = await ctx.model.User.findOne({ [Op.and]: { userName, deleted: 0 } });
      if (user === null) {
        ctx.helper.response.handleError({ ctx, msg: '该用户不存在', data: false });
      } else {
        if (user.password !== password) {
          ctx.helper.response.handleError({ ctx, msg: '密码错误', data: false });
        }
        const token = await ctx.service.user.generateToken(user.id, user.role_ids);
        ctx.helper.response.handleSuccess({ ctx, msg: '登录成功', data: { token } });
      }
    } catch (error) {
      ctx.helper.response.handleError({ ctx, msg: '未知错误' });
    }
  }


  /**
     * @summary 获取图形码
     * @Description 获取图形吗接口
     * @Router GET /api/getCode
     * @Request body getCodeRequest *body
     * @Response 200 getCodeResponse ok
     */
  public async getCode() {
    const ctx = this.ctx;
    const captcha: svgCaptcha.CaptchaObj = svgCaptcha.create({
      size: 4, // 验证码长度
      fontSize: 45, // 验证码字号
      ignoreChars: '0o1i', // 过滤掉某些字符， 如 0o1i
      noise: 3, // 干扰线条数目
      width: 100, // 宽度
      color: true,
    });
    ctx.session!.loginCode = captcha.text; // 把验证码赋值给session
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
  }

  /**
     * @summary 获取用户信息
     * @Description 获取用户信息接口
     * @Router GET /api/getUserInfo
     * @Request body getUserInfoRequest *body
     * @Response 200 getUserInfoResponse ok
     */
  public async getUserInfo() {
    const ctx = this.ctx;
    try {
      const { uid } = ctx.auth;
      const user = await ctx.model.User.findOne({ attributes: [ 'user_name', 'role_ids', 'info', 'id' ], [Op.and]: { id: uid, deleted: 0 } });
      ctx.helper.response.handleSuccess({ ctx, msg: '查询用户信息成功', data: { user } });
    } catch (error) {
      ctx.helper.response.handleErrorr({ ctx, msg: '查询用户信息失败' });
    }
  }
}
