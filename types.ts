
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface UserProfile {
  authorName: string;
  logo: string; // Base64
}

export interface Elaboration {
  id: string;
  name: string; // Nombre de la sub-receta (ej: "Salsa", "Relleno")
  ingredients: Ingredient[];
  instructions: string;
  photos: string[]; // Base64 strings específicos para este paso
}

export interface Recipe {
  id: string;
  name: string;
  category: string; // Ej: Entrantes, Carnes, Postres
  
  // Personalización
  author?: string;
  logo?: string; // Base64 del logo del restaurante/creador
  sourceUrl?: string; // Enlace a vídeo o web original

  // Datos de Rendimiento
  yieldQuantity: number; // Cantidad resultante
  yieldUnit: string;     // Unidad (ej: raciones, litros)
  
  // Multimedia
  photo?: string; // Base64 string para la imagen PRINCIPAL (Cuadrada)
  processPhotos: string[]; // Array de Base64 para el paso a paso GLOBAL (General)

  // Estructura de Elaboraciones (Nuevo Sistema)
  elaborations: Elaboration[];
  
  // Deprecated (mantenidos temporalmente para migración)
  ingredients?: Ingredient[];
  instructions?: string;

  notes?: string;

  // DETALLES DE SERVICIO
  serviceDetails: {
    presentation: string;      // Notas de emplatado (Ahora destacado)
    servingTemp: string;       // Temperatura de servicio
    cutlery: string;           // Marcaje/Cubiertos
    passTime: string;          // Tiempo de pase
    serviceType: string;       // Tipo de servicio (ej: emplatado, gueridón)
    clientDescription: string; // Descripción comercial para carta
  };
}

export const DEFAULT_RECIPE: Omit<Recipe, 'id'> = {
  name: '',
  category: 'General',
  author: '',
  sourceUrl: '',
  yieldQuantity: 4,
  yieldUnit: 'raciones',
  elaborations: [
    {
      id: 'default_elab',
      name: 'Elaboración Principal',
      ingredients: [],
      instructions: '',
      photos: []
    }
  ],
  notes: '',
  processPhotos: [],
  serviceDetails: {
    presentation: '',
    servingTemp: '',
    cutlery: '',
    passTime: '',
    serviceType: 'Emplatado',
    clientDescription: ''
  }
};