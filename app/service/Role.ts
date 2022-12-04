import { Service } from 'egg';
import { Account } from '../type/account';
import { Menu } from '../type/menu';
import { Role } from '../type/role';
import { Op } from 'sequelize';

export default class RoleService extends Service {

  // 获取用户权限
  async getUserPermission(decode: Account.Decode): Promise<Menu.Menu[]> {
    const ctx = this.ctx;
    const { scope } = decode;
    // 查询id对应的角色的菜单id
    const res = await ctx.model.Role.findOne({ attributes: [ 'menu_ids' ], where: { id: scope } });
    // 查询菜单各个菜单id对应的权限
    const menuList = await ctx.model.Menu.findAll({ attributes: [ 'permission' ], [Op.in]: { id: res.menu_id.split(',') } });
    // 返回权限
    return menuList || [];
  }

  // 获取所有角色权限列表
  async getAllRolePermission() {
    const ctx = this.ctx;
    const res = ctx.model.Role.findAll({ attributes: [ 'id', 'menu_ids', 'parent_id', 'name' ] });
    const RoleList: Role.Role[] = [];
    for (const item of res) {
      RoleList.push({
        id: item.id,
        menuList: await ctx.service.role.getUserPermission({ scope: String(item.id), uid: 0 }),
        name: item.name,
        parentId: item.parentId,
      });
    }
    return RoleList;
  }

  // 更新redis角色
  async updateRedisRole() {
    const ctx = this.ctx;
    const roleList = await ctx.service.role.getAllRolePermission();
    for (const role of roleList) {
      if (role.menuList.length) {
        await ctx.service.role.updateRoles((role.id || '').toString(), new Map([
          [ 'id', role.id.toString() ],
          [ 'parentId', role.parentId.toString() ],
          [ 'permissions', role.menuList.map((item: { permission: string }) => item.permission).join(',') ],
        ]));
      }
    }
  }

  // 更新权限
  async updateRoles(roleId: string, obj: Map<string, string>) {
    const app = this.app;
    await app.redis.get('auth').del(roleId);
    await app.redis.get('auth').hmset(roleId, obj);
  }
}
