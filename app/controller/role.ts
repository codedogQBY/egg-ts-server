import { Controller } from 'egg';
import { Op } from 'sequelize';
import { Models } from '../type/model';

export default class RoleController extends Controller {
  // 获取角色列表
  public async list() {
    const ctx = this.ctx;
    try {
      const { pageNum, pageSize, params } = ctx.request.body;
      const { name = '' } = params;
      // 获取列表
      const allRole = await ctx.model.Role.findAll({ attributes: [ 'id', 'name', 'describe', 'updated_at', 'updated_at', 'serial_num', 'menu_ids' ], [Op.like]: { name }, order: [[ 'updated_at', 'DESC' ]] });
      // 转换驼峰
      const roleList = allRole.map(ctx.helper.utils.lineToHumpObject);
      // 变成树形结构
      const records = ctx.helper.utils.getTreeByList(roleList, 0);
      // 获取总数
      const total = records.length;
      if (pageNum > 1) {
        records.splice((pageNum - 1) * pageSize, pageSize);
      }
      // 排序
      const each = (arr: Models.TreeNode[]) => {
        ctx.helper.utils.sort(arr, 'serialNum', 'desc');
        arr.forEach(item => {
          if (item.children) {
            each(item.children);
          }
        });
      };
      each(records);
      // 获取成功
      const data = ctx.helper.response.getPagination(records, total, pageSize, pageNum);
      ctx.helper.response.handleSuccess({ ctx, msg: '获取角色列表成功', data });
    } catch (e) {
      ctx.helper.response.handleError({ ctx, msg: '获取角色列表失败' });
    }
  }

  // 编辑角色列表
  public async edit() {
    const ctx = this.ctx;
    try {
      const { id, name, parentId, describe, serialNum } = ctx.request.body;
      // 更新角色列表
      await ctx.model.Role.update({
        name,
        parent_id: parentId,
        describe,
        serial_num: serialNum,
      }, {
        where: {
          id,
        },
      });
      const scope = id;
      // 获取权限
      const list = await ctx.service.role.getUserPermission({ scope, uid: ctx.auth.uid });
      // 更新角色
      await ctx.service.role.updateRoles(scope, new Map([
        [ 'id', id.toString() ],
        [ 'parentId', parentId.toString() ],
        [ 'permissions', list.map(item => item.permission).join(',') ],
      ]));
      ctx.helper.response.handleSuccess({ ctx, msg: '编辑角色成功' });
    } catch (e) {
      ctx.helper.response.handleError({ ctx, msg: '编辑角色失败' });
    }
  }

  // 添加角色
  public async add() {
    const ctx = this.ctx;
    try {
      const { name, parentId, describe = '', serialNum } = ctx.request.body;
      await ctx.model.Role.create({
        name,
        describe,
        parent_id: parentId,
        serial_num: serialNum,
      });
      await ctx.service.role.updateRedisRole();
      ctx.helper.response.handleSuccess({ ctx, msg: '添加角色成功' });
    } catch (e) {
      ctx.helper.response.handleError({ ctx, msg: '添加角色失败' });
    }
  }

  // 删除角色
  public async delete() {
    const ctx = this.ctx;
    try {
      const { ids } = ctx.request.query;
      await ctx.model.Role.delete({
        [Op.in]: {
          id: ids,
        },
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '删除角色成功' });
    } catch (e) {
      ctx.helper.response.handleError({ ctx, msg: '删除角色失败' });
    }
  }

  // 获取所有的角色Map
  public async getRoleMap() {
    const ctx = this.ctx;
    try {
      // 获取列表
      const allRole = await ctx.model.Role.findAll({ attributes: [ 'id', 'name', 'describe', 'updated_at', 'updated_at', 'serial_num', 'menu_ids' ], order: [[ 'updated_at', 'DESC' ]] });
      // 转换驼峰
      const roleList = allRole.map(ctx.helper.utils.lineToHumpObject);
      // 变成树形结构
      const records = ctx.helper.utils.getTreeByList(roleList, 0);
      // 排序
      const each = (arr: Models.TreeNode[]) => {
        ctx.helper.utils.sort(arr, 'serialNum', 'desc');
        arr.forEach(item => {
          if (item.children) {
            each(item.children);
          }
        });
      };
      each(records);
      // 获取成功
      ctx.helper.response.handleSuccess({ ctx, msg: '获取角色列表成功', data: records });
    } catch (e) {
      ctx.helper.response.handleError({ ctx, msg: '获取角色列表失败' });
    }
  }

  // 编辑权限
  public async editPermission() {
    const ctx = this.ctx;
    try {
      const { ids, roleId } = ctx.request.body;
      await ctx.model.Role.update({ menu_ids: ids.join(',') }, { where: {
        id: roleId,
      } });
      ctx.helper.response.handleSuccess({ ctx, msg: '添加角色成功' });
    } catch (e) {
      ctx.helper.response.handleError({ ctx, msg: '添加角色失败' });
    }
  }
}
