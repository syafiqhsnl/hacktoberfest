import React, { useState, useMemo } from 'react';
import { Task, Opportunity } from '../types.ts';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Award, 
  Plus, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface MyTasksViewProps {
  tasks: Task[];
  opportunities: Opportunity[];
  onToggleTask: (taskId: string, currentCompleted: boolean) => void;
  onAddTask: (task: Partial<Task>) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenReportOutcome: (opp: Opportunity) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  opportunities,
  onToggleTask,
  onAddTask,
  onSelectOpportunity,
  onOpenReportOutcome,
}) => {
  const [selectedOppFilter, setSelectedOppFilter] = useState<string>('ALL');
  const [showCompleted, setShowCompleted] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOppId, setNewTaskOppId] = useState(opportunities[0]?.id || '');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Group tasks by due date category (Overdue, Today, This Week, Later, Completed)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const groupedTasks = useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];
    const completed: Task[] = [];

    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekFromNowStr = weekFromNow.toISOString().split('T')[0];

    tasks.forEach(task => {
      if (selectedOppFilter !== 'ALL' && task.opportunityId !== selectedOppFilter) {
        return;
      }

      if (task.completed) {
        completed.push(task);
        return;
      }

      if (task.dueDate < todayStr) {
        overdue.push(task);
      } else if (task.dueDate === todayStr) {
        today.push(task);
      } else if (task.dueDate <= weekFromNowStr) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    });

    return { overdue, today, thisWeek, later, completed };
  }, [tasks, selectedOppFilter, todayStr]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const opp = opportunities.find(o => o.id === newTaskOppId);

    onAddTask({
      opportunityId: newTaskOppId,
      opportunityTitle: opp?.title || 'General Opportunity',
      counterparty: opp?.counterparty || 'ASEAN Partner',
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      completed: false,
    });

    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const renderTaskItem = (task: Task) => {
    const opp = opportunities.find(o => o.id === task.opportunityId);

    return (
      <div
        key={task.id}
        className={`group p-4 bg-white border rounded-xl flex items-start justify-between gap-3 transition-all ${
          task.completed
            ? 'border-slate-200 bg-slate-50/60 opacity-60'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggleTask(task.id, task.completed)}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
            )}
          </button>

          <div className="space-y-1">
            <p
              className={`text-sm font-semibold transition-all ${
                task.completed ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-slate-500 leading-relaxed">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {opp && (
                <button
                  onClick={() => onSelectOpportunity(opp)}
                  className="font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[11px] flex items-center gap-1"
                >
                  <span>{opp.counterparty}</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              )}

              <span className="text-slate-300">·</span>

              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                  task.priority === 'high'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : task.priority === 'medium'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {task.priority}
              </span>

              <span className="text-slate-300">·</span>

              <span className="font-mono text-slate-500 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Due: {task.dueDate}</span>
              </span>

              {opp && opp.health === 'stalled' && (
                <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                  Unblocks Stalled Deal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action: Quick Report Outcome button for associated opportunity */}
        {opp && !task.completed && (
          <button
            onClick={() => onOpenReportOutcome(opp)}
            title="Report verified outcome claim for this deal"
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            <Award className="w-3 h-3 text-indigo-600" />
            <span className="hidden sm:inline">Report Outcome</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Action Pipeline & Blocker Clearance
          </h2>
          <p className="text-xs text-slate-500">
            Completing tasks automatically clears stalled indicators and advances deal health
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Opportunity filter dropdown */}
          <select
            value={selectedOppFilter}
            onChange={(e) => setSelectedOppFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Active Deals ({opportunities.length})</option>
            {opportunities.map(opp => (
              <option key={opp.id} value={opp.id}>
                {opp.counterparty} - {opp.title.slice(0, 25)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Add Task Form Drawer */}
      {isAddingTask && (
        <form onSubmit={handleCreateTask} className="bg-white border border-indigo-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Create New Action Task
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-slate-400 hover:text-slate-700 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task description (e.g. confirm trial demo date with Bambang Kusuma)..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Link to Opportunity
              </label>
              <select
                value={newTaskOppId}
                onChange={(e) => setNewTaskOppId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {opportunities.map(opp => (
                  <option key={opp.id} value={opp.id}>
                    {opp.counterparty} ({opp.targetCountry})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e: any) => setNewTaskPriority(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Task Sections Grouped by Timeline */}
      
      {/* 1. Overdue Tasks */}
      {groupedTasks.overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="uppercase tracking-wider">
              Overdue ({groupedTasks.overdue.length})
            </span>
            <span className="text-slate-400 font-normal">
              — Primary cause of stalled deal status
            </span>
          </div>
          <div className="space-y-2">
            {groupedTasks.overdue.map(renderTaskItem)}
          </div>
        </div>
      )}

      {/* 2. Today's Tasks */}
      {groupedTasks.today.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="uppercase tracking-wider">
              Due Today ({groupedTasks.today.length})
            </span>
          </div>
          <div className="space-y-2">
            {groupedTasks.today.map(renderTaskItem)}
          </div>
        </div>
      )}

      {/* 3. This Week's Tasks */}
      {groupedTasks.thisWeek.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="uppercase tracking-wider">
              This Week ({groupedTasks.thisWeek.length})
            </span>
          </div>
          <div className="space-y-2">
            {groupedTasks.thisWeek.map(renderTaskItem)}
          </div>
        </div>
      )}

      {/* 4. Later */}
      {groupedTasks.later.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="uppercase tracking-wider">
              Later Pipeline Milestones ({groupedTasks.later.length})
            </span>
          </div>
          <div className="space-y-2">
            {groupedTasks.later.map(renderTaskItem)}
          </div>
        </div>
      )}

      {/* 5. Completed Tasks */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <span>Completed Tasks ({groupedTasks.completed.length})</span>
          <span className="text-slate-400">{showCompleted ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showCompleted && groupedTasks.completed.length > 0 && (
          <div className="space-y-2 pt-3">
            {groupedTasks.completed.map(renderTaskItem)}
          </div>
        )}
      </div>

    </div>
  );
};
