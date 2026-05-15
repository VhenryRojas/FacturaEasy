const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

// Importamos la IA y el Middleware subiendo un nivel de carpeta (../)
const { analizarDocumento } = require('../services/geminiService');
const { autenticarUsuario } = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// Configuración de multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

//1. ANALIZAR DOCUMENTO.
router.post('/analizar', autenticarUsuario, upload.single('documento'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No hay archivo." });

        console.log(`Usuario ID ${req.usuario.userId} subiendo archivo...`);

        const datosExtraidos = await analizarDocumento(req.file.buffer, req.file.mimetype);

        /* const nuevoDocumento = await prisma.documento.create({
            data: {
                nombreArchivo: req.file.originalname,
                tipoArchivo: req.file.mimetype,
                numeroFactura: datosExtraidos.numero_factura || null,
                fechaEmision: datosExtraidos.fecha_factura || null,
                total: datosExtraidos.importe_final || null,
                emisor: datosExtraidos.datos_emisor?.nombre || null,
                datosJson: datosExtraidos,
                usuarioId: req.usuario.userId
            }
        }); */
        const nuevoDocumento = await prisma.documento.create({
            data: {
                nombreArchivo: req.file.originalname,
                tipoArchivo: req.file.mimetype,
                numeroFactura: datosExtraidos.numero_factura || null,
                fechaEmision: datosExtraidos.fecha_factura || null,
                total: datosExtraidos.importe_final ? parseFloat(datosExtraidos.importe_final) : null,
                emisor: datosExtraidos.datos_emisor?.nombre ? datosExtraidos.datos_emisor.nombre : null,
                datosJson: datosExtraidos,
                usuarioId: req.usuario.userId
            }
        });

        res.json({ status: 'success', data: datosExtraidos, dbId: nuevoDocumento.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

//2. VER HISTORIAL (READ).
router.get('/documentos', autenticarUsuario, async (req, res) => {
    try {
        const documentos = await prisma.documento.findMany({
            where: {
                usuarioId: req.usuario.userId
            },
            orderBy: { creadoEn: 'desc' },
            select: {
                id: true, nombreArchivo: true, fechaEmision: true, emisor: true, total: true, creadoEn: true
            }
        });
        res.json({ status: 'success', data: documentos });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

//3. VER 1 DOCUMENTO (READ).
router.get('/documentos/:id', autenticarUsuario, async (req, res) => {
    try {
        const { id } = req.params;

        const documento = await prisma.documento.findFirst({
            where: {
                id: Number(id),
                usuarioId: req.usuario.userId
            }
        });

        if (!documento) {
            return res.status(404).json({ status: 'error', message: 'Documento no encontrado o sin permisos' });
        }

        res.json({ status: 'success', data: documento });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

//ELIMINAR 1 DOCUMENTO (DELETE).
router.delete('/documentos/:id', autenticarUsuario, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. SEGURIDAD: Comprobamos que el documento existe y ES DEL USUARIO que lo intenta borrar.
        const documento = await prisma.documento.findFirst({
            where: {
                id: Number(id),
                usuarioId: req.usuario.userId
            }
        });

        if (!documento) {
            return res.status(404).json({ status: 'error', message: 'Documento no encontrado o no tienes permisos' });
        }

        // 2. Si pasa el filtro, lo borramos definitivamente.
        await prisma.documento.delete({
            where: { id: Number(id) }
        });

        res.json({ status: 'success', message: 'Documento eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;