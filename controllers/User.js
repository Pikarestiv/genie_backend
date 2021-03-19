const Router = require('koa-router');
var koaBody = require('koa-body');

const UserService = require('../services/User');
const TokenService = require('../services/Token');

const BASE_URL = '/user';


module.exports = router => {

  // CREATE NEW USER
  router.post(`${BASE_URL}`, koaBody(), async ctx => {
    try {
      const res = await UserService.create(ctx.request.body);
      ctx.body = res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  router.get(`${BASE_URL}/postcode/:slug`, async ctx => {
    try {
      const {slug} = ctx.params;
      const res = await UserService.isPostCodeAvailable(slug);

      ctx.body = res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  // ADD INTEREST/NOT INTEREST
  router.post(`${BASE_URL}/interested`, koaBody(), async ctx => {

    try {
      const {user_id, positive, tokens} = ctx.request.body;
      const filledTokens = await TokenService.createAll({data: tokens});
      const user = await UserService.getUserById(user_id);
      
      if (!user) {
        return ctx.body = {
          success: false,
          error: "User not exist."
        };
      }

      if (!filledTokens.success) {
        throw "Invalid tokens format provided."
      }

      const res = await UserService.interested(user_id, positive, filledTokens.data);

      ctx.body = {
        data: res,
        success: true
      };
    } catch (err) {
      ctx.body = {
        success: false,
        error: err
      }
    }
  });

  return router;
};