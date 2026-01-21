const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const path = require("path"); // 1. IMPORTANTE: Necesario para manejar carpetas

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 2. CONFIGURACIÓN PARA MOSTRAR TU HTML
// Esto le dice a Express que use la carpeta actual para buscar archivos estáticos
app.use(express.static(__dirname));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// 3. RUTA RAÍZ: Esto quita el error "Cannot GET /"
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// TU RUTA DE LA API (La que ya tenías)
app.post("/api/review", async (req, res) => {
  const { nombre } = req.body;

  const prompt = `
    Da una reseña general promedio de 70 palabras del restaurante, hotel o lugar turistico ${nombre} en Colombia,
    teniendo en cuenta TODAS las reseñas en la web basadas únicamente en las experiencias
    reales de todas las personas que ya han visitado el lugar, incluyendo tanto las
    negativas como las positivas. Responde SIEMPRE en español. Al inicio escribe en mayuscula el sentimiento predominante
    (Sentimiento predominante entre los visitantes: POSITIVO, Sentimiento predominante entre los visitantes: NEGATIVO o Sentimiento predominante entre los visitantes: NEUTRAL) seguido de un salto de linea y luego la reseña.
  `;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", //
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ reply: response.content[0].text });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Error llamando a la API", details: error.message });
  }
});

// 4. ENCENDIDO DEL SERVIDOR (Solo un app.listen al final)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Servidor activo en el puerto ${PORT}`);
});
