
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const digitalizeRecipe = async (fileBase64: string, mimeType: string): Promise<Partial<Recipe>> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Eres un experto en gestión de cocina profesional y estandarización de recetas.
    Tu tarea es extraer los datos de este documento (Imagen o PDF) y convertirlos en una Ficha Técnica estructurada en JSON.
    
    REGLAS CRÍTICAS:
    1. Extrae el nombre, categoría (elige entre: Entrantes, Primeros, Pescados, Carnes, Postres, Salsas/Fondos), autor y rendimiento.
    2. Divide los ingredientes en elaboraciones si el documento lo sugiere.
    3. Para cada ingrediente, separa estrictamente: nombre, cantidad (número) y unidad (kg, g, l, ml, ud, c.s., etc).
    4. Las instrucciones deben ser claras y numeradas.
    5. Extrae detalles de servicio si existen (temperatura, marcaje, tipo de servicio).
    
    Formato de salida (JSON):
    {
      "name": "Nombre",
      "category": "Categoría",
      "yieldQuantity": 4,
      "yieldUnit": "raciones",
      "elaborations": [
        {
          "name": "Nombre de la elaboración",
          "ingredients": [
            {"name": "Producto", "quantity": 100, "unit": "g"}
          ],
          "instructions": "Paso 1... Paso 2..."
        }
      ],
      "notes": "Puntos críticos",
      "serviceDetails": {
        "servingTemp": "Temp",
        "presentation": "Cómo emplatar"
      }
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: fileBase64.split(',')[1] || fileBase64,
              mimeType: mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error parseando JSON de la IA:", error);
    throw new Error("La IA no pudo estructurar los datos correctamente.");
  }
};
