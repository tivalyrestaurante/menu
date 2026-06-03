// Configuración básica
const url = 'menu-tivaly.pdf'; // Asegúrate de que el PDF se llame así

// Referencia a la librería de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];

// Configurar el worker (Obligatorio para PDF.js)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Elementos del DOM
const pdfContainer = document.getElementById('pdfContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const docMeta = document.getElementById('docMeta');

async function renderPDF() {
    try {
        // 1. Obtener el documento PDF
        const pdfDoc = await pdfjsLib.getDocument(url).promise;
        
        // 2. Actualizar UI
        loadingState.hidden = true;
        pdfContainer.hidden = false;
        docMeta.textContent = `${pdfDoc.numPages} página(s) cargadas`;

        // 3. Renderizar cada página (Bucle)
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            await renderPage(pdfDoc, pageNum);
        }
    } catch (error) {
        console.error("Error al cargar el PDF: ", error);
        loadingState.hidden = true;
        errorState.hidden = false;
    }
}

async function renderPage(pdfDoc, pageNum) {
    // Obtener la página específica
    const page = await pdfDoc.getPage(pageNum);
    
    // Crear un contenedor para la hoja
    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'pdf-page-wrapper';
    
    // Crear el elemento Canvas donde se dibujará la hoja
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    pageWrapper.appendChild(canvas);
    pdfContainer.appendChild(pageWrapper);

    // TRUCO DE PROFESIONALES: Renderizar a una escala mayor (2.0 o 2.5) 
    // y dejar que CSS ajuste el ancho al 100%. Así se lee perfecto sin verse pixelado.
    const renderScale = 2.5; 
    const viewport = page.getViewport({ scale: renderScale });

    // Ajustar dimensiones internas del canvas
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Renderizar la página en el canvas
    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    };

    await page.render(renderContext).promise;
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', renderPDF);