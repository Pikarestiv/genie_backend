
module.exports = (sequelize, DataTypes) => {
  const UserTag = sequelize.define('user_tag', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    }
  }, {
    tableName: 'user_tag'
  });
  
  UserTag.associate = (models) => {
    UserTag.belongsTo(models.user);
    UserTag.belongsTo(models.tag);
  };

  return UserTag;
};