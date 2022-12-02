import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  redis: {
    enable: true,
    package: 'egg-redis-ts',
  },
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  csrf: {
    enable: false,
  },
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
  helper: { enable: true,
    package: 'egg-helper',
  },
};

export default plugin;
