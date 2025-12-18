
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Recipe, Ingredient, DEFAULT_RECIPE, Elaboration } from '../types';
import { Plus, Trash2, Save, ArrowLeft, ChefHat, ImageIcon, User, ImagePlus, X, GripVertical, Camera, BookOpen, Utensils, Thermometer, ConciergeBell, Check, Link as LinkIcon, Euro } from 'lucide-react';
import { MasterProduct } from '../data/products';
import { getProducts, saveProduct, generateId, getCategories, calculateRecipeCost, findProductByName } from '../services/storage';

interface RecipeFormProps {
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

const CUTLERY_PRESETS = {
  "Entrantes y Cuchara": [
    { label: "Crema / Sopa caliente", value: "Cuchara sopera" },
    { label: "Consomé", value: "Cuchara de consomé" },
    { label: "Pasta larga (Spaghetti)", value: "Tenedor trinchero + Cuchara sopera" },
    { label: "Pasta corta (Macarrones)", value: "Tenedor trinchero" },
  ],
  "Pescados y Mariscos": [
    { label: "Pescado (limpio o entero)", value: "Pala de pescado + Tenedor de pescado" },
    { label: "Marisco de cáscara", value: "Cuchillo y tenedor de pescado + Lavadedos" },
    { label: "Moluscos (Almejas/Mejillones)", value: "Tenedor de pescado" },
  ],
  "Carnes": [
    { label: "Carne blanda / Guisos", value: "Cuchillo trinchero + Tenedor trinchero" },
    { label: "Carne roja / Chuletón", value: "Cuchillo de carne (Sierra) + Tenedor trinchero" },
    { label: "Aves / Caza", value: "Cuchillo y tenedor trinchero" },
  ],
  "Postres": [
    { label: "Tartas / Bizcochos", value: "Tenedor de postre" },
    { label: "Fruta preparada", value: "Cuchillo de postre + Tenedor de postre" },
    { label: "Helados / Sorbetes", value: "Cuchara de postre" },
    { label: "Postres combinados", value: "Tenedor + Cuchara de postre" },
  ]
};

const SERVICE_TYPES_INFO = [
  { id: "Americana", label: "A la Americana (Emplatado)", desc: "El plato sale terminado y decorado de cocina. El camarero lo sirve por la derecha." },
  { id: "Inglesa", label: "A la Inglesa", desc: "Comida en fuente. El camarero sirve al cliente por la izquierda usando pinza." },
  { id: "Francesa", label: "A la Francesa", desc: "Comida en fuente. El camarero presenta por la izquierda y el cliente se sirve." },
  { id: "Gueridón", label: "Al Gueridón (A la Rusa)", desc: "Se finaliza, trincha o flambea en mesa (carrito) y se sirve por la derecha." },
  { id: "Centro", label: "Plat de Milieu (Al centro)", desc: "Platos al centro para compartir. Marcar con cubiertos de servicio." },
  { id: "Buffet", label: "Servicio de Buffet", desc: "Auto-servicio. El camarero se centra en bebidas y desbarase." }
];

const TEMPERATURE_PRESETS = {
  "Platos Calientes": [
    { label: "Sopas / Cremas", value: "70°C - 80°C" },
    { label: "Carne Poco Hecha", value: "50°C - 55°C (Corazón)" },
    { label: "Carne Al Punto", value: "60°C - 65°C (Corazón)" },
    { label: "Carne Muy Hecha", value: "> 70°C" },
    { label: "Pescados", value: "55°C - 63°C" },
    { label: "Guarniciones (Arroz/Pasta)", value: "65°C - 75°C" },
  ],
  "Platos Fríos": [
    { label: "Ensaladas / Gazpachos", value: "4°C - 8°C" },
    { label: "Pescados Crudos (Tartar/Sashimi)", value: "2°C - 5°C" },
    { label: "Embutidos / Ibéricos", value: "18°C - 22°C (Ambiente)" },
    { label: "Quesos Frescos", value: "4°C - 8°C" },
    { label: "Quesos Curados", value: "16°C - 18°C" },
  ],
  "Postres": [
    { label: "Postres de Nevera", value: "4°C - 6°C" },
    { label: "Helados / Sorbetes", value: "-12°C a -15°C" },
    { label: "Postres Calientes (Coulant)", value: "50°C - 60°C" },
  ]
};

export const RecipeForm: React.FC<RecipeFormProps> = ({ initialRecipe, onSave, onCancel }) => {
  const [recipe, setRecipe] = useState<Recipe>(() => {
    const blankRecipe: Recipe = {
        ...DEFAULT_RECIPE,
        id: generateId(),
        processPhotos: [],
        elaborations: [
           { id: generateId(), name: 'Elaboración Principal', ingredients: [], instructions: '', photos: [] }
        ],
        serviceDetails: { ...DEFAULT_RECIPE.serviceDetails }
    };

    if (initialRecipe) {
        const elaborations = (initialRecipe.elaborations && initialRecipe.elaborations.length > 0) 
            ? initialRecipe.elaborations.map(e => ({ ...e, photos: e.photos || [] })) 
            : [{ id: generateId(), name: 'Elaboración Principal', ingredients: initialRecipe.ingredients || [], instructions: initialRecipe.instructions || '', photos: [] }];

        return {
            ...blankRecipe,
            ...initialRecipe,
            elaborations: elaborations,
            processPhotos: initialRecipe.processPhotos || [],
            serviceDetails: { ...blankRecipe.serviceDetails, ...(initialRecipe.serviceDetails || {}) }
        };
    }
    return blankRecipe;
  });

  const [products, setProducts] = useState<MasterProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeSearch, setActiveSearch] = useState<{ elabIndex: number, ingIndex: number } | null>(null);
  
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showCutleryModal, setShowCutleryModal] = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  
  const [pendingProductCreate, setPendingProductCreate] = useState<{elabIndex: number, ingIndex: number} | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDetails, setNewProductDetails] = useState({
    unidad: 'Kg',
    precio: '' as string,
    alérgenos: [] as string[]
  });

  const ALL_ALLERGENS = [
    'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Leche',
    'Frutos de cáscara', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
  ];

  const costs = useMemo(() => calculateRecipeCost(recipe), [recipe]);

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setActiveSearch(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDecimalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.', ','];
    if (allowedKeys.includes(e.key) || /^[0-9]$/.test(e.key)) {
      return;
    }
  };

  const parseDecimal = (val: string | number): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const sanitized = val.replace(',', '.');
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleInputChange = (field: keyof Recipe, value: any) => {
      setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceDetailChange = (field: string, value: any) => {
    setRecipe(prev => ({
      ...prev,
      serviceDetails: { ...prev.serviceDetails, [field]: value }
    }));
  };

  const appendTemperature = (tempString: string) => {
     const current = recipe.serviceDetails.servingTemp;
     const separator = current ? " + " : "";
     handleServiceDetailChange('servingTemp', current + separator + tempString);
  };

  const addElaboration = () => {
    setRecipe(prev => ({
        ...prev,
        elaborations: [
            ...prev.elaborations, 
            { id: generateId(), name: '', ingredients: [], instructions: '', photos: [] }
        ]
    }));
  };

  const removeElaboration = (index: number) => {
    if (recipe.elaborations.length === 1) {
        alert("Debe haber al menos una elaboración.");
        return;
    }
    if (confirm("¿Eliminar esta elaboración y sus ingredientes?")) {
        setRecipe(prev => ({
            ...prev,
            elaborations: prev.elaborations.filter((_, i) => i !== index)
        }));
    }
  };

  const updateElaboration = (index: number, field: keyof Elaboration, value: any) => {
      const newElabs = [...recipe.elaborations];
      newElabs[index] = { ...newElabs[index], [field]: value };
      setRecipe(prev => ({ ...prev, elaborations: newElabs }));
  };

  const handleElaborationPhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
             const newElabs = [...recipe.elaborations];
             const currentPhotos = newElabs[index].photos || [];
             newElabs[index] = { ...newElabs[index], photos: [...currentPhotos, reader.result as string] };
             setRecipe(prev => ({ ...prev, elaborations: newElabs }));
          };
          reader.readAsDataURL(file as Blob);
        });
      }
  };

  const removeElaborationPhoto = (elabIndex: number, photoIndex: number) => {
      const newElabs = [...recipe.elaborations];
      const photos = [...(newElabs[elabIndex].photos || [])];
      photos.splice(photoIndex, 1);
      newElabs[elabIndex].photos = photos;
      setRecipe(prev => ({ ...prev, elaborations: newElabs }));
  };

  const handleIngredientChange = (elabIndex: number, ingIndex: number, field: keyof Ingredient, value: any) => {
    const newElabs = [...recipe.elaborations];
    const newIngredients = [...newElabs[elabIndex].ingredients];
    newIngredients[ingIndex] = { ...newIngredients[ingIndex], [field]: value };
    newElabs[elabIndex].ingredients = newIngredients;
    setRecipe(prev => ({ ...prev, elaborations: newElabs }));
  };

  const addIngredient = (elabIndex: number) => {
    const newElabs = [...recipe.elaborations];
    newElabs[elabIndex].ingredients.push({ name: '', quantity: '', unit: '' });
    setRecipe(prev => ({ ...prev, elaborations: newElabs }));
  };

  const removeIngredient = (elabIndex: number, ingIndex: number) => {
    const newElabs = [...recipe.elaborations];
    newElabs[elabIndex].ingredients = newElabs[elabIndex].ingredients.filter((_, i) => i !== ingIndex);
    setRecipe(prev => ({ ...prev, elaborations: newElabs }));
  };

  const selectProduct = (elabIndex: number, ingIndex: number, product: MasterProduct) => {
    const newElabs = [...recipe.elaborations];
    const newIngredients = [...newElabs[elabIndex].ingredients];
    newIngredients[ingIndex] = { 
      ...newIngredients[ingIndex], 
      name: product.nombre,
      unit: product.unidad || newIngredients[ingIndex].unit 
    };
    newElabs[elabIndex].ingredients = newIngredients;
    setRecipe(prev => ({ ...prev, elaborations: newElabs }));
    setActiveSearch(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipe(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecipe(prev => ({
            ...prev,
            processPhotos: [...(prev.processPhotos || []), reader.result as string]
          }));
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeProcessPhoto = (index: number) => {
    setRecipe(prev => ({
        ...prev,
        processPhotos: prev.processPhotos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe.name) {
      alert("El nombre de la receta es obligatorio");
      return;
    }

    const sanitizedRecipe = {
        ...recipe,
        yieldQuantity: parseDecimal(recipe.yieldQuantity),
        elaborations: recipe.elaborations.map(elab => ({
            ...elab,
            ingredients: elab.ingredients.map(ing => ({
                ...ing,
                quantity: parseDecimal(ing.quantity)
            }))
        }))
    };

    onSave(sanitizedRecipe);
  };

  const getFilteredProducts = (searchTerm: string) => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => p.nombre.toLowerCase().includes(term)).slice(0, 8);
  };

  const initiateCreateProduct = (elabIndex: number, ingIndex: number, name: string) => {
    setPendingProductCreate({ elabIndex, ingIndex });
    setNewProductName(name);
    setShowCreateProductModal(true);
    setActiveSearch(null);
    setNewProductDetails({ unidad: 'Kg', precio: '', alérgenos: [] });
  };

  const confirmCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !pendingProductCreate) return;

    const newProduct: MasterProduct = {
      nombre: newProductName,
      unidad: newProductDetails.unidad,
      precio: newProductDetails.precio ? parseDecimal(newProductDetails.precio) : null,
      alérgenos: newProductDetails.alérgenos
    };

    saveProduct(newProduct);
    setProducts(getProducts());

    const { elabIndex, ingIndex } = pendingProductCreate;
    const newElabs = [...recipe.elaborations];
    newElabs[elabIndex].ingredients[ingIndex] = {
        ...newElabs[elabIndex].ingredients[ingIndex],
        name: newProduct.nombre,
        unit: newProduct.unidad
    };
    
    setRecipe(prev => ({ ...prev, elaborations: newElabs }));
    setShowCreateProductModal(false);
    setPendingProductCreate(null);
  };

  const toggleNewAllergen = (allergen: string) => {
    setNewProductDetails(prev => {
      const exists = prev.alérgenos.includes(allergen);
      return {
        ...prev,
        alérgenos: exists ? prev.alérgenos.filter(a => a !== allergen) : [...prev.alérgenos, allergen]
      };
    });
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl mb-10 animate-in fade-in zoom-in duration-300 border border-slate-100 relative">
      
      {/* Cost Preview Floating Bar */}
      <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700 animate-in slide-in-from-right-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Escandallo Actual</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400">{costs.perYield.toFixed(2)}€</span>
              <span className="text-xs font-bold text-slate-400">/ ración</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Coste Total</span>
            <span className="text-lg font-bold text-slate-200 text-right">{costs.total.toFixed(2)}€</span>
          </div>
      </div>

      {/* Sticky Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-20 shadow-md rounded-t-2xl">
        <div className="flex items-center gap-4">
           <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-700 rounded-full transition">
             <ArrowLeft size={24} />
           </button>
           <div>
             <h2 className="text-2xl font-bold">
               {recipe.id.startsWith('id_') ? 'Editar Ficha' : 'Nueva Ficha'}
             </h2>
             <p className="text-slate-400 text-xs">Cálculo de escandallo automático vinculado.</p>
           </div>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-900/20">
          <Save size={20} /> Guardar Cambios
        </button>
      </div>

      <div className="p-8 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Foto Principal */}
            <div className="lg:col-span-1">
               <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Foto Principal</h3>
               <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
                  {recipe.photo ? <img src={recipe.photo} className="absolute inset-0 w-full h-full object-cover" /> : <div className="text-gray-400 flex flex-col items-center"><ImageIcon size={48} /><span className="text-xs mt-2">Subir Foto</span></div>}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               </div>
            </div>

            <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700">Nombre del Plato *</label><input type="text" required value={recipe.name} onChange={(e) => handleInputChange('name', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 border p-3" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Rendimiento</label><input type="text" value={recipe.yieldQuantity} onKeyDown={handleDecimalKeyDown} onChange={(e) => handleInputChange('yieldQuantity', e.target.value)} className="mt-1 block w-full border-gray-300 border rounded-lg p-3" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Unidad</label><input type="text" value={recipe.yieldUnit} onChange={(e) => handleInputChange('yieldUnit', e.target.value)} className="mt-1 block w-full border-gray-300 border rounded-lg p-3" /></div>
                  </div>
               </div>
            </div>
        </section>

        {/* Elaborations list */}
        <div className="space-y-6" ref={searchWrapperRef}>
            {recipe.elaborations.map((elab, elabIndex) => (
                <section key={elab.id} className="border rounded-2xl bg-slate-50 overflow-visible p-6">
                    <div className="flex justify-between mb-4">
                      <input type="text" value={elab.name} onChange={(e) => updateElaboration(elabIndex, 'name', e.target.value)} className="text-xl font-bold bg-transparent w-full outline-none border-b border-slate-200 focus:border-emerald-500" />
                      <button type="button" onClick={() => removeElaboration(elabIndex)} className="text-red-400 p-2"><Trash2 size={20}/></button>
                    </div>
                    <table className="w-full">
                        <thead><tr className="text-xs text-slate-500 text-left"><th>Producto</th><th>Cant.</th><th>Ud.</th><th></th></tr></thead>
                        <tbody>
                            {elab.ingredients.map((ing, ingIndex) => {
                                const prod = findProductByName(ing.name);
                                return (
                                <tr key={ingIndex}>
                                    <td className="relative py-1">
                                        <input value={ing.name} onFocus={() => setActiveSearch({elabIndex, ingIndex})} onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'name', e.target.value)} className={`w-full p-2 rounded border-gray-200 border text-sm ${prod ? 'text-emerald-700 font-bold' : 'text-slate-800'}`} />
                                        {activeSearch?.elabIndex === elabIndex && activeSearch?.ingIndex === ingIndex && (
                                            <ul className="absolute z-[100] left-0 top-full mt-1 w-full bg-white border rounded-xl shadow-2xl max-h-60 overflow-auto">
                                                {getFilteredProducts(ing.name).map((p, idx) => (
                                                    <li key={idx} onMouseDown={() => selectProduct(elabIndex, ingIndex, p)} className="p-3 hover:bg-emerald-50 cursor-pointer text-sm flex justify-between border-b">
                                                        <span>{p.nombre}</span>
                                                        <span className="text-xs font-bold text-emerald-600">{p.precio}€/{p.unidad}</span>
                                                    </li>
                                                ))}
                                                {ing.name.length > 2 && getFilteredProducts(ing.name).length === 0 && (
                                                    <li onMouseDown={() => initiateCreateProduct(elabIndex, ingIndex, ing.name)} className="p-3 text-blue-600 font-bold text-xs cursor-pointer hover:bg-blue-50">Crear "{ing.name}"</li>
                                                )}
                                            </ul>
                                        )}
                                    </td>
                                    <td className="py-1 px-2"><input value={ing.quantity} onKeyDown={handleDecimalKeyDown} onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'quantity', e.target.value)} className="w-full p-2 rounded border border-gray-200 text-right text-sm" /></td>
                                    <td className="py-1"><input value={ing.unit} onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'unit', e.target.value)} className="w-full p-2 rounded border border-gray-200 text-sm" /></td>
                                    <td className="p-1"><button type="button" onClick={() => removeIngredient(elabIndex, ingIndex)}><X size={14}/></button></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    <button type="button" onClick={() => addIngredient(elabIndex)} className="mt-2 text-xs font-bold text-emerald-600">+ Añadir Ingrediente</button>
                </section>
            ))}
            <button type="button" onClick={addElaboration} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:bg-white transition">+ Añadir Elaboración</button>
        </div>
      </div>
    </form>
    
    {showCreateProductModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"><div className="bg-slate-900 text-white p-6 flex justify-between items-center"><h3>Alta Rápida</h3><button onClick={() => setShowCreateProductModal(false)}>✕</button></div><form onSubmit={confirmCreateProduct} className="p-6 space-y-4"><p className="text-sm">Crear <strong>"{newProductName}"</strong></p><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm">Unidad</label><input required className="w-full p-2 border rounded" value={newProductDetails.unidad} onChange={e => setNewProductDetails({...newProductDetails, unidad: e.target.value})} /></div><div><label className="block text-sm">Precio</label><input type="text" className="w-full p-2 border rounded" value={newProductDetails.precio} onKeyDown={handleDecimalKeyDown} onChange={e => setNewProductDetails({...newProductDetails, precio: e.target.value})} /></div></div><div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setShowCreateProductModal(false)}>Cancelar</button><button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">Guardar</button></div></form></div></div>
    )}
    </>
  );
};
