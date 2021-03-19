const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const maxCountOfSearches = 4;

const UserSearchService = {
    findAll: async () => {

        const res = await db.userSearchCount.findAll();

        return res;
    },
    incrementSearch: async (ip) => {
        const currentIPSearches = await db.userSearchCount.findOrCreate({ where: {ip : ip}})
        let count = currentIPSearches[0].dataValues.count;
        if (count < maxCountOfSearches) {
            await db.userSearchCount.update({count: ++count}, {where: {ip: ip}});
            return true
        }
        return false
    }
}

module.exports = UserSearchService;
