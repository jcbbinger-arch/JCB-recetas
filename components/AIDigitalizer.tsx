
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, ClipboardCopy, FileCode, CheckCircle2, AlertCircle, Upload, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

interface AIDigitalizerProps {
  onBack: () => void;
  onSuccess: (draft: any) => void;
}

export const AIDigitalizer: React.FC<AIDigitalizerProps> = ({ onBack, onSuccess }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const MASTER_PROMPT = `Actúa como un experto en gestión de cocina profesional y digitalización de datos. Analiza la receta que te voy a proporcionar (texto o imagen) y devuélveme ÚNICAMENTE un objeto JSON con la siguiente estructura exacta.

IMPORTANTE: 
- No añadas texto explicativo, solo el bloque de código JSON.
- Separa las sub-elaboraciones (ej: "Salsa", "Guarnición") en el array 'elaborations'.
- Las cantidades deben ser números (sin letras de unidades).
- Las unidades deben ser estándar (kg, g, l, ml, ud, c.s., c.p.).

ESTRUCTURA REQUERIDA:
{
  "name": "Nombre del plato",
  "category": "Entrantes/Primeros/Pescados/Carnes/Postres/Salsas/Fondos",
  "yieldQuantity": 4,
  "yieldUnit": "raciones",
  "serviceDetails": {
    "presentation": "Descripción del emplatado",
    "clientDescription": "Descripción comercial para la carta"
  },
  "elaborations": [
    {
      "name": "Nombre de la elaboración (ej: Principal o Salsa)",
      "ingredients": [
        {"name": "Ingrediente 1", "quantity": 0.5, "unit": "kg"},
        {"name": "Ingrediente 2", "quantity": 2, "unit": "ud"}
      ],
      "instructions": "Pasos detallados de esta elaboración"
    }
  ]
}

RECETA A ANALIZAR:
[PEGA AQUÍ TU RECETA O SUBE TU ARCHIVO]`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      setError(null);
      // Limpiar posibles bloques de código markdown ```json ... ```
      const cleanedJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      
      if (!parsed.name || !parsed.elaborations) {
        throw new Error("El JSON no tiene el formato de receta válido.");
      }
      
      onSuccess(parsed);
    } catch (err: any) {
      setError("Error de formato: Asegúrate de pegar el código JSON completo y correcto generado por Gemini.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setJsonText(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[750px] border border-slate-200">
        
        {/* Lado Izquierdo: Instrucciones y Prompt */}
        <div className="w-full lg:w-5/12 bg-slate-900 text-white p-10 flex flex-col relative">
           <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all font-bold mb-10">
             <ArrowLeft size={20}/> Volver al Dashboard
           </button>

           <div className="flex-grow space-y-8">
              <div>
                <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <Sparkles size={24}/>
                </div>
                <h2 className="text-3xl font-black tracking-tight">Digitalización Inteligente</h2>
                <p className="text-slate-400 mt-2">Usa la potencia de Gemini 3 externamente para crear tus fichas sin errores.</p>
              </div>

              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-emerald-400">1</div>
                    <div>
                       <p className="font-bold">Copia el Prompt Maestro</p>
                       <p className="text-sm text-slate-500">Contiene las instrucciones exactas para que Gemini entienda nuestra app.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-emerald-400">2</div>
                    <div>
                       <p className="font-bold">Ve a Gemini y procesa la receta</p>
                       <p className="text-sm text-slate-500">Pega el prompt y tu receta (o sube el PDF/Foto) en el chat de Gemini.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-emerald-400">3</div>
                    <div>
                       <p className="font-bold">Pega el resultado aquí</p>
                       <p className="text-sm text-slate-500">Copia el código JSON que te dé Gemini y pégalo en el recuadro blanco.</p>
                    </div>
                 </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleCopyPrompt}
                  className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                >
                  {copied ? <CheckCircle2 size={20}/> : <ClipboardCopy size={20}/>}
                  {copied ? "¡Prompt Copiado!" : "Copiar Prompt Maestro"}
                </button>
                <a 
                  href="https://gemini.google.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-4 flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm hover:underline"
                >
                  Abrir Gemini en nueva pestaña <ExternalLink size={14}/>
                </a>
              </div>
           </div>

           <div className="mt-auto pt-8 border-t border-slate-800">
              <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                 <BookOpen size={16}/> Método de Alta Precisión
              </div>
           </div>
        </div>

        {/* Lado Derecho: Importación del JSON */}
        <div className="w-full lg:w-7/12 p-10 flex flex-col bg-white">
           <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">Importar Resultado</h3>
                <p className="text-sm text-slate-500">Pega el código JSON generado por la IA.</p>
              </div>
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2">
                 <Upload size={16}/> Subir .json
                 <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
           </div>

           <div className="flex-grow flex flex-col">
              <textarea 
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='Pega el código JSON aquí... (ej: { "name": "...", ... })'
                className="w-full flex-grow p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono text-sm resize-none transition-all"
              />
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-3 rounded-r-xl">
                  <AlertCircle size={20} className="shrink-0"/>
                  <span className="font-bold">{error}</span>
                </div>
              )}

              <div className="mt-6">
                <button 
                  disabled={!jsonText.trim()}
                  onClick={handleImport}
                  className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl ${!jsonText.trim() ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20 active:scale-[0.98]'}`}
                >
                  <FileCode size={24}/>
                  Generar Ficha Técnica
                  <ArrowRight size={24}/>
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest">
                  Al hacer clic, la IA revisará los datos y abrirá el editor de recetas.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
