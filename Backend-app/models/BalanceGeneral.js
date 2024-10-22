module.exports = (sequelize, DataTypes) => {
  const BalanceGeneral = sequelize.define('BalanceGeneral', {
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    activos: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('activos');
        return value === null ? 0 : parseFloat(value);
      }
    },
    pasivos: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('pasivos');
        return value === null ? 0 : parseFloat(value);
      }
    },
    patrimonio: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('patrimonio');
        return value === null ? 0 : parseFloat(value);
      },
      set(value) {
        // Asegurarse de que el patrimonio siempre sea activos - pasivos
        const activos = parseFloat(this.getDataValue('activos') || 0);
        const pasivos = parseFloat(this.getDataValue('pasivos') || 0);
        this.setDataValue('patrimonio', activos - pasivos);
      }
    }
  }, {
    tableName: 'BalanceGenerals',
    hooks: {
      beforeSave: (instance) => {
        const activos = parseFloat(instance.activos || 0);
        const pasivos = parseFloat(instance.pasivos || 0);
        instance.patrimonio = activos - pasivos;
      }
    }
  });

  return BalanceGeneral;
};