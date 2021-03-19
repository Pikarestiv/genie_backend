const db = require('../models');
const Sequelize = require('sequelize');

const TagGrantService = {
  connectGrantsToTags: async (grants, tagGroups) => {
    
    for (let i = 0; i < grants.length; i++) {
      let grant = grants[i];
      grant.tags = {};

      for (let j = 0; j < tagGroups.length; j++) {
        let tagGroup = tagGroups[j];
        let tags = [];
  
        await db.tag_grant.findAll({
          attributes: ['tag.title'],
          where: {
            grantId: grant.id
          },
          include: [
            {
              model: db.tag,
              where: {
                tagGroupId: tagGroup.id
              }
            }
            
          ]
        }).then(data => tags = data);
  
        for (let k = 0; k < tags.length; k++) {
          tags[k] = tags[k].dataValues.tag.dataValues.title;
        }
  
        grant.tags[tagGroup.title] = tags.join(', ');
      }
    }

    return grants;
  }
}

module.exports = TagGrantService;