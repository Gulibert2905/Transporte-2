// controllers/AuditorController.js
const { Viatico, Paciente, Usuario } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

const AuditorController = {
  // Dashboard con estadísticas
async getDashboard(req, res) {
try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const where = {
    fecha_solicitud: {
        [Op.between]: [fecha_inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)), fecha_fin || new Date()]
    }
    };

    const stats = await Promise.all([
    // Total viáticos
    Viatico.count({ where }),
    // Total pendientes de verificación
    Viatico.count({ 
        where: { 
        ...where,
        verificado_auditor: false 
        }
    }),
    // Total valor aprobado
    Viatico.sum('valor_total', {
        where: {
        ...where,
        estado: 'APROBADO'
        }
    })
    ]);

    return res.json({
    total_viaticos: stats[0],
    pendientes_verificacion: stats[1],
    total_valor_aprobado: stats[2] || 0
    });
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener dashboard' });
}
},

// Generar reportes
async generarReporte(req, res) {
try {
    const { tipo_reporte, fecha_inicio, fecha_fin, campos } = req.body;
    
    let where = {};
    if (fecha_inicio && fecha_fin) {
    where.fecha_solicitud = {
        [Op.between]: [fecha_inicio, fecha_fin]
    };
    }

    // Obtener datos según tipo de reporte
    let datos;
    switch (tipo_reporte) {
    case 'PACIENTE':
        datos = await Viatico.findAll({
        where,
        include: [
            {
            model: Paciente,
            as: 'paciente'
            }
        ],
        group: ['paciente_id'],
        attributes: [
            'paciente_id',
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_traslados'],
            [sequelize.fn('SUM', sequelize.col('valor_total')), 'total_valor']
        ]
        });
        break;
    case 'OPERADOR':
        datos = await Viatico.findAll({
        where,
        include: [
            {
            model: Usuario,
            as: 'operador'
            }
        ],
        group: ['operador_id'],
        attributes: [
            'operador_id',
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_traslados'],
            [sequelize.fn('SUM', sequelize.col('valor_total')), 'total_valor']
        ]
        });
        break;
    default:
        datos = await Viatico.findAll({
        where,
        include: [
            {
            model: Paciente,
            as: 'paciente'
            },
            {
            model: Usuario,
            as: 'operador'
            }
        ]
        });
    }

    // Generar Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Configurar columnas según campos seleccionados
    const columnas = campos.map(campo => ({
    header: campo.label,
    key: campo.value,
    width: 15
    }));

    worksheet.columns = columnas;

    // Agregar datos
    datos.forEach(registro => {
    const fila = {};
    campos.forEach(campo => {
        fila[campo.value] = registro[campo.value];
    });
    worksheet.addRow(fila);
    });

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${tipo_reporte.toLowerCase()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al generar reporte' });
}
}
};

module.exports = AuditorController;