document.addEventListener("DOMContentLoaded", () => {
    // 1. Al abrir la página, se rellena el input con el nombre que ya tenemos guardado.
    const inputNombre = document.getElementById('nombreUsuario');
    if (inputNombre) {
        inputNombre.value = localStorage.getItem('usuarioNombre') || '';
    }

    // 2. Al enviar el formulario.
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nuevoNombre = document.getElementById('nombreUsuario').value;
            const token = localStorage.getItem('token');
            const divExito = document.getElementById('msgExito');
            const divError = document.getElementById('msgError');
            const btn = document.getElementById('btnGuardar');

            divExito.style.display = 'none'; divError.style.display = 'none';
            btn.disabled = true; btn.innerText = "Guardando...";

            try {
                const res = await fetch('http://localhost:3000/api/perfil', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre: nuevoNombre })
                });

                const data = await res.json();

                if (data.status === 'success') {
                    localStorage.setItem('usuarioNombre', data.usuario.nombre);
                    divExito.innerText = "¡Nombre actualizado con éxito!";
                    divExito.style.display = 'block';

                    setTimeout(() => location.reload(), 1500);
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                divError.innerText = "⚠️ " + err.message;
                divError.style.display = 'block';
            } finally {
                btn.disabled = false; btn.innerText = "Guardar Cambios";
            }
        });
    }
});