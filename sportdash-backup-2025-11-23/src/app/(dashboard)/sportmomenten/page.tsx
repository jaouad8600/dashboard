'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, Calendar, Clock, User, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TaskStatus = 'PENDING' | 'COMPLETED' | 'REFUSED';

interface Task {
  id: string;
  title: string;
  time: string;
  assignee: string;
  status: TaskStatus;
  type: 'GROUP' | 'INDIVIDUAL' | 'OTHER';
}

import { getDailySchedule } from '@/lib/schedules';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const INITIAL_TASKS: Task[] = [];

export default function SportMomentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '', time: '', assignee: '', type: 'GROUP', status: 'PENDING'
  });

  useEffect(() => {
    const schedule = getDailySchedule(new Date(selectedDate));
    const mappedTasks: Task[] = schedule.map(s => ({
      id: s.id,
      title: `${s.activity} (${s.location})`,
      time: s.startTime,
      assignee: 'Sportdocent', // Default
      status: 'PENDING',
      type: 'GROUP' // Default
    }));
    setTasks(mappedTasks);
  }, [selectedDate]);

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING',
      title: newTask.title || '',
      time: newTask.time || '',
      assignee: newTask.assignee || '',
      type: newTask.type || 'GROUP'
    };
    setTasks([...tasks, task]);
    setIsModalOpen(false);
    setNewTask({ title: '', time: '', assignee: '', type: 'GROUP', status: 'PENDING' });
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const refusedCount = tasks.filter(t => t.status === 'REFUSED').length;
  const totalProcessed = completedCount + refusedCount;
  const progress = Math.round((totalProcessed / tasks.length) * 100) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dagplanning</h1>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-gray-500 font-medium bg-transparent outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-medium"
        >
          <Plus size={20} />
          <span>Nieuw Moment</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-4xl font-bold text-gray-900">{progress}%</span>
              <span className="text-gray-500 ml-2 font-medium">afgehandeld</span>
            </div>
            <span className="text-sm text-gray-500 font-medium">{totalProcessed} van {tasks.length} taken</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm"
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Voltooid</span>
            <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">{completedCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Geweigerd</span>
            <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg">{refusedCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Openstaand</span>
            <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg">{tasks.length - totalProcessed}</span>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white rounded-2xl border transition-all
                ${task.status === 'COMPLETED' ? 'border-green-100 bg-green-50/30' : ''}
                ${task.status === 'REFUSED' ? 'border-red-100 bg-red-50/30' : ''}
                ${task.status === 'PENDING' ? 'border-gray-100 hover:border-blue-200 hover:shadow-md' : ''}
              `}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`font-bold text-lg truncate ${task.status !== 'PENDING' ? 'text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.status === 'REFUSED' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">Geweigerd</span>
                  )}
                  {task.status === 'COMPLETED' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Voltooid</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                    <Clock size={14} className="text-blue-500" />
                    {task.time}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                    <User size={14} className="text-purple-500" />
                    {task.assignee}
                  </span>
                  <span className={`px-2 py-1 rounded-lg font-medium text-xs uppercase tracking-wide
                    ${task.type === 'GROUP' ? 'bg-blue-50 text-blue-700' : ''}
                    ${task.type === 'INDIVIDUAL' ? 'bg-purple-50 text-purple-700' : ''}
                    ${task.type === 'OTHER' ? 'bg-gray-100 text-gray-700' : ''}
                  `}>
                    {task.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 md:border-l md:pl-4 md:border-gray-100">
                <button
                  onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                  className={`p-2 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[80px]
                        ${task.status === 'COMPLETED'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600'
                    }
                    `}
                >
                  <CheckCircle size={20} />
                  <span className="text-[10px] font-bold">Voltooid</span>
                </button>

                <button
                  onClick={() => handleStatusChange(task.id, 'REFUSED')}
                  className={`p-2 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[80px]
                        ${task.status === 'REFUSED'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600'
                    }
                    `}
                >
                  <XCircle size={20} />
                  <span className="text-[10px] font-bold">Weigeren</span>
                </button>

                {task.status !== 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'PENDING')}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Reset status"
                  >
                    <AlertCircle size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Nieuw Sportmoment</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Omschrijving</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 transition-all"
                    placeholder="Bijv. Zaalvoetbal Groep X"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tijd</label>
                    <input
                      type="time"
                      required
                      value={newTask.time}
                      onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                    <select
                      value={newTask.type}
                      onChange={e => setNewTask({ ...newTask, type: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 transition-all"
                    >
                      <option value="GROUP">Groep</option>
                      <option value="INDIVIDUAL">Individueel</option>
                      <option value="OTHER">Overig</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Toegewezen aan</label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 transition-all"
                    placeholder="Naam medewerker"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Toevoegen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
