
module.exports = (sequelize, DataTypes) => {
  const TagGroup = sequelize.define('tag_group', {
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
    tableName: 'tag_group'
  });
  
  TagGroup.associate = (models) => {
    TagGroup.hasMany(models.tag, { as: 'tag' }, {onDelete: 'cascade'});
  };

  return TagGroup;
};