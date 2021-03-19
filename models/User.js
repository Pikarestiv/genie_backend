
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    postcode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    land_size: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    tableName: 'user'
  });
  
  User.associate = (models) => {
    User.hasMany(models.user_token, { as: 'user_token' }, {onDelete: 'cascade'});
    User.hasMany(models.user_received_grant, { as: 'user_received_grant'}, {onDelete: 'cascade'});
    User.hasMany(models.user_tag, { as: 'user_tag'}, {onDelete: 'cascade'});
  };

  return User;
};