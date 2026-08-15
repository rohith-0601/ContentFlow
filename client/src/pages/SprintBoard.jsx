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

const COLUMN_ACCENTS = {
  Backlog: '#737373',
  'In Progress': '#B8860B',
  QA: '#3B4A6B',
  Done: '#2F4F3E',
};

function TaskCard({ task, onDelete, isDragging = false }) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.column !== 'Done';
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '6px',
        padding: '12px',
        opacity: isDragging ? 0.4 : 1,
        transition: 'all 0.15s ease',
        cursor: 'grab',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) e.currentTarget.style.borderColor = '#D4D4D4';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E5E5';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#171717', lineHeight: 1.4 }}>{task.title}</p>
        <GripVertical size={14} style={{ color: '#D4D4D4', flexShrink: 0, marginTop: '2px' }} />
      </div>
      {task.description && (
        <p style={{ fontSize: '12px', color: '#737373', marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <StatusBadge status={task.priority} size="xs" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: isOverdue ? '#DC2626' : '#737373',
          }}
        >
          <Calendar size={10} />
          {formatDate(task.dueDate)}
          {isOverdue && <span style={{ fontWeight: 600, marginLeft: '2px' }}>Overdue</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: '#737373' }}>{task.assignee}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#A3A3A3',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#A3A3A3'; }}
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
  const accentColor = COLUMN_ACCENTS[columnName] || '#737373';

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentColor }} />
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#171717' }}>{columnName}</h3>
          <span style={{ fontSize: '12px', color: '#A3A3A3', fontVariantNumeric: 'tabular-nums' }}>{tasks.length}</span>
        </div>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minHeight: '200px',
            backgroundColor: '#F7F7F8',
            border: '1px solid #E5E5E5',
            borderRadius: '6px',
            padding: '8px',
            borderTop: `2px solid ${accentColor}`,
          }}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onDelete={onDelete} />
          ))}
          {tasks.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
              <p style={{ fontSize: '12px', color: '#A3A3A3' }}>No tasks</p>
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

    let targetColumn = null;
    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask) {
      targetColumn = overTask.column;
    }
    if (!targetColumn && COLUMNS.includes(over.id)) {
      targetColumn = over.id;
    }
    if (!targetColumn || targetColumn === draggedTask.column) return;

    setTasks((prev) =>
      prev.map((t) => (t._id === draggedTask._id ? { ...t, column: targetColumn } : t))
    );

    try {
      await taskApi.moveColumn(draggedTask._id, targetColumn);
    } catch (err) {
      console.error('Failed to move task:', err);
      loadTasks();
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <p className="micro-label">Loading sprint board...</p>
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
            <Plus size={15} />
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
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
            <div style={{ width: '256px' }}>
              <TaskCard task={activeTask} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create task modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="task-title">Title</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="Task title"
              id="task-title"
            />
          </div>
          <div>
            <label htmlFor="task-description">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              placeholder="Task description..."
              id="task-description"
              style={{ resize: 'none' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="task-assignee">Assignee</label>
              <input
                type="text"
                required
                value={createForm.assignee}
                onChange={(e) => setCreateForm({ ...createForm, assignee: e.target.value })}
                placeholder="Assignee name"
                id="task-assignee"
              />
            </div>
            <div>
              <label htmlFor="task-duedate">Due Date</label>
              <input
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                id="task-duedate"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="task-priority">Priority</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                id="task-priority"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-column">Column</label>
              <select
                value={createForm.column}
                onChange={(e) => setCreateForm({ ...createForm, column: e.target.value })}
                id="task-column"
              >
                {COLUMNS.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
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
