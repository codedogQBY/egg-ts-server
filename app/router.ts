import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router, middleware } = app;
  const verifyToken = middleware.verifyToken(app.config.jwt);

  // 权限相关
  router.get('/', controller.home.index);
  router.post('/api/v1/system/auth/register', controller.user.register);
  router.post('/api/v1/system/auth/sendCodeEmail', controller.user.sendCodeEmail);
  router.post('/api/v1/system/auth/login', controller.user.login);
  router.get('/api/v1/system/auth/logout', controller.user.logout);
  router.get('/api/v1/system/common/code', controller.user.getCode);

  // 用户相关
  router.get('/api/v1/system/user/getUserInfo', verifyToken, controller.user.getUserInfo);
  router.post('/api/v1/system/user/editUserById', verifyToken, controller.user.editUser);
  router.post('/api/v1/system/user/editInfo', verifyToken, controller.user.editUserInfo);
  router.post('/api/v1/system/user/getUserMenu', verifyToken, controller.user.getUserMenu);
  router.post('/api/v1/system/user/list', verifyToken, controller.user.getUserList);
  router.get('/api/v1/system/user/query', verifyToken, controller.user.query);

  // 角色相关
  router.post('/api/v1/system/role/add', verifyToken, controller.role.add);
  router.get('/api/v1/system/role/delete', verifyToken, controller.role.delete);
  router.post('/api/v1/system/role/edit', verifyToken, controller.role.edit);
  router.post('/api/v1/system/role/editPermission', verifyToken, controller.role.editPermission);
  router.get('/api/v1/system/role/getRoleMap', verifyToken, controller.role.getRoleMap);
  router.post('/api/v1/system/role/list', verifyToken, controller.role.list);

  // 菜单相关
  router.post('/api/v1/system/menu/add', verifyToken, controller.menu.add);
  router.get('/api/v1/system/menu/delete', verifyToken, controller.menu.delete);
  router.post('/api/v1/system/menu/edit', verifyToken, controller.menu.edit);
  router.get('/api/v1/system/menu/getMenuMap', verifyToken, controller.menu.getMenuMap);
  router.post('/api/v1/system/menu/list', verifyToken, controller.menu.list);


};
