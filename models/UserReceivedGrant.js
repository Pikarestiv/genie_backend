
module.exports = (sequelize, DataTypes) => {
  const UserReceivedGrant = sequelize.define('user_received_grant', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    tableName: 'user_received_grant'
  });
  
  UserReceivedGrant.associate = (models) => {
    UserReceivedGrant.belongsTo(models.user);
    UserReceivedGrant.belongsTo(models.grant);
  };

  return UserReceivedGrant;
};