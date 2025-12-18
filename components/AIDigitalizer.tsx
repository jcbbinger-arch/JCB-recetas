
import React, { useState } from 'react';
import { Sparkles, ClipboardCopy, Check, ArrowLeft, Terminal, FileJson, AlertTriangle } from 'lucide-react';
import { Recipe } from '../types';

interface AIDigitalizerProps {
  onBack: () => void;
  onSuccess: (draft: Partial<Recipe>) => void;
}

export const AIDigitalizer: React.FC<AIDigitalizerProps> = ({ onBack, onSuccess }) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MASTER_PROMPT = `Actúa como un Chef Ejecutivo y experto en digitalización de datos gastronómicos.
Tu tarea es convertir el texto o imagen de una receta que te voy a proporcionar en un objeto JSON compatible con mi sistema de gestión de cocina.

REGLAS DE FORMATO:
1. Devuelve ÚNICAMENTE el código JSON, sin explicaciones ni texto adicional.
2. Esquema exacto:
{
  "name": "Nombre de la receta",
  "category": "Entrantes|Primeros|Carnes|Pescados|Postres|Salsas|Otros",
  "yieldQuantity": 4,
  "yieldUnit": "raciones",
  "elaborations": [
    {
      "name": "Nombre de la elaboración (ej: Masa, Salsa, Principal)",
      "ingredients": [{"name": "Producto", "quantity": 100, "unit": "g|kg|ml|l|ud"}],
      "instructions": "Pasos detallados..."
    }
  ],
  "notes": "Alérgenos, puntos críticos o consejos",
  "serviceDetails": {
    "presentation": "Cómo emplatar",
    "servingTemp": "Temp ideal",
    "cutlery": "Cubiertos",
    "passTime": "Tiempo estimado",
    "serviceType": "A la Americana (Emplatado)",
    "clientDescription": "Descripción sugerente para carta"
  }
}

REGLAS TÉCNICAS:
- Cantidades siempre numéricas (usa g o ml para precisión).
- Si no hay datos de servicio, deja los campos vacíos "".

RECETA A DIGITALIZAR:
[PEGA AQUÍ TU RECETA O ESCANEO]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonText);
      if (!data.name || !data.elaborations) {
        throw new Error("El JSON no tiene el formato de receta requerido.");
      }
      onSuccess(data);
    } catch (e: any) {
      setError(e.message || "Error al parsear el JSON. Asegúrate de copiar el código completo.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-900">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Sparkles className="text-emerald-500" size={32} />
            Puente de Digitalización IA
          </h1>
          <p className="text-slate-500">Convierte texto, fotos o audios en fichas técnicas en segundos.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Paso 1 */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Terminal size={120} />
          </div>
          <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">Paso 1</span>
          <h2 className="text-2xl font-bold mb-4">Copia el Prompt Maestro</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Hemos diseñado una instrucción ultra-precisa para que Gemini 3 o ChatGPT entiendan exactamente cómo estructurar tu receta sin errores.
          </p>
          <button 
            onClick={handleCopy}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-emerald-50'}`}
          >
            {copied ? <Check size={20}/> : <ClipboardCopy size={20}/>}
            {copied ? '¡Copiado!' : 'Copiar Prompt Maestro'}
          </button>
        </div>

        {/* Paso 2 */}
        <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-xl">
          <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">Paso 2</span>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Importa el Resultado</h2>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">
            Una vez la IA te devuelva el código JSON, pégalo aquí debajo para pre-visualizar tu nueva ficha técnica.
          </p>
          
          <textarea 
            value={jsonText}
            onChange={(e) => {setJsonText(e.target.value); setError(null);}}
            placeholder="Pega el código JSON generado por la IA..."
            className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none mb-4"
          />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-xs mb-4 border border-red-100">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleImport}
            disabled={!jsonText.trim()}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/10"
          >
            <FileJson size={20} />
            Crear Ficha desde JSON
          </button>
        </div>
      </div>
      
      <div className="mt-12 p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
        <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2 italic">
          <Sparkles size={18}/> ¿Por qué usar el Puente IA?
        </h3>
        <ul className="text-sm text-emerald-800 space-y-2 opacity-80">
          <li>• <strong>Velocidad:</strong> Pasa libretas manuscritas a digital en segundos.</li>
          <li>• <strong>Estandarización:</strong> La IA unifica nombres y unidades automáticamente.</li>
          <li>• <strong>Sin Errores:</strong> Nuestro prompt fuerza el cumplimiento del esquema técnico.</li>
        </ul>
      </div>
    </div>
  );
};
