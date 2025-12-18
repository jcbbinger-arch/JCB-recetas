
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Recipe, Ingredient, DEFAULT_RECIPE, Elaboration } from '../types';
import { Plus, Trash2, Save, ArrowLeft, ChefHat, ImageIcon, User, ImagePlus, X, GripVertical, Camera, BookOpen, Utensils, Thermometer, ConciergeBell, Check, Link as LinkIcon, Euro, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MasterProduct } from '../data/products';
import { getProducts, saveProduct, generateId, getCategories, calculateRecipeCost, findProductByName } from '../services/storage';

interface RecipeFormProps {
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

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
  const [pendingProductCreate, setPendingProductCreate] = useState<{elabIndex: number, ingIndex: number} | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDetails, setNewProductDetails] = useState({
    unidad: 'Kg',
    precio: '' as string,
    alérgenos: [] as string[]
  });

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDecimalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.', ','];
    if (allowedKeys.includes(e.key) || /^[0-9]$/.test(e.key)) return;
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

  const updateElaboration = (index: number, field: keyof Elaboration, value: any) => {
      const newElabs = [...recipe.elaborations];
      newElabs[index] = { ...newElabs[index], [field]: value };
      setRecipe(prev => ({ ...prev, elaborations: newElabs }));
  };

  const handleIngredientChange = (elabIndex: number, ingIndex: number, field: keyof Ingredient, value: any) => {
    const newElabs = [...recipe.elaborations];
    const newIngredients = [...newElabs[elabIndex].ingredients];
    newIngredients[ingIndex] = { ...newIngredients[ingIndex], [field]: value };
    newElabs[elabIndex].ingredients = newIngredients;
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

  const initiateCreateProduct = (elabIndex: number, ingIndex: number, name: string) => {
    setPendingProductCreate({ elabIndex, ingIndex });
    setNewProductName(name);
    setShowCreateProductModal(true);
    setActiveSearch(null);
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

  return (
    <>
    <form onSubmit={(e) => { e.preventDefault(); onSave(recipe); }} className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl mb-10 border border-slate-100 relative">
      
      {/* Panel Flotante de Escandallo */}
      <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700 animate-in slide-in-from-right-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Escandallo / Ración</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400">{costs.perYield.toFixed(2)}€</span>
              <span className="text-[10px] font-bold text-slate-400">PVP SUGERIDO: {(costs.perYield * 3.5).toFixed(2)}€</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Coste Total</span>
            <span className="text-lg font-bold text-slate-200 text-right">{costs.total.toFixed(2)}€</span>
          </div>
      </div>

      <div className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-20 shadow-md rounded-t-2xl">
        <div className="flex items-center gap-4">
           <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-700 rounded-full transition"><ArrowLeft size={24} /></button>
           <h2 className="text-2xl font-bold">Configuración de Ficha</h2>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold transition shadow-lg">
          <Save size={20} /> Guardar Cambios
        </button>
      </div>

      <div className="p-8 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
               <h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Foto de Presentación</h3>
               <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group">
                  {recipe.photo ? <img src={recipe.photo} className="absolute inset-0 w-full h-full object-cover" /> : <div className="text-gray-300"><ImageIcon size={48} /></div>}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const reader = new FileReader();
                    reader.onloadend = () => handleInputChange('photo', reader.result as string);
                    if(e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                  }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Plato</label><input type="text" required value={recipe.name} onChange={(e) => handleInputChange('name', e.target.value)} className="mt-1 block w-full rounded-xl border-slate-200 border p-3 font-black text-2xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Rendimiento (PAX)</label><input type="text" value={recipe.yieldQuantity} onKeyDown={handleDecimalKeyDown} onChange={(e) => handleInputChange('yieldQuantity', e.target.value)} className="mt-1 block w-full border-slate-200 border rounded-xl p-3 font-bold" /></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad de Medida</label><input type="text" value={recipe.yieldUnit} onChange={(e) => handleInputChange('yieldUnit', e.target.value)} className="mt-1 block w-full border-slate-200 border rounded-xl p-3 font-bold" /></div>
                </div>
            </div>
        </section>

        <div className="space-y-8" ref={searchWrapperRef}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Utensils size={24} className="text-emerald-500" /> Elaboraciones y Escandallo</h3>
              <button type="button" onClick={() => setRecipe(prev => ({ ...prev, elaborations: [...prev.elaborations, { id: generateId(), name: 'Nueva Elaboración', ingredients: [], instructions: '', photos: [] }] }))} className="text-xs font-black bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition">+ Añadir Proceso</button>
            </div>
            
            {recipe.elaborations.map((elab, elabIndex) => (
                <section key={elab.id} className="border border-slate-200 rounded-3xl bg-slate-50 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <GripVertical size={20} className="text-slate-300" />
                      <input type="text" value={elab.name} onChange={(e) => updateElaboration(elabIndex, 'name', e.target.value)} className="text-lg font-black bg-transparent w-full outline-none focus:text-emerald-600 border-b border-transparent focus:border-emerald-200" placeholder="Nombre de la elaboración..." />
                      <button type="button" onClick={() => {
                        if(recipe.elaborations.length > 1) {
                          setRecipe({...recipe, elaborations: recipe.elaborations.filter((_, i) => i !== elabIndex)});
                        }
                      }} className="text-slate-300 hover:text-red-500"><Trash2 size={20}/></button>
                    </div>
                    
                    <table className="w-full">
                        <thead><tr className="text-[10px] text-slate-400 uppercase font-black tracking-widest text-left"><th className="pb-3 px-2">Producto / Ingrediente</th><th className="pb-3 text-right">Cant.</th><th className="pb-3 pl-4">Ud.</th><th className="pb-3"></th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {elab.ingredients.map((ing, ingIndex) => {
                                const prod = findProductByName(ing.name);
                                return (
                                <tr key={ingIndex} className="group">
                                    <td className="relative py-2">
                                        <div className="relative flex items-center">
                                          <input 
                                            value={ing.name} 
                                            onFocus={() => setActiveSearch({elabIndex, ingIndex})} 
                                            onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'name', e.target.value)} 
                                            className={`w-full p-2.5 pr-10 rounded-xl border-slate-200 border text-sm transition focus:ring-2 focus:ring-emerald-500 outline-none ${prod ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-black' : 'bg-white'}`} 
                                            placeholder="Nombre del ingrediente..."
                                          />
                                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {prod ? (
                                              <CheckCircle2 size={16} className="text-emerald-500" title="Ingrediente vinculado correctamente" />
                                            ) : ing.name.length > 2 ? (
                                              <button type="button" onClick={() => initiateCreateProduct(elabIndex, ingIndex, ing.name)} title="Ingrediente huérfano. Clic para dar de alta." className="text-amber-500 hover:scale-125 transition">
                                                <AlertCircle size={18} />
                                              </button>
                                            ) : null}
                                          </div>
                                        </div>
                                        {activeSearch?.elabIndex === elabIndex && activeSearch?.ingIndex === ingIndex && (
                                            <ul className="absolute z-[100] left-0 top-full mt-1 w-full bg-white border border-emerald-100 rounded-xl shadow-2xl max-h-60 overflow-auto">
                                                {products.filter(p => p.nombre.toLowerCase().includes(ing.name.toLowerCase())).slice(0, 10).map((p, idx) => (
                                                    <li key={idx} onMouseDown={() => selectProduct(elabIndex, ingIndex, p)} className="p-3 hover:bg-emerald-50 cursor-pointer text-sm flex justify-between border-b border-slate-50 items-center">
                                                        <span className="font-bold">{p.nombre}</span>
                                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{p.precio}€/{p.unidad}</span>
                                                    </li>
                                                ))}
                                                {ing.name.length > 2 && products.filter(p => p.nombre.toLowerCase().includes(ing.name.toLowerCase())).length === 0 && (
                                                  <li onMouseDown={() => initiateCreateProduct(elabIndex, ingIndex, ing.name)} className="p-4 text-emerald-600 font-black text-xs cursor-pointer hover:bg-emerald-50 flex items-center gap-2">
                                                    <Plus size={16}/> Alta rápida: "{ing.name}"
                                                  </li>
                                                )}
                                            </ul>
                                        )}
                                    </td>
                                    <td className="py-2 px-2"><input value={ing.quantity} onKeyDown={handleDecimalKeyDown} onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'quantity', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-right text-sm font-black text-slate-700" placeholder="0" /></td>
                                    <td className="py-2 pl-4"><input value={ing.unit} onChange={(e) => handleIngredientChange(elabIndex, ingIndex, 'unit', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-400" placeholder="KG/L..." /></td>
                                    <td className="py-2 pl-2"><button type="button" onClick={() => {
                                      const newElabs = [...recipe.elaborations];
                                      newElabs[elabIndex].ingredients = newElabs[elabIndex].ingredients.filter((_, i) => i !== ingIndex);
                                      setRecipe({...recipe, elaborations: newElabs});
                                    }} className="text-slate-300 hover:text-red-500 transition"><X size={16}/></button></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    <button type="button" onClick={() => {
                         const newElabs = [...recipe.elaborations];
                         newElabs[elabIndex].ingredients.push({name: '', quantity: '', unit: ''});
                         setRecipe({...recipe, elaborations: newElabs});
                    }} className="mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-700 transition">+ Añadir Línea de Ingrediente</button>
                    
                    <div className="mt-6">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Procedimiento Técnico</label>
                       <textarea value={elab.instructions} onChange={(e) => updateElaboration(elabIndex, 'instructions', e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white shadow-inner" placeholder="Escribe los pasos de esta elaboración..." />
                    </div>
                </section>
            ))}
        </div>
      </div>
    </form>

    {showCreateProductModal && (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in zoom-in duration-200">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-100">
          <div className="bg-emerald-600 text-white p-6 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter">Alta Rápida de Ingrediente</h3>
            <button onClick={() => setShowCreateProductModal(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
          </div>
          <form onSubmit={confirmCreateProduct} className="p-8 space-y-6">
            <p className="text-sm text-slate-500">Introduce el precio base para que el escandallo de <strong>"{newProductName}"</strong> sea automático.</p>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad de Compra</label><input required className="w-full mt-1 p-3 border border-slate-200 rounded-xl" value={newProductDetails.unidad} onChange={e => setNewProductDetails({...newProductDetails, unidad: e.target.value})} placeholder="Kg, L, Ud..." /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio por Unidad (€)</label><input type="text" className="w-full mt-1 p-3 border border-slate-200 rounded-xl font-mono" onKeyDown={handleDecimalKeyDown} value={newProductDetails.precio} onChange={e => setNewProductDetails({...newProductDetails, precio: e.target.value})} placeholder="0.00" /></div>
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowCreateProductModal(false)} className="flex-grow py-4 rounded-xl font-bold text-slate-400 hover:bg-slate-50">Cerrar</button>
              <button type="submit" className="flex-grow py-4 bg-slate-900 text-white rounded-xl font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-transform">Guardar y Vincular</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};
