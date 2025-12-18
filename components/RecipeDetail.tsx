
import React, { useMemo, useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Printer, ArrowLeft, Clock, Thermometer, Utensils, Users, AlertTriangle, ChefHat, User, Image as ImageIcon, ConciergeBell, ExternalLink, Scale } from 'lucide-react';
import { findProductByName } from '../services/storage';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  initialDesiredYield?: number;
}

const ALL_ALLERGENS_LIST = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Leche',
  'Frutos de cáscara', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
];

const SERVICE_TYPES_DESC: Record<string, string> = {
  "A la Americana (Emplatado)": "El plato sale terminado y decorado de cocina. El camarero lo sirve por la derecha.",
  "A la Inglesa": "Comida en fuente. El camarero sirve al cliente por la izquierda usando pinza.",
  "A la Francesa": "Comida en fuente. El camarero presenta por la izquierda y el cliente se sirve.",
  "Al Gueridón (A la Rusa)": "Se finaliza, trincha o flambea en mesa (carrito) y se sirve por la derecha.",
  "Plat de Milieu (Al centro)": "Platos al centro para compartir. Marcar con cubiertos de servicio.",
  "Servicio de Buffet": "Auto-servicio. El camarero se centra en bebidas y desbarase."
};

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, initialDesiredYield }) => {
  // Inicializamos con el valor proporcionado o el de la receta
  const [desiredYield, setDesiredYield] = useState<number>(initialDesiredYield || recipe.yieldQuantity);

  // Si el prop cambia externamente, actualizamos el estado local
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

  const recipeAllergens = useMemo(() => {
    const allergensSet = new Set<string>();
    const elaborations = recipe.elaborations || [];
    
    elaborations.forEach(elab => {
        elab.ingredients.forEach(ing => {
            const product = findProductByName(ing.name);
            if (product && product.alérgenos) {
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
    if (Number.isInteger(scaled)) return scaled.toString();
    return parseFloat(scaled.toFixed(3)).toString();
  };

  const serviceDesc = SERVICE_TYPES_DESC[recipe.serviceDetails.serviceType];
  const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-screen animate-in fade-in duration-500 relative">
      
      {/* Sticky Header with Scaling Control */}
      <div className="no-print bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-lg gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition font-medium">
            <ArrowLeft size={20} /> Volver
          </button>
          <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
          <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <Users size={18} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase text-slate-400">Raciones:</span>
            <input 
              type="number" 
              value={desiredYield} 
              onChange={(e) => setDesiredYield(Math.max(1, parseFloat(e.target.value) || 1))}
              className="bg-transparent text-white font-bold w-16 outline-none border-b border-emerald-500 text-center"
            />
          </div>
        </div>

        <div className="flex gap-4">
            {scalingFactor !== 1 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-900/30 text-amber-400 rounded-lg text-xs font-bold animate-pulse">
                <Scale size={14} /> Escalado x{scalingFactor.toFixed(2)}
              </div>
            )}
            {recipe.sourceUrl && (
                <a 
                    href={recipe.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/30 transition text-sm"
                >
                    <ExternalLink size={16} /> Ver Original
                </a>
            )}
            <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/30 transition text-sm">
                <Printer size={18} /> Imprimir Ficha
            </button>
        </div>
      </div>

      <div className="p-10 print:p-0 text-slate-800 bg-white">
        
        {/* Header */}
        <header className="flex items-start justify-between border-b-4 border-slate-800 pb-6 mb-8">
           <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-200 print:border-emerald-800">
                    {recipe.category}
                  </span>
                  {recipe.author && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium uppercase tracking-wider">
                          <User size={12} /> {recipe.author}
                      </span>
                  )}
                  {scalingFactor !== 1 && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full border border-amber-200">
                      Calculado para {desiredYield} {recipe.yieldUnit}
                    </span>
                  )}
              </div>
              <h1 className="text-5xl font-serif font-bold text-slate-900 leading-tight mb-2 print:text-3xl">{recipe.name}</h1>
              <p className="text-lg text-slate-500 italic font-serif border-l-4 border-emerald-500 pl-3 print:text-sm">
                 "{recipe.serviceDetails.clientDescription || 'Sin descripción comercial'}"
              </p>
           </div>
           
           <div className="w-32 h-32 flex-shrink-0 ml-4 print:w-20 print:h-20">
              {recipe.logo ? (
                  <img src={recipe.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                  <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-300 print:hidden">
                      <ChefHat size={32} />
                  </div>
              )}
           </div>
        </header>

        <div className="grid grid-cols-12 gap-8 print:gap-4">
          
          <div className="col-span-5 print:col-span-4 flex flex-col gap-8 print:gap-4">
             <div className="w-full aspect-square bg-gray-100 border border-gray-200 rounded-lg overflow-hidden shadow-sm print:border-gray-400 relative">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                     <ChefHat size={48} strokeWidth={1} />
                     <span className="text-xs uppercase tracking-widest mt-2">Sin Foto</span>
                  </div>
                )}
             </div>

             <div className="print-break-inside-avoid">
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-800 pb-1 mb-4 flex items-center gap-2 print:text-sm">
                   <Utensils size={18} /> Escandallo Escalado
                </h2>
                
                {recipe.elaborations.map((elab, idx) => (
                    <div key={idx} className="mb-6 break-inside-avoid print:mb-2">
                        {recipe.elaborations.length > 1 && (
                            <h3 className="font-bold text-emerald-700 text-sm mb-2 border-b border-emerald-100 pb-1 print:text-[10px]">
                                {idx + 1}. {elab.name || 'Elaboración'}
                            </h3>
                        )}
                        <table className="w-full text-sm print:text-[9px]">
                        <thead className="sr-only">
                            <tr><th>Prod</th><th>Cnt</th><th>Ud</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {elab.ingredients.map((ing, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/50 print:bg-transparent' : ''}>
                                <td className="py-1.5 pl-2 font-medium text-slate-700 print:py-0.5">{ing.name}</td>
                                <td className="py-1.5 text-right text-slate-900 font-mono font-bold print:py-0.5">
                                  {formatQuantity(ing.quantity)}
                                </td>
                                <td className="py-1.5 pl-2 text-xs text-slate-400 uppercase print:text-[8px] print:py-0.5">{ing.unit}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                ))}
             </div>
          </div>

          <div className="col-span-7 print:col-span-8 flex flex-col gap-6 print:gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-gray-300 print-break-inside-avoid print:p-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-2 print:mb-1 print:text-[8px]">
                 <AlertTriangle size={12} /> Alérgenos
              </h3>
              <div className="grid grid-cols-7 gap-2 print:gap-1">
                 {ALL_ALLERGENS_LIST.map((allergen) => {
                    const isActive = recipeAllergens.includes(allergen);
                    return (
                        <div key={allergen} className={`flex flex-col items-center justify-center p-2 rounded border text-center transition-colors print:p-0.5 ${
                            isActive 
                            ? 'bg-white border-red-500 shadow-sm ring-1 ring-red-100' 
                            : 'bg-slate-100 border-transparent opacity-40 grayscale print:opacity-20'
                        }`}>
                            <div className={`w-3 h-3 rounded-full mb-1 print:w-1.5 print:h-1.5 print:mb-0.5 ${isActive ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                            <span className={`text-[9px] uppercase leading-tight print:text-[6px] ${isActive ? 'font-bold text-red-900' : 'text-slate-500'}`}>
                                {allergen}
                            </span>
                        </div>
                    )
                 })}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-800 pb-1 mb-4 print:text-sm print:mb-2">
                Elaboración
              </h2>
              {recipe.elaborations.map((elab, idx) => (
                  <div key={idx} className="mb-6 break-inside-avoid print:mb-3">
                      {recipe.elaborations.length > 1 && (
                        <h3 className="font-bold text-slate-800 text-sm mb-2 bg-slate-100 p-1 pl-2 rounded print:text-[10px] print:mb-1">
                            {idx + 1}. {elab.name || 'Proceso'}
                        </h3>
                      )}
                      <div className="whitespace-pre-wrap text-justify text-slate-700 leading-relaxed text-sm font-light mb-3 print:text-[10px] print:mb-1">
                        {elab.instructions || "Sin instrucciones definidas."}
                      </div>

                      {elab.photos && elab.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-3 print:mb-1">
                              {elab.photos.map((photo, pIdx) => (
                                  <div key={pIdx} className="aspect-video rounded overflow-hidden border border-gray-100 bg-gray-50">
                                      <img src={photo} className="w-full h-full object-cover" alt={`Paso ${pIdx}`} />
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              ))}
            </div>

            {recipe.notes && (
               <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-sm text-amber-900 rounded-r-lg print:border-gray-300 print:bg-transparent print:border mt-4 print-break-inside-avoid print:p-2 print:text-[9px]">
                 <span className="font-bold block mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Notas:</span>
                 {recipe.notes}
               </div>
            )}

             <div className="p-4 border border-gray-200 rounded-lg bg-white mt-4 print-break-inside-avoid print:p-2 print:mt-2">
               <h3 className="text-sm font-bold text-slate-800 uppercase mb-2 flex items-center gap-2 print:text-[10px] print:mb-1">
                 <ChefHat size={16}/> Emplatado
               </h3>
               <p className="text-sm text-slate-600 italic leading-relaxed print:text-[9px]">
                 {recipe.serviceDetails.presentation || "Sin especificaciones."}
               </p>
             </div>
          </div>
        </div>

        <div className="mt-10 border-t-2 border-slate-800 pt-6 print:pt-2 print:mt-4 print-break-inside-avoid">
          <div className="grid grid-cols-4 gap-4 text-sm print:gap-2">
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:p-1.5">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold print:text-[7px]">Temperatura</span>
               <div className="flex items-center gap-2 font-bold text-sm text-slate-700 leading-tight print:text-[9px]">
                 {recipe.serviceDetails.servingTemp || "--"}
               </div>
             </div>
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:p-1.5">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold print:text-[7px]">Tiempo Pase</span>
               <div className="font-bold text-lg text-slate-700 print:text-[11px]">
                 {recipe.serviceDetails.passTime || "--"}
               </div>
             </div>
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm col-span-2 print:p-1.5">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold print:text-[7px]">Marcaje</span>
               <div className="font-medium text-slate-700 text-sm print:text-[9px]">
                 {recipe.serviceDetails.cutlery || "Estándar"}
               </div>
             </div>
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:p-1.5 col-span-2">
                <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold print:text-[7px]">Tipo Servicio</span>
                <div className="font-bold text-slate-800 print:text-[10px]">
                  {recipe.serviceDetails.serviceType}
                </div>
             </div>
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:p-1.5 col-span-2">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold print:text-[7px]">PAX Ajustado</span>
               <div className="font-black text-emerald-700 text-lg print:text-[12px]">
                 {desiredYield} {recipe.yieldUnit}
               </div>
             </div>
          </div>
        </div>
      </div>

      <footer className="print-footer px-10">
        <div className="flex-grow flex justify-between w-full">
            <span className="font-bold uppercase tracking-tight">{recipe.name} • {desiredYield} {recipe.yieldUnit}</span>
            <span className="italic">KitchenManager Pro</span>
            <span className="page-number font-bold"></span>
        </div>
      </footer>
    </div>
  );
};
