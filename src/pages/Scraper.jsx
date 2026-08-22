import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Database,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Upload,
  Eye,
  Trash2,
  Settings,
  Target,
  Zap,
  History,
  Download,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { contactsApi, scraperApi } from '../lib/api';

const CATEGORIES = [
  { value: 'real_estate', label: 'Real Estate Agencies', icon: '🏠', color: 'bg-blue-100 text-blue-700' },
  { value: 'restaurants', label: 'Restaurants', icon: '🍽️', color: 'bg-orange-100 text-orange-700' },
  { value: 'hotels', label: 'Hotels & Riads', icon: '🏨', color: 'bg-purple-100 text-purple-700' },
  { value: 'cafes', label: 'Cafes & Tea Rooms', icon: '☕', color: 'bg-amber-100 text-amber-700' },
  { value: 'shops', label: 'Shops & Boutiques', icon: '🛍️', color: 'bg-pink-100 text-pink-700' },
  { value: 'services', label: 'Services & Artisans', icon: '🔧', color: 'bg-green-100 text-green-700' },
  { value: 'doctors', label: 'Doctors & Clinics', icon: '🏥', color: 'bg-red-100 text-red-700' },
  { value: 'lawyers', label: 'Lawyers & Notaries', icon: '⚖️', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'schools', label: 'Schools & Universities', icon: '🎓', color: 'bg-teal-100 text-teal-700' },
];

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  running: { icon: Loader2, color: 'text-primary-600', bg: 'bg-primary-50', label: 'Running' },
  starting: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Starting' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Error' },
};

