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
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#737373]">Loading...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#737373]">Content asset not found.</p>
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
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Editor */}
        <div className="col-span-2 space-y-4">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                  id="edit-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">Owner</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                  id="edit-owner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">Body</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={12}
                  className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150 resize-none leading-relaxed"
                  id="edit-body"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <h3 className="text-sm font-semibold text-[#171717] mb-3">Status</h3>
            <div className="mb-4">
              <StatusBadge status={asset.status} />
            </div>

            {actions.length > 0 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#737373] mb-1">Changed by</label>
                  <input
                    type="text"
                    value={statusUser}
                    onChange={(e) => setStatusUser(e.target.value)}
                    placeholder={form.owner}
                    className="w-full text-sm px-3 py-1.5 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#737373] mb-1">Comment (optional)</label>
                  <textarea
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    rows={2}
                    className="w-full text-sm px-3 py-1.5 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150 resize-none"
                    placeholder="Add a comment..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.nextStatus}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleStatusChange(action.nextStatus)}
                      className="w-full"
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
            <h3 className="text-sm font-semibold text-[#171717] mb-3">History</h3>
            <div className="space-y-3">
              {[...asset.history].reverse().map((entry, i) => (
                <div
                  key={i}
                  className={`relative pl-5 pb-3 ${
                    i < asset.history.length - 1 ? 'border-l border-[#E5E5E5]' : ''
                  }`}
                >
                  <div className="absolute left-0 top-0.5 w-2 h-2 rounded-full bg-[#D4D4D4] -translate-x-1/2" />
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={entry.status} size="xs" />
                  </div>
                  <p className="text-xs text-[#737373] mt-1">
                    {entry.changedBy}
                  </p>
                  {entry.comment && (
                    <p className="text-xs text-[#A3A3A3] mt-0.5 italic">
                      {entry.comment}
                    </p>
                  )}
                  <p className="text-xs text-[#A3A3A3] mt-0.5 flex items-center gap-1">
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
