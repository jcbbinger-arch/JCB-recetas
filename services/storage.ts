
import { Recipe, UserProfile, Menu } from '../types';
import { MASTER_PRODUCTS, MasterProduct } from '../data/products';

const RECIPE_STORAGE_KEY = 'kitchen_recipes_v1';
const PRODUCT_STORAGE_KEY = 'kitchen_products_v1';
const PROFILE_STORAGE_KEY = 'kitchen_profile_v1';
const CATEGORY_STORAGE_KEY = 'kitchen_categories_v1';
const MENU_STORAGE_KEY = 'kitchen_menus_v1';

const DEFAULT_CATEGORIES = [
  'Entrantes', 'Primeros', 'Pescados', 'Carnes', 'Postres', 
  'Salsas/Fondos', 'Cócteles', 'Panadería', 'Guarniciones'
];

export const generateId = (): string => {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// --- MENUS ---
export const getMenus = (): Menu[] => {
  try {
    const data = localStorage.getItem(MENU_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const saveMenu = (menu: Menu): void => {
  const menus = getMenus();
  const index = menus.findIndex(m => m.id === menu.id);
  if (index >= 0) menus[index] = menu;
  else menus.push(menu);
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menus));
};

export const deleteMenu = (id: string): void => {
  const menus = getMenus().filter(m => m.id !== id);
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menus));
};

// --- CATEGORIES ---
export const getCategories = (): string[] => {
  try {
    const data = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
    } else {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
  } catch (error) {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategory = (category: string): void => {
  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    categories.sort((a, b) => a.localeCompare(b));
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  }
};

export const deleteCategory = (category: string): void => {
  const categories = getCategories().filter(c => c !== category);
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
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
    if (!data || data === "undefined" || data === "null") return [];
    const rawRecipes = JSON.parse(data);
    if (!Array.isArray(rawRecipes)) return [];
    return rawRecipes.map((r: any) => ({
      ...r,
      id: r.id || generateId(),
      elaborations: r.elaborations || [{ id: generateId(), name: 'Elaboración Principal', ingredients: r.ingredients || [], instructions: r.instructions || '', photos: [] }]
    }));
  } catch (error) {
    return [];
  }
};

export const saveRecipe = (recipe: Recipe): void => {
  const recipes = getRecipes();
  const existingIndex = recipes.findIndex(r => r.id === recipe.id);
  if (existingIndex >= 0) recipes[existingIndex] = recipe;
  else recipes.push(recipe);
  localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
};

export const deleteRecipe = (id: string): void => {
  const recipes = getRecipes().filter(r => r.id !== id);
  localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
};

// --- PRODUCTS ---
export const getProducts = (): MasterProduct[] => {
  try {
    const data = localStorage.getItem(PRODUCT_STORAGE_KEY);
    let storedProducts: MasterProduct[] = data ? JSON.parse(data) : [];
    
    // Unificar maestro con local
    const merged = [...storedProducts];
    MASTER_PRODUCTS.forEach(master => {
      if (!merged.some(p => p.nombre.toLowerCase() === master.nombre.toLowerCase())) {
        merged.push(master);
      }
    });
    
    return merged.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    return MASTER_PRODUCTS;
  }
};

export const saveProduct = (product: MasterProduct): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.nombre.toLowerCase() === product.nombre.toLowerCase());
  const data = localStorage.getItem(PRODUCT_STORAGE_KEY);
  let stored: MasterProduct[] = data ? JSON.parse(data) : [];
  
  const storedIndex = stored.findIndex(p => p.nombre.toLowerCase() === product.nombre.toLowerCase());
  if (storedIndex >= 0) stored[storedIndex] = product;
  else stored.push(product);
  
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(stored));
};

export const deleteProduct = (name: string): void => {
  const data = localStorage.getItem(PRODUCT_STORAGE_KEY);
  let stored: MasterProduct[] = data ? JSON.parse(data) : [];
  stored = stored.filter(p => p.nombre.toLowerCase() !== name.toLowerCase());
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(stored));
};

export const findProductByName = (name: string): MasterProduct | undefined => {
  return getProducts().find(p => p.nombre.toLowerCase() === name.toLowerCase());
};

// --- EXPORTS & BACKUP ---
export const exportRecipeToJSON = (recipe: Recipe): void => {
  const dataStr = JSON.stringify(recipe, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `receta_${recipe.name.replace(/\s+/g, '_')}.json`);
  link.click();
};

export const createFullBackup = (): void => {
  const backup = {
    recipes: getRecipes(),
    products: getProducts(),
    categories: getCategories(),
    menus: getMenus(),
    profile: getUserProfile(),
  };
  const dataStr = JSON.stringify(backup, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `backup_kitchen_${new Date().toISOString().split('T')[0]}.json`);
  link.click();
};

export const restoreFromBackup = (jsonString: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonString);
    if (data.recipes) localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(data.recipes));
    if (data.products) localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data.products));
    if (data.categories) localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(data.categories));
    if (data.menus) localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(data.menus));
    if (data.profile) saveUserProfile(data.profile);
    return { success: true, message: "Restauración completada." };
  } catch (e) {
    return { success: false, message: "Archivo corrupto." };
  }
};
