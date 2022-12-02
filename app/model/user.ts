import { DataTypes } from 'sequelize';

export interface IUser {
  id: number,
  email:string,
  user_name: string,
  password:string,
  role_ids:string,
  info:string,
  deleted:number,
  created_at: Date,
  updated_at: Date,
}

/**
 * @param {Egg.Application} app
 */
export default app => {
  const User = app.model.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: DataTypes.STRING(128),
    user_name: DataTypes.STRING(128),
    password: DataTypes.STRING(255),
    role_ids: { type: DataTypes.STRING(128), defaultValue: '' },
    info: DataTypes.STRING(128),
    deleted: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  });

  return User;
};
