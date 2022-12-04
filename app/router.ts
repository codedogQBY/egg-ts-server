import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router, middleware } = app;
  const verifyToken = middleware.verifyToken(app.config.jwt);


  router.get('/', controller.home.index);
  router.post('/api/user/register', controller.user.register);
  router.post('/api/user/sendCodeEmail', controller.user.sendCodeEmail);
  router.post('/api/user/login', controller.user.login);
  router.get('/api/getCode', controller.user.getCode);
  router.get('/api/user/getUserInfo', verifyToken, controller.user.getUserInfo);
};
