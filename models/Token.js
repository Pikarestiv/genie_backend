
module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('token', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'token'
  });
  
  Token.associate = (models) => {
    Token.hasMany(models.user_token, { as: 'token' });
  };

  return Token;
};