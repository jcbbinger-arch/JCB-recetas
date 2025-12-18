
export interface MasterProduct {
  id?: string;
  nombre: string;
  precio: number | null;
  unit?: string; 
  unidad: string;
  categoria?: string;
  alérgenos: string[];
}

export const MASTER_PRODUCTS: MasterProduct[] = [
  // --- ACEITES Y BÁSICOS ---
  { nombre: "ACEITE DE OLIVA SUAVE 1 L. (Inamar)", precio: 8.97, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE DE OLIVA SUAVE 5 L. (Inamar)", precio: 8.87, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE DE OLIVA V.E. Arbequina", precio: 8.03, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE GIRASOL (Inamar) 1 l.", precio: 1.82, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE GIRASOL (Inamar) 5 l.", precio: 1.5, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE OLIVA VIRGEN EXTRA Coato 1l.", precio: 10.0, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE OLIVA VIRGEN EXTRA Coato 5l.", precio: 9.1, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE SÉSAMO 1,7 l.", precio: 11.42, unidad: "Litro", alérgenos: ["Sésamo"] },
  { nombre: "ACEITE TRUFA BLANCA (250 ml) spray", precio: 9.5, unidad: "Botella", alérgenos: [] },
  { nombre: "ACEITUNAS CUQUILLO", precio: 4.76, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS GORDALES", precio: 7.07, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS NEGRAS RODAJAS", precio: 10.33, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS NEGRAS S/H", precio: 4.95, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS RELLENAS ANCHOA", precio: 6.9, unidad: "Kg", alérgenos: ["Pescado"] },
  { nombre: "ACELGA 5 hojas", precio: 0.9, unidad: "Manojo", alérgenos: [] },
  { nombre: "ACHICORIA / RADICHIO", precio: 2.05, unidad: "Pieza", alérgenos: [] },
  { nombre: "AGAR-AGAR", precio: 56.04, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUACATE", precio: 6.4, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA ENTERA (Magra)", precio: 6.32, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA ENTERA AÑOJO", precio: 11.55, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA TROCEADA", precio: 6.82, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA TROCEADA AÑOJO", precio: 9.79, unidad: "Kg", alérgenos: [] },
  { nombre: "AJÍ AMARILLOS", precio: 6.35, unidad: "Kg", alérgenos: [] },
  { nombre: "AJO EN POLVO", precio: 12.27, unidad: "Kg", alérgenos: [] },
  { nombre: "AJOS SECOS", precio: 5.0, unidad: "Kg", alérgenos: [] },
  { nombre: "AJOS TIERNOS", precio: 5.0, unidad: "Manojo", alérgenos: [] },
  { nombre: "ALA POLLO", precio: 4.48, unidad: "Kg", alérgenos: [] },
  { nombre: "ALBAHACA (125 g)", precio: 3.7, unidad: "Tarrina", alérgenos: [] },
  { nombre: "ALBARICOQUES", precio: 2.0, unidad: "Kg", alérgenos: [] },
  { nombre: "ALBÚMINA (MERENGUE) Claraval", precio: 25.63, unidad: "Kg", alérgenos: ["Huevos"] },
  { nombre: "ALCACHOFA", precio: 6.5, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCACHOFA CORAZÓN", precio: 7.22, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCAPARRAS", precio: 11.47, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCAPARRÓN FINO", precio: 18.43, unidad: "Kg", alérgenos: [] },
  { nombre: "ALI-OLI RIOBA", precio: 7.28, unidad: "Kg", alérgenos: ["Huevos"] },
  { nombre: "ALMEJA CHIRLA", precio: 13.15, unidad: "Kg", alérgenos: ["Moluscos"] },
  { nombre: "ALMEJA JAPONICA", precio: 14.24, unidad: "Kg", alérgenos: ["Moluscos"] },

  // --- VERDURAS FRESCAS (NORMALIZADAS A KG) ---
  { nombre: "Alcachofas frescas", precio: 15.26, unidad: "Kg", alérgenos: [] },
  { nombre: "Apio tierno", precio: 5.60, unidad: "Kg", alérgenos: ["Apio"] },
  { nombre: "Carlota rama", precio: 2.33, unidad: "Kg", alérgenos: [] },
  { nombre: "Cogollos de lechuga", precio: 2.52, unidad: "Kg", alérgenos: [] },
  { nombre: "Coliflor", precio: 8.12, unidad: "Kg", alérgenos: [] },
  { nombre: "Endivia", precio: 2.80, unidad: "Kg", alérgenos: [] },
  { nombre: "Nabo", precio: 3.14, unidad: "Kg", alérgenos: [] },
  { nombre: "Chirivias", precio: 1.27, unidad: "Kg", alérgenos: [] },
  { nombre: "Judias finas", precio: 11.76, unidad: "Kg", alérgenos: [] },
  { nombre: "Judia roja", precio: 13.86, unidad: "Kg", alérgenos: [] },
  { nombre: "Lechuga", precio: 1.81, unidad: "Kg", alérgenos: [] },
  { nombre: "Iceberg", precio: 1.81, unidad: "Kg", alérgenos: [] },
  { nombre: "Pepinos", precio: 4.56, unidad: "Kg", alérgenos: [] },
  { nombre: "Pimiento rojo", precio: 13.86, unidad: "Kg", alérgenos: [] },
  { nombre: "Pimiento italiano", precio: 5.18, unidad: "Kg", alérgenos: [] },
  { nombre: "Pimiento padron", precio: 8.68, unidad: "Kg", alérgenos: [] },
  { nombre: "Rabanos", precio: 2.10, unidad: "Kg", alérgenos: [] },
  { nombre: "Zanahorias", precio: 2.37, unidad: "Kg", alérgenos: [] },
  { nombre: "Jengibre fresco", precio: 10.50, unidad: "Kg", alérgenos: [] },
  { nombre: "Col lombarda", precio: 5.63, unidad: "Kg", alérgenos: [] },
  { nombre: "Pimiento ñora", precio: 28.00, unidad: "Kg", alérgenos: [] }, // Ajustado de 14€/0.5kg
  { nombre: "Pimiento pericana", precio: 7.01, unidad: "Kg", alérgenos: [] },

  // --- REPOSTERÍA Y TÉCNICOS (PRECIOS POR KG) ---
  { nombre: "Levadura en polvo", precio: 6.06, unidad: "Kg", alérgenos: [] }, // Ajustado de 5.45/900g
  { nombre: "Cobertura chocolate 38%", precio: 18.02, unidad: "Kg", alérgenos: ["Leche", "Soja"] }, // Ajustado de 45.05/2.5kg
  { nombre: "Virutas de chocolate con leche", precio: 29.02, unidad: "Kg", alérgenos: ["Leche", "Soja"] }, // Ajustado de 14.51/500g
  { nombre: "Cobertura chocolate 64%", precio: 15.31, unidad: "Kg", alérgenos: ["Soja"] }, // Ajustado de 38.27/2.5kg
  { nombre: "Virutas de chocolate negro", precio: 29.02, unidad: "Kg", alérgenos: ["Soja"] }, // Ajustado de 14.51/500g
  { nombre: "Cobertura chocolate 55%", precio: 14.81, unidad: "Kg", alérgenos: ["Soja"] },
  { nombre: "Cobertura chocolate blanco 30%", precio: 15.73, unidad: "Kg", alérgenos: ["Leche", "Soja"] },
  { nombre: "Cobertura chocolate 50%", precio: 12.78, unidad: "Kg", alérgenos: ["Soja"] },
  { nombre: "Cobertura chocolate 72%", precio: 16.39, unidad: "Kg", alérgenos: ["Soja"] },

  // --- ESPECIAS (POR KG PARA PRECISIÓN) ---
  { nombre: "Estragon hojas", precio: 66.75, unidad: "Kg", alérgenos: [] }, 
  { nombre: "Pimienta blanca grano", precio: 27.74, unidad: "Kg", alérgenos: [] },
  { nombre: "Pimienta blanca molida", precio: 23.11, unidad: "Kg", alérgenos: [] },
  { nombre: "Eneldo", precio: 26.33, unidad: "Kg", alérgenos: [] },
  { nombre: "Bayas de enebro", precio: 45.70, unidad: "Kg", alérgenos: [] },
  { nombre: "Semillas de amapola", precio: 14.48, unidad: "Kg", alérgenos: [] },
  { nombre: "Canela ceylan rama", precio: 106.80, unidad: "Kg", alérgenos: [] },
  { nombre: "Albahaca hoja seca", precio: 12.05, unidad: "Kg", alérgenos: [] },
  { nombre: "Pimienta negra partida", precio: 26.13, unidad: "Kg", alérgenos: [] },
  { nombre: "Comino semillas", precio: 13.69, unidad: "Kg", alérgenos: [] },
  { nombre: "Clavo grano", precio: 38.33, unidad: "Kg", alérgenos: [] },
  { nombre: "Romero molido", precio: 18.71, unidad: "Kg", alérgenos: [] },
  { nombre: "Anis estrellado", precio: 37.70, unidad: "Kg", alérgenos: [] },
  { nombre: "Orégano hoja", precio: 21.93, unidad: "Kg", alérgenos: [] },
  { nombre: "Tomillo", precio: 14.95, unidad: "Kg", alérgenos: [] },

  // --- OTROS (NORMALIZADOS A KG) ---
  { nombre: "Espárrago verde", precio: 12.35, unidad: "Kg", alérgenos: [] }, // Ajustado de manojo
  { nombre: "Judía helda", precio: 2.90, unidad: "Kg", alérgenos: [] },
  { nombre: "Calabacín negro", precio: 2.65, unidad: "Kg", alérgenos: [] },
  { nombre: "Calabaza cacahuete", precio: 1.42, unidad: "Kg", alérgenos: [] },
  { nombre: "Patata agria", precio: 0.80, unidad: "Kg", alérgenos: [] }, // Ajustado de 4€/5kg
  { nombre: "Patata violeta", precio: 3.53, unidad: "Kg", alérgenos: [] }, // Ajustado de 5.29/1.5kg
  { nombre: "Cebolla dulce", precio: 1.99, unidad: "Kg", alérgenos: [] },
  { nombre: "Cebolla chalota", precio: 5.60, unidad: "Kg", alérgenos: [] },
  { nombre: "Ajo blanco", precio: 5.88, unidad: "Kg", alérgenos: [] },
  { nombre: "Cebolla morada", precio: 1.52, unidad: "Kg", alérgenos: [] },
  { nombre: "Cebolla guisos", precio: 0.65, unidad: "Kg", alérgenos: [] },
  { nombre: "Tomate intenso", precio: 3.22, unidad: "Kg", alérgenos: [] },
  { nombre: "Tomate rama", precio: 2.67, unidad: "Kg", alérgenos: [] },
  { nombre: "Tomate cherry", precio: 4.03, unidad: "Kg", alérgenos: [] },

  // --- LÁCTEOS Y QUESOS (POR KG) ---
  { nombre: "Queso grana padano D.O.P.", precio: 19.08, unidad: "Kg", alérgenos: ["Leche"] },
  { nombre: "Queso rallado hilo", precio: 7.27, unidad: "Kg", alérgenos: ["Leche"] },
  { nombre: "Queso azul 5% oveja", precio: 32.38, unidad: "Kg", alérgenos: ["Leche"] },
  { nombre: "Queso provolone dulce D.O.P.", precio: 14.03, unidad: "Kg", alérgenos: ["Leche"] },
  { nombre: "Queso edam en barra", precio: 29.30, unidad: "Kg", alérgenos: ["Leche"] },
  { nombre: "Champiñón gordo", precio: 4.16, unidad: "Kg", alérgenos: [] } // Ajustado de 10.40/2.5kg
];
