import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Send,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  Eye,
  Search,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { campaignsApi } from '../lib/api';
import { Card } from '../components/Card';

export function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    status: 'draft',
    scheduledAt: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await campaignsApi.list();
      setCampaigns(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await campaignsApi.create(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        message: '',
        status: 'draft',
        scheduledAt: '',
      });
      loadCampaigns();
    } catch (err) {
      console.error('Failed to create campaign:', err);
      setError('Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCampaign) return;
    setSaving(true);
    try {
      await campaignsApi.update(editingCampaign.id, formData);
      setShowEditModal(false);
      loadCampaigns();
    } catch (err) {
      console.error('Failed to update campaign:', err);
      setError('Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await campaignsApi.delete(id);
      loadCampaigns();
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      setError('Failed to delete campaign');
    }
  };

  const handleToggleStatus = async (campaign) => {
    try {
      await campaignsApi.update(campaign.id, {
        status: campaign.status === 'active' ? 'paused' : 'active',
      });
      loadCampaigns();
    } catch (err) {
      console.error('Failed to toggle campaign status:', err);
      setError('Failed to update campaign status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto container-main">
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
            <p className="text-slate-500 mt-1">Create and manage WhatsApp campaigns</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <Button variant="ghost" size="sm" className="ml-4" onClick={loadCampaigns}>
              Retry
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 card-responsive">
          <div className="filter-bar">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search campaigns..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
              />
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Filter by status"
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'active', label: 'Active' },
                  { value: 'paused', label: 'Paused' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <Table
            columns={[
              {
                key: 'name',
                header: 'Campaign Name',
                width: '250px',
                render: (val) => (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Send className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 truncate max-w-xs">{val}</p>
                    </div>
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Status',
                width: '120px',
                render: (val) => {
                  const statusMap = {
                    draft: { label: 'Draft', color: 'text-gray-500', bg: 'bg-gray-50' },
                    active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-50' },
                    paused: { label: 'Paused', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    completed: { label: 'Completed', color: 'text-blue-600', bg: 'bg-blue-50' },
                    failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50' },
                  };
                  const config = statusMap[val] || statusMap.draft;
                  return (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  );
                }
              },
              {
                key: 'message',
                header: 'Message Preview',
                width: '300px',
                render: (val) => (
                  <p className="text-slate-600 text-sm truncate max-w-xs">{val || '—'}</p>
                )
              },
              {
                key: 'scheduledAt',
                header: 'Scheduled For',
                width: '150px',
                render: (val) => (
                  <p className="text-slate-600 text-sm">{val ? new Date(val).toLocaleString() : '—'}</p>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                width: '150px',
                render: (_, row) => (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCampaign(row);
                        setFormData({
                          name: row.name,
                          message: row.message,
                          status: row.status,
                          scheduledAt: row.scheduledAt || '',
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(row)}
                    >
                      {row.status === 'active' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              },
            ]}
            data={campaigns}
            keyField="id"
            loading={loading}
            emptyMessage="No campaigns found"
          />
        </Card>

        {/* Create Campaign Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              name: '',
              message: '',
              status: 'draft',
              scheduledAt: '',
            });
          }}
          title="Create New Campaign"
          size="lg"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }} className="space-y-6">
            <div className="form-group">
              <Input
                label="Campaign Name"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <Input
                label="Message Template"
                placeholder="Enter your message (use {{name}}, {{company}} for personalization)"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                type="textarea"
                required
                className="h-48"
              />
            </div>
            <div className="form-group">
              <Input
                label="Schedule For (Optional)"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  name: '',
                  message: '',
                  status: 'draft',
                  scheduledAt: '',
                });
              }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Campaign Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCampaign(null);
          }}
          title="Edit Campaign"
          size="lg"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }} className="space-y-6">
            <div className="form-group">
              <Input
                label="Campaign Name"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <Input
                label="Message Template"
                placeholder="Enter your message (use {{name}}, {{company}} for personalization)"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                type="textarea"
                required
                className="h-48"
              />
            </div>
            <div className="form-group">
              <Input
                label="Schedule For (Optional)"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => {
                setShowEditModal(false);
                setEditingCampaign(null);
              }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Campaign'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}