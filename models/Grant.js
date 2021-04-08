module.exports = (sequelize, DataTypes) => {
  const Grant = sequelize.define('grant', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    api_link: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    web_link: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    change_history: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    raw_price: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parsed_price: {
      type: DataTypes.NUMERIC,
      allowNull: true,
    },
    parsed_units: {
      type: DataTypes.STRING,
      allowNull: true
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'grant',
    paranoid: true,
  });

  Grant.associate = (models) => {
    Grant.hasMany(models.tag_grant, { as: 'tag_grant' }, {onDelete: 'cascade'});
    Grant.hasMany(models.user_received_grant, { as: 'user_received_grant'}, {onDelete: 'cascade'});
  };

  return Grant;
};
