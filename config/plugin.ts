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
};

export default plugin;
