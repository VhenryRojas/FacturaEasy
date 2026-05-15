document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("app-navbar");
    if (!navbarContainer) return;

    const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';

    // Detectar página actual para marcarla como activa.
    const path = window.location.pathname;
    const isHome = path.includes('index.html') || path === '/';
    const isHistorial = path.includes('historial.html');
    const isPerfil = path.includes('perfil.html');

    navbarContainer.innerHTML = `
        <nav class="navbar">
            <a href="index.html" class="nav-brand">
                <img src="/img/logo_factura_easy3.png" height="60" style="margin-right: 1px; vertical-align: middle;">
            </a>

            <div class="nav-menu">
                <a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Escanear</a>
                <a href="historial.html" class="nav-link ${isHistorial ? 'active' : ''}">Historial</a>
                <a href="perfil.html" class="nav-link ${isPerfil ? 'active' : ''}">Mi Perfil</a> 
            </div>

            <div class="nav-user">
                <span class="user-name">Hola, ${usuarioNombre}</span>
                <button onclick="window.logoutGlobal()" class="btn-logout">Salir</button>
            </div>
        </nav>
    `;
});

// FUNCIÓN DE CERRAR SESIÓN GLOBAL.
window.logoutGlobal = function () {
    if (confirm("¿Seguro que quieres cerrar sesión?")) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioNombre');
        window.location.href = 'login.html';
    }
};