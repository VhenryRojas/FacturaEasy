document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMsg');
    const successDiv = document.getElementById('successMsg');
    const btn = document.getElementById('btnSubmit');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    btn.disabled = true;

    try {
        const res = await fetch('http://localhost:3000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await res.json();

        if (data.status === 'success') {
            successDiv.innerText = "¡Cuenta creada! Redirigiendo al login...";
            successDiv.style.display = 'block';
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        errorDiv.innerText = "⚠️ " + err.message;
        errorDiv.style.display = 'block';
        btn.disabled = false;
    }
});