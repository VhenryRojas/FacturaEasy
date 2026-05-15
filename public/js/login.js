document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMsg');
    const btn = document.getElementById('btnSubmit');

    // Limpiar estado.
    errorDiv.style.display = 'none';
    btn.disabled = true;
    btn.innerText = "Verificando...";

    try {
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.status === 'success') {
            // SE GUARDA EL TOKEN EN EL NAVEGADOR.
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuarioNombre', data.usuario.nombre);

            // Redirigir al dashboard (index.html).
            window.location.href = 'index.html';
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        errorDiv.innerText = "⚠️" + err.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerText = "Entrar";
    }
});
