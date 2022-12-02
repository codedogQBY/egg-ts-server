import { DataTypes } from 'sequelize';
const { INTEGER, DATE, STRING } = DataTypes;

export interface IMenu{
  id: number,
  name:string,
  parent_id:number,
  icon?:string,
  show:number,
  component?:string,
  redirect?:string,
  permission?:string,
  serial_num?:number,
  path?:string,
  hide_children?:number,
  type:number,
  created_at: Date,
  updated_at: Date,
}

/**
 * @param {Egg.Application} app
 */
export default app => {
  const Menu = app.model.define('menu', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING(255), allowNull: false, comment: '菜单名称' },
    parent_id: { type: INTEGER, allowNull: false, comment: '父id' },
    icon: { type: STRING(255), defaultValue: null, comment: '图标' },
    show: { type: INTEGER, defaultValue: 1, comment: '是否显示' },
    component: { type: STRING(255), defaultValue: null, comment: '组件' },
    redirect: { type: STRING(255), defaultValue: null, comment: '重定向' },
    permission: { type: STRING(255), defaultValue: null, comment: '权限标识' },
    serial_num: { type: INTEGER, defaultValue: null, comment: '排序' },
    path: { type: INTEGER, defaultValue: null, comment: '路径' },
    hide_children: { type: INTEGER, defaultValue: 0, comment: '是否隐藏字节点' },
    type: { type: INTEGER, defaultValue: 1, comment: '菜单类型(1目录,2页面,3按钮)' },
    created_at: DATE,
    updated_at: DATE,
  });

  return Menu;
};
