const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(__dirname));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Ruta para la API
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
      model: "claude-3-5-sonnet-20240620", // Asegúrate de usar un modelo válido
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ reply: response.content[0].text });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Error llamando a la API", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Servidor activo en http://localhost:${PORT}`);
});
