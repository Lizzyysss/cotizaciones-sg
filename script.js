document.addEventListener('DOMContentLoaded', () => {
    const itemsTableBody = document.querySelector('#items-table tbody');
    const itemsDisplayContainer = document.getElementById('items-display-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const taxDisplay = document.getElementById('tax-display');
    const totalDisplay = document.getElementById('total-display');
    const totalWordsDisplay = document.getElementById('total-words-display');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');

    // Function to add a new item row
    const addItemRow = () => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="item-description"></td>
            <td><input type="number" class="item-quantity" value="0" min="0"></td>
            <td><input type="number" class="item-price" value="0.00" min="0" step="0.01"></td>
            <td class="item-subtotal">0.00</td>
            <td class="actions"><button class="delete-item-btn">Eliminar</button></td>
        `;
        itemsTableBody.appendChild(newRow);

        // Add corresponding item display card
        const newItemDisplayCard = document.createElement('div');
        newItemDisplayCard.classList.add('item-display-card');
        newItemDisplayCard.innerHTML = `
            <p><strong>Descripción:</strong> <span class="display-description"></span></p>
            <p><strong>Cantidad:</strong> <span class="display-quantity"></span></p>
            <p><strong>Precio:</strong> <span class="display-price"></span></p>
            <p><strong>Subtotal:</strong> <span class="display-subtotal">0.00</span></p>
        `;
        itemsDisplayContainer.appendChild(newItemDisplayCard);

        attachEventListeners(newRow);
        calculateTotals(); // Recalculate totals after adding a row
    };

    // Function to attach event listeners to inputs and delete button in a row
    const attachEventListeners = (row) => {
        const quantityInput = row.querySelector('.item-quantity');
        const priceInput = row.querySelector('.item-price');
        const descriptionInput = row.querySelector('.item-description');
        const deleteBtn = row.querySelector('.delete-item-btn');

        // Get corresponding item display card
        const rowIndex = Array.from(itemsTableBody.children).indexOf(row);
        const displayCard = itemsDisplayContainer.children[rowIndex];

        // Event listeners for mirroring input to display
        descriptionInput.addEventListener('input', (e) => displayCard.querySelector('.display-description').textContent = e.target.value);
        quantityInput.addEventListener('input', (e) => displayCard.querySelector('.display-quantity').textContent = e.target.value);
        priceInput.addEventListener('input', (e) => displayCard.querySelector('.display-price').textContent = parseFloat(e.target.value).toFixed(2));

        quantityInput.addEventListener('input', calculateRowSubtotal);
        priceInput.addEventListener('input', calculateRowSubtotal);
        deleteBtn.addEventListener('click', deleteItemRow);
    };

    // Function to calculate subtotal for a single row
    const calculateRowSubtotal = (event) => {
        const row = event.target.closest('tr');
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const subtotalCell = row.querySelector('.item-subtotal');
        // Find the corresponding display card and its subtotal span
        const rowIndex = Array.from(itemsTableBody.children).indexOf(row);
        const displayCard = itemsDisplayContainer.children[rowIndex];
        const displaySubtotalCell = displayCard ? displayCard.querySelector('.display-subtotal') : null;
        const subtotal = quantity * price;
        subtotalCell.textContent = subtotal.toFixed(2);
        if (displaySubtotalCell) {
            displaySubtotalCell.textContent = subtotal.toFixed(2);
        }
        calculateTotals(); // Recalculate overall totals
    };

    // Function to delete an item row
    const deleteItemRow = (event) => {
        const row = event.target.closest('tr');
        const rowIndex = Array.from(itemsTableBody.children).indexOf(row);
        row.remove();
        if (itemsDisplayContainer.children[rowIndex]) {
            itemsDisplayContainer.children[rowIndex].remove();
        }
        calculateTotals(); // Recalculate totals after deleting a row
    };

    // Function to calculate overall totals (subtotal, tax, total)
    const calculateTotals = () => {
        let totalSubtotal = 0;
        document.querySelectorAll('.item-subtotal').forEach(cell => {
            totalSubtotal += parseFloat(cell.textContent) || 0;
        });

        // Assuming a fixed tax rate, e.g., 15% (adjust as needed)
        const taxRate = 0.15;
        const taxAmount = totalSubtotal * taxRate;
        const totalAmount = totalSubtotal + taxAmount;

        // Update display elements
        document.getElementById('subtotal-display').textContent = totalSubtotal.toFixed(2);
        document.getElementById('tax-display').textContent = taxAmount.toFixed(2);
        document.getElementById('total-display').textContent = totalAmount.toFixed(2);

        // Convert total to words
        totalWordsDisplay.textContent = convertNumberToWords(totalAmount);
    };

    // Event listener for adding a new item row
    addItemBtn.addEventListener('click', addItemRow);

    // Event listeners for client details and general description inputs
    // These will update the display areas as the user types
    document.getElementById('client-name').addEventListener('input', (e) => document.getElementById('client-name-display').textContent = e.target.value);
    document.getElementById('client-address').addEventListener('input', (e) => document.getElementById('client-address-display').textContent = e.target.value);
    document.getElementById('client-rtn').addEventListener('input', (e) => document.getElementById('client-rtn-display').textContent = e.target.value);
    document.getElementById('quote-date').addEventListener('input', (e) => document.getElementById('quote-date-display').textContent = e.target.value);
    document.getElementById('general-description').addEventListener('input', (e) => document.getElementById('general-description-display').textContent = e.target.value);

    // Event listener for generating PDF (needs jsPDF library)
    generatePdfBtn.addEventListener('click', () => {
        // Implementation for generating PDF using jsPDF
        // This will involve structuring the content and downloading the PDF.
        // alert('Generar PDF - Funcionalidad Pendiente'); // Placeholder

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text('Cotización a:', 105, 25, { align: 'center' });

        // Add logo
        const logoImg = document.querySelector('.logo img');
        if (logoImg && logoImg.src && logoImg.complete && logoImg.naturalHeight !== 0) {
            // Calculate proportional height based on a desired width (e.g., 40mm)
            const imgWidth = 40; // Desired width in mm
            const imgHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * imgWidth;
            try {
                doc.addImage(logoImg, 'PNG', 15, 5, imgWidth, imgHeight);
            } catch (error) {
                console.error('Error adding image to PDF:', error);
                doc.text('Logo Suministros Generales - Error al añadir imagen', 15, 10);
            }
        } else {
            // Fallback if image element not found, src is missing, or image not loaded
            doc.text('Logo Suministros Generales - Imagen no encontrada o cargada', 15, 10);
        }

        // Add client details
        const clientName = document.getElementById('client-name').value;
        const clientAddress = document.getElementById('client-address').value;
        const clientRtn = document.getElementById('client-rtn').value;
        const quoteDate = document.getElementById('quote-date').value;
        const generalDescription = document.getElementById('general-description').value;

        let yPos = 47;
        doc.setFontSize(12);
        doc.text(`Nombre: ${clientName}`, 20, yPos);
        doc.text(`Fecha: ${quoteDate}`, 150, yPos, { align: 'left' });
        yPos += 7;
        doc.text(`Dirección: ${clientAddress}`, 20, yPos);
        yPos += 7;
        doc.text(`RTN: ${clientRtn}`, 20, yPos);
        yPos += 7;
        doc.text(`Descripción general: ${generalDescription}`, 20, yPos);

        // Add items table
        yPos += 15;

        const tableColumn = ["Descripción", "Cantidad", "Precio", "Subtotal"];
        const tableRows = [];

        document.querySelectorAll('#items-table tbody tr').forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantity = row.querySelector('.item-quantity').value;
            const price = parseFloat(row.querySelector('.item-price').value).toFixed(2);
            const subtotal = parseFloat(row.querySelector('.item-subtotal').textContent).toFixed(2);
            tableRows.push([description, quantity, price, subtotal]);
        });

        doc.autoTable(tableColumn, tableRows, {
            startY: yPos,
            headStyles: { fillColor: [30, 80, 50] },
            margin: { left: 20, right: 20 },
            didDrawPage: function(data) {
                // Footer
                doc.setFontSize(10);
                const pageCount = doc.internal.getNumberOfPages();
                doc.text('Página ' + doc.internal.getCurrentPageInfo().pageNumber + " of " + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        // Update yPos after table
        yPos = doc.autoTable.previous.finalY + 10;

        // Add summary
        const subtotal = document.getElementById('subtotal-display').textContent;
        const tax = document.getElementById('tax-display').textContent;
        const total = document.getElementById('total-display').textContent;

        doc.setFontSize(12);
        const summaryXPosLabel = 150;
        const summaryXPosValue = 190;

        doc.text(`Subtotal:`, summaryXPosLabel, yPos, { align: 'right' });
        doc.text(`${Math.round(parseFloat(subtotal))}`, summaryXPosValue, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`Impuesto:`, summaryXPosLabel, yPos, { align: 'right' });
        doc.text(`${Math.round(parseFloat(tax))}`, summaryXPosValue, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`Total:`, summaryXPosLabel, yPos, { align: 'right' });
        doc.text(`${Math.round(parseFloat(total))}`, summaryXPosValue, yPos, { align: 'right' });

        // Add underline for total
        doc.line(summaryXPosLabel - 10, yPos + 3, summaryXPosValue, yPos + 3);

        // Add total in words
        yPos += 20;
        const totalInWords = document.getElementById('total-words-display').textContent;
        doc.setFontSize(12);
        doc.text(`Total en letras: ${totalInWords}`, 20, yPos);

        // Save the PDF
        doc.save('cotizacion.pdf');
    });

    // Initial item row when the page loads
    addItemRow();
});

// Function to convert numbers to Spanish words (more detailed implementation needed)
// This is a complex function and a full implementation is outside the scope of this basic example.
// You might consider using a library for this.
// Example structure (simplified - does not handle all cases or large numbers):
function convertNumberToWords(num) {
    // Ensure num is a number
    num = parseFloat(num);
    if (isNaN(num)) return 'Cantidad no válida';

    const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    if (num === 0) return 'cero';

    let entero = Math.floor(num);
    let enteroEnLetras = '';

    const convertHundreds = (n) => {
        if (n === 100) return 'cien';
        let result = '';
        if (n > 99) {
            result += hundreds[Math.floor(n / 100)] + ' ';
            n %= 100;
        }
        if (n < 10) result += units[n];
        else if (n < 20) result += teens[n - 10];
        else {
            result += tens[Math.floor(n / 10)];
            if (n % 10 > 0) result += ' y ' + units[n % 10];
        }
        return result.trim();
    };

    if (entero < 1000) {
        enteroEnLetras = convertHundreds(entero);
    } else if (entero < 1000000) {
        let miles = Math.floor(entero / 1000);
        let restoMiles = entero % 1000;
        if (miles === 1) enteroEnLetras = 'mil';
        else enteroEnLetras = convertHundreds(miles) + ' mil';
        if (restoMiles > 0) {
            enteroEnLetras += ' ' + convertHundreds(restoMiles);
        }
    } else if (entero < 1000000000) {
        let millones = Math.floor(entero / 1000000);
        let restoMillones = entero % 1000000;
        if (millones === 1) enteroEnLetras = 'un millón';
        else enteroEnLetras = convertHundreds(millones) + ' millones';
        if (restoMillones > 0) {
            enteroEnLetras += ' ' + convertHundreds(Math.floor(restoMillones / 1000)) + ' mil';
            if (restoMillones % 1000 > 0) enteroEnLetras += ' ' + convertHundreds(restoMillones % 1000);
        }
    }
    // Add more cases for larger numbers if needed

    let resultado = enteroEnLetras;
    return resultado.charAt(0).toUpperCase() + resultado.slice(1).replace(/\s+/g, ' ').trim();
} 