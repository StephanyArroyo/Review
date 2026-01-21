const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.post("/api/review", async (req, res) => {
  const { nombre } = req.body;

  const prompt = `
    Da una reseña general promedio de 70 palabras del restaurante, hotel o lugar turistico ${nombre} en Colombia,
    teniendo en cuenta TODAS las reseñas en la web basadas únicamente en las experiencias
    reales de todas las personas que ya han visitado el lugar, incluyendo tanto las
    negativas como las positivas. Responde SIEMPRE en español. 
    Al inicio escribe SIEMPRE esta frase exacta: "Sentimiento predominante entre los visitantes: [VALOR]" 
    donde [VALOR] sea POSITIVO, NEGATIVO o NEUTRAL, seguido de un salto de linea y luego la reseña.
  `;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Modelo ultra rápido y compatible
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }]
    });

    const textoIA = response.content[0].text;
    console.log("Respuesta de la IA:", textoIA); // Esto aparecerá en tu terminal
    res.json({ reply: textoIA });

  } catch (error) {
    console.error("DETALLE DEL ERROR:", error);
    res.status(500).json({ error: "Error de API", message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Servidor en http://localhost:${PORT}`);
});
