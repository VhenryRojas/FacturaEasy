document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');

    // 1. VISOR DE PREVISUALIZACIÓN.
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            document.getElementById('fileName').innerText = "Archivo: " + file.name;

            const previewDiv = document.getElementById('previewContainer');
            const contentDiv = document.getElementById('previewContent');
            const url = URL.createObjectURL(file);

            previewDiv.style.display = 'block';
            contentDiv.innerHTML = file.type === 'application/pdf'
                ? `<embed class="preview-frame" src="${url}" type="application/pdf">`
                : `<img class="preview-frame" src="${url}">`;
        });
    }

    // 2. ENVÍO DEL FORMULARIO A LA IA.
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (fileInput.files.length === 0) return alert("Selecciona un archivo");

            const btn = document.getElementById('submitBtn');
            const loader = document.getElementById('loader');
            const resultDiv = document.getElementById('invoiceResult');
            const errorDiv = document.getElementById('errorMsg');

            btn.disabled = true; loader.style.display = "block"; resultDiv.style.display = "none"; errorDiv.style.display = "none";

            const formData = new FormData();
            formData.append('documento', fileInput.files[0]);

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert("Debes iniciar sesión primero");
                    window.location.href = 'login.html';
                    return;
                }

                const res = await fetch('http://localhost:3000/api/analizar', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                const data = await res.json();

                if (data.status === 'success') {
                    // SE LLAMA A LA FUNCIÓN COMPARTIDA (que estará cargada en el HTML).
                    renderInvoice(data.data);
                    resultDiv.style.display = "block";
                    resultDiv.scrollIntoView({ behavior: 'smooth' });
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                console.error(err);
                errorDiv.innerText = "Error: " + err.message;
                errorDiv.style.display = "block";
            } finally {
                btn.disabled = false; loader.style.display = "none";
            }
        });
    }
});