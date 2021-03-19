const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');

// Collect grants data every * time
const {cronCollect} = require('./utils/govuk_collect');
const UserService = require('./services/User');

// UserService.regularEmailUpdate();
cronCollect();

const koa = new Koa();
let app = new Router();

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Total-Count, access-control-allow-headers, access-control-expose-headers, Content-Range, Source');
  ctx.response.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range, Source');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  return next();
});

const grantController = require('./controllers/Grant');
const tagGroupsController = require('./controllers/TagGroups');
const userController = require('./controllers/User');
const tokenController = require('./controllers/Token');


app = grantController(app);
app = tagGroupsController(app);
app = userController(app);
app = tokenController(app);

koa.use(app.routes());
koa.listen(3010);
console.log("Listening on port 3010");