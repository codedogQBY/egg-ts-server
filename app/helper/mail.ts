import nodemailer from 'nodemailer';
import smtpTransport = require('nodemailer-smtp-transport');
interface MailOptions {
  from?: string // 发件人
  to: string // 收件人
  subject?: string // 主题
  text?: string // plain text body
  html?: string // html body
}
class MailHelper {
  get transporter(): any {
    return this._transporter;
  }
  private _transporter: any;
  get clientIsValid(): boolean {
    return this._clientIsValid;
  }
  private _clientIsValid = true;
  constructor() {
    this.initMail();
  }
  initMail() {
    const transporter = nodemailer.createTransport(
      smtpTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        auth: {
          user: 'codedogs@163.com',
          pass: 'IZVDPMLAIXGDVFKL',
        },
      }),
    );

    this._transporter = transporter;

    const verifyClient = () => {
      transporter.verify(error => {
        if (error) {
          this._clientIsValid = false;
          console.log(error);

          console.warn('邮件客户端初始化连接失败，将在一小时后重试');
          setTimeout(verifyClient, 1000 * 60 * 60);
        } else {
          this._clientIsValid = true;
          console.log('邮件客户端初始化连接成功，随时可发送邮件');
        }
      });
    };
    verifyClient();
  }

  sendMail(mailOptions: MailOptions) {
    if (!this._clientIsValid) {
      console.warn('由于未初始化成功，邮件客户端发送被拒绝');
      return false;
    }
    mailOptions.from = '"codedogs" <codedogs@163.com>';
    this._transporter.sendMail(mailOptions, (error, info) => {
      if (error) return console.warn('邮件发送失败', error);
      console.log('邮件发送成功', info.messageId, info.response);
    });
  }
}

export default new MailHelper();
