const Sequelize = require('sequelize');
const db = require('../models');
const TagGroupService = require('./TagGroup');
const TagGrantService = require('./TagGrant');
const uuidv4  = require('uuid/v4');
const Op = Sequelize.Op;

const GrantService = {
  getAll: async (params = {}) => {
    const {
      withBody = false,
      withRawPrices = false,
      withTags = true,
      title = '',
      body = '',
      units = '',
      minPrice,
      tags = [],
      maxPrice
    } = params;
    let grants = [];
    let tagGroups = await TagGroupService.getAll();

    await db.grant.findAll({
      attributes: 
        [
          ...[
            'id', 'title', 'web_link', 'parsed_price', 'parsed_units'
          ],
          ...(withRawPrices ? ['raw_price'] : []),
          ...(withBody ? ['body'] : [])
        ],
      where: {
        ...{
          body: {
            [Op.like]: `%${body}%`
          },
          title: {
            [Op.like]: `%${title}%`
          },
        },
        ...(minPrice && maxPrice ?{parsed_price: {
            [Op.gte]: minPrice,
            [Op.lte]: maxPrice
          }} : {}),
        ...(units.length ? {parsed_units: {[Op.eq]: units}} : {})
      },
      include: {
        model: db.tag_grant,
        as: 'tag_grant',
        where: {
          ...(tags.length ? { tagId: {
            [Op.in]: tags
          } } : {})
        }
      }
    })
      .then(data => grants = data);
    
    for (let i = 0; i < grants.length; i++) {
      grants[i] = grants[i].dataValues;
    }
    grants.sort((a,b) => a.tag_grant.length > b.tag_grant.length ? -1 : 1);

    if (withTags) {
      grants = TagGrantService.connectGrantsToTags(grants, tagGroups);
    }
    
    return grants;
  },

  getById: async (params = {}) => {
    const {id = 0} = params;
    let res = null;

    await db.grant.findAll({
      where: {
        id
      }
    })
      .then(data => res = data);

    if (res[0] && res[0].dataValues) {
      const tagGroups = await TagGroupService.getAll()
      res = await TagGrantService.connectGrantsToTags([res[0].dataValues], tagGroups);

      return res;
    }

    return null;
  },

  getPrices: async() => {
    let res = {};

    await db.grant.findAll({
      attributes: [
        [Sequelize.fn('MAX', Sequelize.col('parsed_price')), 'max_price'],
        [Sequelize.fn('MIN', Sequelize.col('parsed_price')), 'min_price']
      ],
      where: {
        parsed_price: {
          [Op.ne]: null
        }
      }
    }).then(data => res = data);

    return res;
  },

  getUnits: async() => {
    let res = [];

    await db.grant.findAll({
      attributes: [
        'parsed_units'
      ],
      where: {
        parsed_units: {
          [Op.ne]: null
        }
      }
    }).then(data => res = data);
    
    res = res.reduce((arr, x) => arr.indexOf(x.parsed_units) > -1 ? arr : [...arr, x.parsed_units] , []);
    return res;
  },

  create: async(data = {}) => {
    const {title = '', body = '', web_link = '', tags = [], units = '', source} = data;
    let res = {};
    
    await db.grant.create({
      id: uuidv4(),
      title,
      body,
      units,
      web_link,
      source
    })
      .then(data => res = data.dataValues);

    for (let i = 0; i < tags.length; i++) {
      await db.tag_grant.create({
        id: uuidv4(),
        tagId: tags[i].id,
        grantId: res.id
      });
    }

    return res;
  },

  deleteOutdated: async (newGrants = [], source = '') => {

    const res = await db.grant.destroy({
      where: {
        id: {
          [Op.notIn]: newGrants
        },
        source: {
          [Op.eq]: source
        }
      }
    });
    
    return res;
  },

  getGrantsForUser: async (user, tags) => {

    const res = await db.grant.findAll({
      where: {
        '$user_received_grant.grantId$': {
          [Op.eq]:  null
        },
        '$tag_grant->tag.title$': {
          [Op.not]: null
        }
      },
      include: [
        {
          model: db.tag_grant,
          as: 'tag_grant',
          include: {
            model: db.tag,
            as: 'tag',
            where: {
              '$tag_grant->tag.title$': {
                [Op.in]: [...tags]
              }
            }
          }
        },
        {
          model: db.user_received_grant,
          as: 'user_received_grant',
          where: {
            userId: user.id
          },
          required: false
        },
      ]
    });
    
    console.log('res: ', res.length);
    return res;
  }
}

module.exports = GrantService;