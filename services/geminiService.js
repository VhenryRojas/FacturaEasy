const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// DEFINIMOS EL ESQUEMA ESTRICTO PARA GEMINI
const esquemaFacturaGemini = {
    type: SchemaType.OBJECT,
    properties: {
        numero_factura: { type: SchemaType.STRING, nullable: true },
        fecha_factura: { type: SchemaType.STRING, nullable: true },
        
        datos_cliente: {
            type: SchemaType.OBJECT,
            nullable: true,
            properties: {
                nombre: { type: SchemaType.STRING, nullable: true },
                apellidos: { type: SchemaType.STRING, nullable: true },
                identificacion: { type: SchemaType.STRING, nullable: true },
                direccion: { type: SchemaType.STRING, nullable: true }
            },
            required: ["nombre", "apellidos", "identificacion", "direccion"]
        },
        
        datos_emisor: {
            type: SchemaType.OBJECT,
            nullable: true,
            properties: {
                nombre: { type: SchemaType.STRING, nullable: true },
                apellidos: { type: SchemaType.STRING, nullable: true },
                identificacion: { type: SchemaType.STRING, nullable: true },
                direccion: { type: SchemaType.STRING, nullable: true }
            },
            required: ["nombre", "apellidos", "identificacion", "direccion"]
        },
        
        conceptos: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    linea_concepto_factura: { type: SchemaType.STRING, nullable: true },
                    unidades_linea_factura: { type: SchemaType.NUMBER, nullable: true },
                    linea_importe_factura: { type: SchemaType.NUMBER, nullable: true }
                },
                required: ["linea_concepto_factura", "unidades_linea_factura", "linea_importe_factura"]
            }
        },
        
        importe_bruto: { type: SchemaType.STRING, nullable: true },
        porcentaje_iva: { type: SchemaType.STRING, nullable: true, description: "Solo el número, debes devolver máximo 2 decimales. Ejemplo: '21.00'" },
        importe_iva: { type: SchemaType.STRING, nullable: true },
        porcentaje_descuento: { type: SchemaType.STRING, nullable: true },
        importe_descuento: { type: SchemaType.STRING, nullable: true },
        importe_final: { type: SchemaType.STRING, nullable: true }
    },
    required: [
        "numero_factura", 
        "fecha_factura", 
        "datos_cliente", 
        "datos_emisor", 
        "conceptos", 
        "importe_bruto", 
        "porcentaje_iva", 
        "importe_iva", 
        "porcentaje_descuento", 
        "importe_descuento", 
        "importe_final"
    ]
};

const model = genAI.getGenerativeModel({
    //model: "gemini-2.5-flash",
    //model: "gemini-3-flash-preview",
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: esquemaFacturaGemini,
        maxOutputTokens: 8192,
        temperature: 0,
    }
});

async function analizarDocumento(fileBuffer, mimeType) {
    try {
        console.log("1. Iniciando análisis con Prompt Avanzado...");

        const prompt = `
            Eres un sistema experto en contabilidad y OCR. Tu misión es extraer datos de una factura con precisión quirúrgica.
            
            Analiza la imagen adjunta y rellena el JSON siguiendo estas reglas estrictas:

            === GUÍA DE EXTRACCIÓN CAMPO A CAMPO ===

            1. SOBRE PERSONAS Y EMPRESAS (Cliente y Emisor):
               - **Nombre vs Apellidos**: 
                 * Si es una EMPRESA (tiene S.A., S.L., Inc, Corp, o parece una marca como 'Mercadona', 'Iberdrola'): Pon el nombre completo en "nombre"
                   y deja "apellidos" como null. NO dividas "Mercadona S.A." en Nombre: Mercadona, Apellidos: S.A.
                 * Si es una PERSONA FÍSICA: Intenta separar Nombre y Apellidos.
               - **Emisor**: Suele estar arriba a la izquierda o en el logotipo grande.
               - **Cliente**: Busca "A la atención de", "Cliente:", "Facturar a:".

            2. FECHAS (fecha_factura):
               - Formato de salida obligatorio: "DD/MM/AAAA" (Ej: 25/12/2023).
               - Si la fecha está en texto ("20 de Enero de 2024"), conviértela a formato numérico (20/01/2024).
               - Busca "Fecha emisión", "Fecha factura". No confundir con "Fecha vencimiento".

            3. IMPORTES (Moneda y Decimales):
               - Salida: Escribe el número como texto (Ej: "10.50" o "21")
               - NUNCA uses más de dos decimales. Si es un número entero como el 21%, devuelve "21".
               - Si hay símbolo de moneda (€, $) ignóralo, devuelve solo la cifra.
               - **Importe Final**: Es el total a pagar (generalmente abajo a la derecha, el número más grande y destacado).

            4. CONCEPTOS (Líneas de factura):
               - Extrae CADA línea de producto.
               - Si hay una columna "Cantidad", úsala. Si no, asume 1.
               - La descripción debe ser completa.
            
            5. **IMPORTANTE**:
               - No inventes datos que no estén en el documento.
               - No calcules ningún importe, descuentos, IVA, porcentajes, base imponible.
               - Siempre debes extraerse los datos tal cual vienen escrito en el documento.

            === ESTRUCTURA JSON A COMPLETAR (Respetar nulos) ===
            {
                "numero_factura": "string o null",
                "fecha_factura": "string DD/MM/AAAA o null",
                "datos_cliente": {
                    "nombre": "string (Razón social o Nombre de pila)",
                    "apellidos": "string (Solo si es persona física) o null",
                    "identificacion": "string (DNI/CIF) o null",
                    "direccion": "string o null"
                },
                "datos_emisor": {
                    "nombre": "string (Razón social o Nombre de pila)",
                    "apellidos": "string (Solo si es persona física) o null",
                    "identificacion": "string (DNI/CIF) o null",
                    "direccion": "string o null"
                },
                "conceptos": [
                    {
                        "linea_concepto_factura": "string",
                        "unidades_linea_factura": number, 
                        "linea_importe_factura": number
                    }
                ],
                "importe_bruto": "string" (Base imponible),
                "porcentaje_iva": "string" (Ej: 21.00),
                "importe_iva": "string" (Ej:26.10),
                "porcentaje_descuento": "string" (Ej:10.00),
                "importe_descuento": "string" (Ej:35.15),
                "importe_final": "string" (Ej:50.25)
            }
            
            Debes responder siempre con un JSON válido.
        `;

        const imagePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType: mimeType
            },
        };

        console.log("2. Enviando datos a Google...");
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("3. Respuesta recibida:", text);

        // Parseo simple del string a JSON
        const jsonResponse = JSON.parse(text);

        console.log("4. Extracción exitosa.");
        return jsonResponse; // Se devuelve el JSON directamente

    } catch (error) {
        console.error("Error IA:", error.message);
        throw error;
    }
}

module.exports = { analizarDocumento };