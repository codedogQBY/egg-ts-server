import { Controller } from 'egg';
import { Op,QueryTypes } from 'sequelize';
import svgCaptcha from 'svg-captcha';
import { Account } from '../type/account';
import { Menu } from '../type/menu';
import { Models } from '../type/model';
/**
 * @Controller user
 */

interface MenuList extends Account.User {
  roleParentId: number
  menuId: number
  roleName: string
  roleId: number
  menuName: string
  menuType: Menu.MenuType
  serialNum: number
  show: 0 | 1
  menuParentId: number
  menuPermission: string
}

interface Permissions {
  name: string
  roleId: number
  id: number
  menuType: Menu.MenuType
  show: number
  parentId: number
  serialNum: number
  permission: string
  actions: Account.Action[]
}

export default class UserController extends Controller {
  /**
     * @summary 用户注册
     * @Description 用户注册接口
     * @Router POST /api/register
     * @Request body registerRequest *body
     * @Response 200 registerResponse ok
     */
  public async register() {
    const ctx = this.ctx;
    try {
      const { password, userName, email, code } = ctx.request.body as { password: string, userName: string, email: string, code: string };
      const { bool, msg } = await ctx.service.user.checkUserNameAndEmail(userName, email);
      if (!bool) {

        if (+code !== +ctx.session?.code) {
          ctx.helper.response.handleError({ ctx, msg: '验证码错误' });
          return;
        }
        await ctx.model.User.create({
          password, user_name: userName, email,
        });
        ctx.helper.response.handleSuccess({ ctx, msg: '注册成功' });
      } else {
        ctx.helper.response.handleError({ ctx, msg });
      }

    } catch (error) {
      console.error(error);
      ctx.helper.response.handleError({ ctx, msg: '用户注册失败' });
    }
  }


  /**
     * @summary 获取注册验证码
     * @Description 获取注册验证码
     * @Router POST /api/sendCodeEmail
     * @Request body sendCodeEmailRequest *body
     * @Response 200 sendCodeEmailResponse ok
     */
  public async sendCodeEmail() {
    const ctx = this.ctx;
    try {
      const { email, userName } = ctx.request.body as { userName: string, email: string };
      const { bool, msg } = await ctx.service.user.checkUserNameAndEmail(userName, email);
      if (!bool) {
        ctx.helper.response.handleError({ ctx, msg });
      }
      const code = (Math.random() * 1000000).toFixed();
      // 在会话中添加验证码字段code
      ctx.session!.code = code;
      // 发送邮件
      ctx.helper.mail.sendMail({
        to: email,
        subject: '验证码',
        text: '验证码',
        html: `
                <div >
                    <p>您正在注册智能营销平台帐号，用户名<b>${userName}</b>，
                    验证邮箱为<b>${email}</b> 。
                    验证码为：</p>
                    <p style="color: green;font-weight: 600;margin: 0 6px;text-align: center; font-size: 20px">
                      ${code}
                    </p>
                    <p>请在注册页面填写该改验证码</p>
                    <p>若不是您所发，请忽略</p>
                </div>
            `,
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '邮件发送成功' });
    } catch (error) {
      console.log(error);
      ctx.helper.response.handleError({ ctx, msg: '邮件发送失败' });
    }
  }

  /**
     * @summary 用户登录
     * @Description 用户登录接口
     * @Router POST /api/login
     * @Request body loginRequest *body
     * @Response 200 loginResponse ok
     */
  public async login() {
    const ctx = this.ctx;
    try {
      const { userName, password, code } = ctx.request.body as { userName: string, password: string, code:string};
      const loginCode = ctx.session!.loginCode;
      if (code !== loginCode) {
        ctx.helper.response.handleError({ ctx, msg: '验证码错误', data: false });
      }
      const user = await ctx.model.User.findOne({ [Op.and]: { userName, deleted: 0 } });
      if (user === null) {
        ctx.helper.response.handleError({ ctx, msg: '该用户不存在', data: false });
      } else {
        if (user.password !== password) {
          ctx.helper.response.handleError({ ctx, msg: '密码错误', data: false });
        }
        const token = await ctx.service.user.generateToken(user.id, user.role_ids);
        await ctx.service.user.saveToken(token, user.id);
        ctx.helper.response.handleSuccess({ ctx, msg: '登录成功', data:  token  });
      }
    } catch (error) {
      console.error(error);
      ctx.helper.response.handleError({ ctx, msg: '未知错误' });
    }
  }


