import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router, middleware } = app;
  const verifyToken = middleware.verifyToken(app.config.jwt);

  // 权限相关
  router.get('/', controller.home.index);
  router.post('/api/auth/register', controller.user.register);
  router.post('/api/auth/sendCodeEmail', controller.user.sendCodeEmail);
  router.post('/api/auth/login', controller.user.login);
  router.get('/api/auth/logout', controller.user.logout);
  router.get('/api/getCode', controller.user.getCode);

  // 用户相关
  router.get('/api/user/getUserInfo', verifyToken, controller.user.getUserInfo);
  router.post('/api/user/editUserById', verifyToken, controller.user.editUser);
  router.post('/api/user/editUserInfo', verifyToken, controller.user.editUserInfo);
  router.post('/api/user/getUserMenu', verifyToken, controller.user.getUserMenu);
  router.post('/api/user/list', verifyToken, controller.user.getUserList);
  router.get('/api/user/query', verifyToken, controller.user.query);

  // 角色相关
  router.post('/api/role/add', verifyToken, controller.role.add);
  router.get('/api/role/delete', verifyToken, controller.role.delete);
  router.post('/api/role/edit', verifyToken, controller.role.edit);
  router.post('/api/role/editPermission', verifyToken, controller.role.editPermission);
  router.get('/api/role/getRoleMap', verifyToken, controller.role.getRoleMap);
  router.post('/api/role/list', verifyToken, controller.role.list);

  // 菜单相关
  router.post('/api/menu/add', verifyToken, controller.menu.add);
  router.get('/api/menu/delete', verifyToken, controller.menu.delete);
  router.post('/api/menu/edit', verifyToken, controller.menu.edit);
  router.get('/api/menu/getMenuMap', verifyToken, controller.menu.getMenuMap);
  router.post('/api/menu/list', verifyToken, controller.menu.list);


};
