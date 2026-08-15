import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { contentApi } from '../lib/api';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

export default function ContentList() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', body: '', owner: '' });

  useEffect(() => {
    loadAssets();
  }, [filterStatus]);

  const loadAssets = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const { data } = await contentApi.getAll(params);
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await contentApi.create(createForm);
      setShowCreate(false);
      setCreateForm({ title: '', body: '', owner: '' });
      loadAssets();
    } catch (err) {
      console.error('Failed to create asset:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content asset?')) return;
    try {
      await contentApi.delete(id);
      loadAssets();
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statuses = ['', 'Draft', 'In Review', 'Approved', 'Published'];

  return (
    <div>
      <Header
        title="Content"
        description="Manage content assets and track approval workflows"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            New Asset
          </Button>
        }
      />

      {/* Status filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilterStatus(s)}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: filterStatus === s ? '#171717' : 'transparent',
              color: filterStatus === s ? '#FFFFFF' : '#737373',
            }}
            onMouseEnter={(e) => {
              if (filterStatus !== s) {
                e.target.style.backgroundColor = '#F5F5F5';
                e.target.style.color = '#171717';
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== s) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#737373';
              }
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Assets table */}
      <Card padding={false} className="animate-fade-in">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <p className="micro-label">Loading...</p>
          </div>
        ) : assets.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: '14px', color: '#737373' }}>No content assets found.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#171717' }}>{asset.title}</p>
                    <p style={{ fontSize: '12px', color: '#A3A3A3', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                      {asset.body}
                    </p>
                  </td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: '14px', color: '#525252' }}>{asset.owner}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#737373', fontVariantNumeric: 'tabular-nums' }}>
                      {formatDate(asset.updatedAt)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate(`/content/${asset._id}`)}
                        aria-label="View asset"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate(`/content/${asset._id}`)}
                        aria-label="Edit asset"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDelete(asset._id)}
                        aria-label="Delete asset"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Content Asset">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="create-title">Title</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="Enter asset title"
              id="create-title"
            />
          </div>
          <div>
            <label htmlFor="create-owner">Owner</label>
            <input
              type="text"
              required
              value={createForm.owner}
              onChange={(e) => setCreateForm({ ...createForm, owner: e.target.value })}
              placeholder="Assigned owner"
              id="create-owner"
            />
          </div>
          <div>
            <label htmlFor="create-body">Body</label>
            <textarea
              value={createForm.body}
              onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })}
              rows={4}
              placeholder="Content body..."
              id="create-body"
              style={{ resize: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
