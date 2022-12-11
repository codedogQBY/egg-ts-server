import { Service } from 'egg';
import { Op } from 'sequelize';
/**
 * User Service
 */

// userId
type Uid = number;

// 权限id
type Scope = string;

export default class User extends Service {
  public async checkUserNameAndEmail(userName: string, email: string) {
    try {
      const ctx = this.ctx;
      const query = {
        [Op.or]: {
          user_name: userName,
          email,
        },
      };
      const res = await ctx.model.User.findAll(query);

      if (res.length > 0) {
        const userNameList = res.filter((item: { userName: string }) => item.userName === userName);
        const emailList = res.filter((item: { email: string }) => item.email === email);
        const msgList:string[] = [];
        if (userNameList.length > 0) {
          msgList.push('该用户名已被注册');
        }
        if (emailList.length > 0) {
          msgList.push('该邮箱已被注册');
        }
        return {
          bool: true,
          msg: msgList.join(','),
        };
      }
      return {
        bool: false,
      };

    } catch (error) {
      throw new Error('查询用户或邮箱失败');
    }

  }

  // 生成token
  public async generateToken(uid: Uid, scope: Scope) {
    const token = this.app.jwt.sign({
      uid,
      scope,
    }, this.app.config.jwt.secret, { expiresIn: 30 * 24 * 60 * 60 + 's' });
    return token;
  }

  public async saveToken(key: string, uid: number) {
    await this.app.redis.get('auth').setex(key, 60 * 60 * 24 * 0.5, uid);
  }

}
