// services/pdfService.js
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

const generarHistoriaClinicaPDF = (historia, stream) => {
    const doc = new PDFDocument();
    doc.pipe(stream);

    // Configuración de estilos
    const titleStyle = { fontSize: 16, bold: true };
    const subtitleStyle = { fontSize: 14, bold: true };
    const textStyle = { fontSize: 12 };
    const margin = 50;

    // Encabezado
    doc.fontSize(titleStyle.fontSize)
        .text('HISTORIA CLÍNICA DE TRASLADO', margin, margin, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(textStyle.fontSize)
        .text(`Historia Clínica #${historia.id}`, { align: 'right' });
    doc.text(`Fecha: ${dayjs(historia.fecha_registro).format('DD/MM/YYYY HH:mm')}`, { align: 'right' });

    doc.moveDown();

    // Datos del Paciente
    doc.fontSize(subtitleStyle.fontSize)
        .text('DATOS DEL PACIENTE', margin);
    doc.fontSize(textStyle.fontSize)
        .text(`Nombre: ${historia.Traslado.Paciente.nombres} ${historia.Traslado.Paciente.apellidos}`)
        .text(`Documento: ${historia.Traslado.Paciente.documento}`)
        .text(`Tipo de Traslado: ${historia.Traslado.tipo_servicio}`);

    doc.moveDown();

    // Signos Vitales
    doc.fontSize(subtitleStyle.fontSize)
        .text('SIGNOS VITALES', margin);
    doc.fontSize(textStyle.fontSize)
        .text(`Presión Arterial: ${historia.presion_arterial}`)
        .text(`Frecuencia Cardíaca: ${historia.frecuencia_cardiaca}`)
        .text(`Saturación O2: ${historia.saturacion_oxigeno}%`)
        .text(`Temperatura: ${historia.temperatura}°C`)
        .text(`Glasgow: ${historia.glasgow}`);

    doc.moveDown();

    // Información Clínica
    doc.fontSize(subtitleStyle.fontSize)
        .text('INFORMACIÓN CLÍNICA', margin);
    doc.fontSize(textStyle.fontSize)
        .text('Motivo del Traslado:')
        .text(historia.motivo_traslado, { indent: 20 })
        .moveDown()
        .text('Condición Actual:')
        .text(historia.condicion_actual, { indent: 20 })
        .moveDown()
        .text('Antecedentes:')
        .text(historia.antecedentes || 'No registrados', { indent: 20 });

    doc.moveDown();

    // Oxigenoterapia
    if (historia.oxigeno_suplementario) {
        doc.fontSize(subtitleStyle.fontSize)
            .text('OXIGENOTERAPIA', margin);
        doc.fontSize(textStyle.fontSize)
            .text(`Dispositivo: ${historia.tipo_dispositivo_o2.replace('_', ' ')}`)
            .text(`Flujo: ${historia.flujo_oxigeno}`);

        doc.moveDown();
    }

    // Procedimientos y Evolución
    doc.fontSize(subtitleStyle.fontSize)
        .text('PROCEDIMIENTOS Y EVOLUCIÓN', margin);
    doc.fontSize(textStyle.fontSize)
        .text('Procedimientos Realizados:')
        .text(historia.procedimientos_realizados || 'No se realizaron procedimientos', { indent: 20 })
        .moveDown()
        .text('Complicaciones:')
        .text(historia.complicaciones || 'Sin complicaciones', { indent: 20 })
        .moveDown()
        .text('Estado al Llegar:')
        .text(historia.estado_llegada || 'No registrado', { indent: 20 });

    doc.moveDown();

    // Responsables
    doc.fontSize(subtitleStyle.fontSize)
        .text('RESPONSABLES', margin);
    doc.fontSize(textStyle.fontSize)
        .text(`Médico: ${historia.Medico?.nombre_completo || 'No asignado'}`);
    
    if (historia.Enfermero) {
        doc.text(`Enfermero: ${historia.Enfermero.nombre_completo}`);
    }

    // Espacio para firmas
    doc.moveDown(2);
    doc.fontSize(textStyle.fontSize)
        .text('_______________________', margin)
        .text('Firma del Médico', margin + 40)
        .text('_______________________', 300)
        .text('Firma del Enfermero', 340);

    doc.end();
};

module.exports = {
    generarHistoriaClinicaPDF
};