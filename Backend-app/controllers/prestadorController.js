const { Prestador } = require('../models');
const xlsx = require('xlsx');

exports.getAllPrestadores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: prestadores } = await Prestador.findAndCountAll({
      limit,
      offset,
      order: [['nit', 'ASC']]
    });

    res.json({
      prestadores,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error al obtener prestadores:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createPrestador = async (req, res) => {
  try {
    const { nit, nombre, contacto } = req.body;
    const newPrestador = await Prestador.create({ nit, nombre, contacto });
    res.status(201).json(newPrestador);
  } catch (error) {
    console.error('Error al crear prestador:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updatePrestador = async (req, res) => {
  try {
    const { nit } = req.params;
    const { nombre, contacto } = req.body;
    const prestador = await Prestador.findByPk(nit);
    if (prestador) {
      await prestador.update({ nombre, contacto });
      res.json(prestador);
    } else {
      res.status(404).json({ message: 'Prestador no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar prestador:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deletePrestador = async (req, res) => {
  try {
    const { nit } = req.params;
    const prestador = await Prestador.findByPk(nit);
    if (prestador) {
      await prestador.destroy();
      res.json({ message: 'Prestador eliminado' });
    } else {
      res.status(404).json({ message: 'Prestador no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar prestador:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.importFromExcel = async (req, res) => {
  try {
    console.log('Iniciando importación de prestadores desde Excel');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log('Datos extraídos del Excel:', data.length, 'filas');

    // Validar estructura del Excel
    const requiredColumns = ['nit', 'nombre', 'contacto'];
    const firstRow = data[0];
    
    const normalizedColumns = {};
    Object.keys(firstRow).forEach(key => {
      normalizedColumns[key.toLowerCase()] = key;
    });

    const missingColumns = requiredColumns.filter(col => 
      !Object.keys(normalizedColumns).includes(col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Faltan las siguientes columnas: ${missingColumns.join(', ')}`,
        columnasEsperadas: requiredColumns,
        columnasEncontradas: Object.keys(firstRow)
      });
    }

    // Validar formato de los datos
    const invalidRows = [];
    const prestadoresToCreate = data.map((row, index) => {
      const prestador = {
        nit: row[normalizedColumns['nit']]?.toString().trim(),
        nombre: row[normalizedColumns['nombre']]?.toString().trim(),
        contacto: row[normalizedColumns['contacto']]?.toString().trim()
      };

      const isValid = 
        prestador.nit && 
        prestador.nombre && 
        prestador.contacto && 
        prestador.contacto.match(/^3\d{9}$/);

      if (!isValid) {
        invalidRows.push({
          fila: index + 1,
          problemas: {
            nit: !prestador.nit ? 'falta o inválido' : 'ok',
            nombre: !prestador.nombre ? 'falta o inválido' : 'ok',
            contacto: !prestador.contacto ? 'falta o inválido' : 
                     !prestador.contacto.match(/^3\d{9}$/) ? 'debe ser un número de 10 dígitos comenzando con 3' : 'ok'
          }
        });
        return null;
      }

      return prestador;
    }).filter(Boolean);

    if (invalidRows.length > 0) {
      return res.status(400).json({
        message: 'Existen filas con datos inválidos',
        filasInvalidas: invalidRows
      });
    }

    // Verificar NITs duplicados y existentes... (resto del código igual)

    await Prestador.bulkCreate(prestadoresToCreate, {
      validate: true
    });

    res.status(200).json({
      message: `Se importaron ${prestadoresToCreate.length} prestadores exitosamente`,
      prestadoresImportados: prestadoresToCreate.length,
      totalFilas: data.length
    });

  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({
      message: 'Error al importar prestadores',
      error: error.message
    });
  }
};