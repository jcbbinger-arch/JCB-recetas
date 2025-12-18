
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ArrowLeft, Sparkles, Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AIDigitalizerProps {
  onBack: () => void;
  onSuccess: (draft: any) => void;
}

export const AIDigitalizer: React.FC<AIDigitalizerProps> = ({ onBack, onSuccess }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processWithAI = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      
      const prompt = `Analiza esta imagen de una ficha técnica de cocina y extrae la información en formato JSON. 
      Estructura requerida:
      {
        "name": "Nombre del plato",
        "category": "Categoría (Entrantes, Carnes, etc)",
        "yieldQuantity": número de raciones,
        "elaborations": [
          {
            "name": "Nombre de la elaboración",
            "ingredients": [{"name": "producto", "quantity": número, "unit": "unidad"}],
            "instructions": "pasos detallados"
          }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text);
      onSuccess(result);
    } catch (err) {
      console.error("AI Error:", err);
      setError("No se pudo procesar la imagen. Asegúrate de que el texto sea legible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        <div className="w-full md:w-1/2 bg-slate-100 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
           <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold"><ArrowLeft size={20}/> Volver</button>
           
           {!image ? (
             <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce"><Upload size={40}/></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Scanner IA</h3>
                <p className="text-slate-500 mb-8 max-w-xs">Sube una foto o PDF de tu ficha antigua y la IA la digitalizará por ti.</p>
                <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-900/20 transition cursor-pointer">
                  Seleccionar Archivo
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
             </div>
           ) : (
             <div className="w-full h-full relative group">
                <img src={image} className="w-full h-full object-contain rounded-xl" />
                <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">✕</button>
             </div>
           )}
        </div>

        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
           <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Sparkles size={24}/></div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Digitalización Inteligente</h2>
              </div>
              <ul className="space-y-4">
                 <li className="flex gap-3 text-slate-600 text-sm font-medium"><CheckCircle2 className="text-emerald-500 shrink-0" size={18}/> Reconoce ingredientes y cantidades automáticamente.</li>
                 <li className="flex gap-3 text-slate-600 text-sm font-medium"><CheckCircle2 className="text-emerald-500 shrink-0" size={18}/> Formatea las instrucciones por pasos.</li>
                 <li className="flex gap-3 text-slate-600 text-sm font-medium"><CheckCircle2 className="text-emerald-500 shrink-0" size={18}/> Mapea productos de tu base de datos maestra.</li>
              </ul>
           </div>

           {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex gap-2 items-center"><AlertCircle size={16}/> {error}</div>
           )}

           <button 
             disabled={!image || loading} 
             onClick={processWithAI}
             className={`w-full py-5 rounded-2xl font-black text-lg transition flex items-center justify-center gap-3 ${!image || loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xl'}`}
           >
             {loading ? <><Loader2 className="animate-spin" /> Procesando...</> : <><Sparkles size={20}/> Escanear Receta</>}
           </button>
           <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">Powered by Google Gemini 3 Flash</p>
        </div>
      </div>
    </div>
  );
};
