'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2, 
  X,
  FileCheck,
  Eye,
  Check,
  Trash2,
  Loader2
} from 'lucide-react';
import { KnowledgeItem } from '@/types';
import { sampleKnowledgeBase } from '@/data/mock-data';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthProvider';

type TabType = 'guideline' | 'fact' | 'terminology' | 'banned' | 'phrase' | 'disclaimer' | 'asset';

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('guideline');
  const [items, setItems] = useState<KnowledgeItem[]>(sampleKnowledgeBase);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Brand Core');
  const [newReplacement, setNewReplacement] = useState('');
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

    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewReplacement('');
    toast(`Successfully added new ${activeTab} rule`);
  };

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
            <p className="mt-1 text-xs sm:text-sm text-[#718494]">
              The single source of truth for approved claims, banned words, legal disclaimers, and guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Document
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
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
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
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
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#718494] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${tabsConfig.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
              />
            </div>
          </div>

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
          </div>
        </div>
      </div>

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
                />
              </div>

              <div>
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
              </div>

              {activeTab === 'banned' && (
                <div>
                  <label className="block text-xs font-bold text-[#20364A] mb-1">Approved Replacement / Synonym</label>
                  <input
                    type="text"
                    placeholder="e.g. Streamlined enterprise governance"
                    value={newReplacement}
                    onChange={(e) => setNewReplacement(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1">Rule Body / Verified Statement</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify explicit guidance, citations, or restrictions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
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
        <div className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <h3 className="font-heading text-base font-bold text-[#20364A]">
                Upload Brand Guideline or Legal File
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-[#718494] hover:text-[#20364A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-8 border-2 border-dashed border-[#C4D5E0] rounded-xl bg-[#EDF3F6]/60 text-center">
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
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
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
              {previewItem.content}
            </div>

            {previewItem.replacement && (
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
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
