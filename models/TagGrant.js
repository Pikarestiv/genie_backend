const Grant = require('./Grant');
const Tag   = require('./Tag');

module.exports = (sequelize, DataTypes) => {
  const TagGrant = sequelize.define('tag_grant', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    // grant_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   unique: 'tag_grant_connection',
    //   references: {
    //     model: Grant(sequelize, DataTypes),
    //     key: 'id',
    //     // deferrable: DataTypes.Deferrable.INITIALLY_IMMEDIATE,
    //   },
    // },
    // tag_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   unique: 'tag_grant_connection',
    //   references: {
    //     model: Tag(sequelize, DataTypes),
    //     key: 'id',
    //     // deferrable: DataTypes.Deferrable.INITIALLY_IMMEDIATE,
    //   },
    // },
    // createdAt: DataTypes.DATE,
    // updatedAt: DataTypes.DATE,
  }, {
    tableName: 'tag_grant'
  });

  TagGrant.associate = (models) => {
    TagGrant.belongsTo(models.grant);
    TagGrant.belongsTo(models.tag);
  };
  

  return TagGrant;
};