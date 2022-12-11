import { Controller } from 'egg';
import { Op } from 'sequelize';
import { Models } from '../type/model';
import { Menu } from '../type/menu';

export default class MenuController extends Controller {
  async add() {
    const ctx = this.ctx;
    try {
      const { type, name, parentId, path = '', icon, serialNum, show, component = '', permission } = ctx.request.body;
      await ctx.model.Menu.create({ name, parent_id: parentId, path, icon, type, serial_num: serialNum, show, component, permission });
      await ctx.service.role.updateRedisRole();
      ctx.helper.response.handleSuccess({ ctx, msg: '添加菜单成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '添加菜单失败' });
    }
  }

  async delete() {
    const ctx = this.ctx;
    try {
      const { ids } = ctx.request.query;
      const idList = ids
      await ctx.model.Menu.destroy({
          where: {
            id: {
              [Op.in]: idList,
            },
          },
      });
      await ctx.service.role.updateRedisRole();
      ctx.helper.response.handleSuccess({ ctx, msg: '删除菜单成功' });
    } catch (e) {
      console.error(e); 
      ctx.helper.response.handleError({ ctx, msg: '删除菜单失败' });
    }
  }

  async edit() {
    const ctx = this.ctx;
    try {
      const {
        id,
        type,
        name,
        parentId,
        path = '',
        icon,
        serialNum,
        show,
        component = '',
        permission = '',
      } = ctx.request.body;
      await ctx.model.Menu.update({
        name, type, parent_id: parentId, path, icon, serial_num: serialNum, show, component, permission,
      }, {
        where: {
          id,
        },
      });
      await ctx.service.role.updateRedisRole();
      ctx.helper.response.handleSuccess({ ctx, msg: '更新菜单成功' });
    } catch (e) {
      console.error(e); 
      ctx.helper.response.handleError({ ctx, msg: '更新菜单失败' });
    }
  }

  // async getMenuByRoleId() {
  //   const ctx = this.ctx;
  //   try {
  //     const { id } = ctx.request.query;
  //     const res = (await ctx.model.Role.findAll({
  //       attributes: [ 'permissions', 'id' ],
  //       order: [[ 'updated_at', 'DESC' ]],
  //       where: {
  //         id,
  //       },
  //     }));
  //     const data = res
  //   } catch (e) {
  //
  //   }
  // }
  async getMenuMap() {
    const ctx = this.ctx;
    try {
      const res = (await ctx.model.Menu.findAll({
        attributes: [ 'permission', 'id', 'name', 'updated_at', 'parent_id', 'show', 'icon', 'serial_num', 'component', 'type' ],
        order: [[ 'updated_at', 'DESC' ]],
      }));
      const data = res.map((item)=>ctx.helper.utils.lineToHumpObject(item)) as Menu.Menu[];
      const records = ctx.helper.utils.getTreeByList(data, 0);
      const each = (arr: Models.TreeNode[]) => {
        ctx.helper.utils.sort(arr, 'serialNum', 'desc');
        arr.forEach(item => {
          if (item.children) {
            each(item.children);
          }
        });
      };
      each(records);
      ctx.helper.response.handleSuccess({ ctx, msg: '获取菜单map成功', data: records });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '获取菜单map失败' });
    }
  }

  async list() {
    const ctx = this.ctx;
    try {
      const {
        pageNum,
        pageSize,
      } = ctx.request.body as unknown as Models.BasePaginationQuery;
      const res = (await ctx.model.Menu.findAll({
        attributes: [ 'permission', 'id', 'name', 'updated_at', 'parent_id', 'show', 'icon', 'serial_num', 'component', 'type','path' ],
        order: [[ 'updated_at', 'DESC' ]],
      }));
      const data = res.map((item)=>ctx.helper.utils.lineToHumpObject(item)) as Menu.Menu[];
      const records = ctx.helper.utils.getTreeByList(data, 0);
      const total: number = records.length;
      if (pageNum > 1) {
        records.splice((pageNum - 1) * pageSize, pageSize);
      }
      const each = (arr: Models.TreeNode[]) => {
        ctx.helper.utils.sort(arr, 'serialNum', 'desc');
        arr.forEach(item => {
          if (item.children) {
            each(item.children);
          }
        });
      };
      each(records);
      const result = ctx.helper.utils.getPagination(records, total, pageSize, pageNum);
      ctx.helper.response.handleSuccess({ ctx, msg: '获取菜单map成功', data: result });
    } catch (e) {
      console.error(e); 
      ctx.helper.response.handleError({ ctx, msg: '获取菜单列表失败' });
    }
  }
}
