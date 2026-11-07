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
  const [items, setItems] = useState<KnowledgeItem[]>([]);
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
  const [newFormat] = useState<'PDF' | 'DOCX' | 'TXT'>('PDF');

  useEffect(() => {
    let active = true;
    apiClient.getKnowledgeBase(user?.organizationId).then((data) => {
      if (active) setItems(data);
    });
    return () => {
      active = false;
    };
  }, [user?.organizationId]);

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
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              The single source of truth for approved claims, banned words, legal disclaimers, and guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Document
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
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
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Knowledge categories">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
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
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

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
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-lg border border-[#C4D5E0]">
                <BookMarked className="w-10 h-10 text-[#416F89]/40 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-bold text-[#20364A]">No {activeTab} rules or assets found</p>
                <p className="text-xs text-[#4F6576] mt-1 mb-4">
                  Add brand guidelines, verified claims, and required vocabulary to enforce policy compliance.
                </p>
                <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                  Add New {activeTab} +
                </Button>
              </div>
            ) : (
              filteredItems.map((item) => (
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
            )))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-rule-modal-title"
        >
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-[#C4D5E0] p-4 sm:p-6 animate-in fade-in zoom-in-95">
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
                />
              </div>

              <div>
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
              </div>

              {activeTab === 'banned' && (
                <div>
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
                  />
                </div>
              )}

              <div>
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
        <div
          className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-rule-modal-title"
        >
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-[#C4D5E0] p-4 sm:p-6 animate-in fade-in zoom-in-95">
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
              </button>
            </div>

            <div className="mt-4 p-8 border-2 border-dashed border-[#C4D5E0] rounded-xl bg-[#EDF3F6]/60 text-center">
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
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-rule-modal-title"
        >
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-[#C4D5E0] p-4 sm:p-6 animate-in fade-in zoom-in-95">
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
              {previewItem.content}
            </div>

            {previewItem.replacement && (
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
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
