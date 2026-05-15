function renderInvoice(data) {
    const renderField = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (value !== null && value !== undefined && String(value).trim() !== "") {
            el.innerText = value;
            el.classList.remove('badge-null');
        } else {
            el.innerHTML = 'NO DETECTADO';
            el.classList.add('badge-null');
        }
    };

    const renderMoney = (id, value, isNegative = false) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (value === null || value === undefined) {
            el.innerHTML = 'NO DETECTADO';
            el.className = 'badge-null';
            return;
        }
        const formatted = parseFloat(value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        el.innerText = (isNegative ? '-' : '') + formatted;
        el.className = 'font-mono';
        if (isNegative) el.style.color = '#ef4444';
        else el.style.color = 'inherit';
    };

    renderField('resNumFactura', data.numero_factura);
    renderField('resFecha', data.fecha_factura);

    const em = data.datos_emisor || {};
    const cli = data.datos_cliente || {};

    renderField('emNombre', em.nombre);
    renderField('emApellidos', em.apellidos);
    renderField('emId', em.identificacion);
    renderField('emDir', em.direccion);

    renderField('cliNombre', cli.nombre);
    renderField('cliApellidos', cli.apellidos);
    renderField('cliId', cli.identificacion);
    renderField('cliDir', cli.direccion);

    const tbody = document.getElementById('resTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        if (data.conceptos && data.conceptos.length > 0) {
            data.conceptos.forEach(item => {
                const row = document.createElement('tr');
                const descCell = `<td>${item.linea_concepto_factura || '<span class="badge-null">NO DETECTADO</span>'}</td>`;
                const qtyCell = `<td class="text-right font-mono">${item.unidades_linea_factura || 1}</td>`;

                let priceDisplay;
                if (item.linea_importe_factura === null || item.linea_importe_factura === undefined) {
                    priceDisplay = '<span class="badge-null">NO DETECTADO</span>';
                } else {
                    priceDisplay = parseFloat(item.linea_importe_factura).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
                }
                const priceCell = `<td class="text-right font-mono">${priceDisplay}</td>`;

                row.innerHTML = descCell + qtyCell + priceCell;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem; color: #64748b;">No se extrajeron líneas de productos</td></tr>';
        }
    }

    renderMoney('resBruto', data.importe_bruto);
    const elIva = document.getElementById('resPorcIva');
    if (elIva) {
        if (data.porcentaje_iva !== null) elIva.innerText = data.porcentaje_iva;
        else elIva.innerText = '-';
    }

    renderMoney('resImporteIva', data.importe_iva);

    const rowDesc = document.getElementById('rowDescuento');
    if (data.importe_descuento !== null && data.importe_descuento > 0) {
        if (rowDesc) rowDesc.style.display = 'flex';
        renderMoney('resDescuento', data.importe_descuento, true);
    } else {
        if (rowDesc) rowDesc.style.display = 'none';
    }

    renderMoney('resTotal', data.importe_final);
}