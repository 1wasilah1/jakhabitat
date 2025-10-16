import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit, Download } from 'lucide-react';

interface Unit {
  id: number;
  name: string;
  types: UnitType[];
  location: string;
  description: string;
  image: string;
  available: boolean;
}

interface UnitType {
  id: number;
  name: string;
  size: number;
  price: number;
}

export const MasterUnit: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingType, setEditingType] = useState<{unitId: number, type?: UnitType} | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Auto-save when data changes
  useEffect(() => {
    if (hasChanges && units.length > 0) {
      const autoSave = async () => {
        setAutoSaveStatus('Menyimpan...');
        
        try {
          await fetch('http://localhost:3001/api/data/units', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ units })
          });
          
          setAutoSaveStatus('✅ Tersimpan ke server');
          setHasChanges(false);
          setTimeout(() => setAutoSaveStatus(''), 3000);
        } catch (error) {
          setAutoSaveStatus('❌ Gagal menyimpan');
          setTimeout(() => setAutoSaveStatus(''), 3000);
        }
      };
      
      const timer = setTimeout(autoSave, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges, units]);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data/units');
      if (response.ok) {
        const data = await response.json();
        setUnits(data.units || []);
      }
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  const saveUnit = (unit: Unit) => {
    let updatedUnits;
    if (unit.id) {
      updatedUnits = units.map(u => u.id === unit.id ? {...unit, types: unit.types || []} : u);
    } else {
      const newUnit = { ...unit, id: Math.max(...units.map(u => u.id), 0) + 1, types: unit.types || [] };
      updatedUnits = [...units, newUnit];
    }
    
    setUnits(updatedUnits);
    
    // Save to backend
    fetch('http://localhost:3001/api/data/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ units: updatedUnits })
    });
    
    setHasChanges(true);
    setIsModalOpen(false);
    setSelectedUnit(null);
    alert('Unit saved successfully!');
  };

  const deleteUnit = (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus unit ini? Data akan hilang dari localStorage.')) return;
    
    const updatedUnits = units.filter(u => u.id !== id);
    setUnits(updatedUnits);
    
    // Update backend
    fetch('http://localhost:3001/api/data/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ units: updatedUnits })
    });
    
    setHasChanges(true);
    alert('Unit berhasil dihapus!');
  };

  const openModal = (unit?: Unit) => {
    setSelectedUnit(unit || {
      id: 0,
      name: '',
      types: [],
      location: '',
      description: '',
      image: '',
      available: true
    });
    setIsModalOpen(true);
  };

  const toggleRow = (unitId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedRows(newExpanded);
  };

  const addType = (unitId: number) => {
    setEditingType({
      unitId,
      type: {
        id: Date.now(),
        name: '',
        size: 0,
        price: 0
      }
    });
  };

  const saveType = () => {
    if (!editingType) return;
    
    const updatedUnits = units.map(unit => {
      if (unit.id === editingType.unitId) {
        if (!unit.types) unit.types = [];
        const existingTypeIndex = unit.types.findIndex(t => t.id === editingType.type?.id);
        if (existingTypeIndex >= 0) {
          unit.types[existingTypeIndex] = editingType.type!;
        } else {
          unit.types.push(editingType.type!);
        }
      }
      return unit;
    });
    
    setUnits(updatedUnits);
    
    // Save to backend
    fetch('http://localhost:3001/api/data/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ units: updatedUnits })
    });
    
    setHasChanges(true);
    setEditingType(null);
  };

  const deleteType = (unitId: number, typeId: number) => {
    const updatedUnits = units.map(unit => {
      if (unit.id === unitId) {
        unit.types = (unit.types || []).filter(t => t.id !== typeId);
      }
      return unit;
    });
    
    setUnits(updatedUnits);
    
    // Save to backend
    fetch('http://localhost:3001/api/data/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ units: updatedUnits })
    });
    
    setHasChanges(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Unit</h2>
          {autoSaveStatus && (
            <p className="text-sm text-green-600 mt-1">{autoSaveStatus}</p>
          )}
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </button>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Types</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {units.map((unit) => (
              <React.Fragment key={unit.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleRow(unit.id)}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        {expandedRows.has(unit.id) ? '▼' : '▶'}
                      </button>
                      <img className="h-10 w-10 rounded object-cover" src={unit.image || '/jakhabitat/placeholder.svg'} alt={unit.name} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                        <div className="text-sm text-gray-500">{unit.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{unit.types?.length || 0} types</span>
                      <button
                        onClick={() => addType(unit.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        + Add Type
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      unit.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {unit.available ? 'Available' : 'Sold'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(unit)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUnit(unit.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                
                {/* Subtable for types */}
                {expandedRows.has(unit.id) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-2 bg-gray-50">
                      <div className="ml-8">
                        <table className="min-w-full">
                          <thead>
                            <tr>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Type Name</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Size</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Price</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(unit.types || []).map((type) => (
                              <tr key={type.id} className="border-t border-gray-200">
                                <td className="py-2 text-sm text-gray-900">{type.name}</td>
                                <td className="py-2 text-sm text-gray-900">{type.size} m²</td>
                                <td className="py-2 text-sm text-gray-900">{formatPrice(type.price)}</td>
                                <td className="py-2 text-sm">
                                  <button
                                    onClick={() => setEditingType({unitId: unit.id, type})}
                                    className="text-blue-600 hover:text-blue-800 mr-2 text-xs"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteType(unit.id, type.id)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedUnit.id ? 'Edit Unit' : 'Add New Unit'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                  <input
                    type="text"
                    value={selectedUnit.name}
                    onChange={(e) => setSelectedUnit({...selectedUnit, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={selectedUnit.location}
                    onChange={(e) => setSelectedUnit({...selectedUnit, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={selectedUnit.image}
                    onChange={(e) => setSelectedUnit({...selectedUnit, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={selectedUnit.description}
                    onChange={(e) => setSelectedUnit({...selectedUnit, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUnit.available}
                      onChange={(e) => setSelectedUnit({...selectedUnit, available: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Available for Sale</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveUnit(selectedUnit)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Unit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Type Edit Modal */}
      {editingType && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingType.type?.name ? 'Edit Type' : 'Add New Type'}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Name</label>
                <input
                  type="text"
                  value={editingType.type?.name || ''}
                  onChange={(e) => setEditingType({
                    ...editingType,
                    type: {...editingType.type!, name: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Studio, 1BR, 2BR, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size (m²)</label>
                <input
                  type="number"
                  value={editingType.type?.size || 0}
                  onChange={(e) => setEditingType({
                    ...editingType,
                    type: {...editingType.type!, size: parseInt(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (IDR)</label>
                <input
                  type="number"
                  value={editingType.type?.price || 0}
                  onChange={(e) => setEditingType({
                    ...editingType,
                    type: {...editingType.type!, price: parseInt(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setEditingType(null)}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveType}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};