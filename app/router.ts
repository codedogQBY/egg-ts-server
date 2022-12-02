import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router, middleware } = app;
  const verifyToken = middleware.verifyToken(app.config.jwt);


  router.get('/', controller.home.index);
  router.post('/api/register', controller.user.register);
  router.post('/api/sendCodeEmail', controller.user.sendCodeEmail);
  router.post('/api/login', controller.user.login);
  router.get('/api/getCode', controller.user.getCode);
  router.get('/api/getUserInfo', verifyToken, controller.user.getUserInfo);
};
