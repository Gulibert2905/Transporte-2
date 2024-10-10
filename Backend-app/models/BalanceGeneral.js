module.exports = (sequelize, DataTypes) => {
    const BalanceGeneral = sequelize.define('BalanceGeneral', {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false
      },
      activos: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      pasivos: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      patrimonio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    });
  
    return BalanceGeneral;
  };