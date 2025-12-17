
import { Recipe, UserProfile } from '../types';
import { MASTER_PRODUCTS, MasterProduct } from '../data/products';

const RECIPE_STORAGE_KEY = 'kitchen_recipes_v1';
const PRODUCT_STORAGE_KEY = 'kitchen_products_v1';
const PROFILE_STORAGE_KEY = 'kitchen_profile_v1';

// Helper for ID generation (replaces uuid dependency)
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- USER PROFILE ---

export const getUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    return data ? JSON.parse(data) : { authorName: '', logo: '' };
  } catch (error) {
    return { authorName: '', logo: '' };
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

// --- RECIPES ---

export const getRecipes = (): Recipe[] => {
  try {
    const data = localStorage.getItem(RECIPE_STORAGE_KEY);
    if (!data) return [];
    
    let rawRecipes: any;
    try {
      rawRecipes = JSON.parse(data);
    } catch (e) {
      console.error("Invalid JSON in storage", e);
      return [];
    }

    if (!Array.isArray(rawRecipes)) {
      console.warn("Storage data is not an array, resetting.");
      return [];
    }
    
    // Migration Logic: Ensure recipes support multiple elaborations and photos inside them
    return rawRecipes.map((r: any) => {
      // Safety check for basic structure
      if (!r || typeof r !== 'object') return null;

      let updatedRecipe = { ...r };

      // Migrate old processPhotos if missing
      if (!updatedRecipe.processPhotos) {
        updatedRecipe.processPhotos = [];
      }

      // Migrate flat ingredients/instructions to elaborations
      if (!updatedRecipe.elaborations || !Array.isArray(updatedRecipe.elaborations) || updatedRecipe.elaborations.length === 0) {
        updatedRecipe.elaborations = [
          {
            id: generateId(),
            name: 'Elaboración Principal',
            ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
            instructions: typeof r.instructions === 'string' ? r.instructions : '',
            photos: []
          }
        ];
        // Clean up old fields
        delete updatedRecipe.ingredients;
        delete updatedRecipe.instructions;
      } else {
        // Ensure existing elaborations have the photos array
        updatedRecipe.elaborations = updatedRecipe.elaborations.map((e: any) => ({
            ...e,
            photos: Array.isArray(e.photos) ? e.photos : [],
            id: e.id || generateId()
        }));
      }

      // Ensure serviceDetails exists
      if (!updatedRecipe.serviceDetails) {
        updatedRecipe.serviceDetails = {
           presentation: '',
           servingTemp: '',
           cutlery: '',
           passTime: '',
           serviceType: 'Emplatado',
           clientDescription: ''
        };
      }

      return updatedRecipe;
    }).filter(Boolean) as Recipe[]; // Filter out nulls

  } catch (error) {
    console.error("Error reading recipes from localStorage", error);
    return [];
  }
};

export const saveRecipe = (recipe: Recipe): void => {
  const recipes = getRecipes();
  const existingIndex = recipes.findIndex(r => r.id === recipe.id);
  
  if (existingIndex >= 0) {
    recipes[existingIndex] = recipe;
  } else {
    recipes.push(recipe);
  }
  
  try {
    localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    alert("Error: El almacenamiento está lleno. Intenta usar imágenes más pequeñas.");
  }
};

export const deleteRecipe = (id: string): void => {
  const recipes = getRecipes().filter(r => r.id !== id);
  localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
};

export const exportRecipeToJSON = (recipe: Recipe) => {
  const dataStr = JSON.stringify(recipe, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const safeName = (recipe.name || 'receta').replace(/\s+/g, '_').toLowerCase();
  const exportFileDefaultName = `${safeName}_ficha.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// --- PRODUCTS ---

export const getProducts = (): MasterProduct[] => {
  try {
    const data = localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : MASTER_PRODUCTS;
    } else {
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(MASTER_PRODUCTS));
      return MASTER_PRODUCTS;
    }
  } catch (error) {
    console.error("Error reading products from localStorage", error);
    return MASTER_PRODUCTS;
  }
};

export const saveProduct = (product: MasterProduct): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.nombre.toLowerCase() === product.nombre.toLowerCase());
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  products.sort((a, b) => a.nombre.localeCompare(b.nombre));

  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
};

export const deleteProduct = (name: string): void => {
  const products = getProducts().filter(p => p.nombre !== name);
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
};

export const findProductByName = (name: string): MasterProduct | undefined => {
  const products = getProducts();
  return products.find(p => p.nombre.toLowerCase() === name.toLowerCase());
};

// --- BACKUP SYSTEM ---

export interface BackupData {
  version: number;
  timestamp: string;
  recipes: Recipe[];
  products: MasterProduct[];
  profile: UserProfile;
}

export const createFullBackup = (): void => {
  const backup: BackupData = {
    version: 2, 
    timestamp: new Date().toISOString(),
    recipes: getRecipes(),
    products: getProducts(),
    profile: getUserProfile()
  };

  const dataStr = JSON.stringify(backup, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const date = new Date().toISOString().split('T')[0];
  const exportFileDefaultName = `backup_cocina_${date}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const restoreFromBackup = (jsonString: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonString);

    if (!Array.isArray(data.recipes) && !Array.isArray(data.products) && !Array.isArray(data)) {
       if (Array.isArray(data) && data.length > 0 && data[0].nombre) {
          localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data));
          return { success: true, message: "Lista de productos importada correctamente." };
       }
       return { success: false, message: "El archivo no tiene un formato válido." };
    }

    if (data.recipes) localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(data.recipes));
    if (data.products) localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data.products));
    if (data.profile) saveUserProfile(data.profile);

    return { success: true, message: "Copia de seguridad restaurada con éxito." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error al leer el archivo JSON." };
  }
};
