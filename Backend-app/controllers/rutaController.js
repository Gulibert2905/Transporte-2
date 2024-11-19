const { Ruta } = require('../models');
const xlsx = require('xlsx');
const db = require('../models'); // Importa todos los modelos
const Tarifa = db.Tarifa;

exports.getAllRutas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let options = {
      limit,
      offset,
      order: [['id', 'ASC']]
    };

    // Si hay prestador_id, agregar el filtro de tarifas
    if (req.query.prestador_id) {
      options.include = [{
        model: Tarifa,
        as: 'Tarifas',
        where: { prestador_nit: req.query.prestador_id },
        attributes: []
      }];
    }

    // Realizar la consulta con paginación
    const { count, rows: rutas } = await Ruta.findAndCountAll(options);

    res.json({
      rutas,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });

  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ 
      message: 'Error al obtener rutas',
      error: error.message 
    });
  }
};

// Asegúrate de que el modelo Ruta tenga la asociación correcta
exports.createRuta = async (req, res) => {
  try {
    const { origen, destino, distancia } = req.body;
    const newRuta = await Ruta.create({ 
      origen, 
      destino, 
      distancia 
    });
    res.status(201).json(newRuta);
  } catch (error) {
    console.error('Error al crear ruta:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.importFromExcel = async (req, res) => {
  try {
    console.log('Iniciando importación de Excel');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log('Datos extraídos del Excel:', data.length, 'filas');

    // Validar estructura del Excel
    const requiredColumns = ['origen', 'destino', 'distancia'];
    const firstRow = data[0];
    
    const normalizedColumns = {};
    Object.keys(firstRow).forEach(key => {
      normalizedColumns[key.toLowerCase()] = key;
    });

    // Verificar columnas requeridas
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

    // Procesar los datos
    const rutasToCreate = data.map((row, index) => {
      const ruta = {
        origen: row[normalizedColumns['origen']],
        destino: row[normalizedColumns['destino']],
        distancia: row[normalizedColumns['distancia']] || 0 // Permitir 0 temporalmente
      };

      // Solo validar que origen y destino no estén vacíos
      const isValid = 
        ruta.origen && 
        ruta.origen.trim() !== '' &&
        ruta.destino && 
        ruta.destino.trim() !== '' &&
        !isNaN(ruta.distancia); // Solo validar que sea un número

      if (!isValid) {
        console.log(`Fila ${index + 1} inválida:`, {
          original: row,
          procesada: ruta,
          problemas: {
            origen: !ruta.origen || ruta.origen.trim() === '' ? 'falta o inválido' : 'ok',
            destino: !ruta.destino || ruta.destino.trim() === '' ? 'falta o inválido' : 'ok',
            distancia: isNaN(ruta.distancia) ? 'no es un número' : 'ok'
          }
        });
      }

      return isValid ? ruta : null;
    }).filter(ruta => ruta !== null);

    if (rutasToCreate.length === 0) {
      return res.status(400).json({
        message: 'No se encontraron rutas válidas para importar',
        razon: 'Verifica que todas las filas tengan origen y destino válidos'
      });
    }

    // Mostrar resumen antes de crear
    console.log(`Se procesarán ${rutasToCreate.length} rutas de ${data.length} filas`);
    console.log('Muestra de rutas a crear:', rutasToCreate.slice(0, 3));

    // Crear las rutas en la base de datos
    await Ruta.bulkCreate(rutasToCreate, {
      validate: true,
      fields: ['origen', 'destino', 'distancia']
    });

    res.status(200).json({
      message: `Se importaron ${rutasToCreate.length} rutas exitosamente`,
      rutasImportadas: rutasToCreate.length,
      totalFilas: data.length,
      nota: 'Las distancias con valor 0 deberán actualizarse posteriormente'
    });

  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({
      message: 'Error al importar rutas',
      error: error.message
    });
  }
};

// Endpoint para obtener rutas disponibles para un prestador
exports.getRutasPorPrestador = async (req, res) => {
  try {
      const prestador_id = req.query.prestador_id;

      if (!prestador_id) {
          return res.status(400).json({ message: 'prestador_id es requerido' });
      }

      const rutas = await Ruta.findAll({
          include: [{
              model: Tarifa,
              where: { prestador_id }, // Filtra rutas por el prestador usando tarifas
              attributes: [] // No se necesita ningún campo de `tarifas`
          }],
          order: [['id', 'ASC']]
      });

      res.json({ rutas });
  } catch (error) {
      console.error('Error al obtener rutas:', error);
      res.status(500).json({ message: 'Error al obtener rutas' });
  }
};
