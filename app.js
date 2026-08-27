// Constantes y Datos
const DEFAULT_DISTANCIA = 7683;
let distanciaSiembra = DEFAULT_DISTANCIA;

const parametros = [
    { id: 'plantas', name: 'No. Plantas/m', type: 'decimal' },           // 0 - Fila 3
    { id: 'flor', name: 'No. Flor/planta', type: 'decimal' },            // 1 - Fila 4
    { id: 'ramillas', name: 'No. Ramillas', type: 'decimal' },           // 2 - Fila 5
    { id: 'foliolos', name: 'No. Foliolos/planta', type: 'calc' }, 		 // 3 - Fila 6
    { id: 'atipicas', name: 'Plantas atípicas', type: 'int' },           // 4 - Fila 7
    { id: 'manchas', name: 'Manchas foliares', type: 'int' },            // 5 - Fila 8
    { id: 'roya', name: 'Roya', type: 'int' },                           // 6 - Fila 9
    { id: 'corchosis', name: 'Corchosis', type: 'int' },                 // 7 - Fila 10
    { id: 'alternaria', name: 'Alternaría', type: 'int' },               // 8 - Fila 11
    { id: 'moho', name: 'Moho blanco', type: 'int' },                    // 9 - Fila 12
    { id: 'ginoforos', name: 'No. Ginóforos/planta', type: 'int' },      // 10 - Fila 13
    { id: 'cap_peq', name: 'Cáps. pequeñas', type: 'int' },              // 11 - Fila 14
    { id: 'cap_med', name: 'Cáps. medianas', type: 'int' },              // 12 - Fila 15
    { id: 'cap_gra', name: 'Cáps. grandes', type: 'int' },               // 13 - Fila 16
    { id: 'cap_pod', name: 'Cáps. podridas', type: 'int' }               // 14 - Fila 17
];

// Estructura para guardar datos de las 5 estaciones (0 a 4)
let datosEstaciones = Array.from({length: parametros.length}, () => [0,0,0,0,0]);

// Elementos del DOM
const screens = {
    1: document.getElementById('screen1'),
    2: document.getElementById('screen2'),
    3: document.getElementById('screen3')
};
const headerTitle = document.getElementById('header-title');
const headerIcon = document.getElementById('header-icon');
const btnBack = document.getElementById('btn-back');
const headerDistancia = document.getElementById('header-distancia');
const headerDistanciaVal = document.getElementById('header-distancia-val');
const inputDistancia = document.getElementById('input-distancia');

// Navegación
function showScreen(num) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[num].classList.add('active');
    
    if (num === 1) {
        headerTitle.innerText = "EVALUACIÓN DEL CULTIVO";
        headerIcon.style.display = 'block';
        btnBack.classList.add('hidden');
        headerDistancia.classList.add('hidden');
    } else if (num === 2) {
        headerTitle.innerText = "CAPTURA DE DATOS";
        headerIcon.style.display = 'none';
        btnBack.classList.remove('hidden');
        headerDistancia.classList.add('hidden');
    } else if (num === 3) {
        headerTitle.innerText = "RESULTADOS";
        headerIcon.style.display = 'none';
        btnBack.classList.remove('hidden');
        headerDistanciaVal.innerText = distanciaSiembra.toLocaleString('en-US') + " mts/lineales";
        headerDistancia.classList.remove('hidden');
    }
}

btnBack.addEventListener('click', () => {
    if (screens[3].classList.contains('active')) showScreen(2);
    else if (screens[2].classList.contains('active')) showScreen(1);
});

headerDistancia.addEventListener('click', () => showScreen(1));

// Pantalla 1: Confirmar
document.getElementById('btn-screen1-next').addEventListener('click', () => {
    let val = parseFloat(inputDistancia.value);
    if (!isNaN(val) && val > 0) {
        distanciaSiembra = val;
        showScreen(2);
    } else {
        alert("Por favor, ingrese una distancia de siembra válida.");
    }
});

// Generar Tabla de Captura
const tbodyCapture = document.getElementById('capture-tbody');
parametros.forEach((param, pIdx) => {
    let tr = document.createElement('tr');
    if(param.type === 'calc') tr.classList.add('row-calc');
    
    let th = document.createElement('th');
    th.innerHTML = param.sub ? `${param.name}<span>${param.sub}</span>` : param.name;
    tr.appendChild(th);
    
    for (let e = 0; e < 5; e++) {
        let td = document.createElement('td');
        let input = document.createElement('input');
        input.type = "number";
        input.dataset.row = pIdx;
        input.dataset.col = e;
        
        if (param.type === 'decimal') {
            input.inputMode = "decimal";
            input.step = "0.01";
        } else if (param.type === 'int') {
            input.inputMode = "numeric";
        } else if (param.type === 'calc') {
            input.readOnly = true;
            input.value = "0";
            input.tabIndex = -1; // skip in tab
        }
        
        // Listener para autocalcular Foliolos
        if (pIdx === 2) { // Ramillas
            input.addEventListener('input', function() {
                let v = parseFloat(this.value) || 0;
                let foliolosInput = document.querySelector(`input[data-row="3"][data-col="${e}"]`);
                if(foliolosInput) {
                    foliolosInput.value = v * 4;
                }
            });
        }
        
        td.appendChild(input);
        tr.appendChild(td);
    }
    tbodyCapture.appendChild(tr);
});

