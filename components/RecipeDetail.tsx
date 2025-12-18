
import React, { useMemo, useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Printer, ArrowLeft, Users, AlertTriangle, ChefHat, User, Euro, Scale, Info, Clock, Thermometer, Utensils } from 'lucide-react';
import { findProductByName, calculateRecipeCost } from '../services/storage';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  initialDesiredYield?: number;
}

const ALL_ALLERGENS_LIST = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Leche',
  'Frutos de cáscara', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
];

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, initialDesiredYield }) => {
  const [desiredYield, setDesiredYield] = useState<number>(initialDesiredYield || recipe.yieldQuantity);

  useEffect(() => {
    if (initialDesiredYield) {
      setDesiredYield(initialDesiredYield);
    }
  }, [initialDesiredYield]);

  const handlePrint = () => {
    window.print();
  };

  const scalingFactor = useMemo(() => {
    if (!recipe.yieldQuantity || !desiredYield) return 1;
    return desiredYield / recipe.yieldQuantity;
  }, [recipe.yieldQuantity, desiredYield]);

  const costs = useMemo(() => calculateRecipeCost(recipe), [recipe]);

  const recipeAllergens = useMemo(() => {
    const allergensSet = new Set<string>();
    recipe.elaborations.forEach(elab => {
        elab.ingredients.forEach(ing => {
            const product = findProductByName(ing.name);
            if (product?.alérgenos) {
                product.alérgenos.forEach(a => allergensSet.add(a));
            }
        });
    });
    return Array.from(allergensSet);
  }, [recipe]);

  const formatQuantity = (qty: number | string) => {
    const num = typeof qty === 'number' ? qty : parseFloat(qty);
    if (isNaN(num)) return qty;
    const scaled = num * scalingFactor;
    return parseFloat(scaled.toFixed(3)).toString();
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-screen animate-in fade-in duration-500 relative font-sans">
      
      {/* BARRA DE CONTROL (NO SE IMPRIME) */}
      <div className="no-print bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-lg gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition font-bold">
            <ArrowLeft size={20} /> VOLVER
          </button>
          <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
          <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <Users size={18} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase text-slate-400">RACIONES:</span>
            <input 
              type="number" 
              value={desiredYield} 
              onChange={(e) => setDesiredYield(Math.max(1, parseFloat(e.target.value) || 1))}
              className="bg-transparent text-white font-bold w-16 outline-none border-b border-emerald-500 text-center"
            />
          </div>
        </div>

        <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Coste por Ración</div>
              <div className="text-xl font-black text-emerald-400">{costs.perYield.toFixed(2)}€</div>
            </div>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
                <Printer size={20} /> IMPRIMIR
            </button>
        </div>
      </div>

      {/* CUERPO DE LA FICHA (DISEÑO CLÁSICO) */}
      <div className="p-8 print:p-0 text-slate-800">
        
        {/* CABECERA TÉCNICA */}
        <header className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-start">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-slate-100 text-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded border border-slate-200">
                {recipe.category}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <User size={12}/> {recipe.author || 'Autor no definido'}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2 print:text-2xl">{recipe.name}</h1>
            <p className="text-slate-500 italic text-sm max-w-2xl">{recipe.serviceDetails.clientDescription || 'Sin descripción comercial.'}</p>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
             {recipe.logo ? (
                <img src={recipe.logo} alt="Logo" className="h-20 w-auto object-contain" />
             ) : (
                <div className="h-20 w-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center text-slate-300 print:hidden">
                  <ChefHat size={32} />
                </div>
             )}
             <div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-right">
                <span className="block text-[8px] uppercase font-bold text-slate-400">Escandallo por ración</span>
                <span className="text-xl font-black">{costs.perYield.toFixed(2)} €</span>
             </div>
          </div>
        </header>

        {/* METADATOS RÁPIDOS */}
        <div className="grid grid-cols-4 gap-4 mb-8 print:mb-4">
           <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="block text-[9px] uppercase font-black text-slate-400 mb-1">Rendimiento</span>
              <span className="font-bold text-slate-800">{desiredYield} {recipe.yieldUnit}</span>
           </div>
           <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="block text-[9px] uppercase font-black text-slate-400 mb-1">Temp. Servicio</span>
              <span className="font-bold text-slate-800">{recipe.serviceDetails.servingTemp || '--'}</span>
           </div>
           <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="block text-[9px] uppercase font-black text-slate-400 mb-1">Tiempo Pase</span>
              <span className="font-bold text-slate-800">{recipe.serviceDetails.passTime || '--'}</span>
           </div>
           <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="block text-[9px] uppercase font-black text-slate-400 mb-1">Vajilla</span>
              <span className="font-bold text-slate-800">{recipe.serviceDetails.cutlery || '--'}</span>
           </div>
        </div>

        {/* FOTO E INGREDIENTES */}
        <div className="grid grid-cols-12 gap-8 mb-8 print:gap-4 print:mb-4">
           {/* Foto si existe */}
           {recipe.photo && (
             <div className="col-span-12 md:col-span-4 print:col-span-4">
               <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-square bg-slate-50">
                 <img src={recipe.photo} className="w-full h-full object-cover" alt={recipe.name} />
               </div>
               {scalingFactor !== 1 && (
                 <div className="mt-4 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Scale size={16}/> Valores calculados para {desiredYield} raciones.
                 </div>
               )}
             </div>
           )}

           {/* Ingredientes */}
           <div className={`${recipe.photo ? 'col-span-12 md:col-span-8 print:col-span-8' : 'col-span-12'}`}>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 flex items-center gap-2">
                <Utensils size={18}/> Ingredientes y Cantidades
              </h2>
              {recipe.elaborations.map((elab, idx) => (
                <div key={idx} className="mb-6 break-inside-avoid">
                  {recipe.elaborations.length > 1 && (
                    <h3 className="text-xs font-black text-emerald-600 uppercase mb-2">
                      {idx + 1}. {elab.name}
                    </h3>
                  )}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase text-left border-b border-slate-100">
                        <th className="py-2 pl-2">Ingrediente</th>
                        <th className="py-2 text-right">Cantidad</th>
                        <th className="py-2 pl-4">Ud.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {elab.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2 pl-2 font-medium text-slate-700">{ing.name}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">{formatQuantity(ing.quantity)}</td>
                          <td className="py-2 pl-4 text-xs text-slate-400 font-bold uppercase">{ing.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
           </div>
        </div>

        {/* ELABORACIÓN */}
        <section className="mb-8 print:mb-4">
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 flex items-center gap-2">
              <ChefHat size={18}/> Técnica de Elaboración
           </h2>
           <div className="space-y-6">
              {recipe.elaborations.map((elab, idx) => (
                <div key={idx} className="break-inside-avoid">
                  {recipe.elaborations.length > 1 && (
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-2">Proceso {idx + 1}: {elab.name}</h3>
                  )}
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap text-justify bg-slate-50/50 p-4 rounded-xl border border-slate-100 print:bg-white print:p-0 print:border-none">
                    {elab.instructions || 'Pasos no definidos.'}
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* NOTAS Y PUNTOS CRÍTICOS */}
        {recipe.notes && (
          <section className="mb-8 print:mb-4 break-inside-avoid">
             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                <h2 className="text-xs font-black uppercase text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16}/> Notas Técnicas / APPCC
                </h2>
                <p className="text-sm text-red-800 leading-snug">{recipe.notes}</p>
             </div>
          </section>
        )}

        {/* ALÉRGENOS (PIE DE PÁGINA) */}
        <section className="border-t-2 border-slate-100 pt-6 break-inside-avoid">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 text-center">Declaración de Alérgenos</h2>
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 print:gap-1">
            {ALL_ALLERGENS_LIST.map(allergen => {
              const isActive = recipeAllergens.includes(allergen);
              return (
                <div key={allergen} className={`flex flex-col items-center gap-1 opacity-${isActive ? '100' : '20'}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isActive ? 'bg-red-600 border-red-600' : 'bg-transparent border-slate-200'}`}>
                    {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-[8px] font-bold uppercase text-slate-500 text-center leading-none">{allergen.slice(0, 8)}</span>
                </div>
              )
            })}
          </div>
        </section>

      </div>

      {/* PIE DE PÁGINA IMPRESIÓN */}
      <footer className="print-footer px-10">
        <div className="flex justify-between w-full font-bold text-[10px] uppercase">
            <span>{recipe.name}</span>
            <span>Coste/Ración: {costs.perYield.toFixed(2)}€</span>
            <span className="page-number"></span>
        </div>
      </footer>
    </div>
  );
};
