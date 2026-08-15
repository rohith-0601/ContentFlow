import { useState, useEffect } from 'react';
import { FileText, Columns3, AlertTriangle, Clock } from 'lucide-react';
import { dashboardApi } from '../lib/api';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: dashboard } = await dashboardApi.get();
      setData(dashboard);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#737373]">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#737373]">Failed to load dashboard data. Make sure the server is running.</p>
      </div>
    );
  }

  const contentCards = [
    { label: 'Draft', count: data.contentByStatus.Draft },
    { label: 'In Review', count: data.contentByStatus['In Review'] },
    { label: 'Approved', count: data.contentByStatus.Approved },
    { label: 'Published', count: data.contentByStatus.Published },
  ];

  const taskCards = [
    { label: 'Backlog', count: data.tasksByColumn.Backlog },
    { label: 'In Progress', count: data.tasksByColumn['In Progress'] },
    { label: 'QA', count: data.tasksByColumn.QA },
    { label: 'Done', count: data.tasksByColumn.Done },
  ];

  return (
    <div>
      <Header title="Dashboard" description="Overview of content and sprint progress" />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded bg-[#E8EBF0]">
              <FileText size={16} className="text-[#3B4A6B]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#171717]">{data.totalContent}</p>
              <p className="text-xs text-[#737373]">Content Assets</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded bg-[#E8EBF0]">
              <Columns3 size={16} className="text-[#3B4A6B]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#171717]">{data.totalTasks}</p>
              <p className="text-xs text-[#737373]">Sprint Tasks</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded bg-[#FEE2E2]">
              <AlertTriangle size={16} className="text-[#991B1B]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#171717]">{data.overdueCount}</p>
              <p className="text-xs text-[#737373]">Overdue Tasks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content by status + Tasks by column */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-sm font-semibold text-[#171717] mb-4">Content by Status</h3>
          <div className="space-y-3">
            {contentCards.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <StatusBadge status={item.label} />
                <span className="text-sm font-medium text-[#171717] tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-[#171717] mb-4">Tasks by Column</h3>
          <div className="space-y-3">
            {taskCards.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <StatusBadge status={item.label} />
                <span className="text-sm font-medium text-[#171717] tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <h3 className="text-sm font-semibold text-[#171717] mb-4">Recent Activity</h3>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-[#737373] py-4">No recent activity.</p>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {data.recentActivity.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <Clock size={14} className="text-[#A3A3A3] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-[#171717] truncate">
                      <span className="font-medium">{entry.changedBy}</span>
                      {' changed '}
                      <span className="font-medium">{entry.assetTitle}</span>
                    </p>
                    {entry.comment && (
                      <p className="text-xs text-[#737373] mt-0.5 truncate">
                        {entry.comment}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={entry.status} size="xs" />
                  <span className="text-xs text-[#A3A3A3] whitespace-nowrap">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
