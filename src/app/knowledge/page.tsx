'use client';

<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  BookMarked, 
  Plus, 
  Upload, 
  Search, 
  FileText, 
  Database, 
  AlertOctagon, 
  Scale, 
  Layers, 
<<<<<<< HEAD
  CheckCircle2, 
  X,
  FileCheck,
  Eye,
  Check,
  Trash2,
  Loader2
=======
  X,
  FileCheck,
  Eye,
  Check
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
} from 'lucide-react';
import { KnowledgeItem } from '@/types';
import { sampleKnowledgeBase } from '@/data/mock-data';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/components/ui/Toast';
<<<<<<< HEAD
import { useAuth } from '@/components/auth/AuthProvider';
=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

type TabType = 'guideline' | 'fact' | 'terminology' | 'banned' | 'phrase' | 'disclaimer' | 'asset';

export default function KnowledgeBasePage() {
  const { toast } = useToast();
<<<<<<< HEAD
  const { user, isLoading: isAuthLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
  const [activeTab, setActiveTab] = useState<TabType>('guideline');
  const [items, setItems] = useState<KnowledgeItem[]>(sampleKnowledgeBase);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
<<<<<<< HEAD
  const [isUploading, setIsUploading] = useState(false);
=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Brand Core');
  const [newReplacement, setNewReplacement] = useState('');
<<<<<<< HEAD
  const [newFormat, setNewFormat] = useState<'PDF' | 'DOCX' | 'TXT'>('PDF');

  useEffect(() => {
    let active = true;
    apiClient.getKnowledgeBase(user?.organizationId).then((data) => {
      if (active) setItems(data);
    });
    return () => {
      active = false;
    };
  }, [user?.organizationId]);
=======
  const [newFormat] = useState<'PDF' | 'DOCX' | 'TXT'>('PDF');

  useEffect(() => {
    apiClient.getKnowledgeBase().then(setItems);
  }, []);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isUploadModalOpen) setIsUploadModalOpen(false);
        if (previewItem) setPreviewItem(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isUploadModalOpen, previewItem]);
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

  const filteredItems = items.filter((item) => {
    const matchesTab = item.type === activeTab;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

<<<<<<< HEAD
    const newItem = await apiClient.addKnowledgeItem(
      {
        type: activeTab,
        title: newTitle,
        content: newContent,
        category: newCategory,
        status: 'Active',
        replacement: activeTab === 'banned' ? newReplacement : undefined,
        fileFormat: activeTab === 'guideline' ? newFormat : undefined,
        fileSize: activeTab === 'guideline' ? '2.4 MB' : undefined,
        tags: [newCategory, activeTab],
      },
      user?.organizationId,
      user?.id
    );
=======
    const newItem = await apiClient.addKnowledgeItem({
      type: activeTab,
      title: newTitle,
      content: newContent,
      category: newCategory,
      status: 'Active',
      replacement: activeTab === 'banned' ? newReplacement : undefined,
      fileFormat: activeTab === 'guideline' ? newFormat : undefined,
      fileSize: activeTab === 'guideline' ? '2.4 MB' : undefined,
      tags: [newCategory, activeTab],
    });
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewReplacement('');
    toast(`Successfully added new ${activeTab} rule`);
  };

<<<<<<< HEAD
  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await apiClient.deleteKnowledgeItem(id);
      if (!result.success) {
        toast(result.error || 'Failed to remove rule from knowledge base', 'error');
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast('Rule removed from active knowledge base');
    } catch (err: any) {
      toast(err?.message || 'Failed to remove rule from knowledge base', 'error');
    }
  };

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isAuthLoading) {
      toast('Authenticating user profile. Please wait a moment...', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!user || !user.organizationId) {
      toast('Organization profile is required to upload documents. Please log in or refresh your session.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const orgId = user.organizationId;
    if (orgId === 'org-1' || orgId.includes('..') || orgId.includes('/') || orgId.includes('\\')) {
      toast('Invalid organization identifier detected. Upload blocked for security.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const orgPath = `${orgId}/${Date.now()}-${sanitizedFileName}`;

    setIsUploading(true);
    try {
      const targetBucket = activeTab === 'asset' ? 'brand-assets' : 'knowledge-documents';
      const uploadRes = await apiClient.uploadAsset(targetBucket, orgPath, file, orgId);

      if (!uploadRes) {
        toast(`Failed to upload ${activeTab === 'asset' ? 'brand asset' : 'document'} to secure storage. Please check permissions.`, 'error');
        setIsUploading(false);
        return;
      }

      const ext = file.name.split('.').pop()?.toUpperCase() as any;

      const newItem = await apiClient.addKnowledgeItem(
        {
          type: activeTab === 'asset' ? 'asset' : 'guideline',
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: activeTab === 'asset' 
            ? `Uploaded brand visual asset: ${file.name}. Validated for multi-channel usage.`
            : `Uploaded brand governance file: ${file.name}. Validated for enterprise compliance indexing.`,
          category: activeTab === 'asset' ? 'Visual Assets' : 'Uploaded Guidelines',
          status: 'Active',
          fileFormat: ['PDF', 'DOCX', 'TXT', 'PNG', 'JPG'].includes(ext) ? ext : 'PDF',
          fileSize: file.size,
          tags: [activeTab === 'asset' ? 'Asset' : 'Document', ext || 'PDF'],
          filePath: uploadRes.path,
        },
        orgId,
        user.id
      );

      setItems((prev) => [newItem, ...prev]);
      setIsUploadModalOpen(false);
      toast(`${activeTab === 'asset' ? 'Brand asset' : 'Document'} uploaded successfully: ${file.name} (Storage Linked)`);
    } catch (err: any) {
      toast(`Upload error: ${err?.message || 'Storage operation failed'}`, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenDocument = async (filePath: string, itemType?: string) => {
    toast('Generating secure download link...');
    const bucket = itemType === 'asset' ? 'brand-assets' : 'knowledge-documents';
    const signedUrl = await apiClient.getSignedUrl(bucket, filePath);
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast('Could not generate secure document link', 'error');
    }
  };

=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
  const handleSimulatedUpload = (fileType: string) => {
    setIsUploadModalOpen(false);
    toast(`Document uploaded successfully: Brand_Policy_2026.${fileType.toLowerCase()} (Indexed)`);
  };

  const tabsConfig = [
    { id: 'guideline', label: 'Brand Guidelines', count: items.filter(i => i.type === 'guideline').length, icon: FileText },
    { id: 'fact', label: 'Approved Facts', count: items.filter(i => i.type === 'fact').length, icon: Database },
    { id: 'terminology', label: 'Terminology', count: items.filter(i => i.type === 'terminology').length, icon: FileCheck },
    { id: 'banned', label: 'Banned Terms', count: items.filter(i => i.type === 'banned').length, icon: AlertOctagon },
    { id: 'phrase', label: 'Required Phrases', count: items.filter(i => i.type === 'phrase').length, icon: BookMarked },
    { id: 'disclaimer', label: 'Disclaimers', count: items.filter(i => i.type === 'disclaimer').length, icon: Scale },
    { id: 'asset', label: 'Brand Assets', count: items.filter(i => i.type === 'asset').length, icon: Layers },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Knowledge base</span>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
              Brand Governance Knowledge Base
            </h1>
<<<<<<< HEAD
            <p className="mt-1 text-xs sm:text-sm text-[#718494]">
=======
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              The single source of truth for approved claims, banned words, legal disclaimers, and guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
<<<<<<< HEAD
              leftIcon={<Upload className="w-3.5 h-3.5" />}
=======
              leftIcon={<Upload className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Document
            </Button>
            <Button
              variant="primary"
              size="sm"
<<<<<<< HEAD
              leftIcon={<Plus className="w-4 h-4" />}
=======
              leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              onClick={() => setIsAddModalOpen(true)}
            >
              Add {tabsConfig.find(t => t.id === activeTab)?.label.slice(0, -1)}
            </Button>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C4D5E0] pb-4">
            {/* Scrollable Tabs */}
<<<<<<< HEAD
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
=======
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Knowledge categories">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
<<<<<<< HEAD
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#20364A] text-white shadow-sm'
                        : 'bg-[#EDF3F6]/70 text-[#526B7C] hover:bg-[#D5E3EC] hover:text-[#20364A]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#D5E3EC] text-[#31566D]'
                      }`}
                    >
=======
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                      isActive
                        ? 'bg-[#416F89] text-white shadow-sm'
                        : 'text-[#4F6576] hover:text-[#20364A] hover:bg-[#F4F8FA]'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                      isActive ? 'bg-[#F4D77B] text-[#20364A] font-extrabold' : 'bg-[#D5E3EC]/80 text-[#20364A]'
                    }`}>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

<<<<<<< HEAD
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#718494] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${tabsConfig.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
=======
            {/* Filter Input */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-[#4F6576] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter rules &amp; claims..."
                aria-label="Filter rules and claims"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              />
            </div>
          </div>

<<<<<<< HEAD
          {/* Tab Content Cards */}
          <div className="mt-5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[#C4D5E0] rounded-xl">
                <BookMarked className="w-8 h-8 text-[#718494] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#20364A]">No knowledge items found</p>
                <p className="text-[11px] text-[#718494] mt-0.5">Try searching with a different term or add a new entry.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setPreviewItem(item)}
                    className="p-4 rounded-xl border border-[#C4D5E0] bg-white hover:border-[#416F89] transition-all cursor-pointer shadow-subtle hover:shadow-default flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5E3EC] text-[#31566D]">
                          {item.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 text-[10px] text-[#258A70] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            {item.status}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="text-[#718494] hover:text-[#C65E57] p-1 rounded transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-heading text-sm font-bold text-[#20364A] mt-2 group-hover:text-[#416F89] transition-colors line-clamp-1">
                        {item.title}
                      </h4>

                      <p className="text-xs text-[#718494] mt-1.5 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>

                      {item.replacement && (
                        <div className="mt-3 p-2 rounded bg-[rgba(244,215,123,.25)] border border-[#B77938]/25 text-[11px]">
                          <span className="font-bold text-[#9A682D] block">Approved Substitute:</span>
                          <span className="text-[#20364A] italic font-semibold">{item.replacement}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EDF3F6] flex items-center justify-between text-[11px] text-[#718494]">
                      <div className="flex items-center gap-1.5">
                        {item.fileFormat && (
                          <span className="font-mono text-[10px] bg-[#20364A] text-white px-1.5 py-0.2 rounded font-bold">
                            {item.fileFormat}
                          </span>
                        )}
                        <span>
                          {typeof item.fileSize === 'number'
                            ? `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB`
                            : (item.fileSize || item.lastUpdated)}
                        </span>
                      </div>
                      <span className="font-bold text-[#416F89] group-hover:underline flex items-center gap-1">
                        Inspect
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
=======
          {/* Items Grid */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-lg border border-[#C4D5E0] bg-white hover:border-[#416F89]/50 transition-all shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D5E3EC]/70 text-[#20364A]">
                      {item.category || item.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#1F7560]">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      {item.status}
                    </span>
                  </div>

                  <h2 className="font-heading text-sm font-bold text-[#20364A] leading-snug line-clamp-1">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-xs text-[#4F6576] leading-relaxed line-clamp-3">
                    {item.content}
                  </p>

                  {/* Banned term replacement notice */}
                  {item.replacement && (
                    <div className="mt-3 p-2.5 bg-[#F4D77B]/25 border border-[#B77938]/30 rounded-lg text-xs">
                      <span className="font-bold text-[#9A682D]">Approved Phrasing:</span>
                      <p className="text-[#20364A] font-semibold italic mt-0.5">“{item.replacement}”</p>
                    </div>
                  )}

                  {item.fileFormat && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#4F6576] font-mono">
                      <span className="px-2 py-0.5 bg-[#D5E3EC]/80 rounded text-[#20364A] font-bold">
                        {item.fileFormat}
                      </span>
                      <span>{item.fileSize}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#C4D5E0] flex items-center justify-between text-xs text-[#4F6576]">
                  <span>Updated: {item.lastUpdated}</span>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded p-1"
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    Preview
                  </button>
                </div>
              </div>
            ))}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Add New Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <h3 className="font-heading text-base font-bold text-[#20364A]">
                Add New {tabsConfig.find(t => t.id === activeTab)?.label.slice(0, -1)}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#718494] hover:text-[#20364A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1">Title / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Lexicon Standard 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
=======
      {/* Add Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-rule-modal-title"
        >
          <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <h2 id="add-rule-modal-title" className="font-heading text-base font-bold text-[#20364A]">
                Add New {tabsConfig.find(t => t.id === activeTab)?.label.slice(0, -1)}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-[#4F6576] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="mt-4 space-y-4">
              <div>
                <label htmlFor="knowledge-item-title" className="block text-xs font-bold text-[#20364A] mb-1">
                  Title or Terminology Key <span className="text-[#A94842]" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="knowledge-item-title"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SOC2 Recertification Scope or Banned Word"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                />
              </div>

              <div>
<<<<<<< HEAD
                <label className="block text-xs font-bold text-[#20364A] mb-1">Guideline Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                >
                  <option value="Tone and Voice">Tone and Voice</option>
                  <option value="Security & Certifications">Security & Certifications</option>
                  <option value="Trademarks & Naming">Trademarks & Naming</option>
                  <option value="Restricted Vocabulary">Restricted Vocabulary</option>
                  <option value="Responsible AI Policy">Responsible AI Policy</option>
                  <option value="Financial & Claims">Financial & Claims</option>
                  <option value="Visual Assets">Visual Assets</option>
                </select>
=======
                <label htmlFor="knowledge-item-category" className="block text-xs font-bold text-[#20364A] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="knowledge-item-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              </div>

              {activeTab === 'banned' && (
                <div>
<<<<<<< HEAD
                  <label className="block text-xs font-bold text-[#20364A] mb-1">Approved Replacement / Synonym</label>
                  <input
                    type="text"
                    placeholder="e.g. Streamlined enterprise governance"
                    value={newReplacement}
                    onChange={(e) => setNewReplacement(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
=======
                  <label htmlFor="knowledge-item-replacement" className="block text-xs font-bold text-[#20364A] mb-1">
                    Approved Replacement Phrasing <span className="text-[#A94842]" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="knowledge-item-replacement"
                    required
                    value={newReplacement}
                    onChange={(e) => setNewReplacement(e.target.value)}
                    placeholder="e.g. Streamlined Enterprise Governance"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  />
                </div>
              )}

              <div>
<<<<<<< HEAD
                <label className="block text-xs font-bold text-[#20364A] mb-1">Rule Body / Verified Statement</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify explicit guidance, citations, or restrictions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
=======
                <label htmlFor="knowledge-item-content" className="block text-xs font-bold text-[#20364A] mb-1">
                  Content, Rule Details or Citation <span className="text-[#A94842]" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="knowledge-item-content"
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detailed guidelines, mandatory phrasing, or approved verification criteria..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
<<<<<<< HEAD
        <div className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <h3 className="font-heading text-base font-bold text-[#20364A]">
                Upload Brand Guideline or Legal File
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-[#718494] hover:text-[#20364A]">
                <X className="w-4 h-4" />
=======
        <div
          className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-rule-modal-title"
        >
          <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <h2 id="upload-rule-modal-title" className="font-heading text-base font-bold text-[#20364A]">
                Upload Brand Guideline or Legal File
              </h2>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded text-[#4F6576] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              </button>
            </div>

            <div className="mt-4 p-8 border-2 border-dashed border-[#C4D5E0] rounded-xl bg-[#EDF3F6]/60 text-center">
<<<<<<< HEAD
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#416F89] mb-2" />
                  <p className="text-xs font-bold text-[#20364A]">Uploading and indexing document...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-[#416F89] mx-auto mb-3" />
                  <h4 className="font-heading text-sm font-bold text-[#20364A]">Choose a guideline document to upload</h4>
                  <p className="text-xs text-[#718494] mt-1">Supports PDF, DOCX, TXT, PNG, JPG (up to 50MB)</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={handleRealFileUpload}
                  />

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#20364A] text-white rounded-lg text-xs font-bold hover:bg-[#182C3D] transition-all shadow-sm"
                    >
                      Browse Local Files
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatedUpload('PDF')}
                      className="px-3 py-1.5 bg-white border border-[#C4D5E0] rounded-lg text-xs font-bold text-[#20364A] hover:bg-[#EDF3F6]"
                    >
                      Quick Demo PDF
                    </button>
                  </div>
                </>
              )}
=======
              <Upload className="w-10 h-10 text-[#416F89] mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-heading text-sm font-bold text-[#20364A]">Drag &amp; drop guideline document</h3>
              <p className="text-xs text-[#4F6576] mt-1">Supports PDF, DOCX, TXT, PNG, JPG (up to 50MB)</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSimulatedUpload('PDF')}
                >
                  Simulate PDF Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSimulatedUpload('DOCX')}
                >
                  Simulate DOCX Upload
                </Button>
              </div>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
<<<<<<< HEAD
        <div className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5E3EC] text-[#31566D]">
                  {previewItem.type.toUpperCase()}
                </span>
                <h3 className="font-heading text-base font-bold text-[#20364A]">{previewItem.title}</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-[#718494] hover:text-[#20364A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 p-4 rounded-lg bg-[#EDF3F6]/60 border border-[#C4D5E0] text-xs text-[#263B4D] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap font-sans">
=======
        <div
          className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-rule-modal-title"
        >
          <div className="bg-white rounded-xl max-w-xl w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D5E3EC] text-[#20364A]">
                  {previewItem.type.toUpperCase()}
                </span>
                <h2 id="preview-rule-modal-title" className="font-heading text-base font-bold text-[#20364A]">
                  {previewItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded text-[#4F6576] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-4 rounded-lg bg-[#EDF3F6]/60 border border-[#C4D5E0] text-xs sm:text-sm text-[#20364A] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap font-sans">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              {previewItem.content}
            </div>

            {previewItem.replacement && (
<<<<<<< HEAD
              <div className="p-3 bg-[rgba(244,215,123,.25)] rounded-lg border border-[#B77938]/25 text-xs mb-4">
                <span className="font-bold text-[#9A682D]">Approved Compliant Phrasing:</span>
                <p className="mt-1 text-[#20364A] italic font-semibold">{previewItem.replacement}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[#718494] pt-3 border-t border-[#C4D5E0] gap-2">
              <span>Audited by: {previewItem.updatedBy}</span>
              <div className="flex items-center gap-2">
                {previewItem.filePath && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDocument(previewItem.filePath!, previewItem.type)}
                    leftIcon={<Eye className="w-3.5 h-3.5 text-[#416F89]" />}
                  >
                    {previewItem.type === 'asset' ? 'View Asset' : 'View Document'}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setPreviewItem(null)}>
                  Close Preview
                </Button>
              </div>
=======
              <div className="p-3 bg-[#F4D77B]/25 rounded-lg border border-[#B77938]/30 text-xs mb-4">
                <span className="font-bold text-[#9A682D]">Approved Compliant Phrasing:</span>
                <p className="mt-1 text-[#20364A] italic font-semibold">“{previewItem.replacement}”</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[#4F6576] pt-3 border-t border-[#C4D5E0]">
              <span>Audited by: {previewItem.updatedBy}</span>
              <Button size="sm" variant="outline" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
