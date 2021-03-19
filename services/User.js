const Sequelize = require('sequelize');
const db = require('../models');
const uuidv4  = require('uuid/v4');
const CronJob = require('cron').CronJob;

const GrantService = require('./Grant');
const TagService = require('./Tag');
const { sendInitialEmail, sendRegularUpdate } = require('../utils/mail');

const UserService = {

  create: async ({email, postcode, land_size, land_use}) => {

    const [{dataValues: res}, created] = await db.user.findOrCreate(
      {
        where: {
          postcode
        },
        defaults: {
          id: uuidv4(),
          postcode,
          email,
          land_size
        }
      }
    );

    if (!created) {
      return {
        success: false,
        error: 'User with this postcode already exist.'
      };
    }

    const tags = await TagService.findAll(land_use);

    db.user_tag.bulkCreate(
      tags.map(tag => ({userId: res.id, tagId: tag.dataValues.id, id: uuidv4()})), 
      {ignoreDuplicates: true}
    );

    let grants = await GrantService.getGrantsForUser(res, land_use);
    grants = grants.slice(0, 10).map(grant => ({id: grant.id, title: grant.title}));
    
    if (grants.length > 0) {
      db.user_received_grant.bulkCreate(
        grants.map(grant => ({userId: res.id, grantId: grant.id, id: uuidv4()})),
        {ignoreDuplicates: true}
      );

      sendInitialEmail({
        email: res.email,
        user_id: res.id,
        grants: grants
      });
    }

    return {
      success: true,
      data: {
        user: res,
        grants: grants
      }
    };
  },

  regularEmailUpdate: () => {
    new CronJob('20 01 * * */1', async function() {
      console.log('Regular users email updates...');

      let users = await db.user.findAll({
        include: {
          model: db.user_tag,
          as: 'user_tag',
          include: {
            model: db.tag,
            as: 'tag'
          }
        }
      });
      
      users = users
        .map(user => 
          ({
            ...user,
            tags_list: user.user_tag.reduce((tags, user_tag) => [...tags, user_tag.tag.title], [])
          })
        );
  
      for (const i in users) {
        const user = {...users[i].dataValues, tags_list: users[i].tags_list};
        let grants = await GrantService.getGrantsForUser(user, user.tags_list);
        grants = grants.slice(0, 10).map(grant => ({id: grant.id, title: grant.title}));
  
        if (grants.length > 0) {
          db.user_received_grant.bulkCreate(
            grants.map(grant => ({userId: user.id, grantId: grant.id, id: uuidv4()})),
            {ignoreDuplicates: true}
          );
      
          sendRegularUpdate({
            email: user.email,
            user_id: user.id,
            grants: grants
          });
        }
      }

      console.log('Regular users email updates finished.');
    });
  },

  getUserById: async (user_id) => (await db.user.findByPk(user_id)).dataValues,

  interested: async (user_id, positive, tokens) => {
    try {
      const data = tokens.reduce(
        (arr, token) => 
        [
          ...arr,
          {
            id: uuidv4(),
            tokenId: token.id,
            userId: user_id,
            interested: positive
          }
        ], 
        []
      );
      
      const res = 
        await db.user_token
          .bulkCreate(
            data, 
            {ignoreDuplicates: true}
          )
          .catch(err => {throw err;});
      
      return {
        success: true,
        data: res
      };

    } catch (err) {
      console.error('err: ', err);
      return {
        success: false,
        error: "Invalid params provided."
      }
    }
  },

  isPostCodeAvailable: async (postcode) => {
    const res = await db.user.findAll({
      where: {
        postcode
      }
    });
    console.log('res: ', res);

    return {
      success: true,
      data: {
        free: res.length === 0
      }
    }
  }
}

module.exports = UserService;