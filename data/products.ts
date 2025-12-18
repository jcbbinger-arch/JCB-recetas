
export interface MasterProduct {
  id?: string;
  nombre: string;
  precio: number | null;
  unidad: string;
  categoria?: string;
  alérgenos: string[];
}

export const MASTER_PRODUCTS: MasterProduct[] = [
  { nombre: "ACEITE DE OLIVA SUAVE 1 L. (Inamar)", precio: 8.97, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE DE OLIVA SUAVE 5 L. (Inamar)", precio: 8.87, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE DE OLIVA V.E. Arbequina", precio: 8.03, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE GIRASOL (Inamar) 1 l.", precio: 1.82, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE GIRASOL (Inamar) 5 l.", precio: 1.5, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE OLIVA VIRGEN EXTRA Coato 1l.", precio: 10.0, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE OLIVA VIRGEN EXTRA Coato 5l.", precio: 9.1, unidad: "Litro", alérgenos: [] },
  { nombre: "ACEITE SÉSAMO 1,7 l.", precio: 11.42, unidad: "Litro", alérgenos: ["Sésamo"] },
  { nombre: "ACEITE TRUFA BLANCA (250 ml) spray", precio: 9.5, unidad: "Botella", alérgenos: [] },
  { nombre: "ACEITUNA PARTIDA", precio: null, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS ALIÑADAS", precio: null, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS CUQUILLO (2,6 kg)", precio: 4.76, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS GORDALES", precio: 7.07, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS NEGRAS C/H", precio: null, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS NEGRAS RODAJAS (330 g)", precio: 10.33, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS NEGRAS S/H (333 g)", precio: 4.95, unidad: "Kg", alérgenos: [] },
  { nombre: "ACEITUNAS RELLENAS ANCHOA (600 g)", precio: 6.9, unidad: "Kg", alérgenos: ["Pescado"] },
  { nombre: "ACEITUNAS VERDES S/H", precio: null, unidad: "Kg", alérgenos: [] },
  { nombre: "ACELGA 5 hojas", precio: 0.9, unidad: "Manojo", alérgenos: [] },
  { nombre: "ACHICORIA / RADICHIO", precio: 2.05, unidad: "Pieza", alérgenos: [] },
  { nombre: "ACIDO Grifo cerveza (10 kg)", precio: 48.0, unidad: "Botella", alérgenos: ["Gluten"] },
  { nombre: "AGAR-AGAR (500 g)", precio: 56.04, unidad: "Kg", alérgenos: [] },
  { nombre: "AGUA BOTELLIN 0,5 litro", precio: null, unidad: "Pack", alérgenos: [] },
  { nombre: "AGUA BOTELLIN 20 cl", precio: null, unidad: "Pack", alérgenos: [] },
  { nombre: "AGUA BOTELLIN 33 cl x 24 unid. (Aro)", precio: 3.89, unidad: "Pack", alérgenos: [] },
  { nombre: "AGUA DE AZAHAR", precio: 13.33, unidad: "Litro", alérgenos: [] },
  { nombre: "AGUA DE ROSAS", precio: null, unidad: "Litro", alérgenos: [] },
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
  { nombre: "ALCACHOFA LATA", precio: null, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCAPARRAS (1000 gne)", precio: 11.47, unidad: "Kg", alérgenos: [] },
  { nombre: "ALCAPARRÓN FINO (380 gne)", precio: 18.43, unidad: "Kg", alérgenos: [] },
  { nombre: "ALGA KOMBU Deshid. 100 g", precio: 3.5, unidad: "Paq.", alérgenos: [] },
  { nombre: "ALGAS NORI (10 láminas)", precio: 2.4, unidad: "Paq.", alérgenos: [] },
  { nombre: "ALI-OLI RIOBA Biberón770 ml", precio: 7.28, unidad: "Kg", alérgenos: ["Huevos"] },
  { nombre: "ALMEJA CHIRLA", precio: 13.15, unidad: "Kg", alérgenos: ["Moluscos"] },
  { nombre: "ALMEJA JAPONICA", precio: 14.24, unidad: "Kg", alérgenos: ["Moluscos"] },
  { nombre: "ALMENDRA COMUNA FRITA", precio: null, unidad: "Kg", alérgenos: ["Frutos de cáscara"] }
];
