
export interface Ingredient {
  name: string;
  quantity: number | string; // Permitimos string para manejar decimales en edición sin perder el punto
  unit: string;
}

export interface UserProfile {
  authorName: string;
  logo: string; // Base64
}

export interface Elaboration {
  id: string;
  name: string; 
  ingredients: Ingredient[];
  instructions: string;
  photos: string[]; 
}

export interface Menu {
  id: string;
  name: string;
  recipeIds: string[];
  description?: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string; 
  author?: string;
  logo?: string; 
  sourceUrl?: string; 

  yieldQuantity: number; 
  yieldUnit: string;     
  
  photo?: string; 
  processPhotos: string[]; 

  elaborations: Elaboration[];
  
  ingredients?: Ingredient[];
  instructions?: string;

  notes?: string;

  serviceDetails: {
    presentation: string;      
    servingTemp: string;       
    cutlery: string;           
    passTime: string;          
    serviceType: string;       
    clientDescription: string; 
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
    serviceType: 'A la Americana (Emplatado)',
    clientDescription: ''
  }
};
