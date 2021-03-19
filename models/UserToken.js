
module.exports = (sequelize, DataTypes) => {
  const UserToken = sequelize.define('user_token', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    interested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: 'user_token'
  });
  
  UserToken.associate = (models) => {
    UserToken.belongsTo(models.user);
    UserToken.belongsTo(models.token);
  };

  return UserToken;
};