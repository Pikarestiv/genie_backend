const Router = require('koa-router');
const TagGroupService = require('../services/TagGroup');
const BASE_URL = '/tag_group';


module.exports = router => {

  // GET TAG GROUPS WITH TAGS
  router.get(`${BASE_URL}`, async ctx => {
    try {
      const res = await TagGroupService.getAll({withTags: true});

      ctx.body = res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  return router;
}