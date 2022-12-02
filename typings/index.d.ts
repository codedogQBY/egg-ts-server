import 'egg';
import * as sequelize from 'sequelize';
import { Redis, RedisOptions } from "ioredis";

interface EggRedis {
    get(key: string): Redis;
}
declare module 'egg' {
    type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
    interface Application {
        jwt: {
            sign(payload: any, secret: string, options?:any, callback?:function): string;
            verify(token: any, secret: string, options?:any, callback?:function): {uid:number,scope:string,iat:number};
        },
        Sequelize: typeof sequelize;
        model: IModel;
        redis;
    }
    interface IModel extends sequelize.Sequelize, PlainObject {
    }
    interface Context {
        model: IModel;
        auth:{
            uid:number,
            scope:string
        }
    }
    interface EggAppConfig {
        sequelize: EggSequelizeOptions | DataSources;
    }
}

