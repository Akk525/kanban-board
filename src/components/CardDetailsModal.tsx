import React, { useState } from 'react';
import { X, Calendar, User, Tag, Clock, MessageCircle, Edit3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useBoardContext } from '../context/BoardContext';
import type { Card as CardType, User as UserType, Comment } from '../types';

interface CardDetailsModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  card,
  isOpen,
  onClose,
  users,
}) => {
  const { dispatch } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editData, setEditData] = useState<Partial<CardType>>(card || {});

  React.useEffect(() => {
    if (card) {
      setEditData(card);
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const assignee = users.find(user => user.id === card.assigneeId);
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const isDueSoon = card.dueDate && 
    new Date(card.dueDate) > new Date() && 
    new Date(card.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_CARD',
      payload: {
        id: card.id,
        ...editData,
        dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
      },
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      dispatch({ type: 'DELETE_CARD', payload: card.id });
      onClose();
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      authorId: '1', // Current user - in a real app this would be dynamic
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({
      type: 'UPDATE_CARD',
      payload: {
        id: card.id,
        comments: [...card.comments, comment],
      },
    });
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
            )}
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[card.priority]}`}>
              {card.priority}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={isEditing ? "Cancel editing" : "Edit card"}
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
              title="Delete card"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={editData.description || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap">
                {card.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={16} />
                Assignee
              </label>
              {isEditing ? (
                <select
                  value={editData.assigneeId || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800">{assignee?.name || 'Unassigned'}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} />
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    dueDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {card.dueDate ? (
                    <>
                      <span className={`${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-800'}`}>
                        {format(new Date(card.dueDate), 'MMM dd, yyyy')}
                      </span>
                      {isOverdue && <Clock size={14} className="text-red-500" />}
                      {isDueSoon && <Clock size={14} className="text-orange-500" />}
                    </>
                  ) : (
                    <span className="text-gray-500">No due date</span>
                  )}
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[card.priority]}`}>
                  {card.priority}
                </span>
              )}
            </div>

            {/* Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
              <p className="text-gray-600">{format(new Date(card.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} />
              Labels
            </label>
            {card.labels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {card.labels.map((label, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No labels</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <MessageCircle size={16} />
              Comments ({card.comments.length})
            </label>
            
            {/* Add Comment */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {card.comments.map(comment => {
                const author = users.find(u => u.id === comment.authorId);
                return (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {author?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                );
              })}
              {card.comments.length === 0 && (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              )}
            </div>
          </div>

          {/* Save/Cancel buttons when editing */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
