
import React, { useState, useMemo } from 'react';
import { Recipe, Menu, Ingredient } from '../types';
import { getRecipes, findProductByName, saveMenu, deleteMenu, generateId, calculateRecipeCost } from '../services/storage';
import { Plus, Trash2, ShoppingCart, Users, ChevronRight, ArrowLeft, Printer, FileText, LayoutList, Search, Utensils, Scale } from 'lucide-react';
import { RecipeDetail } from './RecipeDetail';

interface MenuManagerProps {
  menus: Menu[];
  onBack: () => void;
  onRefresh: () => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({ menus, onBack, onRefresh }) => {
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'order' | 'cards'>('list');
  const [pax, setPax] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState('');
  
  const recipes = useMemo(() => getRecipes(), []);

  const consolidatedOrder = useMemo(() => {
    if (!selectedMenu) return {};
    const result: Record<string, Record<string, { quantity: number; unit: string }>> = {};
    
    selectedMenu.recipeIds.forEach(rid => {
      const recipe = recipes.find(r => r.id === rid);
      if (!recipe) return;

      const factor = pax / recipe.yieldQuantity;
      recipe.elaborations.forEach(elab => {
        elab.ingredients.forEach(ing => {
          const product = findProductByName(ing.name);
          const category = product?.categoria || product?.unidad || "Varios / Otros";
          const qty = (typeof ing.quantity === 'number' ? ing.quantity : parseFloat(ing.quantity as string)) * factor;
          
          if (!result[category]) result[category] = {};
          if (!result[category][ing.name]) {
            result[category][ing.name] = { quantity: 0, unit: ing.unit };
          }
          result[category][ing.name].quantity += qty;
        });
      });
    });
    return result;
  }, [selectedMenu, recipes, pax]);

  const handleCreateMenu = () => {
    const newMenu: Menu = {
      id: generateId(),
      name: 'Nuevo Menú',
      recipeIds: [],
      createdAt: new Date().toISOString()
    };
    saveMenu(newMenu);
    setSelectedMenu(newMenu);
    setViewMode('detail');
    onRefresh();
  };

  const toggleRecipeInMenu = (recipeId: string) => {
    if (!selectedMenu) return;
    const newIds = selectedMenu.recipeIds.includes(recipeId)
      ? selectedMenu.recipeIds.filter(id => id !== recipeId)
      : [...selectedMenu.recipeIds, recipeId];
    
    const updatedMenu = { ...selectedMenu, recipeIds: newIds };
    saveMenu(updatedMenu);
    setSelectedMenu(updatedMenu);
    onRefresh();
  };

  if (viewMode === 'list') {
    return (
      <div className="p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <LayoutList className="text-emerald-500" size={32} />
              Menús y Eventos
            </h1>
            <p className="text-slate-500">Agrupa fichas técnicas para producción masiva.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 transition"><ArrowLeft size={24} /></button>
            <button onClick={handleCreateMenu} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
              <Plus size={20} /> Crear Evento
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map(menu => (
            <div key={menu.id} onClick={() => { setSelectedMenu(menu); setViewMode('detail'); }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><FileText size={24} /></div>
                <button onClick={(e) => { e.stopPropagation(); deleteMenu(menu.id); onRefresh(); }} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{menu.name}</h3>
              <p className="text-xs text-slate-400 uppercase font-black tracking-widest">{menu.recipeIds.length} Recetas incluidas</p>
              <div className="mt-6 flex items-center justify-between text-emerald-600 font-bold text-sm">
                <span>Configurar Menú</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedMenu) {
    const menuRecipes = recipes.filter(r => selectedMenu.recipeIds.includes(r.id));
    const availableRecipes = recipes.filter(r => !selectedMenu.recipeIds.includes(r.id) && r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-300">
        <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-6 font-bold transition">
          <ArrowLeft size={18} /> Volver a Menús
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Nombre del Evento</label>
                <input 
                  type="text" 
                  value={selectedMenu.name} 
                  onChange={(e) => {
                    const m = { ...selectedMenu, name: e.target.value };
                    saveMenu(m);
                    setSelectedMenu(m);
                  }}
                  className="bg-transparent text-4xl font-black outline-none border-b-2 border-transparent focus:border-emerald-500 w-full mb-6"
                />
                
                <div className="flex flex-wrap gap-4">
                  <div className="bg-slate-800 px-6 py-3 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <Users className="text-emerald-400" size={24} />
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase">PAX Totales</p>
                      <input 
                        type="number" 
                        value={pax} 
                        onChange={(e) => setPax(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-transparent text-xl font-bold outline-none w-20"
                      />
                    </div>
                  </div>
                  <button onClick={() => setViewMode('order')} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-900/40">
                    <ShoppingCart size={20} /> Hoja de Pedido
                  </button>
                  <button onClick={() => setViewMode('cards')} className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition">
                    <Printer size={20} /> Libro de Fichas
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                <Utensils size={20} /> PLATOS SELECCIONADOS ({menuRecipes.length})
              </h3>
              <div className="space-y-3">
                {menuRecipes.map(r => (
                  <div key={r.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-500 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        {r.photo ? <img src={r.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Utensils size={24}/></div>}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{r.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">{r.category} • {calculateRecipeCost(r).perYield.toFixed(2)}€/pax</p>
                      </div>
                    </div>
                    <button onClick={() => toggleRecipeInMenu(r.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 h-fit sticky top-6">
            <h3 className="font-black text-slate-800 mb-4 uppercase tracking-tighter text-sm">Biblioteca de Recetas</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar biblioteca..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {availableRecipes.map(r => (
                <button 
                  key={r.id} 
                  onClick={() => toggleRecipeInMenu(r.id)}
                  className="w-full text-left p-2.5 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100 flex items-center gap-3 transition group"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {r.photo ? <img src={r.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Utensils size={16}/></div>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-slate-700 text-xs truncate leading-none mb-1">{r.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">{r.category}</p>
                  </div>
                  <Plus className="ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition" size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'order' && selectedMenu) {
    return (
      <div className="p-8 max-w-5xl mx-auto bg-white min-h-screen print:p-1 print:max-w-none font-sans">
        <button onClick={() => setViewMode('detail')} className="no-print mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold transition">
          <ArrowLeft size={18} /> Volver al Evento
        </button>

        <header className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-end print:mb-2 print:pb-1">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter print:text-[9pt]">PEDIDO CONSOLIDADO DE PRODUCCIÓN</h1>
            <p className="text-lg text-slate-500 font-medium print:text-[7pt]">{selectedMenu.name} • <span className="text-emerald-600 font-black">{pax} PAX</span></p>
          </div>
          <button onClick={() => window.print()} className="no-print bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-slate-800 transition">
            <Printer size={20} /> Imprimir Listado
          </button>
        </header>

        <div className="space-y-6 print:columns-2 print:gap-2 print:space-y-0">
          {Object.entries(consolidatedOrder).map(([category, items]) => (
            <div key={category} className="break-inside-avoid mb-6 print:mb-1 border-b border-slate-50 print:pb-1">
              <h2 className="text-xl font-black bg-slate-900 px-4 py-1.5 border-l-4 border-emerald-500 text-white uppercase tracking-widest mb-3 print:text-[7pt] print:px-1 print:py-0.5 print:mb-1 print:border-l-2">
                {category}
              </h2>
              <table className="w-full text-sm print:text-[7pt]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] font-black print:text-[5pt]">
                    <th className="text-left py-2 px-1">PRODUCTO</th>
                    <th className="text-right py-2 px-1">CANTIDAD</th>
                    <th className="text-left py-2 px-1 pl-2">UD.</th>
                    <th className="w-10 print:w-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(items).map(([name, data]) => (
                    <tr key={name} className="hover:bg-slate-50 border-b border-dotted border-slate-100">
                      <td className="py-2 px-1 font-bold text-slate-800 print:py-0.5 print:px-0">{name}</td>
                      <td className="py-2 px-1 text-right font-black text-emerald-700 print:py-0.5 print:px-0">
                        {parseFloat(data.quantity.toFixed(3))}
                      </td>
                      <td className="py-2 px-1 text-slate-400 font-black uppercase text-[10px] print:text-[6pt] print:py-0.5 pl-2">{data.unit}</td>
                      <td className="py-2 px-1 print:py-0.5">
                        <div className="w-4 h-4 border border-slate-200 rounded print:w-2 print:h-2"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <footer className="mt-10 border-t pt-4 text-[10px] text-slate-400 flex justify-between uppercase font-black italic print:text-[5pt] print:mt-1">
          <span>Sincronización Automática KitchenManager Pro</span>
          <span>Basado en producción para {pax} comensales</span>
        </footer>
      </div>
    );
  }

  if (viewMode === 'cards' && selectedMenu) {
    const menuRecipes = recipes.filter(r => selectedMenu.recipeIds.includes(r.id));
    return (
      <div className="bg-slate-800 py-10 print:bg-white print:p-0 min-h-screen">
        <div className="max-w-[210mm] mx-auto space-y-20 print:space-y-0" key={`pax-key-${pax}-${selectedMenu.id}`}>
          <button onClick={() => setViewMode('detail')} className="no-print mb-8 ml-10 flex items-center gap-2 text-white/50 hover:text-white font-bold transition">
            <ArrowLeft size={18} /> Volver al Menú
          </button>
          
          <div className="no-print bg-emerald-600 text-white p-6 mx-10 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Libro de Fichas del Evento</h3>
              <p className="text-emerald-100 text-sm">Todas las recetas escaladas automáticamente a <span className="font-black text-white">{pax} PAX</span>.</p>
            </div>
            <button onClick={() => window.print()} className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
              <Printer size={20} /> Imprimir Libro Pro
            </button>
          </div>

          {menuRecipes.map((recipe) => (
            <div key={`${recipe.id}-${pax}`} className="print:break-after-page">
               <RecipeDetail recipe={recipe} onBack={() => {}} initialDesiredYield={pax} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
