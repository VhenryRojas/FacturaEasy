const formatMoney = (val) => val ? parseFloat(val).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €' : '-';

async function cargarHistorial() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'login.html';

    try {
        const res = await fetch('http://localhost:3000/api/documentos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const tbody = document.getElementById('historyBody');
        document.getElementById('loading').style.display = 'none';

        if (data.status === 'success' && data.data.length > 0) {
            tbody.innerHTML = ''; // Limpiar.

            data.data.forEach(doc => {
                const row = document.createElement('tr');
                const fechaVisual = doc.fechaEmision || new Date(doc.creadoEn).toLocaleDateString();

                row.innerHTML = `
                    <td><span style="color:#94a3b8">#${doc.id}</span></td>
                    <td><span class="badge-date">${fechaVisual}</span></td>
                    <td style="font-weight: 500;">${doc.emisor || '<span style="color:#cbd5e1; font-style:italic">Desconocido</span>'}</td>
                    <td style="font-size: 0.9rem; color: #64748b;">${doc.nombreArchivo}</td>
                    <td class="font-mono" style="text-align: right; font-weight: bold;">${formatMoney(doc.total)}</td>
                    <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
                        <button class="btn-view" onclick="verDetalle(${doc.id})">Ver</button>
                        <button onclick="eliminarDocumento(${doc.id})" style="background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem; transition: 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Borrar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay documentos procesados aún.</td></tr>';
        }
    } catch (error) {
        document.getElementById('loading').innerText = "Error al cargar datos";
        console.error(error);
    }
}

function verDetalle(id) {
    window.location.href = `detalle.html?id=${id}`;
}

async function eliminarDocumento(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta factura? Esta acción no se puede deshacer.")) {
        return;
    }
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/documentos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
            cargarHistorial();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert("Error al eliminar: " + error.message);
    }
}

// Cargar al iniciar.
document.addEventListener("DOMContentLoaded", cargarHistorial);