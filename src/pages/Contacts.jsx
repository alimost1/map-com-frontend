import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Upload,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { contactsApi } from '../lib/api';

export function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [importTags, setImportTags] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);

  const tags = [
    { label: 'Real Estate', value: 'real_estate', color: 'bg-blue-100 text-blue-800' },
    { label: 'Restaurant', value: 'restaurant', color: 'bg-orange-100 text-orange-800' },
    { label: 'Hotel', value: 'hotel', color: 'bg-purple-100 text-purple-800' },
    { label: 'Cafe', value: 'cafe', color: 'bg-amber-100 text-amber-800' },
    { label: 'Shop', value: 'shop', color: 'bg-pink-100 text-pink-800' },
    { label: 'Service', value: 'service', color: 'bg-green-100 text-green-800' },
    { label: 'Scraped', value: 'scraped', color: 'bg-gray-100 text-gray-800' },
    { label: 'Imported', value: 'imported', color: 'bg-indigo-100 text-indigo-800' },
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const response = await contactsApi.list({
        limit: 1000,
        search: searchTerm || undefined,
        tag: filterTag || undefined,
      });
      setContacts(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleteLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => contactsApi.delete(id))
      );
      setSelectedIds(new Set());
      loadContacts();
    } catch (error) {
      console.error('Failed to delete contacts:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(contacts.map(c => c.id));
      setSelectedIds(allIds);
    }
  };

  const handleImport = async () => {
    if (!importTags.trim()) {
      alert('Please enter at least one tag');
      return;
    }
    setShowImportModal(false);
    alert(`Would import with tags: ${importTags}`);
    loadContacts();
  };

  const filteredContacts = (Array.isArray(contacts) ? contacts : []).filter(contact => {
    const matchesSearch = !searchTerm ||
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = !filterTag ||
      (contact.tags && contact.tags.includes(filterTag));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto container-main">
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
            <p className="text-slate-500 mt-1">Manage your contact database</p>
          </div>
          <div className="action-bar">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 card-responsive">
          <div className="filter-bar">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                placeholder="Filter by tag"
                options={tags.map(t => ({ value: t.value, label: t.label }))}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={loadContacts}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Actions Bar */}
        {contacts.length > 0 && (
          <div className="action-bar">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {selectedIds.size > 0 && (
                  <>
                    <span>{selectedIds.size} selected</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={deleteLoading}
                      className="ml-3"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete Selected'}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadContacts}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                disabled={deleteLoading || selectedIds.size === 0}
                onClick={handleDeleteSelected}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          </div>
        )}

        {/* Contacts Table */}
        <Card>
          <Table
            columns={[
              {
                key: 'select',
                header: '',
                width: '60px',
                render: () => (
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === contacts.length && contacts.length > 0}
                      onChange={handleToggleSelectAll}
                      className="h-4 w-4 text-green-600"
                    />
                  </div>
                ),
              },
              {
                key: 'name',
                header: 'Name',
                width: '200px',
                render: (val, row) => (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                      {(row.first_name || row.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{`${row.first_name || ''} ${row.last_name || ''}`.trim()}</p>
                      {row.company && (
                        <p className="text-sm text-slate-500 truncate max-w-xs">{row.company}</p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: 'phone',
                header: 'Phone',
                width: '150px',
                render: (val) => (
                  val ? (
                    <a href={`tel:${val}`} className="font-mono text-sm text-green-600 hover:underline flex items-center gap-1">
                      <span className="w-4 h-4 opacity-50">📞</span>
                      {val}
                    </a>
                  ) : <span className="text-slate-400">—</span>
                )
              },
              {
                key: 'email',
                header: 'Email',
                width: '200px',
                render: (val) => (
                  val ? (
                    <a href={`mailto:${val}`} className="text-sm text-green-600 hover:underline truncate max-w-xs">
                      {val}
                    </a>
                  ) : <span className="text-slate-400">—</span>
                )
              },
              {
                key: 'tags',
                header: 'Tags',
                width: '200px',
                render: (val, row) => (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(row.tags || []).map((tag, index) => {
                      const tagInfo = tags.find(t => t.value === tag) || {
                        label: tag,
                        color: 'bg-gray-100 text-gray-800'
                      };
                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${tagInfo.color}`}
                        >
                          {tagInfo.label}
                        </span>
                      );
                    })}
                  </div>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                width: '120px',
                render: (_, row) => (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                      className="p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filteredContacts}
            keyField="id"
            loading={loading}
            emptyMessage="No contacts found"
          />
        </Card>

        {/* Import Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Contacts"
          size="lg"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleImport();
          }} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  label="Tags (comma-separated)"
                  placeholder="real_estate, marrakech, scraped"
                  value={importTags}
                  onChange={(e) => setImportTags(e.target.value)}
                />
              </div>
              <div className="text-sm text-slate-500">
                Enter tags to apply to all imported contacts. Separate multiple tags with commas.
              </div>
            </div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}