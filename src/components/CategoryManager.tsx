import React, { useState } from 'react';
import { X, Plus, Palette, Edit2, Trash2 } from 'lucide-react';
import type { Category } from '../types';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#6B7280', // Gray
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange-600
  '#84CC16', // Lime
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(defaultColors[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor(defaultColors[0]);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editName.trim()) {
      onUpdateCategory(editingCategory.id, editName.trim(), editColor);
      setEditingCategory(null);
      setEditName('');
      setEditColor('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditColor('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette size={20} />
            Manage Categories
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Add New Category */}
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium mb-3">Add New Category</h4>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-1">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newCategoryColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-4">
          <h4 className="font-medium mb-3">Existing Categories</h4>
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No categories yet. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {editingCategory?.id === category.id ? (
                    <>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: editColor }}
                      />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                      <div className="flex gap-1">
                        {defaultColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={`w-6 h-6 rounded-full border ${
                              editColor === color ? 'border-gray-900' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="flex-1 font-medium">{category.name}</span>
                      <button
                        onClick={() => handleStartEdit(category)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Edit category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(category.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
