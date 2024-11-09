// components/ReportesPage.js
function ReportesPage() {
    const [campos, setCampos] = useState([]);
    const [filtros, setFiltros] = useState({
      fechaInicio: '',
      fechaFin: '',
      tipoPaciente: '',
      estado: ''
    });
  
    const generarReporte = async () => {
      try {
        const response = await axiosInstance.get('/reportes', {
          params: {
            ...filtros,
            campos: campos
          }
        });
        
        // Exportar a Excel
        exportToExcel(response.data, campos);
      } catch (error) {
        console.error('Error generando reporte:', error);
      }
    };
  
    return (
      <Box>
        <Typography variant="h5">Generador de Reportes</Typography>
        
        {/* Selector de campos */}
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label="Datos del Paciente"
            onChange={(e) => handleCampoChange('paciente', e.target.checked)}
          />
          {/* Más campos... */}
        </FormGroup>
  
        {/* Filtros */}
        <TextField
          type="date"
          label="Fecha Inicio"
          value={filtros.fechaInicio}
          onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
        />
        {/* Más filtros... */}
  
        <Button onClick={generarReporte}>
          Generar Reporte
        </Button>
      </Box>
    );
  }