export function Scraper() {
  const [scraping, setScraping] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('real_estate');
  const [location, setLocation] = useState('Marrakech, Morocco');
  const [maxResults, setMaxResults] = useState(50);
  const [headless, setHeadless] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await contactsApi.list({ limit: 1000 });
      const allContacts = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
      const scrapedContacts = allContacts.filter(c => c.source === 'google_maps');
      const grouped = {};
      scrapedContacts.forEach(c => {
        const date = c.scraped_at ? c.scraped_at.split('T')[0] : 'Unknown';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(c);
      });
      setHistory(Object.entries(grouped)
        .map(([date, contacts]) => ({ date, count: contacts.length, contacts }))
        .sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    setResults([]);
    setShowResults(false);
    setJobStatus('starting');
    setProgress(0);
    setCurrentPhase('Initializing...');

    try {
      const response = await scraperApi.googleMaps({
        category: selectedCategory,
        location,
        maxResults: parseInt(maxResults),
        headless,
      });

      if (response.data?.jobId) {
        await pollJob(response.data.jobId);
      } else if (response.data?.results) {
        setResults(response.data.results);
        setShowResults(true);
        setJobStatus('completed');
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      setJobStatus({ error: error.message });
    } finally {
      setScraping(false);
    }
  };

  const pollJob = async (jobId) => {
    setJobStatus('running');
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const response = await scraperApi.status(jobId);
        const job = response.data;
        const pct = Math.round((i / maxAttempts) * 100);
        setProgress(pct);

        if (job.status === 'completed') {
          setResults(job.results || []);
          setShowResults(true);
          setJobStatus('completed');
          setProgress(100);
          setCurrentPhase('Completed!');
          loadHistory();
          return;
        } else if (job.status === 'failed') {
          setJobStatus({ error: job.error || 'Job failed' });
          return;
        }
        setCurrentPhase(`Processing... (${pct}%)`);
      } catch (error) {
        console.error('Poll error:', error);
      }
    }
    setJobStatus({ error: 'Timeout waiting for job' });
  };

  const handleImport = async () => {
    if (results.length === 0) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', new Blob([JSON.stringify(results)], { type: 'application/json' }), 'scraped_results.json');
      formData.append('source', 'google_maps');
      formData.append('tags', `${selectedCategory},scraped,${location.split(',')[0].toLowerCase()}`);

      await contactsApi.import(formData);
      setShowImportModal(true);
      setResults([]);
      setShowResults(false);
      loadHistory();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleViewOnMaps = (place) => {
    if (place.place_id) {
      window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, '_blank');
    } else if (place.latitude && place.longitude) {
      window.open(`https://www.google.com/maps/@${place.latitude},${place.longitude},18z`, '_blank');
    }
  };

  const columns = [
    { key: 'name', header: 'Business Name', width: '280px', render: (val, row) => (
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${CATEGORIES.find(c => c.value === row.category)?.color || 'bg-primary-100 text-primary-700'}`}>
          <span className="text-lg">{CATEGORIES.find(c => c.value === row.category)?.icon || '📍'}</span>
        </div>
        <div>
          <p className="font-semibold text-slate-900 truncate max-w-xs">{val}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {row.category && (
              <Badge variant="info" size="xs">{row.category.replace('_', ' ')}</Badge>
            )}
            {row.rating && (
              <Badge variant="success" size="xs">⭐ {row.rating}</Badge>
            )}
            {row.reviews_count && (
              <Badge variant="default" size="xs">{row.reviews_count} reviews</Badge>
            )}
          </div>
        </div>
      </div>
    )},
    { key: 'phone', header: 'Phone', width: '150px', render: (val) => (
      val ? (
        <a href={`tel:${val}`} className="font-mono text-sm text-green-600 hover:underline flex items-center gap-1">
          <span className="w-4 h-4 opacity-50">📞</span>
          {val}
        </a>
      ) : <span className="text-slate-400">—</span>
    )},
    { key: 'address', header: 'Address', width: '250px', render: (val) => (
      <span className="text-slate-600 text-sm truncate block max-w-xs" title={val}>{val || '—'}</span>
    )},
    { key: 'website', header: 'Website', width: '130px', render: (val) => (
      val ? (
        <a href={val} target="_blank" rel="noopener" className="text-green-600 hover:underline text-sm flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" />
          Visit
        </a>
      ) : <span className="text-slate-300">—</span>
    )},
    { key: 'actions', header: '', width: '70px', render: (_, row) => (
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => handleViewOnMaps(row)}
          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="View on Google Maps"
        >
          <Eye className="w-4 h-4" />
        </button>
        {row.place_id && (
          <button
            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Copy Place ID"
            onClick={() => navigator.clipboard.writeText(row.place_id)}
          >
            <span className="text-xs font-mono">ID</span>
          </button>
        )}
      </div>
    )},
  ];

  const selectedCategoryData = CATEGORIES.find(c => c.value === selectedCategory);

  // Helper to render status icon dynamically
  const renderStatusIcon = (status) => {
    const config = STATUS_CONFIG[status];
    if (config?.icon) {
      return <config.icon className={`w-5 h-5 ${config.color || 'text-primary-600'}`} />;
    }
    return <Loader2 className="w-5 h-5 animate-spin text-primary-600" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto container-main">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Search className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Google Maps Scraper</h1>
            <p className="text-slate-500 mt-0.5">Extract business phone numbers and contact details from Google Maps</p>
          </div>
        </div>
        <div className="action-bar">
          <Button variant="outline" onClick={loadHistory} className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button variant="ghost" onClick={() => setShowResults(false)} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Stats Bar (when results exist) */}
      {showResults && results.length > 0 && (
        <div className="results-stats-grid">
          <StatCard
            icon={Target}
            value={results.length}
            label="Businesses Found"
            color="primary"
          />
          <StatCard
            icon={Database}
            value={results.filter(r => r.phone).length}
            label="With Phone Numbers"
            color="green"
          />
          <StatCard
            icon={Globe}
            value={results.filter(r => r.website).length}
            label="With Website"
            color="blue"
          />
          <StatCard
            icon={Zap}
            value={`${Math.round(results.filter(r => r.rating).length / Math.max(results.length, 1) * 100)}%`}
            label="Rating Coverage"
            color="amber"
          />
        </div>
      )}

      {/* Configuration Panel */}
      <Card className="p-6 card-responsive">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">Search Configuration</h2>
        </div>

        <div className="scraper-config-grid">
          {/* Category */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="label flex items-center gap-2">
              <span className="text-lg">{selectedCategoryData?.icon || '🏠'}</span>
              Category
            </label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
              className="mt-1"
            />
          </div>

          {/* Location */}
          <div className="lg:col-span-1">
            <label className="label flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Location
            </label>
            <Input
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Max Results */}
          <div className="lg:col-span-1">
            <label className="label flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-400" />
              Max Results
            </label>
            <Input
              type="number"
              min="1"
              max="200"
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
              className="mt-1"
              leftIcon={<Target className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Mode */}
          <div className="lg:col-span-1">
            <label className="label flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-400" />
              Mode
            </label>
            <Select
              value={headless ? 'headless' : 'headed'}
              onChange={(e) => setHeadless(e.target.value === 'headless')}
              options={[
                { value: 'headless', label: '⚡ Headless (Faster)' },
                { value: 'headed', label: '🖥️ Headed (Debug)' },
              ]}
              className="mt-1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-bar">
          <Button
            variant="primary"
            size="lg"
            onClick={handleScrape}
            disabled={scraping}
            className="flex-1 flex items-center justify-center gap-2 py-4 text-lg font-medium rounded-xl transition-all hover:shadow-lg btn-full-mobile"
            style={{ minHeight: '56px' }}
          >
            {scraping ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scraping in Progress...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Scraping
              </>
            )}
          </Button>

          {showResults && results.length > 0 && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleImport}
              disabled={importing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-4 text-lg font-medium rounded-xl transition-all btn-full-mobile"
              style={{ minHeight: '56px' }}
            >
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Import {results.length} Contacts
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {scraping && jobStatus && jobStatus !== 'completed' && !jobStatus.error && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">{currentPhase || 'Processing...'}</span>
              <span className="text-sm font-mono text-green-600">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              This may take a few minutes. Headless mode is faster but headed mode lets you debug.
            </p>
          </div>
        )}

        {/* Job Status */}
        {jobStatus && (
          <div className="mt-6 p-4 rounded-xl border transition-all">
            {jobStatus.error ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-red-50 border-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Scraping Failed</p>
                    <p className="text-sm text-red-600 mt-1">{jobStatus.error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleScrape}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Retry
                  </Button>
                </div>
              </>
            ) : jobStatus === 'completed' ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Scraping Completed!</p>
                  <p className="text-sm text-green-600 mt-1">Found {results.length} businesses. Ready to import.</p>
                </div>
              </div>
            ) : (
              <div className={`flex items-center gap-3 p-3 ${STATUS_CONFIG[jobStatus]?.bg || 'bg-green-50'} border-${STATUS_CONFIG[jobStatus]?.color?.replace('text-', '').replace('-600', '-100') || 'border-green-100'} rounded-lg`}>
                {renderStatusIcon(jobStatus)}
                <div>
                  <p className="font-medium text-slate-900">{STATUS_CONFIG[jobStatus]?.label || 'Processing'}</p>
                  <p className="text-sm text-slate-500 mt-1">{currentPhase || 'Please wait...'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Results Table */}
      {showResults && results.length > 0 && (
        <Card>
          <div className="p-4 border-b border-slate-200 card-responsive flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
                <p className="text-sm text-slate-500">{results.length} businesses found for <span className="font-medium">{selectedCategoryData?.label}</span> in <span className="font-medium">{location}</span></p>
              </div>
            </div>
          </div>
          <Table
            columns={columns}
            data={results}
            keyField="place_id"
            loading={false}
            emptyMessage="No results found"
          />
        </Card>
      )}

      {/* History */}
      {history.length > 0 && !showResults && (
        <Card>
          <div className="p-4 border-b border-slate-200 card-responsive">
            <h2 className="text-lg font-semibold text-slate-900">Scraping History</h2>
          </div>
          <Table
            columns={[
              { key: 'date', header: 'Date', width: '150px', render: (val) => <span className="font-medium text-slate-900">{val}</span> },
              { key: 'count', header: 'Contacts', width: '100px', render: (val) => <span className="text-green-600 font-semibold">{val}</span> },
              { key: 'actions', header: '', width: '80px', render: (_, row) => (
                <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" onClick={() => {
                  setResults(row.contacts);
                  setShowResults(true);
                }}>
                  <Eye className="w-4 h-4" />
                </button>
              )},
            ]}
            data={history}
            keyField="date"
            loading={false}
            emptyMessage="No history available"
          />
        </Card>
      )}

      {/* Import Success Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Successful"
        size="md"
      >
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Contacts Imported!</h3>
          <p className="text-slate-500">The scraped contacts have been added to your database.</p>
        </div>
      </Modal>
    </div>
  );
}