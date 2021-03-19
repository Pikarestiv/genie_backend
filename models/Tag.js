const Sequelize = require('sequelize');
const TagGroup  = require('./TagGroup');

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('tag', {
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    tableName: 'tag'
  });

  Tag.associate = (models) => {
    Tag.hasMany(models.tag_grant, { as: 'tag' });
  };

  Tag.associate = (models) => {
    Tag.belongsTo(models.tag_group);
  };

  return Tag;
};
