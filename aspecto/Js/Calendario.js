// Variables globales
const ctx = document.getElementById('graficoResumen').getContext('2d');
let graficoResumen;

const cuerpoTablaCultivos = document.getElementById('cuerpo-tabla-cultivos');
const formCultivos = document.getElementById('form-cultivos');
const mesActual = document.getElementById('mes-actual');
const totalAreaElement = document.getElementById('total-area');
const areaSembradaElement = document.getElementById('area-sembrada');
const areaPorSembrarElement = document.getElementById('area-por-sembrar');
const fechaActual = new Date();

let cultivos = JSON.parse(localStorage.getItem('cultivos')) || [];

// Inicialización
actualizarTablaCultivos();
mostrarCalendario(fechaActual);
actualizarResumenAreas();

// Manejar envío del formulario
formCultivos.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-cultivo').value;
    const area = document.getElementById('area').value;
    const fechaSiembra = document.getElementById('fecha-siembra').value;
    const duracionCiclo = document.getElementById('duracion-ciclo').value;

    if (nombre && area > 0 && fechaSiembra && duracionCiclo > 0) {
        const fechaCosecha = calcularFechaCosecha(fechaSiembra, duracionCiclo);

        const nuevoCultivo = {
            nombre,
            area,
            fechaSiembra,
            duracionCiclo,
            fechaCosecha
        };

        if (formCultivos.dataset.editingIndex !== undefined) {
            // Editar cultivo existente
            cultivos[formCultivos.dataset.editingIndex] = nuevoCultivo;
            formCultivos.removeAttribute('data-editing-index'); // Limpiar el índice de edición
        } else {
            // Agregar nuevo cultivo
            cultivos.push(nuevoCultivo);
        }

        localStorage.setItem('cultivos', JSON.stringify(cultivos));
        actualizarTablaCultivos();
        actualizarResumenAreas();
        formCultivos.reset();
    } else {
        alert('Por favor, completa todos los campos correctamente.');
    }
});

// Calcular la fecha de cosecha
function calcularFechaCosecha(fechaSiembra, duracionCiclo) {
    const fecha = new Date(fechaSiembra);
    fecha.setDate(fecha.getDate() + parseInt(duracionCiclo));
    return fecha.toISOString().split('T')[0];
}

// Actualizar la tabla de cultivos
function actualizarTablaCultivos() {
    cuerpoTablaCultivos.innerHTML = '';
    cultivos.forEach((cultivo, index) => {
        const fila = document.createElement('tr');
        
        // Crear celdas para cada dato del cultivo
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = cultivo.nombre;
        
        const celdaArea = document.createElement('td');
        celdaArea.textContent = cultivo.area;
        
        const celdaFechaSiembra = document.createElement('td');
        celdaFechaSiembra.textContent = cultivo.fechaSiembra;

        const celdaFechaCosecha = document.createElement('td');
        celdaFechaCosecha.textContent = cultivo.fechaCosecha ? cultivo.fechaCosecha : 'N/A';

        const celdaAcciones = document.createElement('td');
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.onclick = () => eliminarCultivo(index);
        
        const botonEditar = document.createElement('button');
        botonEditar.textContent = 'Editar';
        botonEditar.onclick = () => editarCultivo(index); // Llamar función para editar

        celdaAcciones.appendChild(botonEliminar);
        celdaAcciones.appendChild(botonEditar);
        
        // Añadir las celdas a la fila
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaArea);
        fila.appendChild(celdaFechaSiembra);
        fila.appendChild(celdaFechaCosecha); 
        fila.appendChild(celdaAcciones);
        
        // Añadir la fila a la tabla
        cuerpoTablaCultivos.appendChild(fila);
    });
}

// Eliminar cultivo
function eliminarCultivo(index) {
    cultivos.splice(index, 1);
    localStorage.setItem('cultivos', JSON.stringify(cultivos));
    actualizarTablaCultivos();
    actualizarResumenAreas();
}

