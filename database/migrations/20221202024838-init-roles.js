'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('roles', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: STRING(255), allowNull: false, comment: '角色名称' },
      describe: { type: STRING(255), allowNull: false, comment: '描述' },
      parent_id: { type: INTEGER, allowNull: false, comment: '父id' },
      serial_num: { type: INTEGER, defaultValue: null, comment: '排序' },
      menu_ids: { type: STRING(255), defaultValue: null, comment: '菜单权限' },
      created_at: DATE,
      updated_at: DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  },
};