// Salto automático con Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        if (e.target.tagName === 'INPUT' && !e.target.readOnly) {
            const inputs = Array.from(document.querySelectorAll('#screen2 input:not([readonly])'));
            const index = inputs.indexOf(e.target);
            if (index > -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else if (index === inputs.length - 1) {
                e.target.blur(); // Ocultar teclado
            }
        }
    }
});

// Limpiar Todo
document.getElementById('btn-limpiar').addEventListener('click', () => {
    if(confirm("¿Desea borrar todos los datos y restablecer la configuración?")) {
        inputDistancia.value = DEFAULT_DISTANCIA;
        distanciaSiembra = DEFAULT_DISTANCIA;
        document.querySelectorAll('#screen2 input').forEach(inp => {
            inp.value = (inp.readOnly) ? "0" : "";
        });
    }
});

// Calcular Resultados y mostrar Pantalla 3
function formatNumber(num, decimals = 2) {
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

document.getElementById('btn-ver-resultados').addEventListener('click', () => {
    const resultsTbody = document.getElementById('results-tbody');
    resultsTbody.innerHTML = "";
    
    // Leer valores
    document.querySelectorAll('#screen2 input').forEach(inp => {
        let r = parseInt(inp.dataset.row);
        let c = parseInt(inp.dataset.col);
        let v = parseFloat(inp.value) || 0;
        datosEstaciones[r][c] = v;
    });

    let promedios = Array(parametros.length).fill(0);

    parametros.forEach((param, i) => {
        let tr = document.createElement('tr');
        
        let tdName = document.createElement('td');
        tdName.innerText = param.name.replace('\n', ' ');
        tr.appendChild(tdName);
        
        let sum = 0;
        for (let e = 0; e < 5; e++) {
            let val = datosEstaciones[i][e];
            sum += val;
            let td = document.createElement('td');
            // Mostrar sin formato en celdas de estación si es entero, para decimales respetar input original o formatiarlo
            td.innerText = (param.type === 'decimal' || param.type === 'calc' && val % 1 !== 0) ? Number(val.toFixed(2)) : val;
            tr.appendChild(td);
        }
        
        let prom = sum / 5;
        promedios[i] = prom;
        
        // SUMA
        let tdSum = document.createElement('td');
        // Regla estricta: Solo la primera celda (idx 0) SUMA es decimal. Resto es entero.
        if (i === 0 || i === 9){
            tdSum.innerText = formatNumber(sum, 2);
        } else {
            tdSum.innerText = formatNumber(Math.round(sum), 0);
        }
        tr.appendChild(tdSum);
        
        // PROM
        let tdProm = document.createElement('td');
        tdProm.innerText = formatNumber(prom, 2);
        tr.appendChild(tdProm);
        
        // PLTS/MZ
        let tdPlts = document.createElement('td');
        tdPlts.classList.add('val-plts');
        let pltsText = "";
        
        // Fórmulas de PLTS/MZ basadas en Excel
        let prom_plantas = promedios[0]; // H3 en Excel
        let prom_foliolos = promedios[3]; // H6 en Excel

        if (i === 0) { // Plantas/m
            pltsText = formatNumber(prom * distanciaSiembra, 2);
        } else if (i === 4) { // Atípicas
            if (prom_plantas > 0) pltsText = formatNumber((prom / prom_plantas) * 100, 2);
        } else if (i >= 5 && i <= 8) { // Manchas, Roya, Corchosis, Alternaria
            if (prom_foliolos > 0) pltsText = formatNumber((prom / prom_foliolos) * 100, 2);
        } else if (i === 9) { // Moho blanco
            if (prom_plantas > 0) pltsText = formatNumber((prom / prom_plantas) * 100, 2);
        }
        
        tdPlts.innerText = pltsText;
        tr.appendChild(tdPlts);
        
        resultsTbody.appendChild(tr);
    });

    showScreen(3);
});

// Botones Pantalla 3
document.getElementById('btn-nueva-eval').addEventListener('click', () => {
    showScreen(2);
});
document.getElementById('btn-recalcular').addEventListener('click', () => {
    // Vuelve a Pantalla 2, los datos ya están ahí
    showScreen(2);
});

// Service Worker Registration for PWA y Auto-Recarga
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrado', reg))
            .catch(err => console.error('Error al registrar Service Worker', err));
    });

    // NUEVO: Detecta cuando el sw.js cambia y refresca la app automáticamente para todos los usuarios
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
