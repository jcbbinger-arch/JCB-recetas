
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

// --- CALCULATIONS ---

export const calculateRecipeCost = (recipe: Recipe): { total: number; perYield: number } => {
  let totalCost = 0;
  
  recipe.elaborations.forEach(elab => {
    elab.ingredients.forEach(ing => {
      const product = findProductByName(ing.name);
      if (product && product.precio !== null) {
        let qty = typeof ing.quantity === 'string' ? parseFloat(ing.quantity.replace(',', '.')) : (ing.quantity || 0);
        if (isNaN(qty)) qty = 0;

        // Conversión inteligente de unidades
        let factor = 1;
        const ingUnit = ing.unit.toLowerCase().trim();
        const prodUnit = (product.unidad || '').toLowerCase().trim();

        // Gramos a Kilos
        if ((ingUnit === 'g' || ingUnit === 'gr' || ingUnit === 'gramos') && (prodUnit === 'kg' || prodUnit === 'kilo' || prodUnit === 'kilos')) {
          factor = 0.001;
        }
        // Mililitros a Litros
        if ((ingUnit === 'ml' || ingUnit === 'mililitros') && (prodUnit === 'l' || prodUnit === 'litro' || prodUnit === 'litros')) {
          factor = 0.001;
        }
        // Centilitros a Litros
        if ((ingUnit === 'cl' || ingUnit === 'centilitros') && (prodUnit === 'l' || prodUnit === 'litro' || prodUnit === 'litros')) {
          factor = 0.01;
        }

        totalCost += qty * factor * product.precio;
      }
    });
  });

  const yieldQty = typeof recipe.yieldQuantity === 'string' ? parseFloat((recipe.yieldQuantity as string).replace(',', '.')) : (recipe.yieldQuantity || 1);
  const perYield = !isNaN(yieldQty) && yieldQty > 0 ? totalCost / yieldQty : 0;
  
  return { total: totalCost, perYield };
};

// --- STORAGE METHODS (REST UNCHANGED) ---

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

export const getProducts = (): MasterProduct[] => {
  try {
    const data = localStorage.getItem(PRODUCT_STORAGE_KEY);
    let storedProducts: MasterProduct[] = data ? JSON.parse(data) : [];
    const mergedProducts = [...storedProducts];
    MASTER_PRODUCTS.forEach(master => {
      if (!mergedProducts.some(p => p.nombre.toLowerCase() === master.nombre.toLowerCase())) {
        mergedProducts.push(master);
      }
    });
    return mergedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    return MASTER_PRODUCTS;
  }
};

export const saveProduct = (product: MasterProduct): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.nombre.toLowerCase() === product.nombre.toLowerCase());
  if (existingIndex >= 0) products[existingIndex] = product;
  else products.push(product);
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
};

export const deleteProduct = (name: string): void => {
  const products = getProducts().filter(p => p.nombre !== name);
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
};

export const findProductByName = (name: string): MasterProduct | undefined => {
  return getProducts().find(p => p.nombre.toLowerCase() === name.toLowerCase());
};

export const exportRecipeToJSON = (recipe: Recipe): void => {
  const dataStr = JSON.stringify(recipe, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `receta_${recipe.name.replace(/\s+/g, '_')}.json`);
  linkElement.click();
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
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `backup_kitchen_${new Date().toISOString().split('T')[0]}.json`);
  linkElement.click();
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
