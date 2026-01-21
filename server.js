const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Verificación de API KEY en consola al iniciar
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: No se encontró la ANTHROPIC_API_KEY en el archivo .env");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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
      // Cambiado a un modelo de amplia disponibilidad
      model: "claude-3-sonnet-20240229", 
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });

    if (response && response.content && response.content[0]) {
      res.json({ reply: response.content[0].text });
    } else {
      throw new Error("Respuesta de IA vacía");
    }

  } catch (error) {
    console.error("DETALLE DEL ERROR EN SERVIDOR:", error);
    res.status(500).json({ 
      error: "Error en el servidor", 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Servidor activo en http://localhost:${PORT}`);
});
