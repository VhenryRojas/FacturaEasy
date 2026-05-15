document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    if (!docId) {
        document.getElementById('loading').innerHTML = "No se especificó ningún documento.";
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/documentos/${docId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.status === 'success') {
            const doc = json.data;
            document.getElementById('headerFileName').innerText = doc.nombreArchivo;

            // Se usa la función compartida que estará cargada en el HTML.
            renderInvoice(doc.datosJson);

            document.getElementById('loading').style.display = 'none';
            document.getElementById('invoiceResult').style.display = 'block';
        } else {
            throw new Error(json.message);
        }

    } catch (error) {
        document.getElementById('loading').innerHTML = "Error al cargar: " + error.message;
    }
});