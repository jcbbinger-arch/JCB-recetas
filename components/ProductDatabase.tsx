
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MasterProduct } from '../data/products';
import { getProducts, saveProduct, deleteProduct } from '../services/storage';
import { Search, Plus, Trash2, Edit, ArrowLeft, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, Upload, FileSpreadsheet, Info, AlertCircle, Sparkles, ClipboardCopy } from 'lucide-react';

interface ProductDatabaseProps {
  onBack: () => void;
}

type SortField = 'nombre' | 'precio' | 'unidad';
type SortOrder = 'asc' | 'desc';

export const ProductDatabase: React.FC<ProductDatabaseProps> = ({ onBack }) => {
  const [products, setProducts] = useState<MasterProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{count: number, error: string | null} | null>(null);
  const [copied, setCopied] = useState(false);

  const MASTER_PRODUCTS_PROMPT = `Actúa como un experto en gestión de inventarios de hostelería. 
Analiza la siguiente lista de productos y devuélveme un archivo CSV con el formato exacto de 4 columnas separado por punto y coma (;).

REGLAS CRÍTICAS:
1. Formato columnas: Nombre del producto; Precio con IVA; Unidad; Alérgenos
2. Precio: Usa solo números con coma para decimales (ej: 12,50). No pongas el símbolo €.
3. Unidad: Usa "kg", "l", "unidad" o "pack".
4. Alérgenos: Identifica si contiene alguno de estos 14: Gluten, Crustáceos, Huevos, Pescado, Cacahuetes, Soja, Leche, Frutos de cáscara, Apio, Mostaza, Sésamo, Sulfitos, Altramuces, Moluscos. Si no tiene, pon un guion "-".
5. Si encuentras nombres similares, unifica el nombre para que sea descriptivo (ej: "Harina de Trigo 1kg").

LISTA DE PRODUCTOS A PROCESAR:
[PEGA AQUÍ TU LISTA O TABLA]`;

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [formProd, setFormProd] = useState<MasterProduct & { precioStr: string }>({
    nombre: '',
    unidad: 'Kg',
    precio: null,
    precioStr: '',
    alérgenos: []
  });

  const ALL_ALLERGENS = [
    'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Leche',
    'Frutos de cáscara', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_PRODUCTS_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (valA === null) valA = 0;
      if (valB === null) valB = 0;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });
    return result;
  }, [products, searchTerm, sortField, sortOrder]);

  const parseDecimal = (val: string): number => {
    if (!val) return 0;
    const sanitized = val.replace(/[€\s]/g, '').replace(',', '.');
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) return;

        const separator = lines[0].includes(';') ? ';' : ',';
        let importedCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(separator).map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts.length < 1) continue;

          const nombre = parts[0];
          const precioStr = parts[1] || '';
          const unidad = parts[2] || 'unidad';
          const alergenosRaw = parts[3] || '';

          const alergenos = ALL_ALLERGENS.filter(a => 
            alergenosRaw.toLowerCase().includes(a.toLowerCase())
          );

          if (nombre) {
            saveProduct({
              nombre,
              precio: precioStr ? parseDecimal(precioStr) : null,
              unidad,
              alérgenos: alergenos
            });
            importedCount++;
          }
        }
        setImportStatus({ count: importedCount, error: null });
        loadProducts();
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        setImportStatus({ count: 0, error: "Error al procesar el archivo CSV." });
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const openAddForm = () => {
    setIsEditing(false);
    setOriginalName('');
    setFormProd({ nombre: '', unidad: 'Kg', precio: null, precioStr: '', alérgenos: [] });
    setShowForm(true);
  };

  const openEditForm = (product: MasterProduct) => {
    setIsEditing(true);
    setOriginalName(product.nombre);
    setFormProd({
      ...product,
      precioStr: product.precio !== null ? product.precio.toString().replace('.', ',') : '',
      alérgenos: [...product.alérgenos]
    });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProd.nombre) return;
    if (isEditing && originalName.toLowerCase() !== formProd.nombre.toLowerCase()) {
      deleteProduct(originalName);
    }
    const finalProduct: MasterProduct = {
      nombre: formProd.nombre,
      unidad: formProd.unidad,
      precio: formProd.precioStr ? parseDecimal(formProd.precioStr) : null,
      alérgenos: formProd.alérgenos
    };
    saveProduct(finalProduct);
    loadProducts();
    setShowForm(false);
  };

  const toggleAllergen = (allergen: string) => {
    setFormProd(prev => {
      const exists = prev.alérgenos.includes(allergen);
      return { ...prev, alérgenos: exists ? prev.alérgenos.filter(a => a !== allergen) : [...prev.alérgenos, allergen] };
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans animate-in fade-in duration-300">
      <header className="bg-slate-900 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="text-xl font-bold">Base de Datos de Productos</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{products.length} Referencias</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPromptModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-purple-900/20">
              <Sparkles size={20} /> Prompt IA
            </button>
            <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCSVImport} />
            <button onClick={() => csvInputRef.current?.click()} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
              <FileSpreadsheet size={20} /> Subir CSV
            </button>
            <button onClick={openAddForm} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition">
              <Plus size={20} /> Nuevo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-grow">
        {importStatus && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${importStatus.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {importStatus.error ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
            <span className="font-bold">{importStatus.error ? importStatus.error : `¡Inventario actualizado! Se han procesado ${importStatus.count} productos.`}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest cursor-pointer" onClick={() => handleSort('nombre')}>
                  <div className="flex items-center gap-2">Nombre <SortIcon field="nombre" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest cursor-pointer" onClick={() => handleSort('precio')}>
                  <div className="flex items-center gap-2">Precio (€) <SortIcon field="precio" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Unidad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedAndFilteredProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">{p.nombre}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-600">{p.precio ? `${p.precio.toFixed(2)}€` : '--'}</td>
                  <td className="px-6 py-4 uppercase text-xs text-slate-400">{p.unidad}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditForm(p)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                    <button onClick={() => deleteProduct(p.nombre)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showPromptModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-purple-700 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <Sparkles size={32}/>
                <h3 className="text-2xl font-black">Prompt Maestro para Productos</h3>
              </div>
              <div className="bg-slate-100 p-6 rounded-2xl font-mono text-[10px] text-slate-600 mb-6 max-h-40 overflow-y-auto border border-slate-200">
                {MASTER_PRODUCTS_PROMPT}
              </div>
              <button onClick={handleCopyPrompt} className="w-full py-4 bg-white text-purple-700 rounded-xl font-black flex items-center justify-center gap-3">
                {copied ? "¡Prompt Copiado!" : "Copiar Prompt"}
              </button>
              <button onClick={() => setShowPromptModal(false)} className="w-full mt-4 text-purple-200 text-sm font-bold">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 text-white flex justify-between items-center ${isEditing ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              <h3 className="font-bold">{isEditing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="text-xs font-bold uppercase text-slate-400">Nombre</label><input required className="w-full p-2 border rounded-lg" value={formProd.nombre} onChange={e => setFormProd({...formProd, nombre: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase text-slate-400">Precio (€)</label><input className="w-full p-2 border rounded-lg" value={formProd.precioStr} onChange={e => setFormProd({...formProd, precioStr: e.target.value})} placeholder="0,00" /></div>
                <div><label className="text-xs font-bold uppercase text-slate-400">Unidad</label><input required className="w-full p-2 border rounded-lg" value={formProd.unidad} onChange={e => setFormProd({...formProd, unidad: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
