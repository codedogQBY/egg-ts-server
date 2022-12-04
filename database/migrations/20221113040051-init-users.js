'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // 在执行数据库升级时调用的函数，创建 users 表
  async up (queryInterface, Sequelize) {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      email:STRING(128),
      user_name: STRING(128),
      password:STRING(255),
      role_ids:{type:STRING(128),defaultValue:""},
      info:STRING(1024),
      deleted:{type:INTEGER,defaultValue:0},
      created_at: DATE,
      updated_at: DATE,
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
