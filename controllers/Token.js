const Router = require('koa-router');
var koaBody = require('koa-body');

const TokenService = require('../services/Token');
const BASE_URL = '/token';


module.exports = router => {

  // CREATE NEW TOKENS
  router.post(`${BASE_URL}/all`, koaBody(), async ctx => {
    try {
      const res = await TokenService.createAll(ctx.request.body);
      ctx.body = res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  return router;
};