// models/Usuario.js
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
              notEmpty: true,
              len: [3, 50]
          }
      },
      password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
              notEmpty: true,
              len: [6, 100]
          }
      },
      rol: {
          type: DataTypes.ENUM('admin', 'contador', 'administrativo', 'operador', 'auditor'),
          allowNull: false,
          validate: {
              isIn: [['admin', 'contador', 'administrativo', 'operador', 'auditor']]
          }
      },
      estado: {
          type: DataTypes.ENUM('activo', 'inactivo', 'bloqueado'),
          defaultValue: 'activo',
          allowNull: false
      },
      ultimo_acceso: {
          type: DataTypes.DATE,
          allowNull: true
      },
      intentos_fallidos: {
          type: DataTypes.INTEGER,
          defaultValue: 0
      },
      permisos: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: null,
          get() {
              const permisos = this.getDataValue('permisos');
              return permisos ? JSON.parse(permisos) : getPermisosPorDefecto(this.rol);
          },
          set(value) {
              this.setDataValue('permisos', JSON.stringify(value));
          }
      },
      email: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
              isEmail: true
          }
      },
      nombre_completo: {
          type: DataTypes.STRING,
          allowNull: true
      },
      fecha_ultimo_password: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
      },
      requiere_cambio_password: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
      }
  }, {
      tableName: 'usuarios',
      timestamps: true,
      hooks: {
          beforeCreate: async (usuario) => {
              usuario.permisos = getPermisosPorDefecto(usuario.rol);
          },
          beforeUpdate: async (usuario) => {
              if (usuario.changed('rol')) {
                  usuario.permisos = getPermisosPorDefecto(usuario.rol);
              }
          }
      },
      indexes: [
          {
              unique: true,
              fields: ['username']
          },
          {
              fields: ['estado']
          },
          {
              fields: ['rol']
          }
      ]
  });

  // Función helper para obtener permisos por defecto según el rol
  const getPermisosPorDefecto = (rol) => {
      const permisosBase = {
          'ver_perfil': true,
          'editar_perfil': true
      };

      const permisosPorRol = {
          admin: {
              ...permisosBase,
              'gestionar_usuarios': true,
              'gestionar_traslados': true,
              'gestionar_pacientes': true,
              'ver_estadisticas': true,
              'generar_reportes': true,
              'configurar_sistema': true
          },
          contador: {
              ...permisosBase,
              'ver_traslados': true,
              'gestionar_pagos': true,
              'ver_estadisticas': true,
              'generar_reportes': true
          },
          administrativo: {
              ...permisosBase,
              'ver_traslados': true,
              'crear_traslados': true,
              'editar_traslados': true,
              'gestionar_pacientes': true
          },
          operador: {
              ...permisosBase,
              'ver_traslados': true,
              'crear_traslados': true,
              'editar_traslados': true,
              'ver_pacientes': true
          },
          auditor: {
              ...permisosBase,
              'ver_traslados': true,
              'verificar_traslados': true,
              'generar_reportes': true,
              'ver_estadisticas': true,
              'ver_historial': true
          }
      };

      return permisosPorRol[rol] || permisosBase;
  };

  // Métodos de instancia
  Usuario.prototype.tienePermiso = function(permiso) {
      const permisos = this.permisos;
      return permisos && permisos[permiso] === true;
  };

  Usuario.prototype.esRol = function(rol) {
      return this.rol === rol;
  };

  Usuario.prototype.estaActivo = function() {
      return this.estado === 'activo';
  };

  // Asociaciones
  Usuario.associate = (models) => {
      // Asociación con traslados verificados (para auditor)
      Usuario.hasMany(models.Traslado, {
          foreignKey: 'auditor_id',
          as: 'TrasladosVerificados'
      });

      // Asociación con traslados creados (para operador)
      Usuario.hasMany(models.Traslado, {
          foreignKey: 'operador_id',
          as: 'TrasladosCreados'
      });
  };

  // Métodos estáticos
  Usuario.findByUsername = async function(username) {
      return await this.findOne({ where: { username } });
  };

  Usuario.findActiveByRole = async function(rol) {
      return await this.findAll({
          where: {
              rol,
              estado: 'activo'
          }
      });
  };

  return Usuario;
};