
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MasterProduct } from '../data/products';
import { getProducts, saveProduct, deleteProduct } from '../services/storage';
import { Search, Plus, Trash2, Edit, ArrowLeft, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, Upload, FileSpreadsheet, Info, AlertCircle } from 'lucide-react';

interface ProductDatabaseProps {
  onBack: () => void;
}

type SortField = 'nombre' | 'precio' | 'unidad';
type SortOrder = 'asc' | 'desc';

export const ProductDatabase: React.FC<ProductDatabaseProps> = ({ onBack }) => {
  const [products, setProducts] = useState<MasterProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{count: number, error: string | null} | null>(null);

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
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' 
          ? valA - valB 
          : valB - valA;
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

        // Detectar separador (coma o punto y coma)
        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        
        let importedCount = 0;
        
        // Empezar en i=1 para saltar cabecera
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV splitter que respeta algunas comillas si es necesario
          const parts = line.split(separator).map(p => p.trim().replace(/^"|"$/g, ''));
          
          if (parts.length < 1) continue;

          // Mapeo básico: 0: Nombre, 1: Precio, 2: Unidad, 3: Alérgenos
          const nombre = parts[0];
          const precioStr = parts[1] || '';
          const unidad = parts[2] || 'unidad';
          const alergenosRaw = parts[3] || '';

          const alergenos = ALL_ALLERGENS.filter(a => 
            alergenosRaw.toLowerCase().includes(a.toLowerCase()) ||
            // Alias comunes
            (a === 'Frutos de cáscara' && alergenosRaw.toLowerCase().includes('frutos secos')) ||
            (a === 'Gluten' && alergenosRaw.toLowerCase().includes('trigo'))
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
        setImportStatus({ count: 0, error: "Error al procesar el archivo. Asegúrate de que es un CSV válido." });
      }
    };
    reader.readAsText(file);
    // Reset input
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
    
    if (isEditing && originalName !== formProd.nombre) {
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
      return {
        ...prev,
        alérgenos: exists 
          ? prev.alérgenos.filter(a => a !== allergen)
          : [...prev.alérgenos, allergen]
      };
    });
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`¿Eliminar producto "${name}" de la base de datos?`)) {
      deleteProduct(name);
      loadProducts();
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans animate-in fade-in duration-300">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Base de Datos de Productos</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                {products.length} Referencias Totales
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={csvInputRef} 
              onChange={handleCSVImport}
            />
            <button 
              onClick={() => csvInputRef.current?.click()}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <FileSpreadsheet size={20} /> Importar CSV
            </button>
            <button 
              onClick={openAddForm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition"
            >
              <Plus size={20} /> Nuevo Producto
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-grow">
        
        {importStatus && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 ${importStatus.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {importStatus.error ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
            <span className="font-bold">
              {importStatus.error ? importStatus.error : `¡Éxito! Se han importado/actualizado ${importStatus.count} productos.`}
            </span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-4 items-start">
            <Info className="text-blue-500 shrink-0 mt-1" size={20} />
            <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Guía de Importación CSV:</p>
                <p>El archivo debe tener este orden: <strong>Nombre del producto, Precio, Unidad, Alérgenos</strong>.</p>
                <p className="text-xs mt-1 opacity-80">Ejemplo: Bacalao fresco; 12,50; Kg; Pescado</p>
            </div>
        </div>

        {/* Search & Counter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre (ej: tomate, metro chef...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            />
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm whitespace-nowrap">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Resultados: </span>
            <span className="text-lg font-black text-emerald-600">{sortedAndFilteredProducts.length}</span>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest w-12">#</th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest cursor-pointer group hover:bg-slate-800 transition"
                    onClick={() => handleSort('nombre')}
                  >
                    <div className="flex items-center gap-2">Nombre <SortIcon field="nombre" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest cursor-pointer group hover:bg-slate-800 transition"
                    onClick={() => handleSort('precio')}
                  >
                    <div className="flex items-center gap-2">Precio Ref. <SortIcon field="precio" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest cursor-pointer group hover:bg-slate-800 transition"
                    onClick={() => handleSort('unidad')}
                  >
                    <div className="flex items-center gap-2">Unidad <SortIcon field="unidad" /></div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Alérgenos</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedAndFilteredProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/30 transition group">
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-gray-400 font-mono">
                      {(idx + 1).toString().padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                      {product.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono font-bold">
                      {product.precio ? `${product.precio.toFixed(2)} €` : <span className="text-gray-300 font-normal italic">Sin precio</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 uppercase text-xs font-bold">
                      {product.unidad}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.alérgenos.length > 0 ? product.alérgenos.map(a => (
                          <span key={a} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-100 text-orange-800 border border-orange-200">
                            {a}
                          </span>
                        )) : <span className="text-gray-300 text-[10px] italic">No</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditForm(product)} 
                          className="text-gray-400 hover:text-blue-600 transition p-2 hover:bg-blue-50 rounded-full"
                          title="Editar producto"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.nombre)} 
                          className="text-gray-300 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full"
                          title="Eliminar producto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedAndFilteredProducts.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="bg-slate-100 p-6 rounded-full text-slate-300 mb-4"><Search size={48} /></div>
                <h3 className="text-lg font-bold text-slate-800">No se encontraron productos</h3>
                <p className="text-slate-500">Intenta buscar con otros términos o añade uno nuevo.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className={`text-white p-6 flex justify-between items-center ${isEditing ? 'bg-blue-700' : 'bg-slate-800'}`}>
              <div>
                <h3 className="text-lg font-bold">{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
                <p className="text-xs text-white/60">
                  {isEditing ? `Modificando ${originalName}` : 'Introduce los datos del proveedor'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/60 hover:text-white transition">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Nombre del Producto</label>
                <input 
                  required
                  autoFocus
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                  value={formProd.nombre}
                  onChange={e => setFormProd({...formProd, nombre: e.target.value})}
                  placeholder="Ej: Harina de Trigo Tradicional"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Precio (€)</label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                    value={formProd.precioStr}
                    onChange={e => setFormProd({...formProd, precioStr: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Unidad</label>
                  <input 
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                    value={formProd.unidad}
                    onChange={e => setFormProd({...formProd, unidad: e.target.value})}
                    placeholder="Kg, L, Ud..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Declaración de Alérgenos</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto shadow-inner">
                  {ALL_ALLERGENS.map(allergen => (
                    <label key={allergen} className="flex items-center gap-2 text-[11px] font-bold uppercase cursor-pointer hover:bg-white p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                      <input 
                        type="checkbox"
                        checked={formProd.alérgenos.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-3 text-white rounded-xl font-bold shadow-lg transition flex items-center gap-2 ${
                    isEditing ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  {isEditing ? 'Actualizar Referencia' : 'Guardar Referencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
