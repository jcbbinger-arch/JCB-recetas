import React, { useState, useEffect } from 'react';
import { MasterProduct } from '../data/products';
import { getProducts, saveProduct, deleteProduct } from '../services/storage';
import { Search, Plus, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ProductDatabaseProps {
  onBack: () => void;
}

export const ProductDatabase: React.FC<ProductDatabaseProps> = ({ onBack }) => {
  const [products, setProducts] = useState<MasterProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Product Form State
  const [newProd, setNewProd] = useState<MasterProduct>({
    nombre: '',
    unidad: 'Kg',
    precio: null,
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

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.nombre) return;
    saveProduct(newProd);
    loadProducts();
    setShowAddForm(false);
    setNewProd({ nombre: '', unidad: 'Kg', precio: null, alérgenos: [] });
  };

  const toggleAllergen = (allergen: string) => {
    setNewProd(prev => {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans animate-in fade-in duration-300">
      {/* Header */}
      <header className="bg-slate-800 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Base de Datos de Productos</h1>
              <p className="text-xs text-slate-400">{products.length} referencias registradas</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-md flex items-center gap-2 transition"
          >
            <Plus size={20} /> Nuevo Producto
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-grow">
        
        {/* Search */}
        <div className="mb-6 relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
           <input 
             type="text"
             placeholder="Buscar ingrediente..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
           />
        </div>

        {/* Product Grid */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Ref.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alérgenos</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {product.precio ? `${product.precio.toFixed(2)} €` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.unidad}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.alérgenos.length > 0 ? product.alérgenos.map(a => (
                          <span key={a} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            {a}
                          </span>
                        )) : <span className="text-gray-400 text-xs italic">Ninguno</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(product.nombre)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Añadir Nuevo Producto</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                <input 
                  required
                  autoFocus
                  className="mt-1 w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  value={newProd.nombre}
                  onChange={e => setNewProd({...newProd, nombre: e.target.value})}
                  placeholder="Ej: Harina de Trigo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio (€)</label>
                  <input 
                    type="number" step="0.01"
                    className="mt-1 w-full p-2 border rounded-md"
                    value={newProd.precio || ''}
                    onChange={e => setNewProd({...newProd, precio: parseFloat(e.target.value)})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad</label>
                  <input 
                    required
                    className="mt-1 w-full p-2 border rounded-md"
                    value={newProd.unidad}
                    onChange={e => setNewProd({...newProd, unidad: e.target.value})}
                    placeholder="Kg, L, Ud..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alérgenos</label>
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-md border border-gray-200 max-h-40 overflow-y-auto">
                  {ALL_ALLERGENS.map(allergen => (
                    <label key={allergen} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input 
                        type="checkbox"
                        checked={newProd.alérgenos.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium">
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};