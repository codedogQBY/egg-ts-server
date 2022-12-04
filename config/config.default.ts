import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.keys = appInfo.name + '_1669261481826_4927';

  config.middleware = [];

  config.sequelize = {
    dialect: 'mysql', // 数据库类型
    host: '127.0.0.1', // 连接地址
    port: 3306, // 连接端口
    database: 'egg-ts', // 数据库名称
    username: 'root', // 用户名
    password: 'root', // 密码
  };

  config.redis = {
    clients: {
      auth: { // instanceName. See below
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: '',
        db: 0,
      },
    },
  };
  config.jwt = {
    secret: 'egg-ts',
  };
  config.security = {
    csrf: {
      enable: false,
    },
  };
  return {
    ...config,
  };
};
