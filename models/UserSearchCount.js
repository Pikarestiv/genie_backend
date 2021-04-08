
module.exports = (sequelize, DataTypes) => {
    const UserSearchCount = sequelize.define('userSearchCount', {
        ip: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        count: {
            type: DataTypes.NUMERIC,
            default: 0,
        },
    }, {
        tableName: 'user_search_count',
        timestamps: false
    });
    return UserSearchCount;
};
