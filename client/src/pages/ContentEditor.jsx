import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { contentApi } from '../lib/api';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

const WORKFLOW_ACTIONS = {
  Draft: [{ nextStatus: 'In Review', label: 'Submit for Review', variant: 'primary' }],
  'In Review': [
    { nextStatus: 'Approved', label: 'Approve', variant: 'primary' },
    { nextStatus: 'Draft', label: 'Return to Draft', variant: 'secondary' },
  ],
  Approved: [
    { nextStatus: 'Published', label: 'Publish', variant: 'primary' },
    { nextStatus: 'Draft', label: 'Return to Draft', variant: 'secondary' },
  ],
  Published: [],
};

export default function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', owner: '' });
  const [statusComment, setStatusComment] = useState('');
  const [statusUser, setStatusUser] = useState('');

  useEffect(() => {
    loadAsset();
  }, [id]);

  const loadAsset = async () => {
    try {
      const { data } = await contentApi.getById(id);
      setAsset(data);
      setForm({ title: data.title, body: data.body, owner: data.owner });
    } catch (err) {
      console.error('Failed to load asset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await contentApi.update(id, form);
      setAsset(data);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    try {
      const { data } = await contentApi.updateStatus(id, {
        status: nextStatus,
        changedBy: statusUser || form.owner,
        comment: statusComment,
      });
      setAsset(data);
      setStatusComment('');
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <p className="micro-label">Loading...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <p style={{ fontSize: '14px', color: '#737373' }}>Content asset not found.</p>
      </div>
    );
  }

  const actions = WORKFLOW_ACTIONS[asset.status] || [];

  return (
    <div>
      <Header
        title="Edit Content"
        actions={
          <Button variant="ghost" onClick={() => navigate('/content')}>
            <ArrowLeft size={15} />
            Back
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Editor */}
        <div className="animate-fade-in">
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="edit-title">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  id="edit-title"
                />
              </div>
              <div>
                <label htmlFor="edit-owner">Owner</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  id="edit-owner"
                />
              </div>
              <div>
                <label htmlFor="edit-body">Body</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={12}
                  id="edit-body"
                  style={{ resize: 'none', lineHeight: 1.7 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleSave} disabled={saving}>
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in" >
          {/* Status */}
          <Card>
            <h3 className="section-label" style={{ marginBottom: '12px' }}>Status</h3>
            <div style={{ marginBottom: '16px' }}>
              <StatusBadge status={asset.status} />
            </div>

            {actions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#737373' }}>Changed by</label>
                  <input
                    type="text"
                    value={statusUser}
                    onChange={(e) => setStatusUser(e.target.value)}
                    placeholder={form.owner}
                    style={{ padding: '7px 10px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#737373' }}>Comment (optional)</label>
                  <textarea
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    rows={2}
                    placeholder="Add a comment..."
                    style={{ resize: 'none', padding: '7px 10px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {actions.map((action) => (
                    <Button
                      key={action.nextStatus}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleStatusChange(action.nextStatus)}
                      style={{ width: '100%' }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* History */}
          <Card>
            <h3 className="section-label" style={{ marginBottom: '12px' }}>History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[...asset.history].reverse().map((entry, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    paddingLeft: '20px',
                    paddingBottom: '16px',
                    borderLeft: i < asset.history.length - 1 ? '1px solid #E5E5E5' : '1px solid transparent',
                    marginLeft: '4px',
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-4px',
                      top: '2px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#D4D4D4',
                      border: '2px solid #FFFFFF',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={entry.status} size="xs" />
                  </div>
                  <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px' }}>
                    {entry.changedBy}
                  </p>
                  {entry.comment && (
                    <p style={{ fontSize: '12px', color: '#A3A3A3', marginTop: '2px', fontStyle: 'italic' }}>
                      {entry.comment}
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: '#A3A3A3', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} />
                    {formatDateTime(entry.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
