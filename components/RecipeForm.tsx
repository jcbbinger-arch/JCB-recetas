
import React, { useState, useEffect, useRef } from 'react';
import { Recipe, Ingredient, DEFAULT_RECIPE, Elaboration } from '../types';
import { Plus, Trash2, Save, ArrowLeft, ChefHat, ImageIcon, User, ImagePlus, X, GripVertical, Camera, BookOpen, Utensils, Thermometer, ConciergeBell, Check, Link as LinkIcon } from 'lucide-react';
import { MasterProduct } from '../data/products';
import { getProducts, saveProduct, generateId, getCategories } from '../services/storage';

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

  // Helper para manejar el punto del teclado numérico como coma decimal
  const handleDecimalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.' || e.key === ',') {
      // Si el navegador espera un punto (estándar HTML5) pero el usuario quiere usar la tecla del teclado numérico
      // Algunos navegadores en español manejan esto solos, pero forzamos comportamiento consistente
    }
  };

  // Convertidor seguro de string con coma a número
  const parseDecimal = (val: string): number => {
    if (!val) return 0;
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
    
    let processedValue = value;
    if (field === 'quantity') {
      // Permitimos que el usuario escriba libremente (puntos o comas)
      // La conversión real ocurre en el blur o al guardar, pero aquí guardamos el número para cálculos inmediatos si existieran
      processedValue = typeof value === 'string' ? parseDecimal(value) : value;
    }

    newIngredients[ingIndex] = { ...newIngredients[ingIndex], [field]: processedValue };
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
    onSave(recipe);
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

  const selectedServiceInfo = SERVICE_TYPES_INFO.find(s => s.label === recipe.serviceDetails.serviceType) || SERVICE_TYPES_INFO[0];

  if (!recipe || !recipe.elaborations) {
      return <div className="p-10 text-center">Cargando formulario...</div>;
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl mb-10 animate-in fade-in zoom-in duration-300 border border-slate-100">
      
      {/* Sticky Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-20 shadow-md rounded-t-2xl">
        <div className="flex items-center gap-4">
           <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-700 rounded-full transition">
             <ArrowLeft size={24} />
           </button>
           <div>
             <h2 className="text-2xl font-bold">
               {recipe.id.startsWith('id_') ? 'Editar Ficha Técnica' : 'Nueva Ficha Técnica'}
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
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {recipe.photo && (
                     <button type="button" onClick={() => setRecipe(prev => ({...prev, photo: undefined}))} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"><Trash2 size={16}/></button>
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
                    <input type="text" required value={recipe.name} onChange={(e) => handleInputChange('name', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm" placeholder="Ej: Solomillo Wellington" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Creador / Chef</label>
                       <div className="relative">
                         <User className="absolute left-3 top-3 text-gray-400" size={18} />
                         <input type="text" value={recipe.author || ''} onChange={(e) => handleInputChange('author', e.target.value)} className="mt-1 block w-full pl-10 rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm" placeholder="Nombre" />
                       </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select
                          value={recipe.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="mt-1 block w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1 italic">Puedes gestionar categorías en Configuración.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enlace Vídeo / Web Original</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="url" 
                                value={recipe.sourceUrl || ''} 
                                onChange={(e) => handleInputChange('sourceUrl', e.target.value)} 
                                className="mt-1 block w-full pl-10 rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm" 
                                placeholder="https://..." 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rendimiento</label>
                            <input 
                              type="number" 
                              step="any"
                              value={recipe.yieldQuantity} 
                              onKeyDown={handleDecimalKeyDown}
                              onChange={(e) => handleInputChange('yieldQuantity', parseDecimal(e.target.value))} 
                              className="mt-1 block w-full border-gray-300 border rounded-lg p-3 bg-white shadow-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unidad</label>
                            <input type="text" value={recipe.yieldUnit} onChange={(e) => handleInputChange('yieldUnit', e.target.value)} className="mt-1 block w-full border-gray-300 border rounded-lg p-3 bg-white shadow-sm" placeholder="raciones" />
                        </div>
                    </div>
                  </div>
               </div>
            </div>
        </section>

        {/* Section 2: Elaborations */}
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b pb-2">
                <h3 className="text-xl font-bold text-slate-800">Elaboraciones y Escandallo</h3>
                <button type="button" onClick={addElaboration} className="text-sm bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition flex items-center gap-2">
                    <Plus size={16}/> Añadir Elaboración
                </button>
            </div>

            {recipe.elaborations.map((elab, elabIndex) => (
                <section key={elab.id} className="border border-slate-200 rounded-2xl bg-slate-50 shadow-sm relative transition-all hover:shadow-md overflow-visible">
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center gap-4 rounded-t-2xl">
                        <div className="bg-slate-200 p-2 rounded text-slate-500"><GripVertical size={20} /></div>
                        <div className="flex-grow">
                             <label className="block text-xs font-bold text-slate-400 uppercase">Nombre de la Elaboración</label>
                             <input type="text" value={elab.name} onChange={(e) => updateElaboration(elabIndex, 'name', e.target.value)} placeholder="Ej: Salsa Bechamel..." className="bg-transparent text-lg font-bold text-slate-800 w-full outline-none placeholder-slate-300 focus:text-emerald-600" />
                        </div>
                        <button type="button" onClick={() => removeElaboration(elabIndex)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={20} /></button>
                    </div>

                    <div className="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-2 gap-8 overflow-visible">
                        <div className="overflow-visible">
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-bold text-slate-600">Ingredientes</h4>
                                <button type="button" onClick={() => addIngredient(elabIndex)} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded hover:bg-slate-50 font-bold text-emerald-600">+ Añadir</button>
                             </div>
                             
                             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
                                <table className="w-full table-fixed overflow-visible">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-bold w-[55%] rounded-tl-xl">Producto</th>
                                            <th className="px-3 py-2 text-left font-bold w-[20%]">Cant.</th>
                                            <th className="px-3 py-2 text-left font-bold w-[15%]">Ud.</th>
                                            <th className="px-1 rounded-tr-xl w-[10%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 overflow-visible">
                                        {elab.ingredients.map((ing, ingIndex) => (
                                            <tr key={ingIndex} className="hover:bg-slate-50 group overflow-visible">
                                                <td className="px-3 py-2 relative overflow-visible">
                                                    <input type="text" value={ing.name} onFocus={() => setActiveSearch({ elabIndex, ingIndex })} onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'name', e.target.value)} className="w-full text-sm outline-none bg-transparent font-medium" placeholder="Buscar..." />
                                                    {activeSearch?.elabIndex === elabIndex && activeSearch?.ingIndex === ingIndex && (
                                                        <ul className="absolute z-[100] left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto ring-1 ring-black/5">
                                                            {getFilteredProducts(ing.name).map((product, pIdx) => (
                                                                <li key={pIdx} onMouseDown={() => selectProduct(elabIndex, ingIndex, product)} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm border-b border-gray-50 last:border-0">
                                                                    <div className="font-bold text-gray-800">{product.nombre}</div>
                                                                    <div className="text-xs text-gray-500">{product.unidad}</div>
                                                                </li>
                                                            ))}
                                                            {ing.name.length > 2 && getFilteredProducts(ing.name).length === 0 && (
                                                                <li onMouseDown={() => initiateCreateProduct(elabIndex, ingIndex, ing.name)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-blue-600 font-bold text-xs flex items-center gap-2">
                                                                    <Plus size={14} /> Crear "{ing.name}"
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                  <input 
                                                    type="text" 
                                                    inputMode="decimal"
                                                    value={ing.quantity} 
                                                    onKeyDown={handleDecimalKeyDown}
                                                    onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'quantity', e.target.value)} 
                                                    className="w-full text-sm outline-none bg-slate-50 rounded px-1 text-right" 
                                                  />
                                                </td>
                                                <td className="px-3 py-2"><input type="text" value={ing.unit} onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'unit', e.target.value)} className="w-full text-sm outline-none bg-transparent text-slate-500" /></td>
                                                <td className="px-1 text-center"><button type="button" onClick={() => removeIngredient(elabIndex, ingIndex)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>

                        <div className="flex flex-col h-full">
                             <h4 className="text-sm font-bold text-slate-600 mb-3">Técnica / Procedimiento</h4>
                             <textarea value={elab.instructions} onChange={(e) => updateElaboration(elabIndex, 'instructions', e.target.value)} rows={8} className="w-full rounded-xl border border-gray-300 p-4 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white text-sm leading-relaxed mb-4" placeholder="Pasos detallados..."></textarea>
                             <div className="border border-slate-200 rounded-xl p-3 bg-white">
                                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Camera size={14}/> Fotos del paso</span><label className="cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs px-2 py-1 rounded transition flex items-center gap-1"><Plus size={12}/> Añadir<input type="file" multiple accept="image/*" onChange={(e) => handleElaborationPhotoUpload(elabIndex, e)} className="hidden" /></label></div>
                                {elab.photos && elab.photos.length > 0 ? (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {elab.photos.map((photo, photoIndex) => (
                                            <div key={photoIndex} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group"><img src={photo} className="w-full h-full object-cover" /><button type="button" onClick={() => removeElaborationPhoto(elabIndex, photoIndex)} className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition"><X size={10} /></button></div>
                                        ))}
                                    </div>
                                ) : <div className="text-xs text-slate-300 italic text-center py-2">Sin fotos.</div>}
                             </div>
                        </div>
                    </div>
                </section>
            ))}
        </div>

        {/* Section 3: Gallery & Notes */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ImagePlus size={20}/> Galería y Notas</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 h-full">
                    <div className="flex justify-between items-center mb-3"><span className="text-sm font-bold text-gray-600">Fotos Paso a Paso</span><label className="cursor-pointer bg-emerald-600 text-white text-xs px-3 py-1 rounded-lg font-bold hover:bg-emerald-500 transition">+ Fotos<input type="file" multiple accept="image/*" onChange={handleProcessPhotoUpload} className="hidden" /></label></div>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">{recipe.processPhotos?.map((photo, idx) => (<div key={idx} className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 group"><img src={photo} className="w-full h-full object-cover" /><button type="button" onClick={() => removeProcessPhoto(idx)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"><X size={12} /></button></div>))}</div>
                </div>
                <div><h4 className="text-sm font-bold text-amber-800 mb-2">Notas / Puntos Críticos</h4><textarea value={recipe.notes} onChange={(e) => handleInputChange('notes', e.target.value)} rows={6} className="w-full rounded-xl border border-amber-200 p-4 shadow-sm bg-amber-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none text-amber-900"></textarea></div>
            </div>
        </section>

        {/* Section 4: Service */}
        <section className="bg-slate-800 text-slate-200 p-8 rounded-2xl shadow-lg">
           <h3 className="text-xl font-bold text-white border-b border-slate-600 pb-4 mb-6">Servicio y Pase</h3>
           <div className="mb-6"><label className="block text-sm font-bold text-slate-400 mb-1">Presentación</label><textarea value={recipe.serviceDetails.presentation} onChange={(e) => handleServiceDetailChange('presentation', e.target.value)} rows={3} className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3 focus:ring-2 focus:ring-emerald-500 border outline-none" /></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-400 mb-1">Descripción Carta</label><input type="text" value={recipe.serviceDetails.clientDescription} onChange={(e) => handleServiceDetailChange('clientDescription', e.target.value)} className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3 focus:ring-2 focus:ring-emerald-500 border outline-none" /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-400 mb-1">Temp. Servicio</label><div className="flex gap-2"><input type="text" value={recipe.serviceDetails.servingTemp} onChange={(e) => handleServiceDetailChange('servingTemp', e.target.value)} className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3" /><button type="button" onClick={() => setShowTempModal(true)} className="bg-orange-600 text-white p-3 rounded-lg"><Thermometer size={20} /></button></div></div>
                <div><label className="block text-sm font-bold text-slate-400 mb-1">Tiempo Pase</label><input type="text" value={recipe.serviceDetails.passTime} onChange={(e) => handleServiceDetailChange('passTime', e.target.value)} className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3" /></div>
             </div>
             <div className="space-y-4">
                 <div><label className="block text-sm font-bold text-slate-400 mb-1">Marcaje</label><div className="flex gap-2"><input type="text" value={recipe.serviceDetails.cutlery} onChange={(e) => handleServiceDetailChange('cutlery', e.target.value)} className="block w-full rounded-lg border-slate-600 bg-slate-700 text-white p-3" /><button type="button" onClick={() => setShowCutleryModal(true)} className="bg-emerald-600 text-white p-3 rounded-lg"><BookOpen size={20} /></button></div></div>
                 <div><label className="block text-sm font-bold text-slate-400 mb-1">Tipo Servicio</label><button type="button" onClick={() => setShowServiceModal(true)} className="w-full bg-slate-700 border border-slate-600 rounded-xl p-4 text-left"><div className="flex justify-between items-center mb-1"><span className="font-bold text-emerald-400 text-lg">{recipe.serviceDetails.serviceType}</span><span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Cambiar</span></div></button></div>
             </div>
           </div>
        </section>
      </div>
    </form>

    {/* MODALS */}
    {showCutleryModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"><div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0"><h3 className="font-bold">Asistente de Marcaje</h3><button onClick={() => setShowCutleryModal(false)}>✕</button></div><div className="p-6 overflow-y-auto bg-slate-50">{Object.entries(CUTLERY_PRESETS).map(([cat, items]) => (<div key={cat} className="bg-white rounded-xl border mb-4"><h4 className="bg-slate-100 px-4 py-2 font-bold text-sm">{cat}</h4>{items.map((i, idx) => (<button key={idx} onClick={() => { handleServiceDetailChange('cutlery', i.value); setShowCutleryModal(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-t flex justify-between"><span>{i.label}</span><span className="text-xs italic text-gray-400">{i.value}</span></button>))}</div>))}</div></div></div>
    )}

    {showTempModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"><div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0"><h3 className="font-bold">Temperaturas de Pase</h3><button onClick={() => setShowTempModal(false)}>✕</button></div><div className="p-6 overflow-y-auto bg-slate-50">{Object.entries(TEMPERATURE_PRESETS).map(([cat, items]) => (<div key={cat} className="bg-white rounded-xl border mb-4"><h4 className="bg-slate-100 px-4 py-2 font-bold text-sm">{cat}</h4>{items.map((i, idx) => (<button key={idx} onClick={() => appendTemperature(`${i.label} (${i.value})`)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t flex justify-between"><span>{i.label}</span><span className="text-xs bg-slate-100 px-2 rounded font-bold">{i.value}</span></button>))}</div>))}</div><div className="p-4 bg-white border-t flex justify-end"><button onClick={() => setShowTempModal(false)} className="bg-slate-800 text-white px-6 py-2 rounded">Listo</button></div></div></div>
    )}

    {showServiceModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"><div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0"><h3 className="font-bold">Tipo de Servicio</h3><button onClick={() => setShowServiceModal(false)}>✕</button></div><div className="p-6 overflow-y-auto bg-slate-50"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{SERVICE_TYPES_INFO.map(t => (<button key={t.id} onClick={() => { handleServiceDetailChange('serviceType', t.label); setShowServiceModal(false); }} className={`p-5 rounded-xl border-2 text-left ${recipe.serviceDetails.serviceType === t.label ? 'border-emerald-500 bg-emerald-50' : 'bg-white border-slate-200'}`}><h4 className="font-bold mb-2">{t.label}</h4><p className="text-sm text-slate-500">{t.desc}</p></button>))}</div></div></div></div>
    )}

    {showCreateProductModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"><div className="bg-slate-900 text-white p-6 flex justify-between items-center"><h3>Alta Rápida</h3><button onClick={() => setShowCreateProductModal(false)}>✕</button></div><form onSubmit={confirmCreateProduct} className="p-6 space-y-4"><p className="text-sm">Crear <strong>"{newProductName}"</strong></p><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm">Unidad</label><input required className="w-full p-2 border rounded" value={newProductDetails.unidad} onChange={e => setNewProductDetails({...newProductDetails, unidad: e.target.value})} /></div><div><label className="block text-sm">Precio</label><input type="text" inputMode="decimal" className="w-full p-2 border rounded" value={newProductDetails.precio} onKeyDown={handleDecimalKeyDown} onChange={e => setNewProductDetails({...newProductDetails, precio: e.target.value})} /></div></div><div><label className="block text-sm mb-2">Alérgenos</label><div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border p-2">{ALL_ALLERGENS.map(a => (<label key={a} className="flex gap-2 items-center text-xs"><input type="checkbox" checked={newProductDetails.alérgenos.includes(a)} onChange={() => toggleNewAllergen(a)} />{a}</label>))}</div></div><div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setShowCreateProductModal(false)}>Cancelar</button><button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">Guardar</button></div></form></div></div>
    )}
    </>
  );
};
