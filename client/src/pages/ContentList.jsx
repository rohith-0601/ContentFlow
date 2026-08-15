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
            <Plus size={16} />
            New Asset
          </Button>
        }
      />

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilterStatus(s)}
            className={`text-sm px-3 py-1.5 rounded transition-colors duration-150 ${
              filterStatus === s
                ? 'bg-[#3B4A6B] text-white'
                : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#171717]'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Assets table */}
      <Card padding={false}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[#737373]">Loading...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[#737373]">No content assets found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="text-left text-xs font-medium text-[#737373] uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-[#737373] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-[#737373] uppercase tracking-wider px-5 py-3">Owner</th>
                <th className="text-left text-xs font-medium text-[#737373] uppercase tracking-wider px-5 py-3">Updated</th>
                <th className="text-right text-xs font-medium text-[#737373] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {assets.map((asset) => (
                <tr
                  key={asset._id}
                  className="hover:bg-[#FAFAFA] transition-colors duration-150"
                >
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-[#171717]">{asset.title}</p>
                    <p className="text-xs text-[#A3A3A3] mt-0.5 line-clamp-1">{asset.body}</p>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-[#525252]">{asset.owner}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-[#737373]">{formatDate(asset.updatedAt)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
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
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Title</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
              placeholder="Enter asset title"
              id="create-title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Owner</label>
            <input
              type="text"
              required
              value={createForm.owner}
              onChange={(e) => setCreateForm({ ...createForm, owner: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
              placeholder="Assigned owner"
              id="create-owner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Body</label>
            <textarea
              value={createForm.body}
              onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })}
              rows={4}
              className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150 resize-none"
              placeholder="Content body..."
              id="create-body"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
