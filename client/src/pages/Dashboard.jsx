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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '2px solid #E5E5E5',
              borderTopColor: '#3B4A6B',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p className="micro-label">Loading dashboard</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <p style={{ fontSize: '14px', color: '#737373' }}>
          Failed to load dashboard data. Make sure the server is running.
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Content Assets',
      value: data.totalContent,
      icon: FileText,
      hasAccent: data.totalContent > 0,
    },
    {
      label: 'Sprint Tasks',
      value: data.totalTasks,
      icon: Columns3,
      hasAccent: data.totalTasks > 0,
    },
    {
      label: 'Overdue Tasks',
      value: data.overdueCount,
      icon: AlertTriangle,
      hasAccent: data.overdueCount > 0,
    },
  ];

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

      {/* ── Stat Cards ──────────────────────────── */}
      <div
        className="stagger-children"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '24px',
              borderTop: stat.hasAccent ? '2px solid #3B4A6B' : '2px solid transparent',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.04), -1px -1px 3px rgba(255,255,255,0.6)',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '3px 3px 10px rgba(0,0,0,0.06), -1px -1px 4px rgba(255,255,255,0.7)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.04), -1px -1px 3px rgba(255,255,255,0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="stat-number">{stat.value}</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
              }}
            >
              <stat.icon size={14} style={{ color: '#737373' }} />
              <span className="micro-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content by Status + Tasks by Column ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}
      >
        <Card className="animate-fade-in">
          <h3 className="section-label" style={{ marginBottom: '16px' }}>
            Content by Status
          </h3>
          <div>
            {contentCards.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < contentCards.length - 1 ? '1px solid #F0F0F0' : 'none',
                }}
              >
                <StatusBadge status={item.label} />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#171717',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '80ms' }}>
          <h3 className="section-label" style={{ marginBottom: '16px' }}>
            Tasks by Column
          </h3>
          <div>
            {taskCards.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < taskCards.length - 1 ? '1px solid #F0F0F0' : 'none',
                }}
              >
                <StatusBadge status={item.label} />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#171717',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Recent Activity ────────────────────── */}
      <Card className="animate-fade-in">
        <h3 className="section-label" style={{ marginBottom: '16px' }}>
          Recent Activity
        </h3>
        {data.recentActivity.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#737373', padding: '16px 0' }}>
            No recent activity.
          </p>
        ) : (
          <div>
            {data.recentActivity.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < data.recentActivity.length - 1 ? '1px solid #F0F0F0' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Clock size={14} style={{ color: '#A3A3A3', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '14px', color: '#171717' }}>
                      <span style={{ fontWeight: 600 }}>{entry.changedBy}</span>
                      {' changed '}
                      <span style={{ color: '#525252' }}>{entry.assetTitle}</span>
                    </p>
                    {entry.comment && (
                      <p style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>
                        {entry.comment}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
                  <StatusBadge status={entry.status} size="xs" />
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#A3A3A3',
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
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