// Actualizar resumen de áreas
function actualizarResumenAreas() {
    let totalArea = 0;
    let areaSembrada = 0;

    cultivos.forEach(cultivo => {
        totalArea += parseFloat(cultivo.area);
        if (new Date(cultivo.fechaSiembra) <= fechaActual) {
            areaSembrada += parseFloat(cultivo.area);
        }
    });

    const areaPorSembrar = totalArea - areaSembrada;

    totalAreaElement.textContent = totalArea.toFixed(2);
    areaSembradaElement.textContent = areaSembrada.toFixed(2);
    areaPorSembrarElement.textContent = areaPorSembrar.toFixed(2);

    if (graficoResumen) {
        graficoResumen.destroy();
    }

    graficoResumen = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Área', 'Área Sembrada', 'Área por Sembrar'],
            datasets: [{
                label: 'Áreas en m²',
                data: [totalArea, areaSembrada, areaPorSembrar],
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                borderColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Editar cultivo
function editarCultivo(index) {
    const cultivo = cultivos[index];
    
    document.getElementById('nombre-cultivo').value = cultivo.nombre;
    document.getElementById('area').value = cultivo.area;
    document.getElementById('fecha-siembra').value = cultivo.fechaSiembra;
    document.getElementById('duracion-ciclo').value = cultivo.duracionCiclo;
    
    // Establecer el índice de edición en el formulario
    formCultivos.dataset.editingIndex = index;
}

// Mostrar calendario
function mostrarCalendario(fecha) {
    const diasCalendario = document.getElementById('dias-calendario');
    diasCalendario.innerHTML = '';

    const mes = fecha.getMonth();
    const year = fecha.getFullYear();

    const primerDia = new Date(year, mes, 1).getDay(); // Corregido: 'primerDia' ya es un número
    const ultimoDia = new Date(year, mes + 1, 0).getDate();
    let fila = document.createElement('tr');

    mesActual.textContent = `${fecha.toLocaleString('es-ES', { month: 'long' })} ${year}`;

    // Llenar los días en el calendario
    for (let i = 0; i < primerDia; i++) {
        fila.appendChild(document.createElement('td'));
    }

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const celda = document.createElement('td');
        celda.textContent = dia;
        const fechaDia = new Date(year, mes, dia).toISOString().split('T')[0];

        // Resaltar siembra y cosecha
        if (cultivos.some(c => c.fechaSiembra === fechaDia)) {
            celda.classList.add('evento');
        }

        if (cultivos.some(c => c.fechaCosecha === fechaDia)) {
            celda.classList.add('cosecha');
        }

        celda.addEventListener('click', () => mostrarDetallesDia(fechaDia));
        fila.appendChild(celda);

        if ((primerDia + dia) % 7 === 0 || dia === ultimoDia) {
            diasCalendario.appendChild(fila);
            fila = document.createElement('tr');
        }
    }
}

// Navegación por meses
const botonMesAnterior = document.getElementById('mes-anterior');
const botonMesSiguiente = document.getElementById('mes-siguiente');

botonMesAnterior.addEventListener('click', () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    mostrarCalendario(fechaActual);
});

botonMesSiguiente.addEventListener('click', () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    mostrarCalendario(fechaActual);
});

// Mostrar detalles de un día
function mostrarDetallesDia(fecha) {
    const eventosSiembra = cultivos.filter(c => c.fechaSiembra === fecha);
    const eventosCosecha = cultivos.filter(c => c.fechaCosecha === fecha);

    let mensaje = `Eventos para el ${fecha}:\n`;

    if (eventosSiembra.length > 0) {
        mensaje += `Siembras:\n${eventosSiembra.map(e => `${e.nombre} - Área: ${e.area}m²`).join('\n')}\n`;
    }

    if (eventosCosecha.length > 0) {
        mensaje += `Cosechas:\n${eventosCosecha.map(e => `${e.nombre} - Área: ${e.area}m²`).join('\n')}\n`;
    }

    if (eventosSiembra.length === 0 && eventosCosecha.length === 0) {
        mensaje += 'Sin eventos en esta fecha.\n';
    }

    alert(mensaje);
}

// Exportar datos a CSV
function exportarCSV() {
    let csvContent = 'Nombre,Área (m²),Fecha de Siembra,Fecha de Cosecha\n';
    cultivos.forEach(cultivo => {
        csvContent += `${cultivo.nombre},${cultivo.area},${cultivo.fechaSiembra},${cultivo.fechaCosecha}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cultivos.csv');
    link.click();
}

// Exportar datos a PDF
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('Cultivos', 10, 10);
    let y = 20;

    cultivos.forEach(cultivo => {
        doc.text(`Nombre: ${cultivo.nombre}, Área: ${cultivo.area} m², Fecha Siembra: ${cultivo.fechaSiembra}, Fecha Cosecha: ${cultivo.fechaCosecha}`, 10, y);
        y += 10;
    });

    doc.save('cultivos.pdf');
}