  /**
     * @summary 获取图形码
     * @Description 获取图形吗接口
     * @Router GET /api/getCode
     * @Request body getCodeRequest *body
     * @Response 200 getCodeResponse ok
     */
  public async getCode() {
    const ctx = this.ctx;
    const captcha: svgCaptcha.CaptchaObj = svgCaptcha.create({
      size: 4, // 验证码长度
      fontSize: 45, // 验证码字号
      ignoreChars: '0o1i', // 过滤掉某些字符， 如 0o1i
      noise: 3, // 干扰线条数目
      width: 100, // 宽度
      color: true,
    });
    ctx.session!.loginCode = captcha.text; // 把验证码赋值给session
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
  }

  /**
     * @summary 获取用户信息
     * @Description 获取用户信息接口
     * @Router GET /api/getUserInfo
     * @Request body getUserInfoRequest *body
     * @Response 200 getUserInfoResponse ok
     */
  public async getUserInfo() {
    const ctx = this.ctx;
    try {
      const { uid } = ctx.auth;
      const user = await ctx.model.User.findOne({ attributes: [ 'user_name', 'role_ids', 'info', 'id' ], [Op.and]: { id: uid, deleted: 0 } });
      ctx.helper.response.handleSuccess({ ctx, msg: '查询用户信息成功', data: { user } });
    } catch (error) {
      console.error(error);
      ctx.helper.response.handleError({ ctx, msg: '查询用户信息失败' });
    }
  }

