
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArrowLeft, Sparkles, Upload, FileText, Loader2, AlertCircle, CheckCircle2, FileDown } from 'lucide-react';

interface AIDigitalizerProps {
  onBack: () => void;
  onSuccess: (draft: any) => void;
}

interface FileData {
  base64: string;
  mimeType: string;
  fileName: string;
}

export const AIDigitalizer: React.FC<AIDigitalizerProps> = ({ onBack, onSuccess }) => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFileData({
          base64,
          mimeType: file.type,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const processWithAI = async () => {
    if (!fileData) return;
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Analiza este documento (imagen o PDF) de una ficha técnica de cocina profesional y extrae la información con extrema precisión.
      
      Reglas de extracción:
      1. Extrae el nombre del plato de forma clara.
      2. Si hay varias elaboraciones (ej: Salsa, Guarnición, Principal), sepáralas en el array de elaboraciones.
      3. Para cada ingrediente, separa: nombre, cantidad (solo el número) y unidad (kg, g, l, ml, ud, etc).
      4. Las instrucciones deben ser pasos claros y numerados.
      5. Intenta identificar el rendimiento (pax/raciones).

      Estructura JSON requerida:
      {
        "name": "Nombre del plato",
        "category": "Categoría sugerida",
        "yieldQuantity": número_raciones,
        "elaborations": [
          {
            "name": "Nombre de la sub-elaboración",
            "ingredients": [{"name": "producto", "quantity": número, "unit": "unidad"}],
            "instructions": "pasos detallados"
          }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { 
              inlineData: { 
                data: fileData.base64, 
                mimeType: fileData.mimeType 
              } 
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const textResult = response.text;
      if (!textResult) throw new Error("La IA no devolvió contenido.");
      
      const result = JSON.parse(textResult);
      onSuccess(result);
    } catch (err: any) {
      console.error("AI Error:", err);
      setError(err.message || "No se pudo procesar el documento. Asegúrate de que no esté protegido por contraseña y sea legible.");
    } finally {
      setLoading(false);
    }
  };

  const isPDF = fileData?.mimeType === 'application/pdf';

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[700px] border border-slate-800/10">
        
        {/* Left Side: Upload / Preview */}
        <div className="w-full md:w-1/2 bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 relative">
           <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 flex items-center gap-2 font-bold transition-all">
             <ArrowLeft size={20}/> Volver al Dashboard
           </button>
           
           {!fileData ? (
             <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                  <Upload size={44} className="animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Scanner Pro <span className="text-emerald-500">IA</span></h3>
                <p className="text-slate-500 mb-10 max-w-xs leading-relaxed font-medium">
                  Sube una <span className="text-slate-900">foto, imagen o PDF</span> de tu ficha antigua. Gemini la digitalizará en segundos.
                </p>
                <label className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-slate-900/20 transition-all cursor-pointer hover:scale-105 active:scale-95">
                  Seleccionar Documento
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileSelect} className="hidden" />
                </label>
                <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Formatos: JPG, PNG, PDF</p>
             </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
                {isPDF ? (
                  <div className="flex flex-col items-center bg-white p-12 rounded-[2rem] shadow-xl border border-slate-100 w-full max-w-xs">
                    <div className="bg-red-50 text-red-500 p-6 rounded-2xl mb-4">
                      <FileDown size={64} />
                    </div>
                    <p className="font-black text-slate-800 text-center break-all">{fileData.fileName}</p>
                    <p className="text-xs text-slate-400 font-bold mt-2 uppercase">Documento PDF</p>
                  </div>
                ) : (
                  <div className="w-full h-full relative group shadow-2xl rounded-2xl overflow-hidden border-4 border-white">
                    <img src={`data:${fileData.mimeType};base64,${fileData.base64}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                       <p className="text-white font-bold">Imagen Lista</p>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => setFileData(null)} 
                  className="mt-6 text-slate-400 hover:text-red-500 text-sm font-bold flex items-center gap-2"
                >
                  ✕ Eliminar y elegir otro
                </button>
             </div>
           )}
        </div>

        {/* Right Side: Info & Process */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
           <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                 <div className="bg-purple-600 text-white p-3 rounded-2xl shadow-lg shadow-purple-200">
                   <Sparkles size={28}/>
                 </div>
                 <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Digitalización Multimodal</h2>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Powered by Google Gemini 3</p>
                 </div>
              </div>
              
              <div className="space-y-5">
                 <div className="flex gap-4 items-start">
                    <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><CheckCircle2 size={18}/></div>
                    <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="text-slate-900 font-bold">Lectura nativa de PDF:</span> Extrae datos de documentos de múltiples páginas con precisión quirúrgica.
                    </p>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><CheckCircle2 size={18}/></div>
                    <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="text-slate-900 font-bold">Mapeo Automático:</span> Identifica ingredientes, unidades y cantidades para tu escandallo.
                    </p>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><CheckCircle2 size={18}/></div>
                    <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="text-slate-900 font-bold">Formato Profesional:</span> Organiza las técnicas de cocina en pasos secuenciales listos para imprimir.
                    </p>
                 </div>
              </div>
           </div>

           {error && (
             <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl flex gap-3 items-center animate-in slide-in-from-left-2">
               <AlertCircle size={20} className="shrink-0"/> 
               <span className="font-bold">{error}</span>
             </div>
           )}

           <button 
             disabled={!fileData || loading} 
             onClick={processWithAI}
             className={`w-full py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden ${
               !fileData || loading 
               ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
               : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] shadow-emerald-900/20'
             }`}
           >
             {loading ? (
               <>
                 <Loader2 className="animate-spin" size={24} />
                 <span>Analizando Documento...</span>
               </>
             ) : (
               <>
                 <Sparkles size={24}/>
                 <span>Digitalizar ahora</span>
               </>
             )}
           </button>

           <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex flex-col items-center">
                 <div className="text-slate-900 font-black text-xl leading-none">100%</div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Privado</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col items-center">
                 <div className="text-slate-900 font-black text-xl leading-none">OCRX</div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Techno</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col items-center">
                 <div className="text-slate-900 font-black text-xl leading-none">SEC</div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
