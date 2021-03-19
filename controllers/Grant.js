const Router = require('koa-router');
var koaBody = require('koa-body');

const GrantService = require('../services/Grant');
const UserSearchService = require('../services/UserSearch');
const BASE_URL = '/grant';

module.exports = router => {

  // GET ALL
  router.get(`${BASE_URL}`, async ctx => {
    try {
      const {query = {} } = ctx;
      const {title = '', body = '', units = '', tags = [], minPrice, maxPrice, ip} = query;
      const searchAllowed = await UserSearchService.incrementSearch(ip);
      let res = [];
      if (searchAllowed) {
        res = await GrantService.getAll(
            {
              ...{
                withRawPrices: true, withBody: true, withTags: false,
                title, body, minPrice, maxPrice, units,
              },
              ...(tags && tags.length > 0 ? {tags: JSON.parse(tags)} : {})
            }
        );
      }
      ctx.body = {
        searchAllowed: searchAllowed,
        items: res
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  // GET BY ID
  router.get(`${BASE_URL}/:id`, async ctx => {
    try {
      const {id} = ctx.params;
      const res = await GrantService.getById({id});

      ctx.body = {data: res};
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  // GET MIN AND MAX PRICES
  router.get(`${BASE_URL}/all/prices`, async ctx => {
    try {
      const res = await GrantService.getPrices();

      ctx.body = res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  // GET ALL UNITS
  router.get(`${BASE_URL}/all/units`, async ctx => {
    try {
      const res = await GrantService.getUnits();

      ctx.body = res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  // CREATE NEW GRANT
  router.post(`${BASE_URL}`, koaBody(), async ctx => {
    try {
      console.log('body: ', ctx.request.body );
      const res = await GrantService.create(JSON.parse(ctx.request.body));
      ctx.body = {
        data: res
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  return router;
}
