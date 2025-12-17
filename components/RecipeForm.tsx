
import React, { useState, useEffect, useRef } from 'react';
import { Recipe, Ingredient, DEFAULT_RECIPE, Elaboration } from '../types';
import { Plus, Trash2, Save, ArrowLeft, ChefHat, ImageIcon, User, ImagePlus, X, GripVertical, Camera, BookOpen, Utensils } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MasterProduct } from '../data/products';
import { getProducts, saveProduct } from '../services/storage';

interface RecipeFormProps {
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

// --- DATA DICTIONARIES ---

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
  { 
    id: "Americana", 
    label: "A la Americana (Emplatado)", 
    desc: "El plato sale terminado y decorado de cocina. El camarero lo sirve por la derecha." 
  },
  { 
    id: "Inglesa", 
    label: "A la Inglesa", 
    desc: "Comida en fuente. El camarero sirve al cliente por la izquierda usando pinza." 
  },
  { 
    id: "Francesa", 
    label: "A la Francesa", 
    desc: "Comida en fuente. El camarero presenta por la izquierda y el cliente se sirve." 
  },
  { 
    id: "Gueridón", 
    label: "Al Gueridón (A la Rusa)", 
    desc: "Se finaliza, trincha o flambea en mesa (carrito) y se sirve por la derecha." 
  },
  { 
    id: "Centro", 
    label: "Plat de Milieu (Al centro)", 
    desc: "Platos al centro para compartir. Marcar con cubiertos de servicio." 
  },
  { 
    id: "Buffet", 
    label: "Servicio de Buffet", 
    desc: "Auto-servicio. El camarero se centra en bebidas y desbarase." 
  }
];

