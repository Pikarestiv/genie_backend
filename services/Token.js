const Sequelize = require('sequelize');
const db = require('../models');
const uuidv4  = require('uuid/v4');

const TokenService = {

  createAll: async ({data}) => {
    try {
      await db.token
        .bulkCreate(
          data.map(token => ({title: token, id: uuidv4()})), 
          {ignoreDuplicates: true}
        )
        .catch(err => {throw err;});
        
      const res = 
        await db.token
          .findAll({ where: {title: {[Sequelize.Op.in]: data}}})
          .catch(err => {throw err;});

      return {
        success: true,
        data: res
      };
      
    } catch(err) {
      console.error('err: ', err);
      return {
        success: false,
        error: "Invalid data provided."
      }
    }
  } 
}

module.exports = TokenService;