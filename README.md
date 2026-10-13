# FacturaEasy 📄⚡

> Aplicación web para la gestión, procesamiento e inteligencia aplicada al análisis de facturas y documentos contables.

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js, Express.js
- **Base de Datos & ORM:** Prisma ORM, PostgreSQL / MySQL
- **Inteligencia Artificial:** Google Gemini API (Servicios de extracción y análisis automatizado)
- **Autenticación & Seguridad:** Middlewares personalizados, JWT / Sesiones
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6)

---

## 🚀 Arquitectura del Proyecto

```text
FacturaEasy/
├── middlewares/    # Control de acceso y validación de sesiones
├── prisma/         # Modelado de datos y esquemas con Prisma ORM
├── public/         # Interfaz de usuario (HTML, CSS y scripts de renderizado)
├── routes/         # Endpoints modulares de la API REST (autenticación, documentos)
├── services/       # Integración con servicios externos (Google Gemini AI)
└── server.js       # Punto de entrada y servidor Express
