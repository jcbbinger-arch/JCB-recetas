
import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { digitalizeRecipe } from '../services/ai';
import { Recipe } from '../types';

interface AIDigitalizerProps {
  onBack: () => void;
  onSuccess: (draft: Partial<Recipe>) => void;
}

export const AIDigitalizer: React.FC<AIDigitalizerProps> = ({ onBack, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Formato no soportado. Sube un PDF o una Imagen (JPG/PNG).");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const result = await digitalizeRecipe(base64, file.type);
          onSuccess(result);
        } catch (err: any) {
          setError(err.message || "Error al procesar el documento.");
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error al leer el archivo.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 font-bold transition">
        <ArrowLeft size={18} /> Volver al Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          {/* Decorative background sparks */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-2xl text-emerald-400 mb-6 border border-emerald-500/30">
              <Sparkles size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Digitalización Inteligente</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Sube una foto de tu ficha física o un PDF. Nuestra IA extraerá ingredientes, cantidades y procesos automáticamente.
            </p>
          </div>
        </div>

        <div className="p-12">
          {!isProcessing ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-100 rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,application/pdf"
              />
              <div className="bg-slate-100 p-6 rounded-full text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100 transition-colors mb-4">
                <Upload size={48} />
              </div>
              <p className="text-xl font-bold text-slate-800">Seleccionar Archivo</p>
              <p className="text-slate-400 text-sm mt-1">PDF, JPG o PNG (máx. 10MB)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <Loader2 size={80} className="text-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <FileText size={32} className="text-emerald-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mt-8 animate-pulse">Leyendo tu receta...</h3>
              <p className="text-slate-500 mt-2 text-center max-w-sm">
                Estamos analizando la estructura del documento y mapeando los ingredientes. Esto puede tardar unos segundos.
              </p>
              
              <div className="mt-10 w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-1/2 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
              <AlertCircle size={24} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 mb-3">1</div>
              <p className="text-sm font-bold text-slate-800">Sube el documento</p>
              <p className="text-xs text-slate-400">PDF o foto nítida</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 mb-3">2</div>
              <p className="text-sm font-bold text-slate-800">IA Procesa</p>
              <p className="text-xs text-slate-400">Extracción de datos</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 mb-3">3</div>
              <p className="text-sm font-bold text-slate-800">Revisa y Guarda</p>
              <p className="text-xs text-slate-400">Edición manual final</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
