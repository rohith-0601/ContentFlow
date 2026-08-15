import { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import { taskApi } from '../lib/api';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

export default function StandupView() {
  const [standup, setStandup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStandup();
  }, []);

  const loadStandup = async () => {
    try {
      const { data } = await taskApi.getStandup();
      setStandup(data);
    } catch (err) {
      console.error('Failed to load standup:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const formatSince = (since) =>
    new Date(since).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#737373]">Loading standup...</p>
      </div>
    );
  }

  const assignees = standup ? Object.keys(standup.groups) : [];

  return (
    <div>
      <Header
        title="Standup Summary"
        description={
          standup
            ? `Tasks updated since ${formatSince(standup.since)}`
            : 'Tasks updated in the last 24 hours'
        }
      />

      {assignees.length === 0 ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[#737373]">No tasks were updated in the last 24 hours.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignees.map((assignee) => (
            <Card key={assignee}>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 rounded bg-[#E8EBF0]">
                  <User size={14} className="text-[#3B4A6B]" />
                </div>
                <h3 className="text-sm font-semibold text-[#171717]">{assignee}</h3>
                <span className="text-xs text-[#A3A3A3]">
                  {standup.groups[assignee].length} task{standup.groups[assignee].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-[#E5E5E5]">
                {standup.groups[assignee].map((task) => (
                  <div key={task._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#171717]">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-[#737373] mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <StatusBadge status={task.column} size="xs" />
                      <StatusBadge status={task.priority} size="xs" />
                      <div className="flex items-center gap-1 text-xs text-[#A3A3A3]">
                        <Calendar size={10} />
                        {formatDate(task.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
