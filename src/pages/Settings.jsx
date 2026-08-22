import { useState, useEffect } from 'react';
import {
  Smartphone,
  WifiOff,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  TestTube,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { evolutionApi } from '../lib/api';
import { Modal } from '../components/Modal';

export function SettingsPage() {
  const [instanceId, setInstanceId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [defaultNumber, setDefaultNumber] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Test message from map-com');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);

  const connectionStatus = {
    connected: { label: 'Connected', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
    disconnected: { label: 'Disconnected', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
    error: { label: 'Error', color: 'text-red-600', bg: 'bg-red-100', icon: <Shield className="w-4 h-4" /> },
    unknown: { label: 'Unknown', color: 'text-slate-500', bg: 'bg-slate-100', icon: <Shield className="w-4 h-4" /> },
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await evolutionApi.getSettings();
      const settings = response.data;
      setInstanceId(settings.instanceId || '');
      setApiKey(settings.apiKey || '');
      setWebhookUrl(settings.webhookUrl || '');
      setDefaultNumber(settings.defaultNumber || '');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await evolutionApi.updateSettings({
        instanceId,
        apiKey,
        webhookUrl,
        defaultNumber,
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const response = await evolutionApi.testConnection();
      setTestResult({
        success: true,
        message: 'Connection successful!',
      });
      setShowTestModal(true);
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Connection failed',
      });
      setShowTestModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto container-main">
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 mt-1">Configure your WhatsApp campaign settings</p>
          </div>
          <Button variant="primary" onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Connection Status */}
        <Card className="p-4 card-responsive">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">WhatsApp Connection</h3>
                <p className="text-sm text-slate-500">Evolution API instance status</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Checking status...</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instance Configuration */}
        <Card className="p-6 card-responsive">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Instance Configuration</h2>
          <div className="space-y-6">
            <div className="form-group">
              <Input
                label="Instance ID"
                placeholder="Enter your instance ID"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Input
                label="API Key"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
            </div>
            <div className="form-group">
              <Input
                label="Webhook URL"
                placeholder="Enter your webhook URL (optional)"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Input
                label="Default Number"
                placeholder="Default phone number for outgoing messages"
                value={defaultNumber}
                onChange={(e) => setDefaultNumber(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Test Connection */}
        <Card className="p-6 card-responsive">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Test Connection</h2>
          <div className="space-y-4">
            <div className="form-group">
              <Input
                label="Test Number"
                placeholder="Enter a phone number to test with"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Input
                label="Test Message"
                placeholder="Enter a test message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => { setShowTestModal(false); setTestResult(null); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={testConnection} disabled={loading}>
                {loading ? 'Testing...' : 'Send Test Message'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Test Result Modal */}
        <Modal
          isOpen={showTestModal}
          onClose={() => { setShowTestModal(false); setTestResult(null); }}
          title="Test Connection Result"
          size="md"
        >
          <div className="space-y-4">
            {testResult ? (
              <div className={`p-4 text-center rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {testResult.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                )}
                <p className="font-medium text-slate-900 mb-2">
                  {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                </p>
                <p className="text-slate-600">{testResult.message}</p>
              </div>
            ) : (
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-slate-500">Testing connection...</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}