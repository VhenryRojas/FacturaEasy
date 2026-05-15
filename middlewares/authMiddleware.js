const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY_JWT;

function autenticarUsuario(req, res, next) {
    const authHeader = req.headers['authorization'];
    // El token suele venir así: "Bearer eyJhbGciOi..."
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Acceso denegado: Necesitas iniciar sesión' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ status: 'error', message: 'Token no válido o expirado' });
        }
        // ÉXITO. Guardo los datos del usuario dentro de la petición.
        req.usuario = user; 
        next();
    });
}

module.exports = { autenticarUsuario };