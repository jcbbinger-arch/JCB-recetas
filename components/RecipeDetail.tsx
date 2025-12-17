
import React, { useMemo } from 'react';
import { Recipe } from '../types';
import { Printer, ArrowLeft, Clock, Thermometer, Utensils, Users, AlertTriangle, ChefHat, User, Image as ImageIcon, ConciergeBell } from 'lucide-react';
import { findProductByName } from '../services/storage';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

const ALL_ALLERGENS_LIST = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Leche',
  'Frutos de cáscara', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
];

// Re-using the dictionary for display purposes
const SERVICE_TYPES_DESC: Record<string, string> = {
  "A la Americana (Emplatado)": "El plato sale terminado y decorado de cocina. El camarero lo sirve por la derecha.",
  "A la Inglesa": "Comida en fuente. El camarero sirve al cliente por la izquierda usando pinza.",
  "A la Francesa": "Comida en fuente. El camarero presenta por la izquierda y el cliente se sirve.",
  "Al Gueridón (A la Rusa)": "Se finaliza, trincha o flambea en mesa (carrito) y se sirve por la derecha.",
  "Plat de Milieu (Al centro)": "Platos al centro para compartir. Marcar con cubiertos de servicio.",
  "Servicio de Buffet": "Auto-servicio. El camarero se centra en bebidas y desbarase."
};

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  
  const handlePrint = () => {
    window.print();
  };

  // Calculate allergens from ALL ingredients in ALL elaborations
  const recipeAllergens = useMemo(() => {
    const allergensSet = new Set<string>();
    
    // Safety check for older data structure or empty elaborations
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

  const serviceDesc = SERVICE_TYPES_DESC[recipe.serviceDetails.serviceType];

  return (
    <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-screen animate-in fade-in duration-500">
      
      <div className="no-print bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition font-medium">
          <ArrowLeft size={20} /> Volver
        </button>
        <div className="flex gap-4">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/30 transition">
            <Printer size={20} /> Imprimir / PDF
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
              </div>
              <h1 className="text-5xl font-serif font-bold text-slate-900 leading-tight mb-2">{recipe.name}</h1>
              <p className="text-lg text-slate-500 italic font-serif border-l-4 border-emerald-500 pl-3">
                 "{recipe.serviceDetails.clientDescription || 'Sin descripción comercial'}"
              </p>
           </div>
           
           {/* Logo */}
           <div className="w-32 h-32 flex-shrink-0 ml-4">
              {recipe.logo ? (
                  <img src={recipe.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                  <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-300 print:hidden">
                      <ChefHat size={32} />
                  </div>
              )}
           </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column: Photo & Ingredients (Iterated by Elaboration) */}
          <div className="col-span-5 print:col-span-5 flex flex-col gap-8">
             
             {/* Photo (Square) */}
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

             {/* Ingredients List (Grouped by Elaboration) */}
             <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-800 pb-1 mb-4 flex items-center gap-2">
                   <Utensils size={18} /> Escandallo
                </h2>
                
                {recipe.elaborations.map((elab, idx) => (
                    <div key={idx} className="mb-6 break-inside-avoid">
                        {recipe.elaborations.length > 1 && (
                            <h3 className="font-bold text-emerald-700 text-sm mb-2 border-b border-emerald-100 pb-1">
                                {idx + 1}. {elab.name || 'Elaboración'}
                            </h3>
                        )}
                        <table className="w-full text-sm">
                        <thead className="sr-only">
                            <tr><th>Prod</th><th>Cnt</th><th>Ud</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {elab.ingredients.map((ing, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/50 print:bg-transparent' : ''}>
                                <td className="py-1.5 pl-2 font-medium text-slate-700">{ing.name}</td>
                                <td className="py-1.5 text-right text-slate-600 font-mono">{ing.quantity}</td>
                                <td className="py-1.5 pl-2 text-xs text-slate-400 uppercase">{ing.unit}</td>
                            </tr>
                            ))}
                            {elab.ingredients.length === 0 && (
                                <tr><td colSpan={3} className="text-xs italic text-gray-400 py-2">Sin ingredientes.</td></tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                ))}
             </div>
          </div>

          {/* Right Column: Instructions (Iterated), Allergens, Presentation */}
          <div className="col-span-7 print:col-span-7 flex flex-col gap-6">
            
            {/* Allergens Matrix - High Visibility */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-gray-300">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-2">
                 <AlertTriangle size={12} /> Declaración de Alérgenos (Global)
              </h3>
              <div className="grid grid-cols-7 gap-2">
                 {ALL_ALLERGENS_LIST.map((allergen) => {
                    const isActive = recipeAllergens.includes(allergen);
                    return (
                        <div key={allergen} className={`flex flex-col items-center justify-center p-2 rounded border text-center transition-colors ${
                            isActive 
                            ? 'bg-white border-red-500 shadow-sm ring-1 ring-red-100' 
                            : 'bg-slate-100 border-transparent opacity-40 grayscale print:opacity-20'
                        }`}>
                            <div className={`w-3 h-3 rounded-full mb-1 ${isActive ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                            <span className={`text-[9px] uppercase leading-tight ${isActive ? 'font-bold text-red-900' : 'text-slate-500'}`}>
                                {allergen}
                            </span>
                        </div>
                    )
                 })}
              </div>
            </div>

            {/* Instructions (Grouped by Elaboration) */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-800 pb-1 mb-4">
                Elaboración
              </h2>
              {recipe.elaborations.map((elab, idx) => (
                  <div key={idx} className="mb-6 break-inside-avoid">
                      {recipe.elaborations.length > 1 && (
                        <h3 className="font-bold text-slate-800 text-sm mb-2 bg-slate-100 p-1 pl-2 rounded">
                            {idx + 1}. {elab.name || 'Proceso'}
                        </h3>
                      )}
                      <div className="whitespace-pre-wrap text-justify text-slate-700 leading-relaxed text-sm font-light mb-3">
                        {elab.instructions || "Sin instrucciones definidas."}
                      </div>

                      {/* ELABORATION PHOTOS */}
                      {elab.photos && elab.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
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
            
            {/* Process Photos Gallery (Global) */}
            {recipe.processPhotos && recipe.processPhotos.length > 0 && (
               <div className="mt-4 border-t border-dashed border-gray-300 pt-4">
                 <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><ImageIcon size={12}/> Galería General</h3>
                 <div className="grid grid-cols-4 gap-2">
                    {recipe.processPhotos.map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 break-inside-avoid">
                         <img src={photo} className="w-full h-full object-cover" alt={`Paso ${idx}`} />
                      </div>
                    ))}
                 </div>
               </div>
            )}

            {/* Notes */}
            {recipe.notes && (
               <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-sm text-amber-900 rounded-r-lg print:border-gray-300 print:bg-transparent print:border mt-4">
                 <span className="font-bold block mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Puntos Críticos / Notas:</span>
                 {recipe.notes}
               </div>
            )}

             {/* Presentation Section */}
             <div className="p-4 border border-gray-200 rounded-lg bg-white break-inside-avoid mt-4">
               <h3 className="text-sm font-bold text-slate-800 uppercase mb-2 flex items-center gap-2">
                 <ChefHat size={16}/> Presentación y Emplatado
               </h3>
               <p className="text-sm text-slate-600 italic leading-relaxed">
                 {recipe.serviceDetails.presentation || "Sin especificaciones de presentación."}
               </p>
             </div>

          </div>
        </div>

        {/* Footer: Service Specs */}
        <div className="mt-10 border-t-2 border-slate-800 pt-6 break-inside-avoid print-break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
             <Clock size={20} className="text-slate-800" />
             <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Ficha de Pase y Servicio</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
             {/* Temp */}
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:shadow-none relative overflow-hidden">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">Temperatura</span>
               <div className="flex items-center gap-2 font-bold text-sm text-slate-700 leading-tight">
                 <Thermometer size={16} className="text-emerald-500 flex-shrink-0" />
                 {recipe.serviceDetails.servingTemp || "--"}
               </div>
             </div>
             
             {/* Time */}
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:shadow-none">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">Tiempo Pase</span>
               <div className="font-bold text-lg text-slate-700">
                 {recipe.serviceDetails.passTime || "--"}
               </div>
             </div>

             {/* Cutlery */}
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm col-span-2 print:shadow-none">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">Marcaje / Cubiertos</span>
               <div className="font-medium text-slate-700 flex items-center gap-2">
                 <Utensils size={16} className="text-slate-400"/>
                 {recipe.serviceDetails.cutlery || "Estándar"}
               </div>
             </div>
             
             {/* Service Type */}
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:shadow-none col-span-2">
               <div className="flex items-start gap-2">
                   <ConciergeBell size={18} className="text-slate-400 mt-1" />
                   <div>
                       <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">Tipo Servicio</span>
                       <div className="font-bold text-slate-800">
                         {recipe.serviceDetails.serviceType}
                       </div>
                       {serviceDesc && (
                           <div className="text-xs text-slate-500 italic mt-1 leading-tight">
                               {serviceDesc}
                           </div>
                       )}
                   </div>
               </div>
             </div>

             {/* Yield */}
             <div className="p-3 bg-white border border-slate-200 rounded shadow-sm print:shadow-none col-span-2">
               <span className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">Rendimiento</span>
               <div className="font-medium text-slate-700 flex items-center gap-2">
                 <Users size={16} className="text-slate-400"/>
                 {recipe.yieldQuantity} {recipe.yieldUnit}
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
