
import React, { useState, useEffect, useRef } from 'react';
import { Recipe, UserProfile } from './types';
import { getRecipes, saveRecipe, deleteRecipe, exportRecipeToJSON, createFullBackup, restoreFromBackup, getUserProfile, saveUserProfile } from './services/storage';
import { RecipeForm } from './components/RecipeForm';
import { RecipeDetail } from './components/RecipeDetail';
import { ProductDatabase } from './components/ProductDatabase';
import { Plus, Search, Edit, Trash2, Download, ChefHat, FileJson, Database, Settings, Upload, LayoutGrid, UtensilsCrossed, PieChart, User, Save, ImageIcon } from 'lucide-react';

type ViewState = 'list' | 'create' | 'edit' | 'detail' | 'products';

export default function App() {
  const [view, setView] = useState<ViewState>('list');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'backup'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({ authorName: '', logo: '' });

  useEffect(() => {
    refreshRecipes();
    setUserProfile(getUserProfile());
  }, []);

  const refreshRecipes = () => {
    setRecipes(getRecipes());
  };

  const handleCreateNew = () => {
    // Inject global profile into new recipe
    const profile = getUserProfile();
    const recipeWithProfile = {
      author: profile.authorName,
      logo: profile.logo
    } as Partial<Recipe>; // Passed to form as initial overrides

    setSelectedRecipe(recipeWithProfile as Recipe); 
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
      refreshRecipes();
    }
  };

  const handleExport = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    exportRecipeToJSON(recipe);
  };

  const handleSaveForm = (recipe: Recipe) => {
    saveRecipe(recipe);
    refreshRecipes();
    setView('list');
  };

  // --- SETTINGS HANDLERS ---
  
  const handleSaveProfile = () => {
    saveUserProfile(userProfile);
    alert('Perfil guardado. Se usará por defecto en las nuevas recetas.');
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackupDownload = () => {
    createFullBackup();
  };

  const handleBackupUploadTrigger = () => {
    fileInputRef.current?.click();
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
          refreshRecipes();
          setUserProfile(getUserProfile()); // Refresh profile
          setShowSettingsModal(false);
        } else {
          alert("Error: " + result.message);
        }
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };

  // Search Logic
  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.author && r.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRecipes = recipes.length;
  const categories = [...new Set(recipes.map(r => r.category))].length;
  
  // Update ingredient count logic to span across elaborations
  const totalIngredients = recipes.reduce((acc, r) => {
    const ingredientsInRecipe = r.elaborations 
      ? r.elaborations.reduce((eAcc, elab) => eAcc + elab.ingredients.length, 0)
      : (r.ingredients?.length || 0);
    return acc + ingredientsInRecipe;
  }, 0);

  // --- RENDER VIEWS ---

  if (view === 'create' || view === 'edit') {
    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4">
        <RecipeForm 
          initialRecipe={selectedRecipe} 
          onSave={handleSaveForm} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  if (view === 'detail' && selectedRecipe) {
    return (
      <div className="min-h-screen bg-slate-800 py-8 px-4 print:bg-white print:p-0">
        <RecipeDetail 
          recipe={selectedRecipe} 
          onBack={() => setView('list')} 
        />
      </div>
    );
  }

  if (view === 'products') {
    return (
      <ProductDatabase onBack={() => setView('list')} />
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      <div className="flex flex-col lg:flex-row flex-grow min-h-screen">
        
        <aside className="bg-slate-900 text-white lg:w-64 flex-shrink-0 flex flex-col sticky top-0 z-30 lg:h-screen">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-lg shadow-emerald-900/50">
               <ChefHat size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Kitchen<span className="text-emerald-400">Manager</span></h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Pro Edition</p>
            </div>
          </div>

          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            <button onClick={() => setView('list')} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 text-emerald-400 rounded-xl border border-slate-700/50 font-medium transition">
              <LayoutGrid size={20} />
              Dashboard
            </button>
            <button onClick={() => setView('products')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition font-medium">
              <Database size={20} />
              Base de Datos
            </button>
            <button onClick={() => setShowSettingsModal(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition font-medium">
              <Settings size={20} />
              Configuración
            </button>
          </nav>

          <div className="p-4 border-t border-slate-800">
             <button 
               onClick={handleCreateNew}
               className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition transform active:scale-95"
             >
               <Plus size={20} />
               Nueva Ficha
             </button>
          </div>
        </aside>

        <main className="flex-grow p-4 lg:p-8 overflow-y-auto bg-slate-50">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Mis Recetas</h2>
              <p className="text-slate-500 text-sm">Gestiona y organiza tus fichas técnicas.</p>
            </div>
            <div className="relative w-full sm:w-96">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="text-slate-400" size={18} />
               </div>
               <input 
                 type="text"
                 placeholder="Buscar..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="block w-full pl-10 pr-3 py-2.5 border-0 rounded-xl bg-white shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <UtensilsCrossed size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Recetas</p>
                <p className="text-2xl font-bold text-slate-800">{totalRecipes}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <PieChart size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Categorías</p>
                <p className="text-2xl font-bold text-slate-800">{categories}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Database size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Ingredientes Usados</p>
                <p className="text-2xl font-bold text-slate-800">{totalIngredients}</p>
              </div>
            </div>
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
               <div className="bg-slate-50 p-6 rounded-full mb-4">
                 <ChefHat size={48} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-800">No se encontraron recetas</h3>
               <p className="mt-2 text-slate-500">Prueba con otro término o crea una nueva ficha.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  onClick={() => handleDetail(recipe)}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col h-full"
                >
                  <div className="aspect-square relative overflow-hidden bg-slate-100">
                     {recipe.photo ? (
                       <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                     ) : (
                       <div className="flex items-center justify-center h-full text-slate-300">
                         <ChefHat size={48} strokeWidth={1.5} />
                       </div>
                     )}
                     
                     <div className="absolute top-3 left-3">
                       <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/50">
                         {recipe.category}
                       </span>
                     </div>

                     <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={(e) => handleExport(e, recipe)}
                          className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full hover:text-blue-600 shadow-sm"
                        >
                          <FileJson size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleEdit(e, recipe)}
                          className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full hover:text-emerald-600 shadow-sm"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, recipe.id)}
                          className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full hover:text-red-600 shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                     
                     <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-3">
                       <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight mb-1">
                         {recipe.name}
                       </h3>
                       {recipe.author && (
                         <p className="text-xs text-slate-400 font-medium">Por: {recipe.author}</p>
                       )}
                    </div>
                    
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
                      {recipe.serviceDetails.clientDescription || "Sin descripción comercial..."}
                    </p>
                    
                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs font-medium text-slate-400 uppercase tracking-wide">
                      <div className="flex items-center gap-1">
                         <span className="text-emerald-600 font-bold text-sm">{recipe.yieldQuantity}</span> {recipe.yieldUnit}
                      </div>
                      <div>
                         {recipe.elaborations ? recipe.elaborations.length : 1} Elaboraciones
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* SETTINGS & PROFILE MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="bg-slate-700 p-2 rounded-lg"><Settings size={20} /></div>
                 <div>
                    <h3 className="text-lg font-bold">Configuración</h3>
                    <p className="text-xs text-slate-400">Preferencias Globales</p>
                 </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-500 hover:text-white transition">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
               <button 
                 onClick={() => setSettingsTab('profile')}
                 className={`flex-1 py-3 text-sm font-bold ${settingsTab === 'profile' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 Perfil & Logo
               </button>
               <button 
                 onClick={() => setSettingsTab('backup')}
                 className={`flex-1 py-3 text-sm font-bold ${settingsTab === 'backup' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 Copia de Seguridad
               </button>
            </div>
            
            <div className="p-6">
               {settingsTab === 'profile' && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="text-sm text-slate-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      Establece aquí tus datos predeterminados. Se aplicarán automáticamente a todas las <strong>nuevas</strong> fichas que crees.
                    </div>
                    
                    <div className="flex flex-col items-center">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo Predeterminado</label>
                       <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden relative group hover:border-emerald-500 transition cursor-pointer">
                          {userProfile.logo ? (
                            <img src={userProfile.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                            <ImageIcon className="text-gray-300" />
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                       </div>
                       <button onClick={() => setUserProfile(prev => ({...prev, logo: ''}))} className="text-xs text-red-500 mt-2 hover:underline">Eliminar logo</button>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Chef / Alumno</label>
                       <div className="relative">
                          <User className="absolute left-3 top-3 text-gray-400" size={18} />
                          <input 
                            type="text"
                            value={userProfile.authorName}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, authorName: e.target.value }))}
                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Ej: Juan Pérez"
                          />
                       </div>
                    </div>

                    <button 
                      onClick={handleSaveProfile}
                      className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Guardar Perfil
                    </button>
                 </div>
               )}

               {settingsTab === 'backup' && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                     Guarda todas tus recetas, productos y perfil en un archivo único. Úsalo para mover tus datos a otro ordenador.
                   </div>

                   <div className="space-y-3">
                     <button 
                       onClick={handleBackupDownload}
                       className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md group transition"
                     >
                        <div className="text-left">
                          <div className="font-bold text-slate-800 group-hover:text-emerald-600">Descargar Copia</div>
                          <div className="text-xs text-slate-400">Guardar archivo .JSON</div>
                        </div>
                        <div className="bg-slate-100 p-2 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
                           <Download size={20} />
                        </div>
                     </button>

                     <div className="relative">
                       <input 
                         type="file" 
                         accept=".json" 
                         ref={fileInputRef}
                         onChange={handleFileChange}
                         className="hidden"
                       />
                       <button 
                         onClick={handleBackupUploadTrigger}
                         className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md group transition"
                       >
                          <div className="text-left">
                            <div className="font-bold text-slate-800 group-hover:text-blue-600">Restaurar Copia</div>
                            <div className="text-xs text-slate-400">Importar archivo existente</div>
                          </div>
                          <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                             <Upload size={20} />
                          </div>
                       </button>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
