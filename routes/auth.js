const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const { autenticarUsuario } = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY_JWT;

//1. REGISTRO DE USUARIO (CREATE).
router.post('/registro', async (req, res) => {
    try {
        const { email, password, nombre } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Faltan datos' });
        }

        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ status: 'error', message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = await prisma.usuario.create({
            data: { email, password: hashedPassword, nombre }
        });

        res.json({ status: 'success', message: 'Usuario creado correctamente' });

    } catch (error) {
        console.error("Error registro:", error);
        res.status(500).json({ status: 'error', message: 'Error en el servidor' });
    }
});

//2. LOGIN DE USUARIO.
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ userId: usuario.id, email: usuario.email }, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            status: 'success',
            message: 'Login exitoso',
            token: token,
            usuario: { nombre: usuario.nombre, email: usuario.email }
        });

    } catch (error) {
        console.error("Error login:", error);
        res.status(500).json({ status: 'error', message: 'Error en el servidor' });
    }
});

//3. ACTUALIZAR PERFIL (UPDATE).
router.put('/perfil', autenticarUsuario, async (req, res) => {
    try {
        const { nombre } = req.body;

        // 1. Validar que no nos envíen un nombre vacío.
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ status: 'error', message: 'El nombre no puede estar vacío' });
        }

        // 2. Actualizar en la base de datos usando el ID del token (req.usuario.userId).
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: req.usuario.userId },
            data: { nombre: nombre }
        });

        res.json({
            status: 'success',
            message: 'Perfil actualizado correctamente',
            usuario: { nombre: usuarioActualizado.nombre, email: usuarioActualizado.email }
        });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ status: 'error', message: 'Error en el servidor' });
    }
});

module.exports = router;