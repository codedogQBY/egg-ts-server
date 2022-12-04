'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('menus', {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menus');
  },
};
