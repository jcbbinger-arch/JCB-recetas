
import React, { useState, useEffect, useRef } from 'react';
import { Recipe, UserProfile, Menu } from './types';
import { getRecipes, saveRecipe, deleteRecipe, exportRecipeToJSON, createFullBackup, restoreFromBackup, getUserProfile, saveUserProfile, getCategories, saveCategory, deleteCategory, getMenus, getProducts, calculateRecipeCost, generateId } from './services/storage';
import { RecipeForm } from './components/RecipeForm';
import { RecipeDetail } from './components/RecipeDetail';
import { ProductDatabase } from './components/ProductDatabase';
import { MenuManager } from './components/MenuManager';
import { AIDigitalizer } from './components/AIDigitalizer';
import { Plus, Search, Edit, Trash2, Download, ChefHat, FileJson, Database, Settings, Upload, LayoutGrid, UtensilsCrossed, User, ImageIcon, Tag, Layers, Sparkles, Euro } from 'lucide-react';

type ViewState = 'list' | 'create' | 'edit' | 'detail' | 'products' | 'menus' | 'ai_import';

export default function App() {
  const [view, setView] = useState<ViewState>('list');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [dbProductCount, setDbProductCount] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'categories' | 'backup'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({ authorName: '', logo: '' });
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = () => {
    try {
      const allRecipes = getRecipes();
      const allMenus = getMenus();
      const profile = getUserProfile();
      const cats = getCategories();
      const prods = getProducts();

      setRecipes(allRecipes);
      setMenus(allMenus);
      setUserProfile(profile);
      setCategories(cats);
      setDbProductCount(prods.length);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  const handleCreateNew = () => {
    const profile = getUserProfile();
    const recipeWithProfile: Partial<Recipe> = {
      author: profile.authorName || '',
      logo: profile.logo || '',
      category: getCategories()[0] || 'General',
      sourceUrl: '',
      elaborations: [
          { id: 'elab_' + Date.now(), name: 'Elaboración Principal', ingredients: [], instructions: '', photos: [] }
      ],
      yieldQuantity: 4,
      yieldUnit: 'raciones',
      serviceDetails: {
          presentation: '',
          servingTemp: '',
          cutlery: '',
          passTime: '',
          serviceType: 'A la Americana (Emplatado)',
          clientDescription: ''
      }
    };
    setSelectedRecipe(recipeWithProfile as Recipe); 
    setView('create');
  };

  const handleAIImportSuccess = (draft: Partial<Recipe>) => {
    const profile = getUserProfile();
    const recipeWithProfile: Recipe = {
      ...draft,
      id: generateId(),
      author: draft.author || profile.authorName || '',
      logo: draft.logo || profile.logo || '',
      category: draft.category || 'General',
      yieldQuantity: draft.yieldQuantity || 4,
      yieldUnit: draft.yieldUnit || 'raciones',
      elaborations: (draft.elaborations || []).map(e => ({ ...e, id: generateId(), photos: [] })),
      processPhotos: [],
      serviceDetails: {
        presentation: '',
        servingTemp: '',
        cutlery: '',
        passTime: '',
        serviceType: 'A la Americana (Emplatado)',
        clientDescription: '',
        ...draft.serviceDetails
      }
    } as Recipe;
    setSelectedRecipe(recipeWithProfile);
    setView('create');
  };

  const handleEdit = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    setSelectedRecipe(recipe);
    setView('edit');
  };

  const handleDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('detail');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar esta ficha técnica?')) {
      deleteRecipe(id);
      refreshAll();
    }
  };

  const handleExport = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    exportRecipeToJSON(recipe);
  };

  const handleSaveForm = (recipe: Recipe) => {
    saveRecipe(recipe);
    refreshAll();
    setView('list');
  };

  const handleSaveProfile = () => {
    saveUserProfile(userProfile);
    alert('Perfil guardado.');
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserProfile(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    saveCategory(newCategoryName.trim());
    setCategories(getCategories());
    setNewCategoryName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`¿Eliminar categoría "${cat}"?`)) {
      deleteCategory(cat);
      setCategories(getCategories());
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const result = restoreFromBackup(content);
        if (result.success) {
          alert(result.message);
          refreshAll();
          setShowSettingsModal(false);
        } else alert("Error: " + result.message);
      }
    };
    reader.readAsText(file);
  };

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'create' || view === 'edit') return (<div className="min-h-screen bg-slate-100 py-8 px-4"><RecipeForm initialRecipe={selectedRecipe} onSave={handleSaveForm} onCancel={() => setView('list')} /></div>);
  if (view === 'detail' && selectedRecipe) return (<div className="min-h-screen bg-slate-800 py-8 px-4 print:bg-white print:p-0"><RecipeDetail recipe={selectedRecipe} onBack={() => setView('list')} /></div>);
  if (view === 'products') return (<ProductDatabase onBack={() => { setView('list'); refreshAll(); }} />);
  if (view === 'menus') return (<MenuManager menus={menus} onBack={() => setView('list')} onRefresh={refreshAll} />);
  if (view === 'ai_import') return (<AIDigitalizer onBack={() => setView('list')} onSuccess={handleAIImportSuccess} />);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <div className="flex flex-col lg:flex-row flex-grow min-h-screen">
        <aside className="bg-slate-900 text-white lg:w-64 flex-shrink-0 flex flex-col sticky top-0 z-30 lg:h-screen">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-lg"><ChefHat size={28} /></div>
            <div><h1 className="text-lg font-bold tracking-tight">Kitchen<span className="text-emerald-400">Manager</span></h1><p className="text-[10px] text-slate-400 mt-1 uppercase">Pro Edition</p></div>
          </div>
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            <button onClick={() => setView('list')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${view === 'list' ? 'bg-slate-800/50 text-emerald-400 border border-slate-700/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><LayoutGrid size={20} />Dashboard</button>
            <button onClick={() => setView('menus')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${view === 'menus' ? 'bg-slate-800/50 text-emerald-400 border border-slate-700/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Layers size={20} />Menús y Eventos</button>
            <button onClick={() => setView('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${view === 'products' ? 'bg-slate-800/50 text-emerald-400 border border-slate-700/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Database size={20} />Base de Datos</button>
            <button onClick={() => setView('ai_import')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${view === 'ai_import' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-400 hover:bg-emerald-900/30'}`}><Sparkles size={20} />Importador IA</button>
            <button onClick={() => setShowSettingsModal(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition font-medium"><Settings size={20} />Configuración</button>
          </nav>
          <div className="p-4 border-t border-slate-800"><button onClick={handleCreateNew} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"><Plus size={20} />Nueva Ficha</button></div>
        </aside>

        <main className="flex-grow p-4 lg:p-8 overflow-y-auto bg-slate-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div><h2 className="text-2xl font-bold text-slate-800">Mis Recetas</h2><p className="text-slate-500 text-sm">Gestiona cientos de fichas técnicas.</p></div>
            <div className="relative w-full sm:w-96"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="text-slate-400" size={18} /></div><input type="text" placeholder="Filtrar por nombre o categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border-0 rounded-xl bg-white shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-emerald-600 sm:text-sm" /></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><UtensilsCrossed size={18} /></div><div><p className="text-[10px] text-slate-400 font-bold uppercase">Recetas</p><p className="text-lg font-bold">{recipes.length}</p></div></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Layers size={18} /></div><div><p className="text-[10px] text-slate-400 font-bold uppercase">Menús</p><p className="text-lg font-bold">{menus.length}</p></div></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3"><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Tag size={18} /></div><div><p className="text-[10px] text-slate-400 font-bold uppercase">Categorías</p><p className="text-lg font-bold">{categories.length}</p></div></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3 transition-all hover:border-emerald-500 cursor-pointer" onClick={() => setView('products')}><div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Database size={18} /></div><div><p className="text-[10px] text-slate-400 font-bold uppercase">Ingredientes</p><p className="text-lg font-bold">{dbProductCount}</p></div></div>
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-dashed border-2"><ChefHat size={48} className="text-slate-300" /><h3 className="text-xl font-bold mt-4">Sin resultados</h3></div>
          ) : (
            /* Dashboard Grid Ultra-Compacto (hasta 8 columnas) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
              {filteredRecipes.map((recipe) => {
                const costs = calculateRecipeCost(recipe);
                return (
                <div key={recipe.id} onClick={() => handleDetail(recipe)} className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden relative">
                  <div className="aspect-square relative bg-slate-50 overflow-hidden">
                    {recipe.photo ? <img src={recipe.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full text-slate-200"><ChefHat size={32} /></div>}
                    <div className="absolute top-1.5 left-1.5"><span className="bg-white/95 text-slate-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-slate-100 shadow-sm">{recipe.category}</span></div>
                    {/* Cost Badge Compacto */}
                    <div className="absolute top-1.5 right-1.5"><span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-0.5"><Euro size={8}/>{costs.perYield.toFixed(2)}</span></div>
                    
                    {/* Acciones en Hover */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                       <button onClick={(e) => handleExport(e, recipe)} title="Exportar JSON" className="bg-white p-1.5 rounded-lg hover:text-blue-600 text-slate-600 shadow-lg"><FileJson size={14} /></button>
                       <button onClick={(e) => handleEdit(e, recipe)} title="Editar" className="bg-white p-1.5 rounded-lg hover:text-emerald-600 text-slate-600 shadow-lg"><Edit size={14} /></button>
                       <button onClick={(e) => handleDelete(e, recipe.id)} title="Eliminar" className="bg-white p-1.5 rounded-lg hover:text-red-600 text-slate-600 shadow-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="p-2.5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-[11px] font-black text-slate-800 leading-tight group-hover:text-emerald-600 line-clamp-2" title={recipe.name}>{recipe.name}</h3>
                      <p className="text-[8px] text-slate-400 font-medium truncate mt-0.5">Por: {recipe.author}</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-between text-[8px] text-slate-400 font-black uppercase tracking-tighter">
                      <span>{recipe.yieldQuantity} {recipe.yieldUnit.slice(0, 4)}</span>
                      <span className="text-emerald-500">{recipe.elaborations.length} E.</span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </main>
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3"><div className="bg-slate-700 p-2 rounded-lg"><Settings size={20} /></div><div><h3 className="text-lg font-bold">Configuración</h3><p className="text-xs text-slate-400">Personaliza tu entorno</p></div></div>
               <button onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>
            <div className="flex border-b shrink-0">
               <button onClick={() => setSettingsTab('profile')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${settingsTab === 'profile' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Perfil</button>
               <button onClick={() => setSettingsTab('categories')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${settingsTab === 'categories' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Categorías</button>
               <button onClick={() => setSettingsTab('backup')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${settingsTab === 'backup' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Backup</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
               {settingsTab === 'profile' && (
                 <div className="space-y-6">
                    <div className="flex flex-col items-center"><div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center relative overflow-hidden">{userProfile.logo ? <img src={userProfile.logo} className="w-full h-full object-contain p-2" /> : <ImageIcon className="text-gray-300" />}<input type="file" accept="image/*" onChange={handleProfileImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" /></div></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Chef</label><input type="text" value={userProfile.authorName} onChange={(e) => setUserProfile(prev => ({ ...prev, authorName: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" placeholder="Tu nombre..." /></div>
                    <button onClick={handleSaveProfile} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition">Guardar Perfil</button>
                 </div>
               )}

               {settingsTab === 'categories' && (
                 <div className="space-y-6">
                    <form onSubmit={handleAddCategory} className="flex gap-2"><input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-grow p-3 border rounded-lg" placeholder="Nueva categoría..." /><button type="submit" className="bg-emerald-600 text-white px-4 rounded-lg font-bold">Añadir</button></form>
                    <div className="space-y-2 border-t pt-4">
                       {categories.map(cat => (
                         <div key={cat} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg group">
                            <span className="font-medium text-slate-700">{cat}</span>
                            <button onClick={() => handleDeleteCategory(cat)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"><Trash2 size={16} /></button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {settingsTab === 'backup' && (
                 <div className="space-y-3">
                   <button onClick={createFullBackup} className="flex items-center justify-between w-full p-4 border rounded-xl hover:border-emerald-500 transition"><div className="text-left font-bold">Descargar Copia</div><Download size={20} /></button>
                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-between w-full p-4 border rounded-xl hover:border-blue-500 transition"><div className="text-left font-bold">Restaurar Copia</div><Upload size={20} /></button>
                   <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
