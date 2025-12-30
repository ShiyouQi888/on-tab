import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { todoService } from '../../services/todoService';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const TodoWidget: React.FC = () => {
  const { t } = useTranslation();
  const [newTodo, setNewTodo] = useState('');
  
  const todos = useLiveQuery(() => todoService.getTodos());

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await todoService.addTodo(newTodo.trim());
    setNewTodo('');
  };

  const toggleTodo = async (id: string) => {
    await todoService.toggleTodo(id);
  };

  const deleteTodo = async (id: string) => {
    await todoService.deleteTodo(id);
  };

  const remainingCount = todos?.filter(t => t.completed === 0).length || 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full max-w-sm flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <ListTodo className="text-blue-400" size={20} />
        <h3 className="text-white font-bold">{t('widgets.todo.title')}</h3>
        <span className="ml-auto text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
          {t('widgets.todo.itemsCount', { count: remainingCount })}
        </span>
      </div>

      <form onSubmit={handleAddTodo} className="relative mb-4 shrink-0">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder={t('widgets.todo.placeholder')}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {todos?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20 gap-2">
            <ListTodo size={40} strokeWidth={1} />
            <p className="text-sm">{t('widgets.todo.empty')}</p>
          </div>
        ) : (
          todos?.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`shrink-0 transition-colors ${todo.completed ? 'text-green-400' : 'text-white/30 hover:text-white/50'}`}
              >
                {todo.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              
              <span className={`flex-1 text-sm transition-all ${todo.completed ? 'text-white/30 line-through' : 'text-white/80'}`}>
                {todo.content}
              </span>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