export const RecipeForm: React.FC<RecipeFormProps> = ({ initialRecipe, onSave, onCancel }) => {
  const [recipe, setRecipe] = useState<Recipe>(() => {
    // 1. Create a full blank recipe structure
    const blankRecipe: Recipe = {
        ...DEFAULT_RECIPE,
        id: uuidv4(),
        processPhotos: [],
        elaborations: [
           { id: uuidv4(), name: 'Elaboración Principal', ingredients: [], instructions: '', photos: [] }
        ],
        serviceDetails: { ...DEFAULT_RECIPE.serviceDetails }
    };

    // 2. Load initial data if exists
    if (initialRecipe) {
        const elaborations = (initialRecipe.elaborations && initialRecipe.elaborations.length > 0) 
            ? initialRecipe.elaborations.map(e => ({ ...e, photos: e.photos || [] })) // Ensure photos exist
            : [{ id: uuidv4(), name: 'Elaboración Principal', ingredients: initialRecipe.ingredients || [], instructions: initialRecipe.instructions || '', photos: [] }];

        if (initialRecipe.id) {
            return {
                ...blankRecipe,
                ...initialRecipe,
                elaborations: elaborations,
                processPhotos: initialRecipe.processPhotos || [],
                serviceDetails: { ...blankRecipe.serviceDetails, ...(initialRecipe.serviceDetails || {}) }
            };
        } else {
             return {
                ...blankRecipe,
                ...initialRecipe,
                id: blankRecipe.id
            };
        }
    }
    return blankRecipe;
  });

  const [products, setProducts] = useState<MasterProduct[]>([]);
  // activeSearchIndex now tracks which Elaboration AND which Ingredient row is active
  const [activeSearch, setActiveSearch] = useState<{ elabIndex: number, ingIndex: number } | null>(null);
  
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showCutleryModal, setShowCutleryModal] = useState(false); // New modal state
  
  const [pendingProductCreate, setPendingProductCreate] = useState<{elabIndex: number, ingIndex: number} | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDetails, setNewProductDetails] = useState({
    unidad: 'Kg',
    precio: '' as string | number,
    alérgenos: [] as string[]
  });

  const ALL_ALLERGENS = [
    'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Leche',
    'Frutos de cáscara', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
  ];

  useEffect(() => {
    setProducts(getProducts());
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

  const handleInputChange = (field: keyof Recipe, value: any) => {
      setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceDetailChange = (field: string, value: any) => {
    setRecipe(prev => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        [field]: value
      }
    }));
  };

  // --- ELABORATION MANAGEMENT ---

  const addElaboration = () => {
    setRecipe(prev => ({
        ...prev,
        elaborations: [
            ...prev.elaborations, 
            { id: uuidv4(), name: '', ingredients: [], instructions: '', photos: [] }
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

  // --- INGREDIENT MANAGEMENT ---

  const handleIngredientChange = (elabIndex: number, ingIndex: number, field: keyof Ingredient, value: any) => {
    const newElabs = [...recipe.elaborations];
    const newIngredients = [...newElabs[elabIndex].ingredients];
    newIngredients[ingIndex] = { ...newIngredients[ingIndex], [field]: value };
    newElabs[elabIndex].ingredients = newIngredients;
    setRecipe(prev => ({ ...prev, elaborations: newElabs }));
  };

  const addIngredient = (elabIndex: number) => {
    const newElabs = [...recipe.elaborations];
    newElabs[elabIndex].ingredients.push({ name: '', quantity: 0, unit: '' });
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

  // --- IMAGES ---

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

  // --- SUBMIT ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe.name) {
      alert("El nombre de la receta es obligatorio");
      return;
    }
    onSave(recipe);
  };

  const getFilteredProducts = (searchTerm: string) => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => p.nombre.toLowerCase().includes(term)).slice(0, 8);
  };

  // --- NEW PRODUCT CREATION LOGIC ---
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
      precio: newProductDetails.precio ? Number(newProductDetails.precio) : null,
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
        alérgenos: exists 
          ? prev.alérgenos.filter(a => a !== allergen)
          : [...prev.alérgenos, allergen]
      };
    });
  };

  // Helper for service description
  const selectedServiceInfo = SERVICE_TYPES_INFO.find(s => s.label === recipe.serviceDetails.serviceType) || SERVICE_TYPES_INFO[0];

  if (!recipe || !recipe.elaborations) {
      return <div className="p-10 text-center">Cargando formulario...</div>;
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mb-10 animate-in fade-in zoom-in duration-300 border border-slate-100">
      
      {/* Sticky Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
           <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-700 rounded-full transition">
             <ArrowLeft size={24} />
           </button>
           <div>
             <h2 className="text-2xl font-bold">
               {initialRecipe && initialRecipe.id ? 'Editar Ficha Técnica' : 'Nueva Ficha Técnica'}
             </h2>
             <p className="text-slate-400 text-xs">Complete los detalles para generar el documento oficial.</p>
           </div>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-900/20">
          <Save size={20} />
          Guardar Ficha
        </button>
      </div>

      <div className="p-8 space-y-10">
        
        {/* Section 1: Basic Data */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Photo */}
            <div className="lg:col-span-1">
               <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Foto Principal (Cuadrada)</h3>
               <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-emerald-500 transition flex flex-col items-center justify-center relative overflow-hidden group">
                  {recipe.photo ? (
                    <img src={recipe.photo} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <ImageIcon size={48} strokeWidth={1.5} />
                      <span className="text-xs mt-2 font-medium">Subir Foto</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'photo')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {recipe.photo && (
                     <button 
                       type="button" 
                       onClick={() => setRecipe(prev => ({...prev, photo: undefined}))}
                       className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                     >
                       <Trash2 size={16}/>
                     </button>
                  )}
               </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ChefHat className="text-emerald-600" size={24}/> Datos de la Receta
                  </h3>
                  <div className="flex items-center gap-3">
                     <span className="text-xs text-gray-400 uppercase font-bold">Logo:</span>
                     <div className="w-12 h-12 rounded-full border bg-white overflow-hidden relative hover:border-emerald-500 transition">
                        {recipe.logo ? <img src={recipe.logo} className="w-full h-full object-contain"/> : <ImageIcon className="w-full h-full p-3 text-gray-300"/>}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer"/>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Plato *</label>
                    <input 
                      type="text" 
                      required
                      value={recipe.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                      placeholder="Ej: Solomillo Wellington"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Creador / Chef</label>
                       <div className="relative">
                         <User className="absolute left-3 top-3 text-gray-400" size={18} />
                         <input 
                           type="text" 
                           value={recipe.author || ''}
                           onChange={(e) => handleInputChange('author', e.target.value)}
                           className="mt-1 block w-full pl-10 rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                           placeholder="Nombre"
                         />
                       </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select
                          value={recipe.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="mt-1 block w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                        >
                          <option>Entrantes</option>
                          <option>Primeros</option>
                          <option>Pescados</option>
                          <option>Carnes</option>
                          <option>Postres</option>
                          <option>Salsas/Fondos</option>
                          <option>Cócteles</option>
                          <option>Panadería</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700">Rendimiento</label>
                       <input 
                        type="number" 
                        value={recipe.yieldQuantity}
                        onChange={(e) => handleInputChange('yieldQuantity', parseFloat(e.target.value))}
                        className="mt-1 block w-full border-gray-300 border rounded-lg p-3 bg-white shadow-sm"
                      />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700">Unidad</label>
                       <input 
                        type="text" 
                        value={recipe.yieldUnit}
                        onChange={(e) => handleInputChange('yieldUnit', e.target.value)}
                        className="mt-1 block w-full border-gray-300 border rounded-lg p-3 bg-white shadow-sm"
                        placeholder="raciones"
                      />
                    </div>
                  </div>
               </div>
            </div>
        </section>

        {/* Section 2: Elaborations (Multiple Sections) */}
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b pb-2">
                <h3 className="text-xl font-bold text-slate-800">Elaboraciones y Escandallo</h3>
                <button 
                    type="button" 
                    onClick={addElaboration}
                    className="text-sm bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition flex items-center gap-2"
                >
                    <Plus size={16}/> Añadir Elaboración
                </button>
            </div>

            {recipe.elaborations.map((elab, elabIndex) => (
                <section key={elab.id} className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden shadow-sm relative transition-all hover:shadow-md">
                    {/* Elaboration Header */}
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center gap-4">
                        <div className="bg-slate-200 p-2 rounded text-slate-500">
                             <GripVertical size={20} />
                        </div>
                        <div className="flex-grow">
                             <label className="block text-xs font-bold text-slate-400 uppercase">Nombre de la Elaboración</label>
                             <input 
                                type="text"
                                value={elab.name}
                                onChange={(e) => updateElaboration(elabIndex, 'name', e.target.value)}
                                placeholder="Ej: Salsa Bechamel, Relleno de Carne..."
                                className="bg-transparent text-lg font-bold text-slate-800 w-full outline-none placeholder-slate-300 focus:text-emerald-600"
                             />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => removeElaboration(elabIndex)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                            title="Eliminar Elaboración"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>

                    <div className="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Ingredients Column */}
                        <div ref={searchWrapperRef}>
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-bold text-slate-600">Ingredientes</h4>
                                <button type="button" onClick={() => addIngredient(elabIndex)} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded hover:bg-slate-50 font-bold text-emerald-600">
                                    + Añadir
                                </button>
                             </div>
                             
                             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <table className="w-full">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-bold w-1/2">Producto</th>
                                            <th className="px-3 py-2 text-left font-bold">Cant.</th>
                                            <th className="px-3 py-2 text-left font-bold">Ud.</th>
                                            <th className="px-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {elab.ingredients.map((ing, ingIndex) => (
                                            <tr key={ingIndex} className="hover:bg-slate-50 group">
                                                <td className="px-3 py-2 relative">
                                                    <input 
                                                        type="text" 
                                                        value={ing.name}
                                                        onFocus={() => setActiveSearch({ elabIndex, ingIndex })}
                                                        onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'name', e.target.value)}
                                                        className="w-full text-sm outline-none bg-transparent font-medium"
                                                        placeholder="Buscar..."
                                                    />
                                                    {/* Dropdown for this specific row */}
                                                    {activeSearch?.elabIndex === elabIndex && activeSearch?.ingIndex === ingIndex && (
                                                        <ul className="absolute z-50 left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto ring-1 ring-black/5">
                                                            {getFilteredProducts(ing.name).map((product, pIdx) => (
                                                                <li 
                                                                    key={pIdx}
                                                                    onMouseDown={() => selectProduct(elabIndex, ingIndex, product)}
                                                                    className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div className="font-bold text-gray-800">{product.nombre}</div>
                                                                    <div className="text-xs text-gray-500">{product.unidad}</div>
                                                                </li>
                                                            ))}
                                                            {ing.name.length > 2 && getFilteredProducts(ing.name).length === 0 && (
                                                                <li 
                                                                    onMouseDown={() => initiateCreateProduct(elabIndex, ingIndex, ing.name)}
                                                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-blue-600 font-bold text-xs flex items-center gap-2"
                                                                >
                                                                    <Plus size={14} /> Crear "{ing.name}"
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input 
                                                        type="number" 
                                                        value={ing.quantity}
                                                        onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'quantity', parseFloat(e.target.value))}
                                                        className="w-16 text-sm outline-none bg-slate-50 rounded px-1 text-right"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input 
                                                        type="text" 
                                                        value={ing.unit}
                                                        onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'unit', e.target.value)}
                                                        className="w-12 text-sm outline-none bg-transparent text-slate-500"
                                                    />
                                                </td>
                                                <td className="px-1 text-center">
                                                    <button type="button" onClick={() => removeIngredient(elabIndex, ingIndex)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {elab.ingredients.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-xs text-slate-400 italic">Añade ingredientes para esta elaboración.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                             </div>
                        </div>

                        {/* Process Text Area & Photos */}
                        <div className="flex flex-col h-full">
                             <h4 className="text-sm font-bold text-slate-600 mb-3">Técnica / Procedimiento</h4>
                             <textarea
                                value={elab.instructions}
                                onChange={(e) => updateElaboration(elabIndex, 'instructions', e.target.value)}
                                rows={8}
                                className="w-full rounded-xl border border-gray-300 p-4 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white text-sm leading-relaxed mb-4"
                                placeholder={`Describe paso a paso cómo realizar: ${elab.name || 'esta elaboración'}...`}
                             ></textarea>
                             
                             {/* Elaboration Photos */}
                             <div className="border border-slate-200 rounded-xl p-3 bg-white">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Camera size={14}/> Fotos del paso</span>
                                    <label className="cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs px-2 py-1 rounded transition flex items-center gap-1">
                                        <Plus size={12}/> Añadir
                                        <input type="file" multiple accept="image/*" onChange={(e) => handleElaborationPhotoUpload(elabIndex, e)} className="hidden" />
                                    </label>
                                </div>
                                
                                {elab.photos && elab.photos.length > 0 ? (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {elab.photos.map((photo, photoIndex) => (
                                            <div key={photoIndex} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                                                <img src={photo} className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeElaborationPhoto(elabIndex, photoIndex)}
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-300 italic text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        Sin fotos para esta elaboración.
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </section>
            ))}
        </div>

        {/* Section 3: Gallery & Notes */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ImagePlus size={20}/> Galería y Notas Globales</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                     <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 h-full">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-gray-600">Fotos del Paso a Paso (Globales)</span>
                            <label className="cursor-pointer bg-emerald-600 text-white text-xs px-3 py-1 rounded-lg font-bold hover:bg-emerald-500 transition">
                                + Fotos
                                <input type="file" multiple accept="image/*" onChange={handleProcessPhotoUpload} className="hidden" />
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                            {recipe.processPhotos && recipe.processPhotos.length > 0 ? (
                                recipe.processPhotos.map((photo, idx) => (
                                    <div key={idx} className="aspect-square relative rounded-lg overflow-hidden group border border-gray-200">
                                        <img src={photo} className="w-full h-full object-cover" alt={`Paso ${idx + 1}`} />
                                        <button 
                                            type="button"
                                            onClick={() => removeProcessPhoto(idx)}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">{idx + 1}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 py-8 text-center text-gray-400 text-xs italic">
                                    Sube fotos para documentar visualmente el proceso global.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                     <h4 className="text-sm font-bold text-amber-800 mb-2">Notas / Puntos Críticos</h4>
                     <textarea
                        value={recipe.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={6}
                        className="w-full rounded-xl border border-amber-200 p-4 shadow-sm bg-amber-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none placeholder-amber-800/50 text-amber-900"
                        placeholder="Temperaturas críticas, puntos de control, consejos..."
                     ></textarea>
                </div>
            </div>
        </section>

        {/* Section 4: Service (Presentation & Details) */}
        <section className="bg-slate-800 text-slate-200 p-8 rounded-2xl shadow-lg">
           <h3 className="text-xl font-bold text-white border-b border-slate-600 pb-4 mb-6">
             Datos de Servicio y Pase
           </h3>
           
           <div className="mb-6">
                <label className="block text-sm font-bold text-slate-400 mb-1">Presentación y Emplatado</label>
                <textarea
                    value={recipe.serviceDetails.presentation}
                    onChange={(e) => handleServiceDetailChange('presentation', e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3 focus:ring-2 focus:ring-emerald-500 border outline-none"
                    placeholder="Describe detalladamente cómo debe llegar el plato al cliente..."
                />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="md:col-span-2">
               <label className="block text-sm font-bold text-slate-400 mb-1">Descripción Comercial (Carta)</label>
               <input
                 type="text"
                 value={recipe.serviceDetails.clientDescription}
                 onChange={(e) => handleServiceDetailChange('clientDescription', e.target.value)}
                 className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3 focus:ring-2 focus:ring-emerald-500 border outline-none"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Temp. Servicio</label>
                  <input
                    type="text"
                    value={recipe.serviceDetails.servingTemp}
                    onChange={(e) => handleServiceDetailChange('servingTemp', e.target.value)}
                    className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3"
                    placeholder="Ej: 65ºC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Tiempo de Pase</label>
                  <input
                    type="text"
                    value={recipe.serviceDetails.passTime}
                    onChange={(e) => handleServiceDetailChange('passTime', e.target.value)}
                    className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3"
                  />
                </div>
             </div>

             <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-400 mb-1">Marcaje / Cubiertos</label>
                   <div className="flex gap-2">
                      <input
                        type="text"
                        value={recipe.serviceDetails.cutlery}
                        onChange={(e) => handleServiceDetailChange('cutlery', e.target.value)}
                        className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3"
                        placeholder="Escribe o usa el asistente..."
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCutleryModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg shadow-lg flex items-center justify-center transition"
                        title="Asistente de Marcaje"
                      >
                         <BookOpen size={20} />
                      </button>
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-slate-400 mb-1">Tipo Servicio</label>
                   <div className="bg-slate-700 rounded-lg p-2 border border-slate-600">
                     <select
                       value={recipe.serviceDetails.serviceType}
                       onChange={(e) => handleServiceDetailChange('serviceType', e.target.value)}
                       className="block w-full bg-transparent text-white p-1 outline-none text-sm font-bold"
                     >
                       {SERVICE_TYPES_INFO.map(type => (
                         <option key={type.id} value={type.label}>{type.label}</option>
                       ))}
                     </select>
                     {/* Description Box */}
                     <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-slate-300 italic">
                        <span className="font-bold text-emerald-400 block mb-1">Acción del Camarero:</span>
                        {selectedServiceInfo.desc}
                     </div>
                   </div>
                 </div>
             </div>
           </div>
        </section>
      </div>
    </form>

    {/* CUTLERY ASSISTANT MODAL */}
    {showCutleryModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2 rounded-lg text-white">
                     <Utensils size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Asistente de Marcaje</h3>
                    <p className="text-xs text-slate-400">Diccionario Cocina-Sala</p>
                  </div>
               </div>
               <button onClick={() => setShowCutleryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50 flex-grow">
               <div className="space-y-6">
                  {Object.entries(CUTLERY_PRESETS).map(([category, items]) => (
                     <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <h4 className="bg-slate-100 px-4 py-2 font-bold text-slate-700 text-sm border-b border-slate-200">{category}</h4>
                        <div className="divide-y divide-slate-100">
                           {items.map((item, idx) => (
                              <button 
                                key={idx}
                                type="button"
                                onClick={() => {
                                   handleServiceDetailChange('cutlery', item.value);
                                   setShowCutleryModal(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700 transition flex justify-between items-center group"
                              >
                                 <span className="font-medium text-sm text-slate-800 group-hover:text-emerald-800">{item.label}</span>
                                 <span className="text-xs text-slate-400 italic group-hover:text-emerald-600">{item.value}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            
            <div className="p-4 border-t bg-white shrink-0 text-center">
               <button onClick={() => setShowCutleryModal(false)} className="text-slate-500 text-sm hover:underline">Cancelar</button>
            </div>
         </div>
      </div>
    )}

    {/* Create Product Modal */}
    {showCreateProductModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
            <h3 className="text-lg font-bold">Alta Rápida de Producto</h3>
            <button onClick={() => setShowCreateProductModal(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={confirmCreateProduct} className="p-6 space-y-4">
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
              El producto <strong>"{newProductName}"</strong> se añadirá a la base de datos global.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Unidad</label>
                <input 
                  required
                  className="mt-1 w-full p-2 border rounded-lg"
                  value={newProductDetails.unidad}
                  onChange={e => setNewProductDetails({...newProductDetails, unidad: e.target.value})}
                  placeholder="Kg, L, Ud"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Ref (€)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="mt-1 w-full p-2 border rounded-lg"
                  value={newProductDetails.precio}
                  onChange={e => setNewProductDetails({...newProductDetails, precio: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alérgenos</label>
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
                {ALL_ALLERGENS.map(allergen => (
                  <label key={allergen} className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded transition ${newProductDetails.alérgenos.includes(allergen) ? 'bg-red-100 text-red-800 font-bold' : 'hover:bg-gray-200 text-gray-600'}`}>
                    <input 
                      type="checkbox"
                      checked={newProductDetails.alérgenos.includes(allergen)}
                      onChange={() => toggleNewAllergen(allergen)}
                      className="hidden"
                    />
                    <div className={`w-3 h-3 rounded-full border ${newProductDetails.alérgenos.includes(allergen) ? 'bg-red-500 border-red-600' : 'bg-white border-gray-400'}`}></div>
                    {allergen}
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t mt-4">
               <button type="button" onClick={() => setShowCreateProductModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
               <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20">Guardar y Usar</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};
