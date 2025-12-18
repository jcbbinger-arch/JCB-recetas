
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
  { nombre: "ACEITUNAS CUQUILLO (2,6 kg)", precio: 4.76, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS GORDALES", precio: 7.07, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS NEGRAS RODAJAS (330 g)", precio: 10.33, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS NEGRAS S/H (333 g)", precio: 4.95, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS RELLENAS ANCHOA (600 g)", precio: 6.9, unidad: "Kg", alérgenos: ["Pescado"] },
  { nombre: "ACELGA 5 hojas", precio: 0.9, unidad: "Manojo", alérgenos: [] },
  { nombre: "ACHICORIA / RADICHIO", precio: 2.05, unidad: "Pieza", alérgenos: [] },
  { nombre: "ACIDO Grifo cerveza (10 kg)", precio: 48.0, unidad: "Botella", alérgenos: ["Gluten"] },
  { nombre: "AGAR-AGAR (500 g)", precio: 56.04, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUA BOTELLIN 33 cl x 24 unid. (Aro)", precio: 3.89, unidad: "Pack", alérgenos: [] },
  { nombre: "AGUA DE AZAHAR", precio: 13.33, unidad: "Litro", alérgenos: [] },
  { nombre: "AGUA FUENTE LIVIANA (C. 12 u. x 1l.)", precio: 6.4, unidad: "Caja", alérgenos: [] },
  { nombre: "AGUA GARRAFA (5 l.)", precio: 1.09, unidad: "Garrafa", alérgenos: [] },
  { nombre: "AGUA GARRAFA (8 l.)", precio: 1.25, unidad: "Garrafa", alérgenos: [] },
  { nombre: "AGUACATE", precio: 6.4, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA ENTERA (Magra)", precio: 6.32, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA ENTERA AÑOJO", precio: 11.55, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA TROCEADA", precio: 6.82, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUJA TROCEADA AÑOJO", precio: 9.79, unidad: "Kg", alérgenos: [] },
  { nombre: "AJÍ AMARILLOS", precio: 6.35, unidad: "Kg", alérgenos: [] },
  { nombre: "AJO EN POLVO", precio: 12.27, unidad: "Kg", alérgenos: [] },
  { nombre: "AJO NEGRO (2 cabezas)", precio: 4.3, unidad: "Paquete", alérgenos: [] },
  { nombre: "AJOS SECOS", precio: 5.0, unidad: "Kg", alérgenos: [] },
  { nombre: "AJOS TIERNOS (30 u x manojos)", precio: 5.0, unidad: "Manojo", alérgenos: [] },
  { nombre: "ALA POLLO", precio: 4.48, unidad: "Kg", alérgenos: [] },
  { nombre: "ALBAHACA (125 g)", precio: 3.7, unidad: "Tarrina", alérgenos: [] },
  { nombre: "ALBARICOQUES", precio: 2.0, unidad: "Kg", alérgenos: [] },
  { nombre: "ALBARIÑO Rias Baixas Marieta", precio: 10.93, unidad: "Botella", alérgenos: ["Sulfitos"] },
  { nombre: "ALBÚMINA (MERENGUE) Claraval", precio: 25.63, unidad: "Kg", alérgenos: ["Huevos"] },
  { nombre: "ALCACHOFA", precio: 6.5, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCACHOFA CORAZÓN", precio: 7.22, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCAPARRAS (1000 gne)", precio: 11.47, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCAPARRÓN FINO (380 gne)", precio: 18.43, unidad: "Kg", alérgenos: [] },
  { nombre: "ALGA KOMBU Deshid. 100 g", precio: 3.5, unidad: "Paq.", alérgenos: [] },
  { nombre: "ALGAS NORI (10 láminas)", precio: 2.4, unidad: "Paq.", alérgenos: [] },
  { nombre: "ALI-OLI RIOBA Biberón770 ml", precio: 7.28, unidad: "Kg", alérgenos: ["Huevos"] },
  { nombre: "ALMEJA CHIRLA", precio: 13.15, unidad: "Kg", alérgenos: ["Moluscos"] },
  { nombre: "ALMEJA JAPONICA", precio: 14.24, unidad: "Kg", alérgenos: ["Moluscos"] },

  // --- NUEVA LISTA DE VERDURAS ---
  { nombre: "ALCACHOFAS", precio: 15.26, unidad: "unidad", alérgenos: [] },
  { nombre: "APIO TIERNO", precio: 5.60, unidad: "unidad", alérgenos: ["Apio"] },
  { nombre: "CARLOTA RAMA", precio: 2.33, unidad: "unidad", alérgenos: [] },
  { nombre: "COGOLLOS DE LECHUGA", precio: 2.52, unidad: "unidad", alérgenos: [] },
  { nombre: "COLIFLOR UNIDAD", precio: 8.12, unidad: "unidad", alérgenos: [] },
  { nombre: "ENDIVIA", precio: 2.80, unidad: "unidad", alérgenos: [] },
  { nombre: "NABO Y CHIRIVIA", precio: 3.14, unidad: "unidad", alérgenos: [] },
  { nombre: "CHIRIVIAS", precio: 1.27, unidad: "unidad", alérgenos: [] },
  { nombre: "JUDIAS FINAS Kg", precio: 11.76, unidad: "kg", alérgenos: [] },
  { nombre: "JUDIA ROJA Kg", precio: 13.86, unidad: "kg", alérgenos: [] },
  { nombre: "LECHUGA", precio: 1.81, unidad: "unidad", alérgenos: [] },
  { nombre: "ICEBERG", precio: 1.81, unidad: "unidad", alérgenos: [] },
  { nombre: "PEPINOS", precio: 4.56, unidad: "unidad", alérgenos: [] },
  { nombre: "PIMIENTO ROJO K", precio: 13.86, unidad: "kg", alérgenos: [] },
  { nombre: "PIMIENTO ITALIANO", precio: 5.18, unidad: "unidad", alérgenos: [] },
  { nombre: "PIMIENTO PADRON", precio: 8.68, unidad: "unidad", alérgenos: [] },
  { nombre: "RABANOS", precio: 2.10, unidad: "unidad", alérgenos: [] },
  { nombre: "ZANAHORIAS", precio: 2.37, unidad: "unidad", alérgenos: [] },
  { nombre: "CARLOTA 5 K", precio: 9.10, unidad: "unidad", alérgenos: [] },
  { nombre: "JENGIBRE", precio: 10.50, unidad: "unidad", alérgenos: [] },
  { nombre: "COL LOMBARDA", precio: 5.63, unidad: "unidad", alérgenos: [] },
  { nombre: "PIMIENTO ÑORA 0,500 G", precio: 14.00, unidad: "unidad", alérgenos: [] },
  { nombre: "PIMIENTO PERICANA", precio: 7.01, unidad: "unidad", alérgenos: [] },
  { nombre: "CHIRIVIA", precio: 1.40, unidad: "unidad", alérgenos: [] },

  // --- PRODUCTOS SOSA Y TÉCNICOS ---
  { nombre: "Sosa ingredients maltodextrina de tapioca maltosec 500 g", precio: 39.81, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa Ingredients glucosa líquida 1,5kg", precio: 11.72, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa ingredients base en polvo proespuma frío 700gr", precio: 12.97, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa ingredients pasta almendra cruda molida 1 kg", precio: 18.54, unidad: "unidad", alérgenos: ["Frutos de cáscara"] },
  { nombre: "Sosa Ingredients harina airbag cerdo 600g", precio: 17.37, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa ingredients gelificante alginato sodio 750 g", precio: 63.68, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa ingredients peta crispy choco 900gr", precio: 52.90, unidad: "unidad", alérgenos: ["Leche", "Soja"] },
  { nombre: "Sosa ingredients gelificante gelburger 500gr", precio: 23.27, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa ingredients gelificante instangel gelatina 500gr", precio: 18.87, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa ingredients lecitina de soja en polvo bote de 400g", precio: 28.88, unidad: "unidad", alérgenos: ["Soja"] },
  { nombre: "Sosa ingredients metilgel 350 g", precio: 23.86, unidad: "unidad", alérgenos: [] },
  { nombre: "Sosa Ingredients praline pistacho 50% 1,2kg", precio: 70.90, unidad: "unidad", alérgenos: ["Frutos de cáscara"] },

  // --- CHOCOLATES Y COBERTURAS ---
  { nombre: "CALLEBAUT cobertura chocolate 823 1Kg", precio: 24.38, unidad: "unidad", alérgenos: ["Leche", "Soja"] },
  { nombre: "CALLEBAUT cobertura chocolate W2 1Kg", precio: 24.38, unidad: "unidad", alérgenos: ["Leche", "Soja"] },
  { nombre: "CALLEBAUT cobertura chocolate 811 1Kg", precio: 24.38, unidad: "unidad", alérgenos: ["Leche", "Soja"] },
  { nombre: "METRO Chef cobertura gota 72% 2,5kg", precio: 40.98, unidad: "unidad", alérgenos: ["Soja"] },

  // --- FRUTAS Y VERDURAS ADICIONALES ---
  { nombre: "Calabacin redondo verde peso 4 kg", precio: 25.55, unidad: "unidad", alérgenos: [] },
  { nombre: "Berenjena china en caja peso 2 kg", precio: 14.56, unidad: "unidad", alérgenos: [] },
  { nombre: "METRO Chef Cebollino bandeja 125g", precio: 2.81, unidad: "unidad", alérgenos: [] },
  { nombre: "METRO Chef Espárrago verde manojo 420g", precio: 5.19, unidad: "unidad", alérgenos: [] },
  { nombre: "Patata cep agria Calibre 50/80 bolsa 5kg", precio: 4.00, unidad: "unidad", alérgenos: [] },
  { nombre: "METRO Chef cebolla morada saco 5kg", precio: 7.58, unidad: "unidad", alérgenos: [] },
  { nombre: "METRO Chef Tomate cherry caja 2,5kg", precio: 10.08, unidad: "unidad", alérgenos: [] }
];
