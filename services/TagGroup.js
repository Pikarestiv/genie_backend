const db = require('../models');
const Sequelize = require('sequelize');

const TagGroupService = {
  getAll: async (params = {}) => {
    const {withTags = false} = params;
    let tagGroups = [];
    
    if (withTags) {
      await db.tag_group.findAll({
        include: [
          {
            model: db.tag,
            as: 'tag'
          }
        ]
      })
        .then(data => tagGroups = data);
    } else {
      await db.tag_group.findAll()
        .then(data => tagGroups = data);
    }
    
    for (let i = 0; i < tagGroups.length; i++) {
      tagGroups[i] = tagGroups[i].dataValues;
    }

    return tagGroups;
  }
}

module.exports = TagGroupService;