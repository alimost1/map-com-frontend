import { useState, useEffect } from 'react';
import {
  Users,
  Send,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Download,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Tag,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { api, campaignsApi } from '../lib/api';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalCampaigns: 0,
    sentMessages: 0,
    failedMessages: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    instance: 'promo',
    type: 'text',
    imageUrl: '',
    documentUrl: '',
    fileName: '',
    scheduledAt: '',
  });
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [contactsRes, campaignsRes, logsRes] = await Promise.all([
        api.get('/contacts?limit=1'),
        api.get('/campaigns'),
        api.get('/logs?limit=10'),
      ]);

      const contactsCount = contactsRes.data?.length || 0;
      const campaigns = campaignsRes.data || [];
      const sent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const failed = campaigns.reduce((sum, c) => sum + (c.failed_count || 0), 0);

      setStats({
        totalContacts: contactsCount,
        totalCampaigns: campaigns.length,
        sentMessages: sent,
        failedMessages: failed,
        recentActivity: Array.isArray(logsRes.data) ? logsRes.data : [],
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const payload = {
        name: formData.name,
        message: formData.message,
        channel: 'evolution',
        instanceName: formData.instance,
        type: formData.type,
        imageUrl: formData.imageUrl,
        documentUrl: formData.documentUrl,
        fileName: formData.fileName,
        scheduledAt: formData.scheduledAt || null,
      };
      await campaignsApi.create(payload);
      setShowCreateModal(false);
      setFormData({
        name: '',
        message: '',
        instance: 'promo',
        type: 'text',
        imageUrl: '',
        documentUrl: '',
        fileName: '',
        scheduledAt: '',
      });
      loadStats();
    } catch (error) {
      console.error('Create failed:', error);
      setCreateError(error.message || 'Failed to create campaign');
    }
  };

  const statCards = [
    { name: 'Total Contacts', value: stats.totalContacts, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Campaigns', value: stats.totalCampaigns, icon: Send, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Messages Sent', value: stats.sentMessages, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Failed', value: stats.failedMessages, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto container-main">
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your WhatsApp campaigns</p>
          </div>
          <Button variant="primary" onClick={loadStats} disabled={loading}>
            <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid - responsive */}
        <div className="stat-grid">
          {statCards.map((stat) => (
            <Card key={stat.name} className="p-6 card-responsive">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {loading ? '...' : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <div className="p-4 border-b border-slate-200 card-responsive">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {stats.recentActivity.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No recent activity</p>
                </div>
              ) : (
                stats.recentActivity.slice(0, 10).map((log) => (
                  <div key={log.id} className="p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      log.level === 'error' ? 'bg-red-100 text-red-600' :
                      log.level === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {log.level === 'error' && <XCircle className="w-5 h-5" />}
                      {log.level === 'warning' && <Clock className="w-5 h-5" />}
                      {log.level === 'info' && <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{log.message}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    {log.meta && (
                      <Badge variant="info">Details</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-4 border-b border-slate-200 card-responsive">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <a href="/scraper" className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Search className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Scrape Google Maps</p>
                  <p className="text-sm text-slate-500">Find business phones in any category</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
              </a>

              <a href="/contacts" className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Manage Contacts</p>
                  <p className="text-sm text-slate-500">Import, filter, and organize contacts</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </a>

              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group w-full text-left">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Send className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Create Campaign</p>
                  <p className="text-sm text-slate-500">Send WhatsApp messages to contacts</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>

              <a href="/settings" className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors group">
                <div className="p-3 bg-slate-200 rounded-lg">
                  <Settings className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Settings</p>
                  <p className="text-sm text-slate-500">Configure Evolution API & preferences</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Campaign"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {createError}
            </div>
          )}
          <Input
            label="Campaign Name"
            placeholder="e.g., Marrakech Real Estate Promo"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div className="form-group">
            <label htmlFor="dashboard-campaign-message" className="label">Message</label>
            <textarea
              id="dashboard-campaign-message"
              className="input min-h-[120px] resize-y"
              placeholder="Your message here... Use {{name}} for personalization"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
            <p className="text-xs text-slate-500 mt-1">Use {'{{name}}'}, {'{{phone}}'} for personalization</p>
          </div>
          <Select
            label="WhatsApp Instance"
            value={formData.instance}
            onChange={(e) => setFormData({...formData, instance: e.target.value})}
            options={[
              { value: 'promo', label: 'Promo (Default)' },
            ]}
          />
          <Select
            label="Message Type"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            options={[
              { value: 'text', label: 'Text Only' },
              { value: 'image', label: 'Image + Text' },
              { value: 'document', label: 'Document + Text' },
            ]}
          />
          {formData.type === 'image' && (
            <Input
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          )}
          {formData.type === 'document' && (
            <>
              <Input
                label="Document URL"
                placeholder="https://example.com/document.pdf"
                value={formData.documentUrl}
                onChange={(e) => setFormData({...formData, documentUrl: e.target.value})}
              />
              <Input
                label="File Name"
                placeholder="document.pdf"
                value={formData.fileName}
                onChange={(e) => setFormData({...formData, fileName: e.target.value})}
              />
            </>
          )}
          <Input
            label="Schedule For (Optional)"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              <Send className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}