'use client';

import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { KnowledgeItem } from '@/types';
import { sampleKnowledgeBase } from '@/data/mock-data';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/components/ui/Toast';

type TabType = 'guideline' | 'fact' | 'terminology' | 'banned' | 'phrase' | 'disclaimer' | 'asset';

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('guideline');
  const [items, setItems] = useState<KnowledgeItem[]>(sampleKnowledgeBase);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Brand Core');
  const [newReplacement, setNewReplacement] = useState('');
  const [newFormat, setNewFormat] = useState<'PDF' | 'DOCX' | 'TXT'>('PDF');

  useEffect(() => {
    apiClient.getKnowledgeBase().then(setItems);
  }, []);

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
                        ? 'bg-[#416F89] text-white shadow-sm'
                        : 'text-[#526B7C] hover:text-[#20364A] hover:bg-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-[#F4D77B] text-[#20364A] font-extrabold' : 'bg-[#D5E3EC]/70 text-[#718494]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Input */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-[#718494] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter rules & claims..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-lg border border-[#C4D5E0] bg-white hover:bg-white hover:border-[#416F89]/50 transition-all shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5E3EC]/60 text-[#31566D]">
                      {item.category || item.type}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#258A70]">
                      <Check className="w-3 h-3" />
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-[#20364A] leading-snug line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-[#718494] leading-relaxed line-clamp-3">
                    {item.content}
                  </p>

                  {/* Banned term replacement notice */}
                  {item.replacement && (
                    <div className="mt-3 p-2.5 bg-[rgba(244,215,123,.22)] border border-[#B77938]/25 rounded-lg text-[11px]">
                      <span className="font-bold text-[#9A682D]">Approved Phrasing:</span>
                      <p className="text-[#20364A] font-semibold italic mt-0.5">“{item.replacement}”</p>
                    </div>
                  )}

                  {item.fileFormat && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-[#718494] font-mono">
                      <span className="px-1.5 py-0.5 bg-[#D5E3EC]/70 rounded text-[#31566D] font-bold">
                        {item.fileFormat}
                      </span>
                      <span>{item.fileSize}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#C4D5E0] flex items-center justify-between text-[11px] text-[#718494]">
                  <span>Updated: {item.lastUpdated}</span>
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#20364A]/60  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <h3 className="font-heading text-base font-bold text-[#20364A]">
                Add New {tabsConfig.find(t => t.id === activeTab)?.label}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#718494] hover:text-[#20364A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1">
                  Title or Terminology Key
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SOC2 Recertification Scope or Banned Word"
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                />
              </div>

              {activeTab === 'banned' && (
                <div>
                  <label className="block text-xs font-bold text-[#20364A] mb-1">
                    Approved Replacement Phrasing
                  </label>
                  <input
                    type="text"
                    required
                    value={newReplacement}
                    onChange={(e) => setNewReplacement(e.target.value)}
                    placeholder="e.g. Streamlined Enterprise Governance"
                    className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1">
                  Content, Rule Details or Citation
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detailed guidelines, mandatory phrasing, or approved verification criteria..."
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
        <div className="fixed inset-0 bg-[#20364A]/60  z-50 flex items-center justify-center p-4">
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
              <Upload className="w-10 h-10 text-[#416F89] mx-auto mb-3" />
              <h4 className="font-heading text-sm font-bold text-[#20364A]">Drag & drop guideline document</h4>
              <p className="text-xs text-[#718494] mt-1">Supports PDF, DOCX, TXT, PNG, JPG (up to 50MB)</p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulatedUpload('PDF')}
                  className="px-3 py-1.5 bg-white border border-[#C4D5E0] rounded-lg text-xs font-bold text-[#20364A] hover:bg-[#EDF3F6]"
                >
                  Simulate PDF Upload
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedUpload('DOCX')}
                  className="px-3 py-1.5 bg-white border border-[#C4D5E0] rounded-lg text-xs font-bold text-[#20364A] hover:bg-[#EDF3F6]"
                >
                  Simulate DOCX Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-[#20364A]/60  z-50 flex items-center justify-center p-4">
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

            <div className="flex items-center justify-between text-xs text-[#718494] pt-3 border-t border-[#C4D5E0]">
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
