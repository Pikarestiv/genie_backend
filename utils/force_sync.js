const db = require('../models');

force_sync();

async function force_sync() {
  await db.grant.sync({force: true});
  console.log('Grant synced');
  await db.tag_group.sync({force: true});
  console.log('TagGroup synced');
  await db.tag.sync({force: true});
  console.log('Tag synced');
  await db.tag_grant.sync({force: true});
  console.log('Tag synced');
  await db.user.sync({force: true});
  console.log('User synced.');
  await db.token.sync({force: true});
  console.log('Token synced.');
  await db.user_token.sync({force: true});
  console.log('User Token synced.'); 
  await db.user_received_grant.sync({force: true});
  console.log('User Received Grant synced.'); 
  await db.user_tag.sync({force: true});
  console.log('User Tags synced.');   
  await db.userSearchCount.sync({force: true});
  console.log('User Search Count synced.'); 
}
