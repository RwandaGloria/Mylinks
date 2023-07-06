module.exports = (sequelize, DataTypes) => {
    const tokens = sequelize.define("tokens", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false
      }
      
    }, {
      tableName: 'tokens'
    });
  
    return tokens;
  };
  