import { DataTypes } from 'sequelize';

export interface IRole {
  id: number,
  name:string,
  describe:string,
  parent_id:number,
  serial_num:number,
  menu_ids:string,
  created_at: Date,
  updated_at: Date,
}

/**
 * @param {Egg.Application} app
 */
const { INTEGER, DATE, STRING } = DataTypes;
export default app => {
  const Role = app.model.define('role', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING(255), allowNull: false, comment: '角色名称' },
    describe: { type: STRING(255), allowNull: false, comment: '描述' },
    parent_id: { type: INTEGER, allowNull: false, comment: '父id' },
    serial_num: { type: INTEGER, defaultValue: null, comment: '排序' },
    menu_ids: { type: STRING(255), defaultValue: null, comment: '菜单权限' },
    created_at: DATE,
    updated_at: DATE,
  });

  return Role;
};
