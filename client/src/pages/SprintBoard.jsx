import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Calendar, Trash2, GripVertical } from 'lucide-react';
import { taskApi } from '../lib/api';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

const COLUMNS = ['Backlog', 'In Progress', 'QA', 'Done'];

function TaskCard({ task, onDelete, isDragging = false }) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.column !== 'Done';
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      className={`bg-white border border-[#E5E5E5] rounded p-3 ${
        isDragging ? 'opacity-50' : ''
      } transition-colors duration-150`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-[#171717] leading-snug">{task.title}</p>
        <GripVertical size={14} className="text-[#D4D4D4] shrink-0 mt-0.5 cursor-grab" />
      </div>
      {task.description && (
        <p className="text-xs text-[#737373] mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mb-2">
        <StatusBadge status={task.priority} size="xs" />
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-[#991B1B]' : 'text-[#737373]'}`}>
          <Calendar size={10} />
          {formatDate(task.dueDate)}
          {isOverdue && <span className="font-medium ml-0.5">Overdue</span>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#737373]">{task.assignee}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="text-[#A3A3A3] hover:text-[#991B1B] transition-colors duration-150"
          aria-label="Delete task"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onDelete={onDelete} isDragging={isDragging} />
    </div>
  );
}

function Column({ columnName, tasks, onDelete }) {
  const taskIds = tasks.map((t) => t._id);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#171717]">{columnName}</h3>
          <span className="text-xs text-[#A3A3A3] tabular-nums">{tasks.length}</span>
        </div>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[200px] bg-[#FAFAFA] border border-[#E5E5E5] rounded p-2">
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onDelete={onDelete} />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24">
              <p className="text-xs text-[#A3A3A3]">No tasks</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function SprintBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'Medium',
    column: 'Backlog',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data } = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await taskApi.create(createForm);
      setShowCreate(false);
      setCreateForm({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'Medium',
        column: 'Backlog',
      });
      loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const draggedTask = tasks.find((t) => t._id === active.id);
    if (!draggedTask) return;

    // Determine the target column
    let targetColumn = null;

    // Check if dropped over another task
    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask) {
      targetColumn = overTask.column;
    }

    // If dropped over a column area (the SortableContext container)
    if (!targetColumn && COLUMNS.includes(over.id)) {
      targetColumn = over.id;
    }

    if (!targetColumn || targetColumn === draggedTask.column) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggedTask._id ? { ...t, column: targetColumn } : t))
    );

    try {
      await taskApi.moveColumn(draggedTask._id, targetColumn);
    } catch (err) {
      console.error('Failed to move task:', err);
      loadTasks(); // Revert on error
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    const overTask = tasks.find((t) => t._id === over.id);

    if (activeTask && overTask && activeTask.column !== overTask.column) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === activeTask._id ? { ...t, column: overTask.column } : t
        )
      );
    }
  };

  const getColumnTasks = (column) => tasks.filter((t) => t.column === column);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#737373]">Loading sprint board...</p>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Sprint Board"
        description="Track tasks across your sprint workflow"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            New Task
          </Button>
        }
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((column) => (
            <Column
              key={column}
              columnName={column}
              tasks={getColumnTasks(column)}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-64">
              <TaskCard task={activeTask} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create task modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Title</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
              placeholder="Task title"
              id="task-title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150 resize-none"
              placeholder="Task description..."
              id="task-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">Assignee</label>
              <input
                type="text"
                required
                value={createForm.assignee}
                onChange={(e) => setCreateForm({ ...createForm, assignee: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                placeholder="Assignee name"
                id="task-assignee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">Due Date</label>
              <input
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                id="task-duedate"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">Priority</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                id="task-priority"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">Column</label>
              <select
                value={createForm.column}
                onChange={(e) => setCreateForm({ ...createForm, column: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                id="task-column"
              >
                {COLUMNS.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
