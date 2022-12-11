import { Context } from 'egg';

/**
 * 获取token
 * @param ctx
 * @return
 */
function getToken(ctx: Context): string | string[] {
  return ctx.header.authorization || ctx.cookies.get('authorization') || '';
}

/**
 * 校验token是否合法
 * @param ctx
 * @param next
 */
module.exports = (options: { secret: string }) => {
  return async function verifyToken(ctx: Context, next: ()=>{}) {
    // 获取token
    const userToken = getToken(ctx);
    const serverToken = await ctx.app.redis.get('auth').get(userToken);
    if (!userToken || !serverToken) {
      ctx.status = 403;
      return;
    }
    // 尝试解析token, 获取uid和scope
    const { uid, iat, scope } = ctx.app.jwt.verify(userToken, options.secret);

    if (iat < new Date().getDate() / 1000) {
      ctx.status = 401;
      return;
    }
    // 在上下文保存uid和scope
    ctx.auth = {
      uid,
      scope,
    };
    await next();
  };

};
