const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const TagGroupService = {
  findAll: async (tags = []) => {

    const res = await db.tag.findAll({
      where: {
        'title': {
          [Op.in]: tags
        }
      }
    });

    return res;
  }
}

module.exports = TagGroupService;