  async logout() {
    const ctx = this.ctx;
    try {
      const token = ctx.header.authorization || ctx.cookies.get('authorization') || '';
      await ctx.app.redis.get('auth').del(token);
      ctx.helper.response.handleSuccess({ ctx, msg: '退出登录成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '退出登录失败' });
    }
  }

  // 更新用户
  async editUser() {
    const ctx = this.ctx;
    try {
      const { nickName, profile = '', avatar, roleId, id } = ctx.request.body;
      const info = {
        nickName,
        profile,
        avatar,
      };
      await ctx.model.User.update({
        info: JSON.stringify((info)),
        role_id: roleId,
      }, {
        where: {
          id,
        },
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '更新用户信息成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '更新用户信息失败' });
    }
  }

  // 更新用户详情
  async editUserInfo() {
    const ctx = this.ctx;
    try {
      const id = ctx.auth?.uid;
      const { nickName, profile = '', avatar } = ctx.request.body;
      const info = {
        nickName,
        profile,
        avatar,
      };
      await ctx.model.User.update({
        info: JSON.stringify((info)),
      }, {
        where: {
          id,
        },
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '更新用户信息成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '更新用户信息失败' });
    }
  }

  // 获取当前用户菜单
  async getUserMenu() {
    const ctx = this.ctx;
    try {
      const { scope: roleIds } = ctx.auth;
      let roleRes = await (ctx.model.Role.findAll()) as Account.Role[]
      roleRes = roleRes.map(item => ctx.helper.utils.lineToHumpObject(item))as Account.Role[]
      // 存放当前用户的角色和祖宗角色
      const roleList: Account.Role[] = [];
      // 过滤, 获取当前角色及当前角色的祖先角色的所有记录
      const each = (list: Account.Role[], nodeId: number) => {
        const arr = list.filter(item => item.id === nodeId);
        if (arr.length) {
          roleList.push(...arr);
          each(list, arr[0].parentId);
        }
      };

      // 将用户的角色ids转换为数组
      const roleIdList: number[] = roleIds.split(',').map((str: string) => Number(str));
      roleIdList.forEach(roleId => {
        each(roleRes, roleId);
      });      

      // 当前角色的角色树
      const roleTree = ctx.helper.utils.getTreeByList(roleList, 0) as unknown as Account.Role[];
      // 当前角色有权限的所有菜单.
      let menuList: number[] = [];
      const merge = (list: Account.Role[]) => {
        list.forEach(item => {
          menuList = [ ...new Set([ ...menuList, ...item.menuIds.split(',').map(str => Number(str)) ]) ];
          if (item.children) {
            merge(item.children);
          }
        });
      };
      // 合并当前角色和当前角色的祖先角色的所有菜单
      merge(roleTree);
      
      
      // roleId 字段，角色，与权限相关
      let res = await ctx.model.Menu.findAll({
        attributes: [ 'id', 'name', 'show', 'icon', 'component', 'redirect', 'parent_id', 'path', 'hide_children', 'serial_num', 'permission', 'type' ],
        where:{
          id: {
            [Op.in]: menuList
          },
        },
      });
      const sortEach = (arr: Menu.Menu[]) => {
        ctx.helper.utils.sort(arr, 'serialNum', 'desc');
        arr.forEach(item => {
          if (item.children) {
            sortEach(item.children);
          }
        });
      };
      // 根据serialNum排序
      sortEach(res);
      // 构建前端需要的menu树
      
      const list = (res as Menu.Menu[]).map(
        (item) => {
          const {
            parent_id:parentId,
            id,
            icon,
            show,
            component,
            redirect,
            path,
            hide_children:hideChildren,
            children,
            serial_num:serialNum,
            permission,
            type,
            name
          } = item
          
          const isHideChildren = Boolean(hideChildren);
          const isShow = Boolean(show);
          return {
            name,
            parentId,
            id,
            meta: {
              icon,
              title:name,
              show: isShow,
              hideChildren: isHideChildren,
            },
            component,
            redirect,
            path,
            children,
            serialNum,
            permission,
            type,
          };
        },
      );

      ctx.helper.response.handleSuccess({ ctx, msg: '获取当前用菜单成功', data: list });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '获取当前用户菜单失败' });
    }
  }


  // 获取用户列表
  async getUserList() {
    const ctx = this.ctx;
    try {
      const { pageNum, pageSize,params } = ctx.request.body as unknown as Models.BasePaginationQuery;
      const { name } = params;
      // 聚合查询
      const res = await ctx.model.query(`
      SELECT
        user.id,
        user.info,
        user.updated_at,
        user.email,
        user.user_name,
        user.role_ids roleIds,
        role.name roleNames
      FROM
        users as user,
        roles as role
      WHERE
        user.deleted = 0 
        ${name ? `AND user.user_name = ${`"${name}"`}` : ''}
      AND
        FIND_IN_SET(role.id , user.role_ids)
        LIMIT ${pageNum-1}, ${pageSize}`,{ type: QueryTypes.SELECT }) as Account.User[];
      const total = ctx.model.User.findAll().length;
      const list: Account.User[] = [];
      for (const key in res) {
        list.push(res[key]);
      }
      const data = ctx.helper.utils.getPagination(
        list.map(item => {
          // @ts-ignore
          item.info = JSON.parse(item.info || "{}")
          return ctx.helper.utils.lineToHumpObject(item);
        }),
        total,
        pageSize,
        pageNum,
      );
      ctx.helper.response.handleSuccess({ ctx, msg: '获取用户列表成功', data });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '获取用户列表失败' });
    }
  }

  async query() {
    const ctx = this.ctx;
    try {
      const { uid } = ctx.auth;
      const allMenuList = (await ctx.model.query(`
    SELECT
        user.user_name,
        user.email,
        user.info infoStr,
        user.deleted,
        role.name roleName,
        role.id roleId,
        role.menu_ids,
        role.parent_id roleParentId,
        menu.name menuName,
        menu.id menuId,
        menu.type menuType,
        menu.show,
        menu.serial_num,
        menu.parent_id menuParentId,
        menu.permission menuPermission
    FROM
         users user,
         roles role,
         menus menu
    WHERE
        user.id = ${uid}
        AND FIND_IN_SET(role.id , user.role_ids)
        AND FIND_IN_SET(menu.id , role.menu_ids)
  `,{ type: QueryTypes.SELECT }) as MenuList[]).map(item => {
    
        item.info = JSON.parse(item.infoStr || '{}');
        return {
          ...item,
        };
      });
      // 上面的查询会有重复, 过滤重复数据
      const filterMenuList: MenuList[] = [];
      allMenuList.forEach((element: MenuList) => {
        const info: Account.UserInfo = JSON.parse(element.infoStr || '{}');
        const data = filterMenuList.find(
          item =>
            info.nickName === item.info.nickName && element.roleIds === item.roleIds && element.menuId === item.menuId,
        );
        if (!data) {
          filterMenuList.push(element);
        }
      });

      const { info, roleName, userName, roleId, email } = allMenuList[0];

      // 将数据转换为前端需要的数据结构
      const menuList: Permissions[] = filterMenuList.map(item => {
        return {
          roleId: item.roleId,
          roleName: item.roleName,
          id: item.menuId,
          menuType: item.menuType,
          name: item.menuName,
          show: item.show,
          serialNum: item.serialNum,
          actions: [],
          parentId: item.menuParentId,
          permission: item.menuPermission,
        };
      });

      // 获取所有的操作(即按钮)
      const allActions: Permissions[] = menuList.filter(item => item.menuType === 3);
      // 获取所有的菜单目录和菜单
      const allMenu: Permissions[] = menuList.filter(item => item.menuType === 1 || item.menuType === 2) || [];

      // 根据parentId给菜单添加操作
      allMenu.forEach(menu => {
        menu.actions = allActions
          .filter(item => item.parentId === menu.id)
          .map(item => {
            return {
              id: item.id,
              serialNum: item.serialNum,
              permission: item.permission,
            };
          });
      });

      const userInfo = {
        userName,
        email,
        info,
        role: {
          roleName,
          roleId,
          permissions: allMenu,
        },
      };

      ctx.helper.response.handleSuccess({ ctx, msg: '获取用户信息成功', data: userInfo });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '获取用户信息失败' });
    }
  }
}
