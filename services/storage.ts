
import { Recipe, UserProfile } from '../types';
import { MASTER_PRODUCTS, MasterProduct } from '../data/products';

const RECIPE_STORAGE_KEY = 'kitchen_recipes_v1';
const PRODUCT_STORAGE_KEY = 'kitchen_products_v1';
const PROFILE_STORAGE_KEY = 'kitchen_profile_v1';

// Helper for ID generation (Safe implementation)
export const generateId = (): string => {
  // Simple timestamp + random fallback that works in all contexts
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// --- USER PROFILE ---

export const getUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    return data ? JSON.parse(data) : { authorName: '', logo: '' };
  } catch (error) {
    console.warn("Error loading profile, resetting default", error);
    return { authorName: '', logo: '' };
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Storage full or error", e);
  }
};

// --- RECIPES ---

export const getRecipes = (): Recipe[] => {
  try {
    const data = localStorage.getItem(RECIPE_STORAGE_KEY);
    if (!data || data === "undefined" || data === "null") return [];
    
    let rawRecipes: any;
    try {
      rawRecipes = JSON.parse(data);
    } catch (e) {
      console.error("Corrupted recipe data found, resetting list.", e);
      // Optional: backup corrupted data to console just in case
      console.log("Corrupted Data Backup:", data);
      return [];
    }

    if (!Array.isArray(rawRecipes)) {
      return [];
    }
    
    // Defensive Migration Logic
    return rawRecipes.map((r: any) => {
      if (!r || typeof r !== 'object') return null;

      let updatedRecipe = { ...r };

      // Ensure critical fields exist
      updatedRecipe.id = updatedRecipe.id || generateId();
      updatedRecipe.name = updatedRecipe.name || 'Sin Nombre';
      updatedRecipe.processPhotos = Array.isArray(updatedRecipe.processPhotos) ? updatedRecipe.processPhotos : [];

      // Migrate ingredients to elaborations if needed
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
      } else {
        // Sanitize existing elaborations
        updatedRecipe.elaborations = updatedRecipe.elaborations.map((e: any) => ({
            ...e,
            id: e.id || generateId(),
            ingredients: Array.isArray(e.ingredients) ? e.ingredients : [],
            photos: Array.isArray(e.photos) ? e.photos : [],
            instructions: e.instructions || ''
        }));
      }

      // Ensure serviceDetails exists
      updatedRecipe.serviceDetails = {
           presentation: r.serviceDetails?.presentation || '',
           servingTemp: r.serviceDetails?.servingTemp || '',
           cutlery: r.serviceDetails?.cutlery || '',
           passTime: r.serviceDetails?.passTime || '',
           serviceType: r.serviceDetails?.serviceType || 'Emplatado',
           clientDescription: r.serviceDetails?.clientDescription || ''
      };

      return updatedRecipe;
    }).filter(Boolean) as Recipe[];

  } catch (error) {
    console.error("Fatal error reading recipes", error);
    return [];
  }
};

export const saveRecipe = (recipe: Recipe): void => {
  try {
    const recipes = getRecipes();
    const existingIndex = recipes.findIndex(r => r.id === recipe.id);
    
    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe;
    } else {
      recipes.push(recipe);
    }
    
    localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    alert("Error al guardar: Posiblemente el almacenamiento local está lleno (imágenes grandes).");
  }
};

export const deleteRecipe = (id: string): void => {
  const recipes = getRecipes().filter(r => r.id !== id);
  localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
};

export const exportRecipeToJSON = (recipe: Recipe) => {
  const dataStr = JSON.stringify(recipe, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const safeName = (recipe.name || 'receta').replace(/[^a-z0-9]/gi, '_').toLowerCase();
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

export const createFullBackup = (): void => {
  const backup = {
    version: 2, 
    timestamp: new Date().toISOString(),
    recipes: getRecipes(),
    products: getProducts(),
    profile: getUserProfile()
  };

  const dataStr = JSON.stringify(backup, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const date = new Date().toISOString().split('T')[0];
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `backup_cocina_${date}.json`);
  linkElement.click();
};

export const restoreFromBackup = (jsonString: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonString);

    if (Array.isArray(data.recipes)) localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(data.recipes));
    if (Array.isArray(data.products)) localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data.products));
    if (data.profile) saveUserProfile(data.profile);

    return { success: true, message: "Restauración completada." };
  } catch (e) {
    return { success: false, message: "Archivo corrupto o inválido." };
  }
};
